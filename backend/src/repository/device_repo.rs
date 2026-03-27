use sqlx::PgPool;
use uuid::Uuid;

use crate::models::device::Device;

pub async fn create(
    pool: &PgPool,
    user_id: Uuid,
    vendor_id: Uuid,
    device_name: &str,
    device_type: &str,
    state: Option<&str>,
    lga: Option<&str>,
    address: Option<&str>,
) -> Result<Device, sqlx::Error> {
    let device = sqlx::query_as::<_, Device>(
        "INSERT INTO devices (user_id, vendor_id, device_name, device_type, state, lga, address)
         VALUES ($1, $2, $3, $4::device_type, $5, $6, $7)
         RETURNING id, user_id, vendor_id, device_name, device_type::text,
                   status::text, state, lga, address, created_at, updated_at"
    )
    .bind(user_id)
    .bind(vendor_id)
    .bind(device_name)
    .bind(device_type)
    .bind(state)
    .bind(lga)
    .bind(address)
    .fetch_one(pool)
    .await?;
    Ok(device)
}

/// find a device by user

pub async fn find_by_user(pool: &PgPool, user_id: Uuid) -> Result<Vec<Device>, sqlx::Error> {
    let devices = sqlx::query_as::<_, Device>(
        "SELECT id, user_id, vendor_id, device_name, device_type::text,
                status::text, state, lga, address, created_at, updated_at
         FROM devices WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(devices)
}


/// find a device by id
pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Device>, sqlx::Error> {
    let device = sqlx::query_as::<_, Device>(
        "SELECT id, user_id, vendor_id, device_name, device_type::text, 
                status::text, state, lga, address, created_at, updated_at
         FROM devices WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;
    Ok(device)
}

/// update device status
pub async fn update_status(pool: &PgPool, id: Uuid, status: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE devices SET status = $1::device_status WHERE id = $2"
    )
    .bind(status)
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn add_units(
    pool: &sqlx::PgPool,
    device_id: uuid::Uuid,
    units: f64,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE devices SET units_balance = COALESCE(units_balance, 0) + $1 WHERE id = $2"
    )
    .bind(units)
    .bind(device_id)
    .execute(pool)
    .await?;
    Ok(())
}