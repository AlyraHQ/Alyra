use bigdecimal::BigDecimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::transaction::Transaction;

/// Frontend sends for payment intiation 
/// Amount kobo in i64 50000 = 500Naira
/// Channel - ussd-web-diaspora
#[derive(Debug, Deserialize)]
pub struct InitiatePaymentRequest {
    pub device_id: Uuid,
    pub amount_kobo: i64,              
    pub channel: String,              
}

/// Backend sends resp back with Interswitch payment URL hook
/// payment url is subjected to redirection && ref = interswitch ref
#[derive(Debug, Serialize)]
pub struct InitiatePaymentResponse {
    pub transaction_id: Uuid,
    pub payment_url: String,           
    pub reference: String,             
    pub amount_naira: f64,             
}

/// Interswitch pull webhook once payment is confirmed
/// having "00" means txn success and mac = HMA sign verification
#[derive(Debug, Deserialize)]
pub struct InterswitchWebhook {
    pub txnref: String,  
    pub amount: String,
    pub resp: String,                  
    pub mac: String,                
}

/// Sent to client side after confirmation of payment
/// token code in 20CHAR: XXXX XXXX XXXX XXXX XXXX
#[derive(Debug, Serialize)]
pub struct PaymentConfirmedResponse {
    pub transaction_id: Uuid,
    pub token_code: String,            
    pub units: String,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct TransactionResponse {
    pub id: Uuid,
    pub amount_kobo: i64,
    pub amount_naira: f64,
    pub units_purchased: BigDecimal,
    pub channel: String,
    pub status: String,
    pub initiated_at: String,
}

/// Converts Txn model to TxnResp DTO
impl From<Transaction> for TransactionResponse {
    fn from(txn: Transaction) -> Self {
        Self {
            id: txn.id,
            amount_kobo: txn.amount_kobo,
            amount_naira: txn.amount_kobo as f64 / 100.0,
            units_purchased: txn.units_purchased,
            channel: txn.channel,
            status: txn.status,
            initiated_at: txn.initiated_at.to_rfc3339(),
        }
    }
}