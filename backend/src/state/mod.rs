use sqlx::PgPool;
use redis::aio::ConnectionManager;

use crate::config::Config;

pub struct AppState {
    //posgres coonection 
    pub db: PgPool,
    //redis conncetion handles the limmiting, idempotency locks and pub.sub
    pub redis: ConnectionManager,
    // enviran var loaded at the kick off
    pub config: Config
}

impl AppState {
    //impl new AppState called once redis and db is ready
    pub fn new(db: PgPool, redis: ConnectionManager, config: Config) -> Self {
        Self { db, redis, config }
    }
}