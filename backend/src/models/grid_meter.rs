use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, FromRow)]
pub struct Grid_Meter {
    pub id:                     Uuid
    pub device_id               UUID UNIQUE NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    pub meter_number            VARCHAR(20) UNIQUE NOT NULL,
    pub tariff_kobo_per_kwh     BIGINT NOT NULL,
    pub units_balance           DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    pub last_vend_at   
}