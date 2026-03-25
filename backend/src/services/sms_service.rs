use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::config::Config;
use crate::errors::AppError;

#[derive(Debug, Serialize)]
struct SmsPayload {
    to: String,
    from: String,
    sms: String,

    #[serde(rename = "type")]
    msg_type: String,
    api_key: String,
    channel: String,
}

#[derive(Debug, Deserialize)]
struct SmsApiResponse {
    #[serde(rename = "code")]
    code: Option<String>,
}

/// Sends SMS via Termii API 
pub async fn send_sms(
    config: &Config,
    phone: &str,
    message: &str,
) -> Result<(), AppError> {
    let client = Client::new();
    let phone_normalized = normalize_nigerian_phone(phone);

    let payload = SmsPayload {
        to: phone_normalized,
        from: config.termii_sender_id.clone(),
        sms: message.to_string(),
        msg_type: "plain".to_string(),
        api_key: config.termii_api_key.clone(),
        channel: "dnd".to_string(),
    };

    let resp = client
        .post("https://api.ng.termii.com/api/sms/send")
        .json(&payload)
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Termii SMS request failed: {}", e);
            AppError::ExternalServiceError("SMS service unreachable".to_string())
        })?;

    if !resp.status().is_success() {
        tracing::warn!("SMS delivery failed for phone: {}", phone);
        return Err(AppError::ExternalServiceError(
            "SMS delivery failed".to_string(),
        ));
    }

    tracing::info!("SMS sent to {}", phone);
    Ok(())
}

/// Sends OTP for phone verification
pub async fn send_otp(
    config: &Config,
    phone: &str,
    otp: &str,
) -> Result<(), AppError> {
    let message = format!(
        "Your Alyra verification code is: {}. Valid for 10 minutes. Do not share.",
        otp
    );
    send_sms(config, phone, &message).await
}

/// Normalises Nigerian phone to international format for Termii
fn normalize_nigerian_phone(phone: &str) -> String {
    let p = phone.trim().replace(" ", "").replace("-", "");
    if p.starts_with("+234") {
        p.trim_start_matches('+').to_string()
    } else if p.starts_with("234") {
        p
    } else if p.starts_with('0') {
        format!("234{}", &p[1..])
    } else {
        p
    }
}