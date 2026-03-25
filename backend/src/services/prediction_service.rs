use sqlx::PgPool;
use uuid::Uuid;
use chrono::Utc;

use crate::errors::AppError;
use crate::repository::device_repo;

#[derive(Debug)]
pub struct DepletionPrediction {
    pub device_id: Uuid,
    pub units_remaining: f64,
    pub consumption_rate_per_hour: f64,
    pub hours_until_empty: f64,
    pub predicted_depletion_time: String,
    pub recommended_top_up_kobo: i64,
}

/// when will device run out of energy ?
pub async fn predict_depletion(
    pool: &PgPool,
    device_id: Uuid,
) -> Result<Option<DepletionPrediction>, AppError> {
    // Get device to confirm it exists and is active
    let device = device_repo::find_by_id(pool, device_id)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("Device not found".to_string()))?;

    if device.status != "active" {
        return Ok(None);
    }

    // Get and comapre last two consumption(prev - current) readings for this device / hours between 
    let readings = get_recent_readings(pool, device_id).await?;

    if readings.len() < 2 {

        // Not enough data yet to predict
        return Ok(None);
    }

    let (current, previous) = (&readings[0], &readings[1]);
    let units_consumed = previous.units - current.units;

    if units_consumed <= 0.0 {
        return Ok(None);
    }

    // Hours between the two readings
    let hours = (previous.recorded_at - current.recorded_at)
        .num_minutes()
        .abs() as f64
        / 60.0;

    if hours == 0.0 {
        return Ok(None);
    }

    let rate_per_hour = units_consumed / hours;
    let hours_until_empty = current.units / rate_per_hour;

    let depletion_time = Utc::now()
        + chrono::Duration::minutes((hours_until_empty * 60.0) as i64);

    // Recommend enough units to last 3 days at current rate
    let recommended_units = rate_per_hour * 72.0;
    let recommended_kobo = (recommended_units * 8500.0) as i64; // ₦85 per kWh default

    tracing::info!(
        "Device {}: {:.2} units left, {:.1}h until empty",
        device_id, current.units, hours_until_empty
    );

    Ok(Some(DepletionPrediction {
        device_id,
        units_remaining: current.units,
        consumption_rate_per_hour: rate_per_hour,
        hours_until_empty,
        predicted_depletion_time: depletion_time.to_rfc3339(),
        recommended_top_up_kobo: recommended_kobo,
    }))
}

/// Check if device is below alert threshold  if requires the need for notis
pub fn needs_alert(prediction: &DepletionPrediction) -> bool {
    //send notis if its 24h supply remaining
    prediction.hours_until_empty < 24.0
}

// read data
struct ReadingPoint {
    units: f64,
    recorded_at: chrono::DateTime<Utc>,
}

/// get and comp last 2 consumption(prev-recent) readings for a device
async fn get_recent_readings(
    pool: &PgPool,
    device_id: Uuid,
) -> Result<Vec<ReadingPoint>, AppError> {
    let rows = sqlx::query_as::<_, (f64, chrono::DateTime<Utc>)>(
        "SELECT units_remaining, recorded_at 
         FROM consumption_logs 
         WHERE device_id = $1 
         ORDER BY recorded_at DESC 
         LIMIT 2"
    )
    .bind(device_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::DatabaseError)?;

    Ok(rows
        .into_iter()
        .map(|(units, recorded_at)| ReadingPoint { units, recorded_at })
        .collect())
}