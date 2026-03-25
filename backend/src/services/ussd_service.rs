use redis::aio::ConnectionManager;
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::PgPool;

use crate::config::Config;
use crate::errors::AppError;
use crate::repository::{user_repo, device_repo, transaction_repo};
use crate::services::payment_service;
use crate::dto::payment_dto::InitiatePaymentRequest;

/// USSD session stored in Redis with 5 min TTL
#[derive(Debug, Serialize, Deserialize)]
pub struct UssdSession {
    pub phone: String,
    pub step: UssdStep,
    pub device_id: Option<String>,
    pub amount_kobo: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub enum UssdStep {
    MainMenu,
    SelectDevice,
    SelectAmount,
    ConfirmPayment,
    EnterPin,
}

/// Entry point — receives USSD callback from Telo then return text response to display cl phone
pub async fn handle_ussd(
    pool: &PgPool,
    redis: &mut ConnectionManager,
    config: &Config,
    session_id: &str,
    phone: &str,
    text: &str,
) -> Result<String, AppError> {

    // -- create session from Redis
    let session_key = format!("ussd:session:{}", session_id);

    let session_json: Option<String> = redis
        .get(&session_key)
        .await
        .unwrap_or(None);

    let session: Option<UssdSession> = session_json
        .as_deref()
        .and_then(|s| serde_json::from_str(s).ok());

    // Route based on input and current step
    let (response, new_session) = match session {
        None => handle_main_menu(pool, phone, text).await?,
        Some(s) => match s.step {
            UssdStep::MainMenu => handle_main_menu(pool, phone, text).await?,
            UssdStep::SelectDevice => handle_select_device(pool, phone, text, s).await?,
            UssdStep::SelectAmount => handle_select_amount(text, s).await?,
            UssdStep::ConfirmPayment => handle_confirm(text, s).await?,
            UssdStep::EnterPin => handle_pin(pool, redis, config, phone, text, s).await?,
        },
    };

    // Save updated session to Redis — 5 minute TTL
    if let Some(sess) = new_session {
        let json = serde_json::to_string(&sess)
            .map_err(|_| AppError::InternalError("Session serialization failed".to_string()))?;
        let _: () = redis
            .set_ex(&session_key, json, 300)
            .await
            .map_err(AppError::RedisError)?;
    } else {
        // Clear session when flow ends
        let _: () = redis
            .del(&session_key)
            .await
            .map_err(AppError::RedisError)?;
    }

    Ok(response)
}

async fn handle_main_menu(
    pool: &PgPool,
    phone: &str,
    _text: &str,
) -> Result<(String, Option<UssdSession>), AppError> {
    // Check if user is registered
    let user = user_repo::find_by_phone(pool, phone)
        .await
        .map_err(AppError::DatabaseError)?;

    if user.is_none() {
        return Ok((
            "CON Welcome to Alyra Energy\nYou are not registered.\nVisit alyra.ng to register.".to_string(),
            None,
        ));
    }

    let session = UssdSession {
        phone: phone.to_string(),
        step: UssdStep::SelectDevice,
        device_id: None,
        amount_kobo: None,
    };

    Ok((
        "CON Welcome to Alyra Energy\n1. Buy Energy\n2. Check Balance\n3. Transaction History".to_string(),
        Some(session),
    ))
}

async fn handle_select_device(
    pool: &PgPool,
    phone: &str,
    text: &str,
    mut session: UssdSession,
) -> Result<(String, Option<UssdSession>), AppError> {
    if text != "1" {
        return Ok((
            "END Invalid option. Please try again.".to_string(),
            None,
        ));
    }

    // Find user device
    let user = user_repo::find_by_phone(pool, phone)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    let devices = device_repo::find_by_user(pool, user.id)
        .await
        .map_err(AppError::DatabaseError)?;

    if devices.is_empty() {
        return Ok((
            "END You have no registered devices.\nVisit alyra.ng to register a device.".to_string(),
            None,
        ));
    }

    //-- show user first device 
    let device = &devices[0];
    session.device_id = Some(device.id.to_string());
    session.step = UssdStep::SelectAmount;

    Ok((
        format!(
            "CON Device: {}\nType: {}\n\nSelect amount:\n1. ₦200\n2. ₦500\n3. ₦1000\n4. ₦2000",
            device.device_name, device.device_type
        ),
        Some(session),
    ))
}

//--handle async selected amount
async fn handle_select_amount(
    text: &str,
    mut session: UssdSession,
) -> Result<(String, Option<UssdSession>), AppError> {
    let amount_kobo = match text {
        "1" => 20000i64,   //stands for N200 naira
        "2" => 50000i64,   // N500 naira
        "3" => 100000i64,  // N1000 naira
        "4" => 200000i64,  // N2000 naira
        _ => {
            return Ok((
                "END Invalid amount. Please try again.".to_string(),
                None,
            ))
        }
    };

    session.amount_kobo = Some(amount_kobo);
    session.step = UssdStep::ConfirmPayment;

    let naira = amount_kobo / 100;

    Ok((
        format!(
            "CON You selected ₦{}\n\nConfirm payment?\n1. Yes, pay now\n2. Cancel",
            naira
        ),
        Some(session),
    ))
}

//-- async confirmation of the amount inputed
async fn handle_confirm(
    text: &str,
    mut session: UssdSession,
) -> Result<(String, Option<UssdSession>), AppError> {
    match text {
        "1" => {
            session.step = UssdStep::EnterPin;
            Ok((
                "CON Enter your 4-digit PIN to confirm:".to_string(),
                Some(session),
            ))
        }
        "2" => Ok(("END Payment cancelled.".to_string(), None)),
        _ => Ok(("END Invalid option.".to_string(), None)),
    }
}

//confirm pin entry and validate
async fn handle_pin(
    pool: &PgPool,
    _redis: &mut ConnectionManager,
    config: &Config,
    phone: &str,
    pin: &str,
    session: UssdSession,
) -> Result<(String, Option<UssdSession>), AppError> {
    // Verify PIN
    let user = user_repo::find_by_phone(pool, phone)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    let valid = bcrypt::verify(pin, &user.pin_hash)
        .map_err(|_| AppError::InternalError("PIN verification failed".to_string()))?;

    if !valid {
        return Ok((
            "END Incorrect PIN. Transaction cancelled.".to_string(),
            None,
        ));
    }

    let device_id = session
        .device_id
        .as_deref()
        .and_then(|id| Uuid::parse_str(id).ok())
        .ok_or_else(|| AppError::BadRequest("Invalid device".to_string()))?;

    let amount_kobo = session
        .amount_kobo
        .ok_or_else(|| AppError::BadRequest("Invalid amount".to_string()))?;

    // Initiate payment
    let req = InitiatePaymentRequest {
        device_id,
        amount_kobo,
        channel: "ussd".to_string(),
    };

    match payment_service::initiate_payment(pool, config, user.id, req).await {
        Ok(resp) => Ok((
            format!(
                "END Payment initiated.\nRef: {}\nYou will receive your token via SMS after payment.",
                &resp.reference[..12]
            ),
            None,
        )),
        Err(_) => Ok((
            "END Payment initiation failed. Please try again.".to_string(),
            None,
        )),
    }
}