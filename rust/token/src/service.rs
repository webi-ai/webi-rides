/**
* Module        :  service.rs
* Copyright     :  2022 Webi.ai
* License       :  GPL 3.0
* Maintainer    :  Kelsey 
* Stability     :  Who Knows?
* Description   :  Token Service Contracts
*/

use ic_cdk_macros::*;
use ic_kit::{ic, Principal};

array<Principal> Drivers;

enum Roles {
    rider,
    driver
}

enum CurrentStatus {
    active,
    inactive
}

pub struct Rider {
    name: String,
    contact: u32,
    email: String,
    role: Roles,
    addresses: Option<Vec<Principal>>,
    address: Principal,
}

pub struct Driver {
    name: String,
    contact: u32,
    email: String,
    role: Roles,
    vehicleplatenumber: String,
    vehicleseatnumber: String,
    vehiclemake: String,
    vehiclemodel: String,
    vehiclecolor: String,
    vehicletype: String,
    vehicleyear: String,
    rating: Float,
    role: Roles,
    currentstatus: CurrentStatus,
    addresses: Option<Vec<Principal>>,
    address: Principal,
}
