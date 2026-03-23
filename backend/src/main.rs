use anyhow::Ok;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

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
    tracing_subscriber::registry().with(
        tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "alyra=debug, actix_web=info".into()),
    )
    .with(tracing_subscriber::fmt::layer())
    .init();

    //ld Config of env

    //postgres connect

    //redis connect

    //db migration

    //appstate from state

    //route

    //server connection 

    Ok(())
}
