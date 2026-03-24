use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, FromRow)]
pub struct Alert {
    pub id:                 Uuid,
    pub device_id:          Uuid,
    pub user_id:            Uuid,
    pub alert_type:         String,
    pub message:            String,
    pub sent_via:           String,
    pub status:             String,
    pub scheduled_at:       DateTime<Utc>,
    pub sent_at:            Option<DateTime<Utc>>,
    pub created_at:         DateTime<Utc>
}