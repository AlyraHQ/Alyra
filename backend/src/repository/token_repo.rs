use sqlx::PgPool;
use uuid::Uuid;
use crate::models::token::Token;

pub async fn create(
    pool: &PgPool,
    transaction_id: Uuid,
    device_id: Uuid,
    token_code: &str,
    units: f64,
    expires_at: chrono::DateTime<chrono::Utc>,
) -> Result<Token, sqlx::Error> {
    let token = sqlx::query_as!(
        Token,
        "INSERT INTO tokens
            (transaction_id, device_id, token_code, units, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *",
        transaction_id,
        device_id,
        token_code,
        units as f64,
        expires_at,
    )
    .fetch_one(pool)
    .await?;

    Ok(token)
}

pub async fn find_by_code(
    pool: &PgPool,
    token_code: &str,
) -> Result<Option<Token>, sqlx::Error> {
    let token = sqlx::query_as!(
        Token,
        "SELECT * FROM tokens WHERE token_code = $1",
        token_code
    )
    .fetch_optional(pool)
    .await?;

    Ok(token)
}

pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Token>, sqlx::Error> {
    let token = sqlx::query_as!(
        Token,
        "SELECT * FROM tokens WHERE id = $1",
        id
    )
    .fetch_optional(pool)
    .await?;

    Ok(token)
}

pub async fn mark_as_used(pool: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE tokens SET is_used = true, used_at = NOW() WHERE id = $1",
        id
    )
    .execute(pool)
    .await?;

    Ok(())
}
