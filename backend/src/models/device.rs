use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;


#[derive(Debug, Serialize, Deserialize, FromRow, PartialEq, Clone)]
pub struct Device {
    pub id:             Uuid,
    pub user_id:        Uuid,
    pub vendor_id:      Uuid,
    pub device_name:    String,
    pub device_type:    String,
    pub status:         String,
    pub state:          Option<String>,
    pub lga:            Option<String>,
    pub address:        Option<String>,
    pub created_at:     DateTime<Utc>,
    pub updated_at:     DateTime<Utc>
}