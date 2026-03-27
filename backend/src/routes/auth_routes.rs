use actix_web::{post, get, web, HttpResponse};
use serde_json::json;

use crate::state::AppState;
use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::services::auth_service;
use crate::dto::auth_dto::{RegisterRequest, LoginRequest};

//configure
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/auth")
            .service(register)
            .service(login)
            .service(me)
    );
}

/// --- POST /api/auth/register
#[post("/register")]
async fn register(state: web::Data<AppState>, body: web::Json<RegisterRequest>) -> Result<HttpResponse, AppError> {
    let user = auth_service::register(
        &state.db,
        &state.config,
        body.into_inner(),
    ).await?;

    Ok(HttpResponse::Created().json(json!({
        "success": true,
        "data": user
    })))
}

/// --- POST /api/auth/login
#[post("/login")]
async fn login(state: web::Data<AppState>, body: web::Json<LoginRequest>) -> Result<HttpResponse, AppError> {
    let tokens = auth_service::login(
        &state.db,
        &state.config,
        body.into_inner(),
    ).await?;

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": tokens
    })))
}

/// --- GET /api/auth/me  — requires JWT Auth here !!!!!
#[get("/me")]
async fn me(state: web::Data<AppState>, auth_user: AuthUser) -> Result<HttpResponse, AppError> {
    let user = crate::repository::user_repo::find_by_id(
        &state.db,
        auth_user.id,
    )
    .await
    .map_err(AppError::DatabaseError)?
    .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    let response = crate::dto::auth_dto::UserResponse::from(user);

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": response
    })))
}