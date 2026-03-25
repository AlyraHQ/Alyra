use bcrypt::hash;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{config::Config, dto::auth_dto::{RegisterRequest, UserResponse}, errors::AppError, repository::user_repo};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub phone: String,
    pub exp: i64,
    pub iat: i64,
}

//--register---//
pub async fn register(pool: &PgPool, 
    config: &Config, 
    req: RegisterRequest) -> Result<UserResponse, AppError> {
    //check if phone no already exist
    let existing = user_repo::find_by_phone(pool, &req.phone).await
    .map_err(|e| AppError::DatabaseError(e))?;
    
    if existing.is_some() {
        return  Err(AppError::Conflict("Phone number already registered".to_string()));
    }

    //never stop Hash Pin as plain text
    let pin_hash = hash(&req.pin, config.bcrypt_cost)
    .map_err(|_| AppError::InternalError("PIN failed to hash".to_string()))?;

    //create new user in db
    let user = user_repo::create(
        pool, 
        &req.phone, 
        &pin_hash, 
        req.full_name.as_deref(),
        req.email.as_deref(),
        req.state.as_deref(),
        req.lga.as_deref(),
    ).await.map_err(|e| AppError::DatabaseError(e))?;
    
    Ok(user_)
}