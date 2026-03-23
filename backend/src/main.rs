use anyhow::Ok;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tracing::info;

use crate::config::Config;

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
        .unwrap_or_else(|_| "alyra=debug, actix_web=info".into()),
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

    

    //appstate from state

    //route

    //server connection 

    Ok(())
}
