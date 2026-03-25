use actix_web::{post, get, web, HttpResponse};
use serde_json::json;
use uuid::Uuid;

use crate::state::AppState;
use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::repository::{device_repo, user_repo};
use crate::dto::device_dto::{
    RegisterGridMeterRequest,
    RegisterSolarKitRequest,
    DeviceResponse,
};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/devices")
            .service(get_my_devices)
            .service(register_grid_meter)
            .service(register_solar_kit)
            .service(get_device)
    );
}

/// --- GET /api/devices — get all devices for logged in users 
#[get("")]
async fn get_my_devices(state: web::Data<AppState>, auth_user: AuthUser) -> Result<HttpResponse, AppError> {
    let devices = device_repo::find_by_user(&state.db, auth_user.id)
        .await
        .map_err(AppError::DatabaseError)?;

    let response: Vec<DeviceResponse> = devices
        .into_iter()
        .map(DeviceResponse::from)
        .collect();

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": response
    })))
}

/// --- GET /api/devices/{id} - get device by it id
#[get("/{id}")]
async fn get_device(state: web::Data<AppState>,auth_user: AuthUser,path: web::Path<Uuid>) -> Result<HttpResponse, AppError> {
    let device = device_repo::find_by_id(&state.db, path.into_inner())
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("Device not found".to_string()))?;

    if device.user_id != auth_user.id {
        return Err(AppError::Unauthorized("Access denied".to_string()));
    }

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
        "data": DeviceResponse::from(device)
    })))
}

/// -- POST /api/devices/grid — here for register a grid meter
#[post("/grid")]
async fn register_grid_meter(state: web::Data<AppState>, auth_user: AuthUser,
    body: web::Json<RegisterGridMeterRequest>) -> Result<HttpResponse, AppError> {
    let req = body.into_inner();

    // --- Get user's vendor_id — required -- a must to register device
    let user = user_repo::find_by_id(&state.db, auth_user.id)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    let vendor_id = user.vendor_id.ok_or_else(|| {
        AppError::BadRequest("User must be registered under a vendor".to_string())
    })?;

    // --- Create parent device record
    let device = device_repo::create(
        &state.db,
        auth_user.id,
        vendor_id,
        &req.device_name,
        "grid",
        req.state.as_deref(),
        req.lga.as_deref(),
        None,
    )
    .await
    .map_err(AppError::DatabaseError)?;

    // --- Create grid_meters child record
    sqlx::query(
        "INSERT INTO grid_meters (device_id, meter_number, tariff_kobo_per_kwh, units_balance)
         VALUES ($1, $2, $3, 0.0)"
    )
    .bind(device.id)
    .bind(&req.meter_number)
    .bind(req.tariff_kobo_per_kwh)
    .execute(&state.db)
    .await
    .map_err(AppError::DatabaseError)?;

    Ok(HttpResponse::Created().json(json!({
        "success": true,
        "data": DeviceResponse::from(device)
    })))
}

/// --- POST /api/devices/solar — register a solar kitt 
#[post("/solar")]
async fn register_solar_kit(state: web::Data<AppState>,auth_user: AuthUser,
    body: web::Json<RegisterSolarKitRequest>) -> Result<HttpResponse, AppError> {
    let req = body.into_inner();

    let user = user_repo::find_by_id(&state.db, auth_user.id)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    let vendor_id = user.vendor_id.ok_or_else(|| {
        AppError::BadRequest("User must be registered under a vendor".to_string())
    })?;

    let device = device_repo::create(
        &state.db,
        auth_user.id,
        vendor_id,
        &req.device_name,
        "solar",
        req.state.as_deref(),
        req.lga.as_deref(),
        None,
    )
    .await
    .map_err(AppError::DatabaseError)?;

    sqlx::query(
        "INSERT INTO solar_kits 
            (device_id, kit_serial_number, daily_rate_kobo, battery_percent, is_active)
         VALUES ($1, $2, $3, 0, false)"
    )
    .bind(device.id)
    .bind(&req.kit_serial_number)
    .bind(req.daily_rate_kobo)
    .execute(&state.db)
    .await
    .map_err(AppError::DatabaseError)?;

    Ok(HttpResponse::Created().json(json!({
        "success": true,
        "data": DeviceResponse::from(device)
    })))
}