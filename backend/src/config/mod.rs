use anyhow::{Context, Result};

#[derive(Debug, Clone)]
pub struct Config {
    //db
    pub database_url: String,
    //redis
    pub redis_url: String,
    //server
    pub port: u16,
    pub app_env: AppEnv,
    pub frontend_url: String,
    pub cors_origins: String,

    //jwt 
    pub jwt_private_key: String,
    pub jwt_public_key: String,
    pub jwt_access_expiry_secs: i64,
    pub jwt_refresh_expiry_secs: i64,

    
    // Interswitch
    pub interswitch_merchant_code: String,
    pub interswitch_pay_item_id: String,
    pub interswitch_client_id: String,
    pub interswitch_secret_key: String,
    pub interswitch_mac_key: String,
    pub interswitch_base_url: String,
    pub interswitch_data_ref: String,

    //bcrypt
    pub bcrypt_cost: u32,

    //sms
    pub termii_api_key: String,
    pub termii_sender_id: String,

    //token engine
    pub token_secret_key: String,
    pub token_expiry_days: i64,
    

}

#[derive(Debug, Clone, PartialEq)]
pub enum AppEnv {
    Development,
    Production,
}

impl AppEnv {
    pub fn is_production(&self) -> bool {
        *self == AppEnv::Production
    }
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Config {
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse::<u16>()
                .context("Invalid PORT environment variable")?,
                app_env: {
                    let env = std::env::var("APP_ENV")
                        .unwrap_or_else(|_| "development".to_string());
                    match env.as_str() {
                        "production" => AppEnv::Production,
                        _ => AppEnv::Development,
                    }
                },

            frontend_url: std::env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            cors_origins: std::env::var("CORS_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            database_url: required_env("DATABASE_URL")?,
            redis_url: required_env("REDIS_URL")?,


            jwt_private_key: required_env("JWT_PRIVATE_KEY")?,
            jwt_public_key: required_env("JWT_PUBLIC_KEY")?,
            jwt_access_expiry_secs: 900,
            jwt_refresh_expiry_secs: 604_800,

            interswitch_merchant_code: required_env("INTERSWITCH_MERCHANT_CODE")?,
            interswitch_pay_item_id: required_env("INTERSWITCH_PAY_ITEM_ID")?,
            interswitch_client_id: required_env("INTERSWITCH_CLIENT_ID")?,
            interswitch_secret_key: required_env("INTERSWITCH_SECRET_KEY")?,
            interswitch_mac_key: required_env("INTERSWITCH_MAC_KEY")?,
            interswitch_base_url: std::env::var("INTERSWITCH_BASE_URL")
                .unwrap_or_else(|_| "https://newwebpay.qa.interswitchng.com/collections/w/pay".to_string()),
            interswitch_data_ref: required_env("INTERSWITCH_DATA_REF")?,

            bcrypt_cost: std::env::var("BCRYPT_COST")
            .unwrap_or_else(|_| "12".to_string())
            .parse::<u32>()
            .context("Invalid BCRYPT_COST environment variable")?,

            termii_api_key: required_env("TERMII_API_KEY")?,
            termii_sender_id: std::env::var("TERMII_SENDER_ID")
            .unwrap_or_else(|_| "Alyra".to_string()),

            token_secret_key: required_env("TOKEN_SECRET_KEY")?,
            token_expiry_days: std::env::var("TOKEN_EXPIRY_DAYS")
            .unwrap_or_else(|_| "90".to_string())
            .parse::<i64>()
            .context("Invalid TOKEN_EXPIRY_DAYS environment variable")?,
        })
    }
}

fn required_env(key: &str) -> Result<String> {
    let value = std::env::var(key)
    .with_context(|| format!("Missing required environment variable: {}", key))?;

    if value.trim().is_empty() {
        anyhow::bail!(format!("Environment variable {} is empty", key));
    }

    Ok(value)
}