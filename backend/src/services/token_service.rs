use hmac::{Hmac, Mac};
use sha2::Sha256;
use uuid::Uuid;
use chrono::{Utc, Duration};
use sqlx::PgPool;
use bigdecimal::BigDecimal;

use crate::errors::AppError;
use crate::models::token::Token;
use crate::repository::token_repo;

type HmacSha256 = Hmac<Sha256>;

/// Generates a 20-digit numeric token using HMAC-SHA256
pub fn generate_token_code(
    secret_key: &str,
    device_id: &Uuid,
    transaction_id: &Uuid,
    units: &BigDecimal,
) -> Result<String, AppError> {
    let mut mac = HmacSha256::new_from_slice(secret_key.as_bytes())
        .map_err(|_| AppError::InternalError("Token engine init failed".to_string()))?;

    // Message = device + transaction + units — unique per payment
    let message = format!("{}:{}:{}", device_id, transaction_id, units);
    mac.update(message.as_bytes());

    let result = mac.finalize().into_bytes();
    let hex_str = hex::encode(result);

    // Extract only numeric characters
    let numeric: String = hex_str
        .chars()
        .filter(|c| c.is_ascii_digit())
        .take(20)
        .collect();

    // Pad to exactly 20 digits 
    Ok(format!("{:0>20}", numeric))
}

/// Formats 20-digit token for display and SMS
pub fn format_token_display(token_code: &str) -> String {
    token_code
        .chars()
        .collect::<Vec<char>>()
        .chunks(4)
        .map(|c| c.iter().collect::<String>())
        .collect::<Vec<String>>()
        .join(" ")
}

/// Saves token to database
pub async fn create_token(
    pool: &PgPool,
    transaction_id: Uuid,
    device_id: Uuid,
    token_code: &str,
    units: BigDecimal,
) -> Result<Token, AppError> {
    let expires_at = Utc::now() + Duration::days(90);

    token_repo::create(pool, transaction_id, device_id, token_code, units, expires_at)
        .await
        .map_err(AppError::DatabaseError)
}

/// Validates token when user enters it on meter
pub async fn validate_and_use_token(
    pool: &PgPool,
    token_code: &str,
) -> Result<Token, AppError> {
    // Strip spaces in case user entered formatted version
    let clean_code = token_code.replace(" ", "");

    let token = token_repo::find_by_code(pool, &clean_code)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("Token not found".to_string()))?;

    if token.is_used {
        return Err(AppError::Conflict("Token already used".to_string()));
    }

    if token.expires_at < Utc::now() {
        return Err(AppError::Conflict("Token expired".to_string()));
    }

    // Mark as used
    token_repo::mark_as_used(pool, token.id)
        .await
        .map_err(AppError::DatabaseError)?;

    Ok(token)
}
