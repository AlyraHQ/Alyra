use thiserror::Error;
use serde_json::json;
use actix_web::{HttpResponse, ResponseError, http::{StatusCode}};

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),

    // Missing or invalid JWT token
    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    // Valid token but insufficient permissions 
    #[error("Forbidden: {0}")]
    Forbidden(String),

    /// Request is malformed — 400
    #[error("Bad request: {0}")]
    BadRequest(String),

    /// Request body fails validation — 422
    #[error("Validation error: {0}")]
    ValidationError(String),

    /// Duplicate resource e.g. phone already registered — 409
    #[error("Conflict: {0}")]
    Conflict(String),

    // ── Payment Errors ────
    /// Payment processing failed — 402
    #[error("Payment error: {0}")]
    PaymentError(String),

    /// Interswitch webhook  failure —
    #[error("Invalid webhook signature")]
    InvalidWebhookSignature,

    // ── Server Errors ──────
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    /// Redis errors nt
    #[error("Cache error: {0}")]
    RedisError(#[from] redis::RedisError),

    /// Catch-all for unexpected failures
    #[error("Internal server error: {0}")]
    Internal(String),
}

pub type AppResult<T> = Result<T, AppError>;

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        use actix_web::http::StatusCode;
        match self {
            AppError::NotFound(_)              => StatusCode::NOT_FOUND,              
            AppError::Unauthorized(_)          => StatusCode::UNAUTHORIZED,           
            AppError::Forbidden(_)             => StatusCode::FORBIDDEN,              
            AppError::BadRequest(_)            => StatusCode::BAD_REQUEST,            
            AppError::ValidationError(_)       => StatusCode::UNPROCESSABLE_ENTITY,   
            AppError::Conflict(_)              => StatusCode::CONFLICT,               
            AppError::PaymentError(_)          => StatusCode::PAYMENT_REQUIRED,       
            AppError::InvalidWebhookSignature  => StatusCode::UNAUTHORIZED,           
            AppError::DatabaseError(_)         => StatusCode::INTERNAL_SERVER_ERROR,  
            AppError::RedisError(_)            => StatusCode::INTERNAL_SERVER_ERROR,  
            AppError::Internal(_)              => StatusCode::INTERNAL_SERVER_ERROR,  
        }
    }

    fn error_response(&self) -> HttpResponse {
        let status = self.status_code();

        let message = match self {
            AppError::DatabaseError(e) => {
                tracing::error!("Database error: {:?}", e);
                "A database error occured, try again".to_string()
            }
            AppError::RedisError(e) => {
                tracing::error!("Redis error: {:?}", e);
                "A cache error occurred, try again.".to_string()
            }
            AppError::Internal(e) => {
                tracing::error!("Internal error: {:?}", e);
                "An internal error occurred, try again.".to_string()
            }
            other => other.to_string(),
        };

        //same json error response on next js frontend
        HttpResponse::build(status).json(json!({
            "success": false,
            "error": {
                "code": self.error_code(),
                "message": message
            }
        }))
    }

}

impl AppError {
    /// Machine-readable error code for the frontend
    /// Next.js can switch on this to show the right UI message
    fn error_code(&self) -> &'static str {
        match self {
            AppError::NotFound(_)              => "NOT_FOUND",
            AppError::Unauthorized(_)          => "UNAUTHORIZED",
            AppError::Forbidden(_)             => "FORBIDDEN",
            AppError::BadRequest(_)            => "BAD_REQUEST",
            AppError::ValidationError(_)       => "VALIDATION_ERROR",
            AppError::Conflict(_)              => "CONFLICT",
            AppError::PaymentError(_)          => "PAYMENT_ERROR",
            AppError::InvalidWebhookSignature  => "INVALID_SIGNATURE",
            AppError::DatabaseError(_)         => "DATABASE_ERROR",
            AppError::RedisError(_)            => "CACHE_ERROR",
            AppError::Internal(_)              => "INTERNAL_ERROR",
        }
    }
}

impl From<anyhow::Error> for AppError {
    fn from(e: anyhow::Error) -> Self {
        AppError::Internal(e.to_string())
    }
}
