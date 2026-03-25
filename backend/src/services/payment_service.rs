use sqlx::PgPool;
use uuid::Uuid;

use crate::{config::Config, dto::payment_dto::{InitiatePaymentRequest, InitiatePaymentResponse}, errors::AppError, repository::{device_repo, transaction_repo}, services::interswitch};


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
        req.channel, 
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

//Energy units supllied calcu per kobo
fn calculate_units(device_type: &str, amount_kobo: i64) -> f64 {
    match device_type {
        "grid" => amount_kobo as f64 /8500.0, //--this N85naira per kwh
        "solar" => amount_kobo as f64 /20000.0, //--this N200 per day
        _ => 0.0,
        
    }
}