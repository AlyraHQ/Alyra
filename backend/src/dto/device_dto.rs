use serde::{Deserialize, Serialize};
use uuid::Uuid;


/// reg new grid meter
#[derive(Debug, Deserialize)]
pub struct RegisterGridMeterRequest {
    pub device_name:            String,
    pub meter_number:           String,
    pub tariff_kobo_per_kwh:    i64,
    pub state:                  Option<String>,
    pub lga:                    Option<String>,
}


/// reg new solar kit
#[derive(Debug, Deserialize)]
pub struct RegisterSolarKitRequest {
    pub device_name:            String,
    pub kit_serial_number:      String,
    pub daily_rate_kobo:        i64,
    pub state:                  Option<String>,
    pub lga:                    Option<String>,

}
/// device info{resp} sent to frontend dashboard
#[derive(Debug, Serialize)]
pub struct DeviceResponse {
    pub id:                 Uuid,
    pub device_name:        String,
    pub device_type:        String,
    pub status:             String,
    pub state:              Option<String>,
    pub lga:                Option<String>,

    //--Meter Grid--//
    pub units_balance:          Option<f64>,
    pub tariff_naira_per_kwh:   Option<f64>,
    
    //-- Solar Kit --//
    pub battery_percent:    Option<i16>,
    pub is_active:          Option<bool>,
    pub next_payment_due:   Option<String>,
}
