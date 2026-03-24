use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;
use bigdecimal::BigDecimal;

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, FromRow)]
pub struct ConsumptionLog {
    pub id:                        Uuid,
    pub device_id:                 Uuid,
    pub units_remaining:           BigDecimal,
    pub previous_reading :         BigDecimal,
    pub consumption_rate:          BigDecimal, 
    pub reading_trigger:           String,
    pub recorded_at:               DateTime<Utc>
}