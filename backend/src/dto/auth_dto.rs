use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::user::User;

//-- User Registration from the Client side--//
#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub phone: String,
    pub pin: String,
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub state: Option<String>,
    pub lga: Option<String>,
    pub vendor_id: Option<Uuid>,
}

//-- User Login request after successful reg--//
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub phone: String,
    pub pin: String,
}


//--Authetication Resp back to server side after successful reg---//
#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: i64,
}

//--User profile--//
#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub phone: String,
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub state: Option<String>,
    pub lga: Option<String>,
    pub is_verified: bool,
    pub kyc_level: String,
}

//convert user model to user respons automatically called with UserResponse in services
impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            phone: user.phone,
            full_name: user.full_name,
            email: user.email,
            state: user.state,
            lga: user.lga,
            is_verified: user.is_verified,
            kyc_level: user.kyc_level,
        }
    }
}
