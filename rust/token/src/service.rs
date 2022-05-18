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


enum Roles {
    rider,
    driver
}

pub struct Rider {
    name: String,
    contact: u32,
    email: String,
    role: Roles,
    addresses: Option<Vec<Principal>>,
    address: Principal,
}

