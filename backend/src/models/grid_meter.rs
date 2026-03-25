use bigdecimal::BigDecimal;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;


#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, FromRow)]
pub struct GridMeter {
    pub id:                     Uuid,
    pub device_id:              Uuid,
    pub meter_number:           String,
    pub tariff_kobo_per_kwh:    i64, 
    pub units_balance:          BigDecimal,
    pub last_vend_at:           Option<DateTime<Utc>>
}