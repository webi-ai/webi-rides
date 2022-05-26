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

pub struct Drivers {
  pub driver: Vec<Principal>,
}

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
    rating: f64,
    role: Roles,
    currentstatus: CurrentStatus,
    addresses: Option<Vec<Principal>>,
    address: Principal,
}

// return driver array
pub async fn returnDriversAvailable() -> Vec<Driver> {
    let mut drivers = Vec::new();
    for driver in Drivers {
        if driver.currentstatus == CurrentStatus::active {
            drivers.push(driver);
        }
    }
    drivers
}

// get riders
pub async fn getRiders() -> Vec<Rider> {
    let mut riders = Vec::new();
    for rider in Riders {
        if rider.role == Roles::rider {
            riders.push(rider);
        }
    }
    riders
}

// get driver info
pub async fn getDriverInfo(driver: Driver) -> Driver {
    driver
}

// get rider info
pub async fn getRiderInfo(rider: Rider) -> Rider {
    rider
}

// register driver
pub async fn registerDriver(driver: Driver) -> Driver {
    Drivers.push(driver);
    driver
}

// register rider
pub async fn registerRider(rider: Rider) -> Rider {
    Riders.push(rider);
    rider
}


// update driver rating value
pub async fn updateDriverRating(driver: Driver, rating: f64) -> Driver {
    driver.rating = rating;
    driver
}

// update driver status value
pub async fn updateDriverStatus(driver: Driver, status: CurrentStatus) -> Driver {
    driver.currentstatus = status;
    driver
}


// test registerRider 
#[test]
fn test_registerRider() {
    let rider = Rider {
        name: "Kelsey".to_string(),
        contact: 1234567890,
        email: "test@email.com".to_string(),
        role: Roles::rider,
        addresses: None,
        address: Principal::from_string("cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae").unwrap(),
    };
    registerRider(rider);
    assert_eq!(Riders.len(), 1);
}

