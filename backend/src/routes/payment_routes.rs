use actix_web::{post, get, web, HttpResponse, Responder};
use serde_json::json;

use crate::state::AppState;
use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::services::payment_service;
use crate::dto::payment_dto::{
    InitiatePaymentRequest,
    InterswitchWebhook,
    TransactionResponse,
};
use crate::repository::transaction_repo;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/payments")
            .service(initiate)
            .service(webhook)
            .service(get_transactions)
            .service(get_transaction)
    );
}

/// -- POST /api/payments/initiate — requires JWT
#[post("/initiate")]
async fn initiate(state: web::Data<AppState>, auth_user: AuthUser, body: web::Json<InitiatePaymentRequest>) -> Result<HttpResponse, AppError> {
    let response = payment_service::initiate_payment(
        &state.db,
        &state.config,
        auth_user.id,
        body.into_inner(),
    ).await?;

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": response
    })))
}

/// --- POST /api/payments/webhook — called by Interswitch, no auth
#[post("/webhook")]
async fn webhook(state: web::Data<AppState>, body: web::Json<InterswitchWebhook>) -> Result<HttpResponse, AppError> {
    let response = payment_service::handle_webhook(
        &state.db,
        &state.config,
        body.into_inner(),
    ).await?;

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": response
    })))
}

/// ---- GET /api/payments/transactions — requires JWT
#[get("/transactions")]
async fn get_transactions(state: web::Data<AppState>,auth_user: AuthUser) -> Result<HttpResponse, AppError> {
    let txns = transaction_repo::find_by_user(&state.db, auth_user.id)
        .await
        .map_err(AppError::DatabaseError)?;

    let response: Vec<TransactionResponse> = txns
        .into_iter()
        .map(TransactionResponse::from)
        .collect();

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": response
    })))
}

/// --- GET /api/payments/transactions/{id}
#[get("/transactions/{id}")]
async fn get_transaction(state: web::Data<AppState>, auth_user: AuthUser, path: web::Path<uuid::Uuid>) -> Result<HttpResponse, AppError> {
    let txn = transaction_repo::find_by_id(&state.db, path.into_inner())
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("Transaction not found".to_string()))?;

    if txn.user_id != auth_user.id {
        return Err(AppError::Unauthorized("Access denied".to_string()));
    }

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": TransactionResponse::from(txn)
    })))
}
