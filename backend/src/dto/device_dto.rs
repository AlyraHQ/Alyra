use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::device::Device;


/// reg new grid meter
#[derive(Debug, Deserialize)]
pub struct RegisterGridMeterRequest {
    pub device_name:            String,
    pub meter_number:           String,
    pub tariff_kobo_per_kwh:    i64,
    pub state:                  Option<String>,
    pub lga:                    Option<String>,
    pub vendor_id:              Option<Uuid>
}


/// reg new solar kit
#[derive(Debug, Deserialize)]
pub struct RegisterSolarKitRequest {
    pub device_name:            String,
    pub kit_serial_number:      String,
    pub daily_rate_kobo:        i64,
    pub state:                  Option<String>,
    pub lga:                    Option<String>,
    pub vendor_id:              Option<Uuid>

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

//convert device model to device resp
impl From<Device> for DeviceResponse {
    fn from(device: Device) -> Self {
        Self {
            id: device.id,
            device_name: device.device_name,
            device_type: device.device_type,
            status: device.status,
            state: device.state,
            lga: device.lga,
           //join child table
            units_balance: None,
            tariff_naira_per_kwh: None,
            battery_percent: None,
            is_active: None,
            next_payment_due: None,
        }
    }
}
