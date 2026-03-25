use sqlx::PgPool;
use uuid::Uuid;
use bigdecimal::BigDecimal;
use bigdecimal::ToPrimitive;

use crate::{config::Config, dto::payment_dto::{InitiatePaymentRequest, InitiatePaymentResponse, InterswitchWebhook, PaymentConfirmedResponse}, errors::AppError, repository::{device_repo, transaction_repo, user_repo}, services::{interswitch, sms_service, token_service}};


pub async fn initiate_payment(
    pool: &PgPool, 
    config: &Config, 
    user_id: Uuid, req: InitiatePaymentRequest) -> Result<InitiatePaymentResponse, AppError>{
    let device = device_repo::find_by_id(pool, req.device_id).await
    .map_err(AppError::DatabaseError)?
    .ok_or_else(|| AppError::NotFound("Device not found".to_string()))?;

    if device.user_id != user_id {
        return Err(AppError::Unauthorized(
            "Device isnt registered to this user".to_string(),
        ));
    }

    //calc units from the amount
    let units = calculate_units(&device.device_type, req.amount_kobo);

    //unique payment reference from inteerswitch
    let txn_ref = format!("ALY{}", Uuid::new_v4().to_string().replace("-", ""));

    //pending txn created and recorded befr payment
    let transaction = transaction_repo::create(
        pool, 
        user_id, 
        req.device_id, 
        req.amount_kobo, 
        units, 
        &req.channel, 
        &txn_ref)
        .await
        .map_err(AppError::DatabaseError)?;

    //redirect Url after payment
    let redirect_url = format!("{}/payment/callback", config.frontend_url);

    //interswitch payment page url
    let payment_url = interswitch::build_payment_url(
        config, 
        &txn_ref, 
        req.amount_kobo, 
        &redirect_url
    );

    Ok(InitiatePaymentResponse { 
        transaction_id: transaction.id, 
        payment_url, 
        reference: txn_ref, 
        amount_naira: req.amount_kobo as f64 / 100.0
    })
}

//verify + confirm + generate token + sms -- inteswitch webhook
pub async fn handle_webhook(
    pool: &PgPool, config: &Config, 
    webhook: InterswitchWebhook) -> Result<PaymentConfirmedResponse, AppError> {
    //verify HMAC sign then if forged kindly reject
    let valid = interswitch::verify_webhook_signature(
        &config.interswitch_mac_key, 
        &webhook.txnref, 
        &webhook.amount,
    );

    if !valid {
        tracing::warn!("Rejected webhook with invalid forged signature: {}", webhook.txnref);
        return Err(AppError::Unauthorized("Invalid webhook signature".to_string()));
    }

    //-- find txn by interswitch ref--//
    let transaction = transaction_repo::find_by_reference(pool, &webhook.txnref)
    .await
    .map_err(AppError::DatabaseError)?
    .ok_or_else(|| AppError::NotFound("Transaction not found".to_string()))?;

    //--prevents double token generation--//
    if transaction.status == "success" {
        return Err(AppError::Conflict(
            "Transaction already processed".to_string(),
        ));
    }

    //--verify directly with interswtch double confirmation--//
    let verification =
        interswitch::verify_transaction(config, &webhook.txnref, transaction.amount_kobo).await?;

    //success in interswitch response codes
    if verification.response_code != "00" {
        transaction_repo::update_status(pool, transaction.id, "failed")
        .await
        .map_err(AppError::DatabaseError)?;

    tracing::warn!(
        "Payment failed for {}: {}",
        webhook.txnref,
        verification.response_description
    );

    return Err(AppError::Conflict(format!(
        "Payment failed: {}",
        verification.response_description
    )));
}
    //generate 20 token
    let token_code = token_service::generate_token_code(
        &config.token_secret_key,
        &transaction.device_id,
        &transaction.id,
        &transaction.units_purchased,
    )?;

    //save token to database
    let token = token_service::create_token(
        pool,
        transaction.id,
        transaction.device_id,
        &token_code,
        transaction.units_purchased.clone(),
    ).await?;

    //update txn to success and token link
    transaction_repo::update_status(pool, transaction.id, "success")
    .await
    .map_err(AppError::DatabaseError)?;

    transaction_repo::update_token_id(pool, transaction.id, token.id)
    .await
    .map_err(AppError::DatabaseError)?;

    // Format token for display and SMS
    let formatted = token_service::format_token_display(&token_code);
    let units_display = match transaction.units_purchased.to_i64() {
        Some(u) => format!("{:.2} units", u),
        None => format!("{} units", transaction.units_purchased),
    };

    // Send SMS - payment succeeds even if SMS fails
    tokio::spawn({
        let pool = pool.clone();
        let config = config.clone();
        let device_id = transaction.device_id;
        let token_display = formatted.clone();
        let units = units_display.clone();

        async move {
            if let Ok(Some(device)) = device_repo::find_by_id(&pool, device_id).await {
                if let Ok(Some(user)) = user_repo::find_by_id(&pool, device.user_id).await {
                    let msg = format!(
                        "Alyra Token: {}\nUnits: {}\nEnter on your meter. Valid 90 days.",
                        token_display, units
                    );
                    let _ = sms_service::send_sms(&config, &user.phone, &msg).await;
                }
            }
        }
    });

    tracing::info!(
        "Payment successful: {} — token generated for device {}",
        webhook.txnref,
        transaction.device_id
    );

    Ok(PaymentConfirmedResponse {
        transaction_id: transaction.id,
        token_code: formatted,
        units: units_display,
        message: "Payment confirmed. Enter token on your meter.".to_string(),
    })
}



//Energy units supllied calcu per kobo
fn calculate_units(device_type: &str, amount_kobo: i64) -> BigDecimal {
    match device_type {
        // Note: this is a simple ratio converting kobo amount into "energy units".
        "grid" => BigDecimal::from(amount_kobo) / BigDecimal::from(8500i64), //-- this N85naira per kwh
        "solar" => BigDecimal::from(amount_kobo) / BigDecimal::from(20000i64), //-- this N200 per day
        _ => BigDecimal::from(0),
        
    }
}