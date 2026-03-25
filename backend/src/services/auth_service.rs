use bcrypt::{hash, verify};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{config::Config, dto::auth_dto::{AuthResponse, LoginRequest, RegisterRequest, UserResponse}, errors::AppError, repository::user_repo};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub phone: String,
    pub exp: i64,
    pub iat: i64,
}

//--register---//
pub async fn register(
    pool: &PgPool,
    config: &Config,
    req: RegisterRequest,
) -> Result<UserResponse, AppError> {
    // Check phone not already registered
    let existing = user_repo::find_by_phone(pool, &req.phone)
        .await
        .map_err(AppError::DatabaseError)?;

    if existing.is_some() {
        return Err(AppError::Conflict("Phone number already registered".to_string()));
    }

    // Hash PIN — bcrypt cost 
    let pin_hash = hash(&req.pin, config.bcrypt_cost)
        .map_err(|_| AppError::InternalError("Failed to hash PIN".to_string()))?;

    // Insert user into database
    let user = user_repo::create(
        pool,
        &req.phone,
        &pin_hash,
        req.full_name.as_deref(),
        req.email.as_deref(),
        req.state.as_deref(),
        req.lga.as_deref(),
    )
    .await
    .map_err(AppError::DatabaseError)?;

    
    Ok(UserResponse::from(user))
}

pub async fn login(
    pool: &PgPool,
    config: &Config,
    req: LoginRequest,
) -> Result<AuthResponse, AppError> {
    let user = user_repo::find_by_phone(pool, &req.phone).await
    .map_err(AppError::DatabaseError)?
    .ok_or_else(|| AppError::Unauthorized("Invalid phone / Pin".to_string()))?;

    //verify PIN - bcrypt hash
    let valid = verify(&req.pin, &user.pin_hash)
    .map_err(|_| AppError::InternalError("PIN verification failed!! ".to_string()))?

    if !valid {
        return Err(AppError::Unauthorized("Invalid phone / PIN".to_string()));
    }

    // generate access token -time set 15min
    let access_token = generate_token(
        &user.id.to_string(),
        &user.phone,
        config.jwt_access_expiry_secs,
        &config.jwt_private_key
    )?;

    // Generate refresh token (7 days)
    let refresh_token = generate_token(
        &user.id.to_string(),
        &user.phone,
        config.jwt_refresh_expiry_secs,
        &config.jwt_private_key,
    )?;

    Ok(AuthResponse {
        access_token,
        refresh_token,
        token_type: "Bearer".to_string(),
        expires_in: config.jwt_access_expiry_secs,
    })
}

pub fn generate_token