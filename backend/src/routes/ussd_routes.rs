use actix_web::{post, web, HttpResponse};
use serde::Deserialize;

use crate::state::AppState;
use crate::errors::AppError;
use crate::services::ussd_service;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/ussd")
            .service(ussd_callback)
    );
}

/// NG USSD callback format
#[derive(Debug, Deserialize)]
pub struct UssdRequest {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "phoneNumber")]
    pub phone_number: String,
    pub text: String,
}

/// ----POST /api/ussd — receives USSD callbacks from telecom
/// Returns plain text starting with CON (continue) or END (terminate)
#[post("")]
async fn ussd_callback(state: web::Data<AppState>,body: web::Form<UssdRequest>) -> Result<HttpResponse, AppError> {
    let mut redis = state.redis.clone();

    let response = ussd_service::handle_ussd(
        &state.db,
        &mut redis,
        &state.config,
        &body.session_id,
        &body.phone_number,
        &body.text,
    ).await?;

    // USSD responses must be plain text — not JSON !!!
    Ok(HttpResponse::Ok()
        .content_type("text/plain")
        .body(response))
}