use actix_web::{post, get, web, HttpResponse};
use serde_json::json;

use crate::state::AppState;
use crate::errors::AppError;
use crate::repository::vendor_repo;
use crate::dto::vendor_dto::{RegisterVendorRequest, VendorResponse};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/vendors")
            .service(register_vendor)
            .service(get_vendor)
    );
}

/// -- POST /api/vendors/register - register a vendor
#[post("/register")]
async fn register_vendor(state: web::Data<AppState>, body: web::Json<RegisterVendorRequest>) -> Result<HttpResponse, AppError> {
    let req = body.into_inner();

    // Check if dia phone is not already registered
    let existing = vendor_repo::find_by_phone(&state.db, &req.phone)
        .await
        .map_err(AppError::DatabaseError)?;

    if existing.is_some() {
        return Err(AppError::Conflict("Phone already registered as vendor".to_string()));
    }

    let vendor = vendor_repo::create(
        &state.db,
        &req.business_name,
        &req.owner_name,
        &req.phone,
        req.email.as_deref(),
        req.cac_number.as_deref(),
    )
    .await
    .map_err(AppError::DatabaseError)?;

    Ok(HttpResponse::Created().json(json!({
        "success": true,
        "data": VendorResponse::from(vendor)
    })))
}

/// ---- GET /api/vendors/{id} - get vendor by id
#[get("/{id}")]
async fn get_vendor(state: web::Data<AppState>, path: web::Path<uuid::Uuid>) -> Result<HttpResponse, AppError> {
    let vendor = vendor_repo::find_by_id(&state.db, path.into_inner())
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("Vendor not found".to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": VendorResponse::from(vendor)
    })))
}