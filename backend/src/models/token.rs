use bigdecimal::BigDecimal;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, PartialEq, Clone)]
pub struct Token {
    pub id:                 Uuid,
    pub transaction_id:     Uuid,
    pub device_id:          Uuid,
    pub token_code:         String,
    pub units:              BigDecimal,
    pub is_used:            bool,
    pub used_at:            Option<DateTime<Utc>>,
    pub expires_at:         DateTime<Utc>,
    pub created_at:         DateTime<Utc>
}