use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, FromRow)]
pub struct Vendor {
    pub id: Uuid,
    pub business_name: String,
    pub owner_name: String,
    pub phone: String,
    pub email: Option<String>,
    pub cac_number: Option<String>,
    pub commission_bp: i16,
    pub is_approved: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>
}