

use sqlx::PgPool;
use uuid::Uuid;

use crate::models::vendor::Vendor;

pub async fn create(pool: &PgPool, 
    business_name: &str, 
    owner_name: &str, 
    phone: &str, 
    email: Option<&str>, 
    cac_number: Option<&str>) -> Result<Vendor, sqlx::Error> {
    let vendor = sqlx::query_as::<_, Vendor>(
        "INSERT INTO vendors (business_name, owner_name, phone, email, cac_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *",
    )
    .bind(business_name)
    .bind(owner_name)
    .bind(phone)
    .bind(email)
    .bind(cac_number)
    .fetch_one(pool)
    .await?;

    Ok(vendor)
}

//list all vendors
pub async fn list_all(pool: &PgPool) -> Result<Vec<Vendor>, sqlx::Error> {
    let vendors = sqlx::query_as::<_, Vendor>(
        "SELECT * FROM vendors WHERE is_approved = true ORDER BY business_name ASC"
    )
    .fetch_all(pool).await?;
    Ok(vendors)
}

//find vendor by phone
pub async fn find_by_phone(pool: &PgPool, phone: &str) -> Result<Option<Vendor>, sqlx::Error> {
    let vendor = sqlx::query_as::<_, Vendor>(
        "SELECT * FROM vendors WHERE phone = $1",
    )
    .bind(phone)
    .fetch_optional(pool)
    .await?;

    Ok(vendor)
}

//find vendor by id
pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Vendor>, sqlx::Error> {
    let vendor = sqlx::query_as::<_, Vendor>(
        "SELECT * FROM vendors WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(vendor)
}

//aprove vendor
pub async fn approve(pool: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE vendors SET is_approved = true WHERE id = $1",
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}