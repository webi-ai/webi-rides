/**
* Module        :  service.rs
* Copyright     :  2022 Webi.ai
* License       :  GPL 3.0
* Maintainer    :  Kelsey 
* Stability     :  Who Knows?
* Description   :  Token Service Contracts
*/

use ic_cdk::{
    export::{
        candid::{CandidType, Deserialize},
        Principal,
    },
};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

type IdStore = BTreeMap<String, Principal>;
type ProfileStore = BTreeMap<Principal, Profile>;

type DriverStore = Vec<Driver>;
type RiderStore = Vec<Rider>;

#[derive(Clone, Copy, Debug, CandidType, Deserialize)]
enum CurrentStatus {
    Active,
    Inactive
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Rider {
    pub name: String,
    pub contact: u32,
    pub email: String,
    pub role: String,
    pub addresses: Option<Vec<Principal>>,
    pub address: Principal,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Driver {
    pub name: String,
    pub contact: u32,
    pub email: String,
    pub role: String,
    pub vehicleplatenumber: String,
    pub vehicleseatnumber: String,
    pub vehiclemake: String,
    pub vehiclemodel: String,
    pub vehiclecolor: String,
    pub vehicletype: String,
    pub vehicleyear: String,
    pub rating: f64,
    pub currentstatus: CurrentStatus,
    pub addresses: Option<Vec<Principal>>,
    pub address: Principal,
}


#[derive(Clone, Debug, Default, CandidType, Deserialize)]
struct Profile {
    pub name: String,
    pub description: String,
    pub keywords: Vec<String>,
}

thread_local! {
    static PROFILE_STORE: RefCell<ProfileStore> = RefCell::default();
    static ID_STORE: RefCell<IdStore> = RefCell::default();
    static DRIVER_STORE: RefCell<DriverStore> = RefCell::default();
    static RIDER_STORE: RefCell<RiderStore> = RefCell::default();
}

#[query(name = "getSelf")]
fn get_self() -> Profile {
    let id = ic_cdk::api::caller();
    PROFILE_STORE.with(|profile_store| {
        profile_store
            .borrow()
            .get(&id)
            .cloned().unwrap_or_default()
    })
}

#[query]
fn get(name: String) -> Profile {
    ID_STORE.with(|id_store| {
        PROFILE_STORE.with(|profile_store| {
            id_store
                .borrow()
                .get(&name)
                .and_then(|id| profile_store.borrow().get(id).cloned()).unwrap_or_default()
        })
    })
}

#[update]
fn update(profile: Profile) {
    let principal_id = ic_cdk::api::caller();
    ID_STORE.with(|id_store| {
        id_store
            .borrow_mut()
            .insert(profile.name.clone(), principal_id);
    });
    PROFILE_STORE.with(|profile_store| {
        profile_store.borrow_mut().insert(principal_id, profile);
    });
}


//get riders
#[query]
fn get_riders() -> RiderStore {
    RIDER_STORE.with(|rider_store| rider_store.borrow().clone())
}

//get drivers
#[query]
fn get_drivers() -> DriverStore {
    DRIVER_STORE.with(|driver_store| driver_store.borrow().clone())
}

//register rider
#[update]
fn register_rider(rider: Rider) {
    RIDER_STORE.with(|rider_store| {
        rider_store.borrow_mut().push(rider);
    });
}

//register driver
#[update]
fn register_driver(driver: Driver) {
    DRIVER_STORE.with(|driver_store| {
        driver_store.borrow_mut().push(driver);
    });
}

// update driver rating value
#[query]
fn update_driver_rating(driver_name: String, rating: f64) {
    DRIVER_STORE.with(|driver_store| {
        for driver in driver_store.borrow_mut().iter_mut() {
            if driver.name == driver_name {
                driver.rating = rating;
            }
        }
    });
}

// update driver status value
#[query]
fn update_driver_status(driver_name: String, status: CurrentStatus) {
    DRIVER_STORE.with(|driver_store| {
        for driver in driver_store.borrow_mut().iter_mut() {
            if driver.name == driver_name {
                driver.currentstatus = status;
            }
        }
    });
}

// test registerRider 
#[test]
fn test_register_rider() {
    let rider = Rider {
        name: "Kelsey".to_string(),
        contact: 1234567890,
        email: "test@email.com".to_string(),
        role: "rider".to_string(),
        addresses: None,
        address: Principal::from_text("cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae").unwrap(),
    };
    register_rider(rider);
    assert_eq!(get_riders().len(), 1);
}

//test register driver
#[test]
fn test_register_driver() {
    let driver = Driver {
        name: "Kelsey".to_string(),
        contact: 1234567890,
        email: "test@email.com".to_string(),
        role: "driver".to_string(),
        vehicleplatenumber: "ABC123".to_string(),
        vehicleseatnumber: "1".to_string(),
        vehiclemake: "Toyota".to_string(),
        vehiclemodel: "Corolla".to_string(),
        vehiclecolor: "Black".to_string(),
        vehicletype: "SUV".to_string(),
        vehicleyear: "2020".to_string(),
        rating: 0.0,
        currentstatus: CurrentStatus::Active,
        addresses: None,
        address: Principal::from_text("cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae").unwrap(),
    };
    register_driver(driver);
    assert_eq!(get_drivers().len(), 1);
}


#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
  candid::export_service!();
  std::print!("{}", __export_service());
}
