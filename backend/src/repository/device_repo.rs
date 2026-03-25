use sqlx::PgPool;
use uuid::Uuid;

use crate::models::device::Device;

/// create a device
pub async fn create(pool: &PgPool, 
    user_id: Uuid, 
    vendor_id: Uuid, 
    device_name: &str, 
    device_type: &str, 
    state: Option<&str>, 
    lga: Option<&str>, 
    address: Option<&str>) -> Result<Device, sqlx::Error> {
    let device = sqlx::query_as!(
        Device,
        "INSERT INTO devices (user_id, vendor_id, device_name, device_type, state, lga, address)
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING *",
        user_id, 
        vendor_id, 
        device_name, 
        device_type,
        state, 
        lga, 
        address
    )
    .fetch_one(pool)
    .await?;

    Ok(device)

}

/// find a device by user
pub async fn find_by_user(pool: &PgPool, user_id: Uuid) -> Result<Vec<Device>, sqlx::Error> {
    let devices = sqlx::query_as!(
        Device,
        "SELECT * FROM devices WHERE user_id = $1 ORDER BY created_at DESC",
        user_id
    )
    .fetch_all(pool)
    .await?;

    Ok(devices)

}

/// find a device by id
pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Device>, sqlx::Error> {
    let device = sqlx::query_as!(
        Device,
        "SELECT * FROM devices WHERE id = $1",
        id
    )
    .fetch_optional(pool)
    .await?;

    
    Ok(device)
}

/// update device status
pub async fn update_status(pool: &PgPool) -> Result<(), sqlx::Error> {

}
