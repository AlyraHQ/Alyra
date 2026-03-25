use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;
use rust_decimal::Decimal;

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, FromRow)]
pub struct ConsumptionLog {
    pub id:                        Uuid,
    pub device_id:                 Uuid,
    pub units_remaining:            Decimal,
    pub previous_reading:           Option<Decimal>,
    pub consumption_rate:           Option<Decimal>,
    pub reading_trigger:           String,
    pub recorded_at:               DateTime<Utc>
}