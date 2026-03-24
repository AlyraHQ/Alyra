use anyhow::Ok;
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::user::User;


pub async fn create(pool: &PgPool, phone: &str, pin_hash: &str, vendor_id: Option<Uuid>) -> Result<User, sqlx::Error> {
    let user = sqlx::query_as!(
        User,
        "INSERT INTO users (phone, pin_hash, vendor_id)
        VALUES ($1, $2, $3)
        RETURNING *",
        phone,
        pin_hash,
        vendor_id
    )
    .fetch_one(pool)
    .await?;

    Ok(user)
}

pub async fn find_by_phone(pool: &PgPool, phone: &str) -> Result<Option<User>, sqlx::Error> {
    let user = sqlx::query_as!(
        User,
        "SELECT * FROM users WHERE phone = $1",
        phone
    )
    .fetch_optional(pool)
    .await?;
Ok(user)

}

pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<User>, sqlx::Error> {

}