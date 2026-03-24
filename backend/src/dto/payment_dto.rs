use serde::{Deserialize, Serialize};
use uuid::Uuid;

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
