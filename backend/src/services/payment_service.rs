use sqlx::PgPool;
use uuid::Uuid;
use crate::config::Config;
use crate::errors::AppError;
use crate::dto::payment_dto::InitiatePaymentRequest;
use crate::repository::transaction_repo;
use serde::Serialize;
use std::env;
use rand::RngExt;
use sha2::{Sha512, Digest};

#[derive(Debug, Serialize)]
pub struct PaymentFormData {
    pub product_id: String,          
    pub pay_item_id: String,
    pub txn_ref: String,
    pub amount: i64,
    pub currency: i32,
    pub site_redirect_url: String,
    pub hash: String,   
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cust_email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cust_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cust_id: Option<String>,
    pub pay_item_name: String,
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
    let txn_ref = format!(
        "YOUR-{}-{}",
        &user_id.to_string().replace('-', "")[..8],
        chrono::Utc::now().timestamp_millis()
    );

    transaction_repo::create_pending(
        pool,
        user_id,
        req.device_id,
        req.amount_kobo,
        &txn_ref,
    )
    .await
    .map_err(AppError::DatabaseError)?;

    let form_fields = build_payment_form(
        req.amount_kobo,
        &txn_ref,
        None,
        Some("test@example.com".to_string()),
        Some(user_id.to_string()),
    );

    let payment_url = format!(
        "{}/collections/w/pay",
        env::var("INTERSWITCH_BASE_URL")
            .unwrap_or_else(|_| "https://newwebpay.qa.interswitchng.com".to_string())
    );

    Ok(PaymentInitResponse {
        reference: txn_ref,
        payment_url,
        form_fields,
    })
}

fn generate_hash(
    product_id: &str,
    txn_ref: &str,
    amount: i64,
    redirect_url: &str,
    mac_key: &str,
) -> String {
    let raw = format!(
        "{}{}{}{}{}",
        product_id,
        txn_ref,
        amount,
        redirect_url,
        mac_key
    );

    let mut hasher = Sha512::new();
    hasher.update(raw.as_bytes());

    hex::encode(hasher.finalize())
}

pub fn build_payment_form(
    amount_kobo: i64,
    txn_ref: &str,
    cust_name: Option<String>,
    cust_email: Option<String>,
    cust_id: Option<String>,
) -> PaymentFormData {
    let merchant_code = env::var("INTERSWITCH_MERCHANT_CODE")
        .unwrap_or_else(|_| "MX276043".to_string());
    let pay_item_id = env::var("INTERSWITCH_PAY_ITEM_ID")
        .unwrap_or_else(|_| "2629132".to_string());
    let redirect_url = env::var("INTERSWITCH_REDIRECT_URL")
        .unwrap_or_else(|_| "https://alyraa.vercel.app/payment/callback".to_string());
    let mac_key = env::var("INTERSWITCH_MAC_KEY")
    .unwrap_or_else(|_| "rUxk2gPZ74uybNw".to_string());

    let email = cust_email.unwrap_or_else(|| "test@example.com".to_string());
    let hash = generate_hash(
        &merchant_code,
        txn_ref,
        amount_kobo,
        &redirect_url,
        &mac_key,
    );

    println!("=== BUILDING PAYMENT FORM WITH YOUR CREDENTIALS ===");
    println!("Merchant Code: {}", merchant_code);
    println!("Pay Item ID: {}", pay_item_id);
    println!("Amount in kobo: {}", amount_kobo);
    println!("Amount in naira: {}", amount_kobo as f64 / 100.0);
    println!("Transaction Ref: {}", txn_ref);
    println!("Redirect URL: {}", redirect_url);

    PaymentFormData {
        product_id: merchant_code,
        pay_item_id,
        txn_ref: txn_ref.to_string(),
        amount: amount_kobo,
        currency: 566,
        hash,
        site_redirect_url: redirect_url,
        cust_email: Some(email),
        cust_name,
        cust_id,
        pay_item_name: "Energy Token Purchase".to_string(),
    }
}

pub fn get_verify_url(txn_ref: &str, amount: i64) -> String {
    let merchant_code = env::var("INTERSWITCH_MERCHANT_CODE")
        .unwrap_or_else(|_| "MX276043".to_string());
    format!(
        "https://newwebpay.qa.interswitchng.com/collections/api/v1/gettransaction.json?merchantcode={}&transactionreference={}&amount={}",
        merchant_code, txn_ref, amount
    )
}

pub fn generate_token() -> String {
    use rand::Rng;
    let mut rng = rand::rng();
    (0..20).map(|_| rng.random_range(0..10).to_string()).collect()
}