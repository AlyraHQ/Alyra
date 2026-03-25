use actix_web::{get, web, HttpResponse, Responder};
use serde_json::json;


use crate::state::AppState;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(health_check)
       .service(health_db);
}

#[get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "ok",
        "service": "Alyra API",
        "version": "1.0.0"
    }))
}

#[get("/health/db")]
async fn health_db(state: web::Data<AppState>) -> impl Responder {
    match sqlx::query("SELECT 1").fetch_one(&state.db).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "status": "ok",
            "database": "connected"
        })),
        Err(e) => HttpResponse::ServiceUnavailable().json(json!({
            "status": "error",
            "database": "disconnected",
            "detail": e.to_string()
        })),
    }
}