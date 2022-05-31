/**
* Module        :  service.rs
* Copyright     :  2022 Webi.ai
* License       :  GPL 3.0
* Maintainer    :  Kelsey 
* Stability     :  Passes Lint and Test
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

#[derive(PartialEq, Clone, Copy, Debug, CandidType, Deserialize)]
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

#[derive(PartialEq, Clone, Debug, CandidType, Deserialize)]
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

//implement default() for Rider
impl Default for Rider {
    fn default() -> Rider {
        Rider {
            name: String::from(""),
            contact: 0,
            email: String::from(""),
            role: String::from(""),
            addresses: None,
            address: Principal::from_text("cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae").unwrap(),
        }
    }
}

//implement default() for driver
impl Default for Driver {
    fn default() -> Driver {
        Driver {
            name: String::from(""),
            contact: 0,
            email: String::from(""),
            role: String::from(""),
            vehicleplatenumber: String::from(""),
            vehicleseatnumber: String::from(""),
            vehiclemake: String::from(""),
            vehiclemodel: String::from(""),
            vehiclecolor: String::from(""),
            vehicletype: String::from(""),
            vehicleyear: String::from(""),
            rating: 0.0,
            currentstatus: CurrentStatus::Inactive,
            addresses: None,
            address: Principal::from_text("cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae").unwrap(),
        }
    }
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
    //check if the rider is in the store
    assert_eq!(get_riders()[0].name, "Kelsey");

}


//register driver
#[update]
fn register_driver(driver: Driver) {
    DRIVER_STORE.with(|driver_store| {
        driver_store.borrow_mut().push(driver);
    });
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
    //check the data was written to the store
    assert_eq!(get_drivers()[0].name, "Kelsey");
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

// test update_driver_rating
#[test]
fn test_update_driver_rating() {
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
    //check the data was written to the store
    assert_eq!(get_drivers()[0].name, "Kelsey");
    update_driver_rating("Kelsey".to_string(), 5.0);
    assert_eq!(get_drivers()[0].rating, 5.0);
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

//test update_driver_status
#[test]
fn test_update_driver_status() {
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
    //check the data was written to the store
    assert_eq!(get_drivers()[0].name, "Kelsey");
    update_driver_status("Kelsey".to_string(), CurrentStatus::Inactive);
    assert_eq!(get_drivers()[0].currentstatus, CurrentStatus::Inactive);

    update_driver_status("Kelsey".to_string(), CurrentStatus::Active);
    assert_eq!(get_drivers()[0].currentstatus, CurrentStatus::Active);
}



// search for driver by name and return the driver
#[query]
fn search_driver_by_name(driver_name: String) -> Option<Driver> {
    DRIVER_STORE.with(|driver_store| {
        for driver in driver_store.borrow().iter() {
            if driver.name == driver_name {
                return Some(driver.clone());
            }
        }
        None
    })
}

//test search for driver by name and return the driver
#[test]
fn test_search_driver_by_name() {
    //create driver
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

    //search for driver
    let driver_found = search_driver_by_name("Kelsey".to_string());
    //assert
    assert_eq!(driver_found.unwrap().name, "Kelsey");
}





#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
  candid::export_service!();
  std::print!("{}", __export_service());
}
