use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Vendor registration req
#[derive(Debug, Deserialize)]
pub struct RegisterVendorRequest {
    pub business_name: String,
    pub owner_name: String,
    pub phone: String,
    pub email: Option<String>,
    pub cac_number: Option<String>,
}

/// Vendor profile resp
#[derive(Debug, Serialize)]
pub struct VendorResponse {
    pub id: Uuid,
    pub business_name: String,
    pub owner_name: String,
    pub phone: String,
    pub is_approved: bool,
}
