use hmac::{Hmac, Mac};
use serde::Deserialize;
use sha2::Sha256;
use reqwest::Client as HttpClient;

use crate::{config::Config, errors::AppError};

type HmacSha256 = Hmac<Sha256>;

fn compute_hmac(key: &str, message: &str) -> String {
    // Interswitch expects a hex-encoded HMAC-SHA256 digest.
    let mut mac =
        HmacSha256::new_from_slice(key.as_bytes()).expect("HMAC can take key of any size");
    mac.update(message.as_bytes());
    let result = mac.finalize().into_bytes();

    let mut out = String::with_capacity(result.len() * 2);
    for b in result {
        // Each byte becomes two lower-case hex chars.
        use std::fmt::Write;
        write!(&mut out, "{:02x}", b).expect("writing hex should not fail");
    }
    out
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
    txn_ref: &str, amount_kobo: i64, redirect_url: &str,
) -> String {
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
    let client = HttpClient::new();
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