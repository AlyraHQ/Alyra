use bigdecimal::BigDecimal;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;


#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, FromRow)]
pub struct ConsumptionLog {
    pub id:                        Uuid,
    pub device_id:                 Uuid,
    pub units_remaining:           BigDecimal,
    pub previous_reading:          Option<BigDecimal>,
    pub consumption_rate:          Option<BigDecimal>,
    pub reading_trigger:           String,
    pub recorded_at:               DateTime<Utc>
}