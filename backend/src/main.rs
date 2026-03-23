use dotenv::dotenv;

mod dto;
mod config;
mod routes;
mod db;
mod errors;
mod middleware;
mod models;
mod repository; 
mod services;

#[tokio::main]
async fn main() {
    
    //env variable
    let _ = dotenv();
}
