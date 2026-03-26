use bigdecimal::BigDecimal;
use sqlx::PgPool;
use uuid::Uuid;
use crate::models::transaction::Transaction;

pub async fn create(
    pool: &PgPool,
    user_id: Uuid,
    device_id: Uuid,
    amount_kobo: i64,
    units_purchased: f64,
    channel: &str,
    interswitch_ref: &str,
) -> Result<Transaction, sqlx::Error> {
    let txn = sqlx::query_as::<_, Transaction>(
        "INSERT INTO transactions 
            (user_id, device_id, amount_kobo, units_purchased, channel, interswitch_ref)
         VALUES ($1, $2, $3, $4, $5::payment_channel, $6)
         RETURNING id, user_id, device_id, amount_kobo, units_purchased,
                   channel::text, status::text, interswitch_ref, token_id,
                   initiated_at, completed_at"
    )
    .bind(user_id)
    .bind(device_id)
    .bind(amount_kobo)
    .bind(units_purchased)
    .bind(channel)
    .bind(interswitch_ref)
    .fetch_one(pool)
    .await?;
    Ok(txn)
}

pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Transaction>, sqlx::Error> {
    let txn = sqlx::query_as::<_, Transaction>(
        "SELECT id, user_id, device_id, amount_kobo, units_purchased,
                channel::text, status::text, interswitch_ref, token_id,
                initiated_at, completed_at
         FROM transactions WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;
    Ok(txn)
}

pub async fn find_by_user(pool: &PgPool, user_id: Uuid) -> Result<Vec<Transaction>, sqlx::Error> {
    let txns = sqlx::query_as::<_, Transaction>(
        "SELECT id, user_id, device_id, amount_kobo, units_purchased,
                channel::text, status::text, interswitch_ref, token_id,
                initiated_at, completed_at
         FROM transactions WHERE user_id = $1 ORDER BY initiated_at DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(txns)
}

pub async fn find_by_reference(pool: &PgPool, interswitch_ref: &str) -> Result<Option<Transaction>, sqlx::Error> {
    let txn = sqlx::query_as::<_, Transaction>(
        "SELECT id, user_id, device_id, amount_kobo, units_purchased,
                channel::text, status::text, interswitch_ref, token_id,
                initiated_at, completed_at
         FROM transactions WHERE interswitch_ref = $1"
    )
    .bind(interswitch_ref)
    .fetch_optional(pool)
    .await?;
    Ok(txn)
}

pub async fn update_status(pool: &PgPool, id: Uuid, status: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE transactions SET status = $1, completed_at = NOW() WHERE id = $2",
    )
    .bind(status)
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn update_token_id(pool: &PgPool, id: Uuid, token_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE transactions SET token_id = $1 WHERE id = $2",
    )
    .bind(token_id)
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}