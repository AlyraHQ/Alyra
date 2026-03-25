use std::future::{Ready, ready};

use actix_web::{Error, FromRequest, HttpRequest, web, dev::Payload};
use uuid::Uuid;

use crate::{errors::AppError, services::auth_service, state::AppState};


//fix into ny route handler that require auth
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: Uuid,
    pub phone: String,
}

impl FromRequest for AuthUser  {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        //extract bearer token for AUTH Header
        let token = req
        .headers()
        .get("Authorization")
        .and_then(|f| f.to_str().ok())
        .and_then(|f| f.strip_prefix("Bearer "))
        .map(|m| m.to_string());

    let token = match token {
        Some(t) => t,
        None => {
            return ready(Err(AppError::Unauthorized(
                "Missing Authorization header".to_string(),
            )
            .into()))
        }
    };

    //get config from Appstate to verify JWT
    let state = match req.app_data::<web::Data<AppState>>() {
        Some(s) => s.clone(),
        None => {
            return ready(Err(AppError::InternalError(
                "App state confg unavailable".to_string(),
            )
            .into()))
        }
    };

    //verify token with key used to sign in 
    match auth_service::verify_token(&token, &state.config.jwt_public_key) {
        Ok(claims) => match Uuid::parse_str(&claims.sub){
            Ok(id) => ready(Ok(
                AuthUser { id, phone: claims.phone }
            )),
            Err(_) => ready(Err(AppError::Unauthorized(
                "Invalid token subj".to_string(),
            )
            .into())),
        },
        Err(e) => ready(Err(e.into())),
        
    }
        
    }
}