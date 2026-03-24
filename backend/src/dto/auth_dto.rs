use serde::{Deserialize, Serialize};
use uuid::Uuid;

//-- User Registration from the Client side--//
#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    //-- Used 4 digit as pin --//
    pub phone:  String,
    pub pin: String, 
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub state: Option<String>,
    pub lga: Option<String>,
}

//-- User Login request after successful reg--//
#[derive(Debug,Deserialize )]
pub struct LoginRequest {
    pub phone: String,
    pub pin: String,
}


//--Authetication Resp back to server side after successful reg---//
#[derive(Debug, Serialize)]
pub struct AuthResponse {
    //--token type = Bearer stripped from the Authetication Header--//
    //--token expiration is in seconds--//
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
    pub is_verified:  bool,
    pub kyc_level: String,
}
