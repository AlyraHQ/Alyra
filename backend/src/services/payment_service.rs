use sqlx::PgPool;
use uuid::Uuid;
use crate::config::Config;
use crate::errors::AppError;
use crate::dto::payment_dto::InitiatePaymentRequest;
use crate::repository::transaction_repo;
use serde::{Serialize};

use std::env;

#[derive(Debug, Serialize)]
pub struct PaymentFormData {
    pub merchant_code: String,
    pub pay_item_id: String,
    pub txn_ref: String,
    pub amount: i64,         // in kobo
    pub currency: String,
    pub site_redirect_url: String,
    pub cust_name: Option<String>,
    pub cust_email: Option<String>,
    pub cust_id: Option<String>,
    pub pay_item_name: String,
    pub mode: String,        // "TEST" or "LIVE"
}

pub struct PaymentInitResponse {
    pub reference: String,
    pub payment_url: String,
    pub form_fields: PaymentFormData,
}

pub async fn initiate_payment(
    pool: &PgPool,
    _config: &Config,
    user_id: Uuid,
    req: InitiatePaymentRequest,
) -> Result<PaymentInitResponse, AppError> {
    // Generate unique transaction reference
    let txn_ref = format!(
        "ALY-{}-{}",
        &user_id.to_string().replace('-', "")[..8],
        chrono::Utc::now().timestamp_millis()
    );

    // Save as pending transaction
    transaction_repo::create_pending(
        pool,
        user_id,
        req.device_id,
        req.amount_kobo,
        &txn_ref,
    )
    .await
    .map_err(AppError::DatabaseError)?;

    // Build form data for web payment
    let form_fields = build_payment_form(
        req.amount_kobo,
        &txn_ref,
        None,
        None,
        Some(user_id.to_string()),
    );

    let payment_url = format!(
        "{}/collections/w/pay",
        std::env::var("INTERSWITCH_BASE_URL")
            .unwrap_or_else(|_| "https://qa.interswitchng.com".to_string())
    );

    Ok(PaymentInitResponse {
        reference: txn_ref,
        payment_url,
        form_fields,
    })
}


pub fn build_payment_form(
    amount_kobo: i64,
    txn_ref: &str,
    cust_name: Option<String>,
    cust_email: Option<String>,
    cust_id: Option<String>,
) -> PaymentFormData {
    let merchant_code = env::var("INTERSWITCH_MERCHANT_CODE")
        .expect("INTERSWITCH_MERCHANT_CODE not set");
    let pay_item_id = env::var("INTERSWITCH_PAY_ITEM_ID")
        .expect("INTERSWITCH_PAY_ITEM_ID not set");
    let redirect_url = env::var("INTERSWITCH_REDIRECT_URL")
        .unwrap_or_else(|_| "https://alyra.up.railway.app/payment/callback".to_string());

    // Use TEST mode if sandbox URL in env, LIVE otherwise
    let base_url = env::var("INTERSWITCH_BASE_URL")
        .unwrap_or_else(|_| "https://qa.interswitchng.com".to_string());
    let mode = if base_url.contains("qa") || base_url.contains("sandbox") {
        "TEST".to_string()
    } else {
        "LIVE".to_string()
    };

    PaymentFormData {
        merchant_code,
        pay_item_id,
        txn_ref: txn_ref.to_string(),
        amount: amount_kobo,
        currency: "566".to_string(),
        site_redirect_url: redirect_url,
        cust_name,
        cust_email,
        cust_id,
        pay_item_name: "Energy Token Purchase".to_string(),
        mode,
    }
}

pub fn verify_transaction(
    merchant_code: &str,
    txn_ref: &str,
    amount: i64,
) -> String {
    let base_url = env::var("INTERSWITCH_BASE_URL")
        .unwrap_or_else(|_| "https://qa.interswitchng.com".to_string());
    format!(
        "{}/collections/api/v1/gettransaction.json?merchantcode={}&transactionreference={}&amount={}",
        base_url, merchant_code, txn_ref, amount
    )
}

pub fn get_verify_url(txn_ref: &str, amount: i64) -> String {
    let merchant_code = std::env::var("INTERSWITCH_MERCHANT_CODE")
        .unwrap_or_else(|_| "MX276043".to_string());
    // Always use production verify URL — sandbox verify uses same domain
    let base = std::env::var("INTERSWITCH_BASE_URL")
        .unwrap_or_else(|_| "https://qa.interswitchng.com".to_string());
    format!(
        "{}/collections/api/v1/gettransaction.json?merchantcode={}&transactionreference={}&amount={}",
        base, merchant_code, txn_ref, amount
    )
}

pub fn generate_token() -> String {
    use rand::RngExt;
    let mut rng = rand::rng();
    (0..20).map(|_| rng.random_range(0..10u8).to_string()).collect()
}