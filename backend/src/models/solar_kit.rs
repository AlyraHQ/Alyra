use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;


#[derive(Debug, Serialize, Deserialize, FromRow, PartialEq, Clone)]
pub struct SolarKit {
    pub id:                     Uuid,
    pub device_id:              Uuid,
    pub kit_serial_number:      String,
    pub battery_percent:        i16,    
    pub daily_rate_kobo:        i64,       
    pub is_active:              bool,
    pub next_payment_due:       Option<DateTime<Utc>>,
    pub activated_at:           Option<DateTime<Utc>>,

}