use sqlx::PgPool;
use uuid::Uuid;
use bigdecimal::BigDecimal;

use crate::{config::Config, dto::payment_dto::{InitiatePaymentRequest, InitiatePaymentResponse, InterswitchWebhook, PaymentConfirmedResponse}, errors::AppError, repository::{device_repo, transaction_repo}, services::interswitch};


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