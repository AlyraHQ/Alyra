use actix_web::{get, post, web, HttpResponse};
use serde::{Deserialize};
use serde_json::json;
use crate::dto::payment_dto::InitiatePaymentRequest;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::repository::{device_repo, transaction_repo};
use crate::services::payment_service;
use crate::state::AppState;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/payments")
            .service(initiate_payment)
            .service(verify_payment)
            .service(get_transactions)
            .service(test_confirm),
    );
}



#[derive(Debug, Deserialize)]
pub struct VerifyRequest {
    pub reference: String,
}

// ── POST /api/payments/initiate 

#[post("/initiate")]
async fn initiate_payment(
    state: web::Data<AppState>,
    auth: AuthUser,
    body: web::Json<InitiatePaymentRequest>,
) -> Result<HttpResponse, AppError> {
    let req = body.into_inner();
    
    println!("=== PAYMENT INITIATION ===");
    println!("Device: {}, Amount in kobo: {}", req.device_id, req.amount_kobo);

    if req.amount_kobo < 10000 {
        return Err(AppError::BadRequest(
            "Minimum amount is ₦100 (10000 kobo)".to_string(),
        ));
    }

    // Verify device belongs to this user
    let device = crate::repository::device_repo::find_by_id(&state.db, req.device_id)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("Device not found".to_string()))?;

    if device.user_id != auth.id {
        return Err(AppError::Unauthorized(
            "Device does not belong to this user".to_string(),
        ));
    }

    let resp = payment_service::initiate_payment(
        &state.db,
        &state.config,
        auth.id,
        req,
    )
    .await?;
    
    // Debug logging
    println!("=== SENDING TO INTERSWITCH ===");
    println!("URL: {}", resp.payment_url);
    println!("Form fields:");
    println!("  product_id: {}", resp.form_fields.product_id);
    println!("  hash: {}", resp.form_fields.hash);
    println!("  pay_item_id: {}", resp.form_fields.pay_item_id);
    println!("  txn_ref: {}", resp.form_fields.txn_ref);
    println!("  amount: {} kobo (₦{})", resp.form_fields.amount, resp.form_fields.amount as f64 / 100.0);
    println!("  currency: {}", resp.form_fields.currency);
    println!("  site_redirect_url: {}", resp.form_fields.site_redirect_url);
    println!("  cust_email: {:?}", resp.form_fields.cust_email);
    println!("  pay_item_name: {}", resp.form_fields.pay_item_name);

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": {
            "payment_url": resp.payment_url,
            "form_fields": resp.form_fields,
            "txn_ref": resp.reference,
        }
    })))
}

// ── POST /api/payments/verify

#[post("/verify")]
async fn verify_payment(
    state: web::Data<AppState>,
    auth: AuthUser,
    body: web::Json<VerifyRequest>,
) -> Result<HttpResponse, AppError> {
    let txn_ref = &body.reference;
    
    let txn = transaction_repo::find_by_ref(&state.db, txn_ref)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("Transaction not found".to_string()))?;

    if txn.user_id != auth.id {
        return Err(AppError::Unauthorized("Not your transaction".to_string()));
    }

    let verify_url = payment_service::get_verify_url(txn_ref, txn.amount_kobo);
    
    let client = reqwest::Client::new();
    let response = client
        .get(&verify_url)
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| AppError::ExternalServiceError(e.to_string()))?;

    let isw: serde_json::Value = response
        .json()
        .await
        .map_err(|e| AppError::ExternalServiceError(e.to_string()))?;

    // Check ResponseCode as per docs
    let response_code = isw["ResponseCode"].as_str().unwrap_or("99");
    let amount = isw["Amount"].as_i64().unwrap_or(0);

    if response_code == "00" && amount == txn.amount_kobo {
        let units = txn.amount_kobo as f64 / 8500.0;
        let token = payment_service::generate_token();

        transaction_repo::mark_success(&state.db, txn.id, &token, units)
            .await
            .map_err(AppError::DatabaseError)?;

        device_repo::add_units(&state.db, txn.device_id, units)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(HttpResponse::Ok().json(json!({
            "success": true,
            "data": {
                "status": "success",
                "token_code": token,
                "units": format!("{:.1} kWh credited", units),
                "amount": txn.amount_kobo / 100,
            }
        })))
    } else {
        transaction_repo::mark_failed(&state.db, txn.id)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(HttpResponse::Ok().json(json!({
            "success": false,
            "data": {
                "status": "failed",
                "response_code": response_code,
                "message": isw["ResponseDescription"].as_str().unwrap_or("Payment failed"),
            }
        })))
    }
}

// ── GET /api/payments/transactions 

#[get("/transactions")]
async fn get_transactions(
    state: web::Data<AppState>,
    auth: AuthUser,
) -> Result<HttpResponse, AppError> {
    let txns = transaction_repo::find_by_user(&state.db, auth.id)
        .await
        .map_err(AppError::DatabaseError)?;

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": txns
    })))
}

// ── POST /api/payments/test-confirm  (demo/hackathon only) 
// Simulates a confirmed payment without hitting Interswitch — for demo purposes

#[post("/test-confirm")]
async fn test_confirm(
    state: web::Data<AppState>,
    auth: AuthUser,
    body: web::Json<VerifyRequest>,
) -> Result<HttpResponse, AppError> {
    let txn_ref = &body.reference;

    let txn = transaction_repo::find_by_ref(&state.db, txn_ref)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("Transaction not found".to_string()))?;

    if txn.user_id != auth.id {
        return Err(AppError::Unauthorized("Not your transaction".to_string()));
    }

    let units = txn.amount_kobo as f64 / 8500.0;
    let token = payment_service::generate_token();

    transaction_repo::mark_success(&state.db, txn.id, &token, units)
        .await
        .map_err(AppError::DatabaseError)?;

    device_repo::add_units(&state.db, txn.device_id, units)
        .await
        .map_err(AppError::DatabaseError)?;

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": {
            "status": "success",
            "token_code": token,
            "units": format!("{:.1} kWh credited", units),
            "amount": txn.amount_kobo / 100,
        }
    })))
}
