use serde::{Deserialize, Serialize};


/// reg new grid meter
#[derive(Debug, Deserialize)]
pub struct RegisterGridMeterRequest {
    pub device_name: String,
    pub meter_number: String,
    pub tariff_kobo_per_kwh: i64,
    pub state: Option<String>,
    pub lga: Option<String>,
}


/// reg new solar kit
#[derive(Debug, Deserialize)]
pub struct RegisterSolarKitRequest {
    pub device_name: String,
    pub kit_serial_number: String,
    pub daily_rate_kobo: i64,
    pub state: Option<String>,
    pub lga: Option<String>,

}
/// device info{resp} sent to frontend dashboard
#[derive(Debug, Serialize)]
pub struct DeviceResponse {
    pub 
}
