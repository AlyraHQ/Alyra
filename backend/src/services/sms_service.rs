use crate::{config::Config, errors::AppError};

/// Send an SMS to `phone` with `message`.
///
/// Note: This is currently a minimal implementation to keep the backend compiling.
/// Plug in Termii (or another provider) logic here when you're ready.
pub async fn send_sms(_config: &Config, _phone: &str, _message: &str) -> Result<(), AppError> {
    tracing::info!("send_sms called (provider not wired): to={}", _phone);
    Ok(())
}

