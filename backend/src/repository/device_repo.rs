use sqlx::PgPool;

/// create a device
pub async fn create(pool: &PgPool, )

/// find a device by user
/// find a device by id
/// update device status
/// 
/// create          → insert new device, return Device
find_by_id      → load single device by id
find_by_user    → load all devices for a user (Vec<Device>)
update_status   → flip status active/inactive/suspended