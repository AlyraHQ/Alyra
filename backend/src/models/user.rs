use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, PartialEq, FromRow, Clone)]
pub struct User {
    pub id:             Uuid,
    pub phone:          String,
    pub pin_hash:       String,
    pub full_name:      Option<String>,
    pub email:          Option<String>,
    pub state:          Option<String>,
    pub lga:            Option<String>,
    pub address:        Option<String>,
    pub vendor_id:      Option<Uuid>,
    pub is_verified:    bool,
    pub kyc_level:      String,
    pub created_at:     DateTime<Utc>,
    pub updated_at:     DateTime<Utc>
}