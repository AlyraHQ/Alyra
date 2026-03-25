use actix_web::{App, HttpServer, middleware::Logger, web};
use actix_cors::Cors;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tracing::info;

use crate::{config::Config, state::AppState};

mod dto;
mod config;
mod routes;
mod db;
mod errors;
mod state;
mod middleware;
mod models;
mod repository; 
mod services;

#[tokio::main]
async fn main()-> anyhow::Result<()> {
    
    //load env variable
    let _ = dotenvy::dotenv();

    //logging - tracing - debug 
    tracing_subscriber::registry()
    .with(
        tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "alyra=debug,actix_web=info".into()),
    )
    .with(tracing_subscriber::fmt::layer())
    .init();
info!("....hold Backend services starting");

    //ld Config of env variables
    let config = Config::from_env()?;
    info!("env var config loaded...");

    //postgres connect with pool creation
    let db = db::create_pool(&config.database_url).await?;
    info!("db connected successfully");

    //auto db migration
    sqlx::migrate!("./migrations").run(&db).await?;
    info!("Db migrated");

    //redis connect
    let redis_client = redis::Client::open(config.redis_url.clone())?;
    let redis = redis::aio::ConnectionManager::new(redis_client).await?;
    info!("Redis connection made successfully");

    //appstate - bundled for easy actix web sahring across requests
    let state = web::Data::new(AppState::new(db, redis, config.clone()));

    //http server connection 
    let bind_addy = format!("0.0.0.0:{}", config.port);
    info!("Server connection starting on {}", bind_addy);

    HttpServer::new(move || {
        let cors = Cors::permissive();
        
        App::new()
        .app_data(state.clone())
        .wrap(cors)
        .wrap(Logger::default())
        //--- add route ---//
        .configure(routes::health_routes::configure)
        .configure(routes::auth_routes::configure)
        .configure(routes::payment_routes::configure)
        .configure(routes::device_routes::configure)
        .configure(routes::ussd_routes::configure)
        .configure(routes::vendor_routes::configure)
    })
    .bind(&bind_addy)?
    .workers(4)
    .run()
    .await?;
 

    Ok(())
}
