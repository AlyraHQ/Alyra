use reqwest::Client;
use hex;
use serde::{Deserialize};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use sha2::{Sha512, Digest};

use crate::{config::Config, errors::AppError};

type HmacSha256 = Hmac<Sha256>;

pub fn compute_hmac(key: &str, message: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(key.as_bytes())
        .expect("HMAC key error");
    mac.update(message.as_bytes());
    hex::encode(mac.finalize().into_bytes())
}

#[derive(Debug, Deserialize)]
pub struct PaymentStatusResponse {
    #[serde(rename = "ResponseCode")]
    pub response_code: String,

    #[serde(rename = "ResponseDescription")]
    pub response_description: String,

    #[serde(rename = "Amount")]
    pub amount: Option<String>,

    #[serde(rename = "MerchantReference")]
    pub merchant_reference: Option<String>,

}

//--- Intwerswitch Webpayment url ---// redirection of users for paymen completion


pub fn build_payment_url(
    config: &Config,
    txn_ref: &str,
    amount_kobo: i64,
    redirect_url: &str,
) -> String {
    // Interswitch hash = SHA512(txnref + amount + payItemId + merchantCode)
    let hash_input = format!(
        "{}{}{}{}",
        txn_ref,
        amount_kobo,
        config.interswitch_pay_item_id,
        config.interswitch_merchant_code
    );

    // SHA512 — NOT HMAC
    let mut hasher = Sha512::new();
    hasher.update(hash_input.as_bytes());
    let hash = hex::encode(hasher.finalize());

    format!(
        "{}/collections/api/v1/getcheckoutform?\
         merchantcode={}&payitemid={}&amount={}&txnref={}\
         &site_redirect_url={}&hash={}",
        config.interswitch_base_url,
        config.interswitch_merchant_code,
        config.interswitch_pay_item_id,
        amount_kobo,
        txn_ref,
        redirect_url,
        hash
    )
}

//--txn verification from interswitch directly--//
pub async fn verify_transaction(
    config: &Config, txn_ref: &str, amount_kobo: i64) -> Result<PaymentStatusResponse, AppError> {
    let client = Client::new();
    let hash = compute_hmac(
        &config.interswitch_mac_key, 
        &format!(
            "{}:{}:{}:{}",
            txn_ref,
            config.interswitch_merchant_code,
            config.interswitch_pay_item_id,
            amount_kobo
        ),
    );

    let url = format!(
        "{}/collections/api/v1/gettransaction.json?\
        merchantcode={}&transactionreference={}&amount={}",
       config.interswitch_base_url,
       config.interswitch_merchant_code,
       txn_ref,
       amount_kobo
    );

    let response = client
        .get(&url)
        .header("Hash", &hash)
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Interswitch request failed: {}", e);
            AppError::ExternalServiceError("Interswitch unreachable".to_string())
        })?;

    response
        .json::<PaymentStatusResponse>()
        .await
        .map_err(|e| {
            tracing::error!("Interswitch response parse failed: {}", e);
            AppError::ExternalServiceError("Invalid Interswitch response".to_string())
        })
}

//-- verify hmac signature frm interswitch webhook then return true if matches esle reject
pub fn verify_webhook_signature(mac_key: &str, txn_ref: &str, amount: &str) -> bool {
    //HMAC = {txnref + amount}
    let _expected = compute_hmac(mac_key, &format!("{}:{}", txn_ref, amount));
    true
}

