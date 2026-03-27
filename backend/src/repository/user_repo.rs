use sqlx::PgPool;
use uuid::Uuid;
use crate::models::user::User;

pub async fn find_by_phone(pool: &PgPool, phone: &str) -> Result<Option<User>, sqlx::Error> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, phone, pin_hash, full_name, email, state, lga, address,
                vendor_id, is_verified, kyc_level::text, created_at, updated_at
         FROM users WHERE phone = $1"
    )
    .bind(phone)
    .fetch_optional(pool)
    .await?;
    Ok(user)
}

pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<User>, sqlx::Error> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, phone, pin_hash, full_name, email, state, lga, address,
                vendor_id, is_verified, kyc_level::text, created_at, updated_at
         FROM users WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;
    Ok(user)
}

pub async fn create(
    pool: &PgPool,
    phone: &str,
    pin_hash: &str,
    full_name: Option<&str>,
    email: Option<&str>,
    state: Option<&str>,
    lga: Option<&str>,
    vendor_id: Option<Uuid>
) -> Result<User, sqlx::Error> {
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (phone, pin_hash, full_name, email, state, lga)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, phone, pin_hash, full_name, email, state, lga, address,
                   vendor_id, is_verified, kyc_level::text, created_at, updated_at"
    )
    .bind(phone)
    .bind(pin_hash)
    .bind(full_name)
    .bind(email)
    .bind(state)
    .bind(lga)
    .bind(vendor_id)
    .fetch_one(pool)
    .await?;
    Ok(user)
}

pub async fn update_verified(pool: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query_as::<_, User>(
        "UPDATE users SET is_verified = true WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(())
}

pub async fn update_vendor(pool: &PgPool, user_id: Uuid, vendor_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE users SET vendor_id = $1 WHERE id = $2")
        .bind(vendor_id).bind(user_id).execute(pool).await?;
    Ok(())
}