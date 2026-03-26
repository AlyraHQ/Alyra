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
            .service(test_confirm)
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

/// POST /api/payments/test-confirm — DEMO ONLY

#[post("/test-confirm")]
async fn test_confirm(
    state: web::Data<AppState>,
    body: web::Json<serde_json::Value>,
) -> Result<HttpResponse, AppError> {
    let txn_ref = body["reference"]
        .as_str()
        .ok_or_else(|| AppError::BadRequest("reference required".to_string()))?;

    let transaction = crate::repository::transaction_repo::find_by_reference(
        &state.db, txn_ref
    )
    .await
    .map_err(AppError::DatabaseError)?
    .ok_or_else(|| AppError::NotFound("Transaction not found".to_string()))?;

    // Clone units_purchased once — BigDecimal doesn't implement Copy
    // So we need owned copies for each function that consumes it
    let units_for_token = transaction.units_purchased.clone();
    let units_for_create = transaction.units_purchased.clone();
    let units_for_display = transaction.units_purchased.clone();

    // Generate 20-digit token — passes &BigDecimal (borrow, no move)
    let token_code = crate::services::token_service::generate_token_code(
        &state.config.token_secret_key,
        &transaction.device_id,
        &transaction.id,
        &units_for_token,
    )?;

    // Save token — passes owned BigDecimal (moves units_for_create)
    let token = crate::services::token_service::create_token(
        &state.db,
        transaction.id,
        transaction.device_id,
        &token_code,
        units_for_create,
    ).await?;

    // Update transaction status to success
    crate::repository::transaction_repo::update_status(
        &state.db, transaction.id, "success"
    ).await.map_err(AppError::DatabaseError)?;

    // Link token to transaction
    crate::repository::transaction_repo::update_token_id(
        &state.db, transaction.id, token.id
    ).await.map_err(AppError::DatabaseError)?;

    let formatted = crate::services::token_service::format_token_display(&token_code);

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "data": {
            "token_code": formatted,
            "units": format!("{} units", units_for_display),
            "message": "Payment confirmed. Enter token on your meter."
        }
    })))
}