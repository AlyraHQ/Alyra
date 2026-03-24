

use sqlx::PgPool;
use uuid::Uuid;

use crate::models::vendor::Vendor;

pub async fn create(pool: &PgPool, business_name: &str, owner_name: &str, phone: &str, email: Option<&str>, cac_number: Option<&str>) -> Result<Vendor, sqlx::Error> {
    let vendor = sqlx::query_as!(
        Vendor,
        "INSERT INTO vendors (business_name, owner_name, phone, email, cac_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *",
        business_name, 
        owner_name, 
        phone, 
        email, 
        cac_number
    )
    .fetch_one(pool)
    .await?;

    Ok(vendor)
}

pub async fn find_by_phone(pool: &PgPool, phone: &str) -> Result<Option<Vendor>, sqlx::Error> {
    let vendor = sqlx::query_as!(
        Vendor,
        "SELECT * FROM vendors WHERE phone = $1",
        phone
    )
    .fetch_optional(pool)
    .await?;

    Ok(vendor)
}

pub async fn find_by_id(pool: &PgPool) -> Result<Option<Vendor>, sqlx::Error> {

}

pub async fn approve(pool: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {

}