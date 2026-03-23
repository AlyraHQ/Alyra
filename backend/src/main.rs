use anyhow::Ok;
use dotenv::dotenv;

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

    //logging - tracing 
    

    //ld Config of env

    //postgres connect

    //redis connect

    //db migration

    //appstate from state

    //route

    //server connection 

    Ok(())
}
