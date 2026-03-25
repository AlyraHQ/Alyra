use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::vendor::Vendor;

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

impl From<Vendor> for VendorResponse {
    fn from(vendor: Vendor) -> Self {
        Self {
            id: vendor.id,
            business_name: vendor.business_name,
            owner_name: vendor.owner_name,
            phone: vendor.phone,
            is_approved: vendor.is_approved,
        }
    }
}