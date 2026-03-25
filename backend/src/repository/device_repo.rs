use sqlx::PgPool;
use uuid::Uuid;

use crate::models::device::Device;

/// create a device
pub async fn create(pool: &PgPool, 
    user_id: Uuid, 
    vendor_id: Uuid, 
    device_name: &str, 
    device_type: &str, 
    status: &str, 
    state: Option<&str>, 
    lga: Option<&str>, 
    address: Option<&str>) -> Result<Device, sqlx::Error> {

}

/// find a device by user
pub async fn find_by_user(pool: &PgPool, user: &str) -> Result<Option<Device>, sqlx::Error> {

}

/// find a device by id
pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Device>, sqlx::Error> {

}
/// update device status
pub async fn update_status(pool: &PgPool) -> 
