
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, PartialEq, Clone)]
pub struct Transaction {
    pub id:                 Uuid,
    pub user_id:            Uuid,
    pub device_id:          Uuid,
    pub amount_kobo:        i64,
    pub units_purchased:    f64,
    pub channel:            String,
    pub status:             String,
    pub interswitch_ref:    Option<String>,
    pub token_id:           Option<Uuid>,
    pub initiated_at:       DateTime<Utc>,
    pub completed_at:       Option<DateTime<Utc>>
}