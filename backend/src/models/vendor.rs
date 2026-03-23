use serde::Deserialize;
use sqlx::prelude::FromRow;

#[derive(Debug, Deserialize, Clone, PartialEq, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Vendor {

}