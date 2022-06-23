/**
* Module        :  contracts/token/main.rs
* Copyright     :  2022 Webi.ai
* License       :  Not Yet Licensed for Public Use
* Maintainer    :  Kelsey
* Stability     :  Passes Lint, Passes Tests, Dependancies up to date
* Run Tests     :  $ cargo clippy && cargo test && cargo audit
* Description   :  Rideshare Service Contracts
*/

///allow for candid_method incase we need it later
#[allow(unused_imports)]
use ic_cdk::export::{
    candid::{candid_method, CandidType, export_service},
    Principal,
};
use ic_cdk_macros::*;
///allow for ledger_types incase we need it later
#[allow(unused_imports)]
use ic_ledger_types::{
    query_archived_blocks, query_blocks, AccountIdentifier, Block, BlockIndex, GetBlocksArgs, Memo,
    Subaccount, Tokens, DEFAULT_SUBACCOUNT, MAINNET_LEDGER_CANISTER_ID,
};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::fmt;

type IdStore = BTreeMap<String, Principal>;
type ProfileStore = BTreeMap<Principal, Profile>;

type DriverStore = Vec<Driver>;
type RiderStore = Vec<Rider>;
type RidesStore = Vec<Ride>;

#[derive(PartialEq, Clone, Copy, Debug, CandidType, Deserialize)]
pub enum CurrentStatus {
    Active,
    Inactive,
}


/// implement the fmt::Display trait for CurrentStatus
impl fmt::Display for CurrentStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CurrentStatus::Active => write!(f, "Active"),
            CurrentStatus::Inactive => write!(f, "Inactive"),
        }
    }
}

/// implement std::str::FromStr trait for CurrentStatus
impl std::str::FromStr for CurrentStatus {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Active" => Ok(CurrentStatus::Active),
            "Inactive" => Ok(CurrentStatus::Inactive),
            _ => Err(format!("Invalid CurrentStatus: {}", s)),
        }
    }
}

/// implement the fmt::Display trait for RideStatus
impl fmt::Display for RideStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            RideStatus::Active => write!(f, "Active"),
            RideStatus::Completed => write!(f, "Completed"),
            RideStatus::Cancelled => write!(f, "Cancelled"),
        }
    }
}

/// implement std::str::FromStr trait for RideStatus
impl std::str::FromStr for RideStatus {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Active" => Ok(RideStatus::Active),
            "Completed" => Ok(RideStatus::Completed),
            "Cancelled" => Ok(RideStatus::Cancelled),
            _ => Err(format!("Invalid RideStatus: {}", s)),
        }
    }
}


#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Rider {
    pub name: String,
    pub contact: String,
    pub email: String,
    pub role: String,
    pub address: String,
}

#[derive(PartialEq, Clone, Debug, CandidType, Deserialize)]
pub struct Driver {
    pub name: String,
    pub contact: String,
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
    pub address: String,
}

///implement default() for Rider
impl Default for Rider {
    fn default() -> Rider {
        Rider {
            name: String::from(""),
            contact: String::from(""),
            email: String::from(""),
            role: String::from(""),
            address: String::from(
                "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae",
            ),
        }
    }
}

///implement default() for driver
impl Default for Driver {
    fn default() -> Driver {
        Driver {
            name: String::from(""),
            contact: String::from(""),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
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
    static RIDES_STORE: RefCell<RidesStore> = RefCell::default();
}

#[query]
#[candid_method(query)]
fn get_self() -> Profile {
    let id = ic_cdk::api::caller();
    PROFILE_STORE.with(|profile_store| profile_store.borrow().get(&id).cloned().unwrap_or_default())
}

#[query]
#[candid_method(query)]
fn get(name: String) -> Profile {
    ID_STORE.with(|id_store| {
        PROFILE_STORE.with(|profile_store| {
            id_store
                .borrow()
                .get(&name)
                .and_then(|id| profile_store.borrow().get(id).cloned())
                .unwrap_or_default()
        })
    })
}

#[update]
#[candid_method(update)]
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

///get rides store   
#[query]
#[candid_method(query)]
fn get_rides() -> RidesStore {
    RIDES_STORE.with(|rides_store| rides_store.borrow().clone())
}

///get riders
#[query]
#[candid_method(query)]
fn get_riders() -> RiderStore {
    RIDER_STORE.with(|rider_store| rider_store.borrow().clone())
}

///get drivers
#[query]
#[candid_method(query)]
fn get_drivers() -> DriverStore {
    DRIVER_STORE.with(|driver_store| driver_store.borrow().clone())
}

///register rider
#[update]
#[candid_method(update)]
fn register_rider(rider: Rider) {
    RIDER_STORE.with(|rider_store| {
        rider_store.borrow_mut().push(rider);
    });
}

///register driver
#[update]
#[candid_method(update)]
fn register_driver(driver: Driver) {
    DRIVER_STORE.with(|driver_store| {
        driver_store.borrow_mut().push(driver);
    });
}

/// update driver rating value
#[update]
#[candid_method(update)]
fn update_driver_rating(driver_name: String, rating: f64) {
    DRIVER_STORE.with(|driver_store| {
        for driver in driver_store.borrow_mut().iter_mut() {
            if driver.name == driver_name {
                driver.rating = rating;
            }
        }
    });
}

/// update driver status value
#[query]
#[candid_method(query)]
fn update_driver_status(driver_name: String, status: CurrentStatus) {
    DRIVER_STORE.with(|driver_store| {
        for driver in driver_store.borrow_mut().iter_mut() {
            if driver.name == driver_name {
                driver.currentstatus = status;
            }
        }
    });
}

/// search for driver by name and return the driver
#[query]
#[candid_method(query)]
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

/// search for driver by contect and return the driver
#[query]
#[candid_method(query)]
fn search_driver_by_contact(contact: String) -> Option<Driver> {
    DRIVER_STORE.with(|driver_store| {
        for driver in driver_store.borrow().iter() {
            if driver.contact == contact {
                return Some(driver.clone());
            }
        }
        None
    })
}

///search for driver by address and return the driver
#[query]
#[candid_method(query)]
fn search_driver_by_address(principal_id: String) -> Option<Driver> {
    DRIVER_STORE.with(|driver_store| {
        for driver in driver_store.borrow().iter() {
            if driver.address == principal_id {
                return Some(driver.clone());
            }
        }
        None
    })
}

///search for rider by address and return the rider
#[query]
#[candid_method(query)]
fn search_rider_by_address(principal_id: String) -> Option<Rider> {
    RIDER_STORE.with(|rider_store| {
        for rider in rider_store.borrow().iter() {
            if rider.address.to_string() == principal_id {
                return Some(rider.clone());
            }
        }
        None
    })
}

impl Rider {
    /// create a new rider
    pub fn new(
        name: String,
        contact: String,
        email: String,
        role: String,
        address: String,
    ) -> Rider {
        Rider {
            name,
            contact,
            email,
            role,
            address,
        } //create a new rider
    }
    pub fn get_name(&self) -> String {
        self.name.clone()
    }
    pub fn name(&self) -> &str {
        &self.name
    } // get the name of the rider
    pub fn contact(&self) -> &str {
        &self.contact
    } // get the contact of the rider
    pub fn email(&self) -> &str {
        &self.email
    } // get the email of the rider
    pub fn role(&self) -> &str {
        &self.role
    } // get the role of the rider
    pub fn address(&self) -> &str {
        &self.address
    } // get the address of the rider
    pub fn get_field(&self, field: String) -> String {
        match field.as_str() {
            "name" => self.name.clone(),
            "contact" => self.contact.clone(),
            "email" => self.email.clone(),
            "role" => self.role.clone(),
            "address" => self.address.clone(),
            _ => "".to_string(),
        }
    } // get the field of the rider
} // end of impl Rider

impl Driver {
    // create a new driver
    pub fn new(
        name: String,
        contact: String,
        email: String,
        role: String,
        vehicleplatenumber: String,
        vehicleseatnumber: String,
        vehiclemake: String,
        vehiclemodel: String,
        vehiclecolor: String,
        vehicletype: String,
        vehicleyear: String,
        rating: f64,
        currentstatus: CurrentStatus,
        address: String,
    ) -> Driver {
        Driver {
            name,
            contact,
            email,
            role,
            vehicleplatenumber,
            vehicleseatnumber,
            vehiclemake,
            vehiclemodel,
            vehiclecolor,
            vehicletype,
            vehicleyear,
            rating,
            currentstatus,
            address,
        }
    }
    pub fn get_name(&self) -> String {
        self.name.clone()
    } // get the name of the driver
    pub fn name(&self) -> &str {
        &self.name
    } // get the name of the driver
    pub fn contact(&self) -> &str {
        &self.contact
    } // get the contact of the driver
    pub fn email(&self) -> &str {
        &self.email
    } // get the email of the driver
    pub fn role(&self) -> &str {
        &self.role
    } // get the role of the driver
    pub fn vehicleplatenumber(&self) -> &str {
        &self.vehicleplatenumber
    } // get the vehicleplatenumber of the driver
    pub fn vehicleseatnumber(&self) -> &str {
        &self.vehicleseatnumber
    } // get the vehicleseatnumber of the driver
    pub fn vehiclemake(&self) -> &str {
        &self.vehiclemake
    } // get the vehiclemake of the driver
    pub fn vehiclemodel(&self) -> &str {
        &self.vehiclemodel
    } // get the vehiclemodel of the driver
    pub fn vehiclecolor(&self) -> &str {
        &self.vehiclecolor
    } // get the vehiclecolor of the driver
    pub fn vehicletype(&self) -> &str {
        &self.vehicletype
    } // get the vehicletype of the driver
    pub fn vehicleyear(&self) -> &str {
        &self.vehicleyear
    } // get the vehicleyear of the driver
    pub fn rating(&self) -> f64 {
        self.rating
    } // get the rating of the driver
    pub fn currentstatus(&self) -> &CurrentStatus {
        &self.currentstatus
    } // get the currentstatus of the driver
    pub fn address(&self) -> &str {
        &self.address
    } // get the address of the driver
    pub fn get_field(&self, field: String) -> String {
        match field.as_str() {
            "name" => self.name.clone(),
            "contact" => self.contact.clone(),
            "email" => self.email.clone(),
            "role" => self.role.clone(),
            "vehicleplatenumber" => self.vehicleplatenumber.clone(),
            "vehicleseatnumber" => self.vehicleseatnumber.clone(),
            "vehiclemake" => self.vehiclemake.clone(),
            "vehiclemodel" => self.vehiclemodel.clone(),
            "vehiclecolor" => self.vehiclecolor.clone(),
            "vehicletype" => self.vehicletype.clone(),
            "vehicleyear" => self.vehicleyear.clone(),
            "rating" => self.rating.to_string(),
            "currentstatus" => self.currentstatus.to_string(),
            "address" => self.address.clone(),
            _ => "".to_string(),
        }
    } // get the value in the field
    //updates
    pub fn update_name(&mut self, name: String) {
        self.name = name;
    } // update the name of the driver
    pub fn update_contact(&mut self, contact: String) {
        self.contact = contact;
    } // update the contact of the driver
    pub fn update_email(&mut self, email: String) {
        self.email = email;
    } // update the email of the driver
    pub fn update_role(&mut self, role: String) {
        self.role = role;
    } // update the role of the driver
    pub fn update_vehicleplatenumber(&mut self, vehicleplatenumber: String) {
        self.vehicleplatenumber = vehicleplatenumber;
    } // update the vehicleplatenumber of the driver
    pub fn update_vehicleseatnumber(&mut self, vehicleseatnumber: String) {
        self.vehicleseatnumber = vehicleseatnumber;
    } // update the vehicleseatnumber of the driver
    pub fn update_vehiclemake(&mut self, vehiclemake: String) {
        self.vehiclemake = vehiclemake;
    } // update the vehiclemake of the driver
    pub fn update_vehiclemodel(&mut self, vehiclemodel: String) {
        self.vehiclemodel = vehiclemodel;
    } // update the vehiclemodel of the driver
    pub fn update_vehiclecolor(&mut self, vehiclecolor: String) {
        self.vehiclecolor = vehiclecolor;
    } // update the vehiclecolor of the driver
    pub fn update_vehicletype(&mut self, vehicletype: String) {
        self.vehicletype = vehicletype;
    } // update the vehicletype of the driver
    pub fn update_vehicleyear(&mut self, vehicleyear: String) {
        self.vehicleyear = vehicleyear;
    } // update the vehicleyear of the driver
    pub fn update_rating(&mut self, rating: f64) {
        self.rating = rating;
    } // update the rating of the driver
    pub fn update_currentstatus(&mut self, currentstatus: CurrentStatus) {
        self.currentstatus = currentstatus;
    } // update the currentstatus of the driver
    pub fn update_address(&mut self, address: String) {
        self.address = address;
    } // update the address of the driver
    pub fn update_field(&mut self, field: String, value: String) {
        match field.as_str() {
            "name" => self.name = value,
            "contact" => self.contact = value,
            "email" => self.email = value,
            "role" => self.role = value,
            "vehicleplatenumber" => self.vehicleplatenumber = value,
            "vehicleseatnumber" => self.vehicleseatnumber = value,
            "vehiclemake" => self.vehiclemake = value,
            "vehiclemodel" => self.vehiclemodel = value,
            "vehiclecolor" => self.vehiclecolor = value,
            "vehicletype" => self.vehicletype = value,
            "vehicleyear" => self.vehicleyear = value,
            "rating" => self.rating = value.parse().unwrap(),
            "address" => self.address = value,
            _ => (),
        }
    } // update the field of the driver
    //update whole driver
    pub fn update_driver(&mut self, driver: Driver) {
        self.name = driver.name;
        self.contact = driver.contact;
        self.email = driver.email;
        self.role = driver.role;
        self.vehicleplatenumber = driver.vehicleplatenumber;
        self.vehicleseatnumber = driver.vehicleseatnumber;
        self.vehiclemake = driver.vehiclemake;
        self.vehiclemodel = driver.vehiclemodel;
        self.vehiclecolor = driver.vehiclecolor;
        self.vehicletype = driver.vehicletype;
        self.vehicleyear = driver.vehicleyear;
        self.rating = driver.rating;
        self.currentstatus = driver.currentstatus;
        self.address = driver.address;
    } // update the whole driver
    //delete
    pub fn delete_name(&mut self) {
        self.name = "".to_string();
    } // delete the name of the driver
    pub fn delete_contact(&mut self) {
        self.contact = "".to_string();
    } // delete the contact of the driver
    pub fn delete_email(&mut self) {
        self.email = "".to_string();
    } // delete the email of the driver
    pub fn delete_role(&mut self) {
        self.role = "".to_string();
    } // delete the role of the driver
    pub fn delete_vehicleplatenumber(&mut self) {
        self.vehicleplatenumber = "".to_string();
    } // delete the vehicleplatenumber of the driver
    pub fn delete_vehicleseatnumber(&mut self) {
        self.vehicleseatnumber = "".to_string();
    } // delete the vehicleseatnumber of the driver
    pub fn delete_vehiclemake(&mut self) {
        self.vehiclemake = "".to_string();
    } // delete the vehiclemake of the driver
    pub fn delete_vehiclemodel(&mut self) {
        self.vehiclemodel = "".to_string();
    } // delete the vehiclemodel of the driver
    pub fn delete_vehiclecolor(&mut self) {
        self.vehiclecolor = "".to_string();
    } // delete the vehiclecolor of the driver
    pub fn delete_vehicletype(&mut self) {
        self.vehicletype = "".to_string();
    } // delete the vehicletype of the driver
    pub fn delete_vehicleyear(&mut self) {
        self.vehicleyear = "".to_string();
    } // delete the vehicleyear of the driver
    pub fn delete_rating(&mut self) {
        self.rating = 0.0;
    } // delete the rating of the driver
    pub fn delete_address(&mut self) {
        self.address = "".to_string();
    } // delete the address of the driver
    pub fn delete_field(&mut self, field: String) {
        match field.as_str() {
            "name" => self.name = "".to_string(),
            "contact" => self.contact = "".to_string(),
            "email" => self.email = "".to_string(),
            "role" => self.role = "".to_string(),
            "vehicleplatenumber" => self.vehicleplatenumber = "".to_string(),
            "vehicleseatnumber" => self.vehicleseatnumber = "".to_string(),
            "vehiclemake" => self.vehiclemake = "".to_string(),
            "vehiclemodel" => self.vehiclemodel = "".to_string(),
            "vehiclecolor" => self.vehiclecolor = "".to_string(),
            "vehicletype" => self.vehicletype = "".to_string(),
            "vehicleyear" => self.vehicleyear = "".to_string(),
            "rating" => self.rating = 0.0,
            "currentstatus" => self.currentstatus = CurrentStatus::Inactive,
            "address" => self.address = "".to_string(),
            _ => (),
        }
    } // delete the field of the driver
    //delete whole driver
    pub fn delete_driver(&mut self) {
        self.name = "".to_string();
        self.contact = "".to_string();
        self.email = "".to_string();
        self.role = "".to_string();
        self.vehicleplatenumber = "".to_string();
        self.vehicleseatnumber = "".to_string();
        self.vehiclemake = "".to_string();
        self.vehiclemodel = "".to_string();
        self.vehiclecolor = "".to_string();
        self.vehicletype = "".to_string();
        self.vehicleyear = "".to_string();
        self.rating = 0.0;
        self.currentstatus = CurrentStatus::Inactive;
        self.address = "".to_string();
    } // delete the whole driver
    
} // end of impl Driver

///search for riders by field and return the results
#[query]
#[candid_method(query)]
fn search_rider_by_field(field: String, value: String) -> Vec<Option<Rider>> {
    RIDER_STORE.with(|rider_store| {
        let mut result = Vec::new();
        for rider in rider_store.borrow().iter() {
            if rider.get_field(field.clone()) == value {
                result.push(Some(rider.clone()));
            }
        }
        result
    })
}

///search for drivers by field and return the results  
#[query]
#[candid_method(query)]
fn search_driver_by_field(field: String, value: String) -> Vec<Option<Driver>> {
    DRIVER_STORE.with(|driver_store| {
        let mut results = Vec::new();
        for driver in driver_store.borrow().iter() {
            if driver.get_field(field.clone()) == value {
                results.push(Some(driver.clone()));
            } else {
                results.push(None);
            }
        }
        results
    })
}

//search for rides by field and return all results
#[query]
#[candid_method(query)]
fn search_ride_by_field(field: String, value: String) -> Vec<Option<Ride>> {
    RIDES_STORE.with(|ride_store| {
        let mut result = Vec::new();
        for ride in ride_store.borrow().iter() {
            if ride.get_field(field.clone()) == value {
                result.push(Some(ride.clone()));
            }
        }
        result
    })
}

/// ridestatus enum for ride struct to represent the status of the ride
#[derive(PartialEq, Clone, Copy, Debug, CandidType, Deserialize)]
pub enum RideStatus {
    Active,
    Completed,
    Cancelled,
}


//remove a ride from the ride store
#[update]
#[candid_method(update)]
fn remove_ride(ride_id: String) {
    RIDES_STORE.with(|ride_store| {
        let mut ride_store = ride_store.borrow_mut();
        let mut index = 0;
        for ride in ride_store.iter() {
            if ride.rideid == ride_id {
                ride_store.remove(index);
                break;
            }
            index += 1;
        }
    });
}

//remove a ride in the store then add the new one
#[update]
#[candid_method(update)]
fn update_ride(ride_id: String, ride: Ride) {
    RIDES_STORE.with(|ride_store| {
        let mut ride_store = ride_store.borrow_mut();
        let mut index = 0;
        for ride_ in ride_store.iter() {
            if ride_.rideid == ride_id {
                ride_store.remove(index);
                break;
            }
            index += 1;
        }
    });
    RIDES_STORE.with(|ride_store| {
        let mut ride_store = ride_store.borrow_mut();
        ride_store.push(ride);
    });
}

//remove a rider from the store by address
#[update]
#[candid_method(update)]
fn remove_rider(address: String) {
    RIDER_STORE.with(|rider_store| {
        let mut rider_store = rider_store.borrow_mut();
        let mut index = 0;
        for rider in rider_store.iter() {
            if rider.address == address {
                rider_store.remove(index);
                break;
            }
            index += 1;
        }
    });
}

//remove a driver from the store by address and add the new one
#[update]
#[candid_method(update)]
fn update_driver(address: String, driver: Driver) {
    DRIVER_STORE.with(|driver_store| {
        let mut driver_store = driver_store.borrow_mut();
        let mut index = 0;
        for driver_ in driver_store.iter() {
            if driver_.address == address {
                driver_store.remove(index);
                break;
            }
            index += 1;
        }
    });
    DRIVER_STORE.with(|driver_store| {
        let mut driver_store = driver_store.borrow_mut();
        driver_store.push(driver);
    });
}


///Ride struct for the ride table
#[derive(Debug, Deserialize, Clone, CandidType)]
pub struct Ride {
    pub rideid: String,
    pub driver: Driver,
    pub rider: Rider,
    pub pickup: String,
    pub dropoff: String,
    pub status: RideStatus,
    pub timestamp: String,
    pub rating: f64,
    pub driverrating: f64,
    pub riderrating: f64,
    pub driverfeedback: String,
    pub riderfeedback: String,
    pub riderconfirmation: String,
    pub driverconfirmation: String,
}

#[allow(dead_code)]
/// implement the ride struct with the following functions
impl Ride {
    fn update_rider_confirmation(&mut self, confirmation: String) {
        self.riderconfirmation = confirmation;
    }

    fn update_driver_confirmation(&mut self, confirmation: String) {
        self.driverconfirmation = confirmation;
    }
    fn update_driver_rating(&mut self, rating: f64) {
        self.driverrating = rating;
    }
    fn update_rider_rating(&mut self, rating: f64) {
        self.riderrating = rating;
    }
    fn update_driver_feedback(&mut self, feedback: String) {
        self.driverfeedback = feedback;
    }
    fn update_rider_feedback(&mut self, feedback: String) {
        self.riderfeedback = feedback;
    }
    fn update_rating(&mut self, rating: f64) {
        self.rating = rating;
    }
    fn update_status(&mut self, status: RideStatus) {
        self.status = status;
    }
    fn update_timestamp(&mut self, timestamp: String) {
        self.timestamp = timestamp;
    }
    fn update_dropoff(&mut self, dropoff: String) {
        self.dropoff = dropoff;
    }
    fn update_pickup(&mut self, pickup: String) {
        self.pickup = pickup;
    }
    fn update_rider(&mut self, rider: Rider) {
        self.rider = rider;
    }
    fn update_driver(&mut self, driver: Driver) {
        self.driver = driver;
    }
    fn update_rideid(&mut self, rideid: String) {
        self.rideid = rideid;
    }

    fn get_rider_confirmation(&self) -> String {
        self.riderconfirmation.clone()
    }
    fn get_driver_confirmation(&self) -> String {
        self.driverconfirmation.clone()
    }
    fn get_driver_rating(&self) -> f64 {
        self.driverrating
    }
    fn get_rider_rating(&self) -> f64 {
        self.riderrating
    }
    fn get_driver_feedback(&self) -> String {
        self.driverfeedback.clone()
    }
    fn get_rider_feedback(&self) -> String {
        self.riderfeedback.clone()
    }
    fn get_rating(&self) -> f64 {
        self.rating
    }
    fn get_status(&self) -> RideStatus {
        self.status
    }
    fn get_timestamp(&self) -> String {
        self.timestamp.clone()
    }
    fn get_dropoff(&self) -> String {
        self.dropoff.clone()
    }
    fn get_pickup(&self) -> String {
        self.pickup.clone()
    }
    fn get_rider(&self) -> Rider {
        self.rider.clone()
    }
    fn get_driver(&self) -> Driver {
        self.driver.clone()
    }
    fn get_rideid(&self) -> String {
        self.rideid.clone()
    }

    fn get_id(&self) -> String {
        self.rideid.clone()
    }

    fn get_type(&self) -> String {
        "Ride".to_string()
    }

    fn get_field(&self, field: String) -> String {
        match field.as_str() {
            "rideid" => self.rideid.clone(),
            "driver" => self.driver.get_name(),
            "rider" => self.rider.get_name(),
            "pickup" => self.pickup.clone(),
            "dropoff" => self.dropoff.clone(),
            "status" => self.status.to_string(),
            "timestamp" => self.timestamp.clone(),
            "rating" => self.rating.to_string(),
            "driverrating" => self.driverrating.to_string(),
            "riderrating" => self.riderrating.to_string(),
            "driverfeedback" => self.driverfeedback.clone(),
            "riderfeedback" => self.riderfeedback.clone(),
            "riderconfirmation" => self.riderconfirmation.clone(),
            "driverconfirmation" => self.driverconfirmation.clone(),
            "driveraddress" => self.driver.address.clone(),
            "rideraddress" => self.rider.address.clone(),
            _ => "".to_string(),
        }
    }
}

///register ride to RIDES_STORE
#[update]
#[candid_method(update)]
fn register_ride(ride: Ride) {
    RIDES_STORE.with(|rides_store| {
        rides_store.borrow_mut().push(ride);
    });
}

///search ride by
#[allow(dead_code)]
#[candid_method(query)]
fn search_ride_by_id(rideid: String) -> Option<Ride> {
    let mut rides = get_rides();
    for ride in rides.iter_mut() {
        if ride.rideid == rideid {
            return Some(ride.clone());
        }
    }
    None
}

///update a driver for a ride by rideid
#[update]
#[candid_method(update)]
fn update_driver_for_ride(rideid: String, driver: Driver) {
    let mut rides = get_rides();
    for ride in rides.iter_mut() {
        if ride.rideid == rideid {
            ride.update_driver(driver.clone());
        }
    }
}


///update a rider for a ride by rideid
#[update]
#[candid_method(update)]
fn update_rider_for_ride(rideid: String, rider: Rider) {
    let mut rides = get_rides();
    for ride in rides.iter_mut() {
        if ride.rideid == rideid {
            ride.update_rider(rider.clone());
        }
    }
}


export_service!();

#[query]
fn export_candid() -> String {
    __export_service()
}

#[cfg(any(target_arch = "wasm32", test))]
fn main() {}

#[cfg(not(any(target_arch = "wasm32", test)))]
fn main() {
    candid::export_service!();
    std::print!("{}", __export_service());
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash)]
pub struct TransferArgs {
    amount: Tokens,
    to_principal: Principal,
    to_subaccount: Option<Subaccount>,
}

///get one
pub type BlockHeight = u64;

///get block from ledger with height
#[allow(dead_code)]
#[candid_method(query)]
async fn get_block_from_ledger(
    block_height: BlockHeight,
    ledger_canister_id: Principal,
) -> Option<Block> {
    //!set arguments for get blocks
    let args = GetBlocksArgs {
        start: block_height,
        length: 1,
    };
    //set ledger to mainnet
    if let Ok(result) = query_blocks(ledger_canister_id, args.clone()).await {
        //get block from result
        if !result.blocks.is_empty() {
            return result.blocks.first().cloned();
        }
        //get block from archived blocks
        if let Some(b) = result
            .archived_blocks
            .into_iter()
            .find(|b| (b.start <= block_height && (block_height - b.start) < b.length))
        {
            if let Ok(Ok(range)) = query_archived_blocks(&b.callback, args).await {
                return range.blocks.get((block_height - b.start) as usize).cloned();
            }
        }
    }
    None
}

///request a ride
#[update]
#[candid_method(query)]
pub fn request_ride(rider: Rider, pickup: String, dropoff: String, timestamp: String) -> () {
    //find an available driver
    let mut drivers = get_drivers();
    let mut driver = None;
    for d in drivers.iter_mut() {
        if d.currentstatus == CurrentStatus::Active {
            driver = Some(d.clone());
            break;
        }
    }
    //assert
    assert!(driver.is_some());
    //create a ride with the driver and rider
    let ride = Ride {
        rideid: "".to_string(),
        driver: driver.unwrap().clone(),
        rider: rider.clone(),
        pickup: pickup.clone(),
        dropoff: dropoff.clone(),
        status: RideStatus::Active,
        timestamp: timestamp.clone(),
        rating: 0.0,
        driverrating: 0.0,
        riderrating: 0.0,
        driverfeedback: "".to_string(),
        riderfeedback: "".to_string(),
        riderconfirmation: "".to_string(),
        driverconfirmation: "".to_string(),
    };
    //register ride
    register_ride(ride.clone());
}

#[cfg(test)]
mod test {
    use super::*;

    /// test registerRider
    #[test]
    fn test_register_rider() {
        let rider = Rider {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
            email: "test@email.com".to_string(),
            role: "rider".to_string(),
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_rider(rider);
        assert_eq!(get_riders().len(), 1);
        //check if the rider is in the store
        assert_eq!(get_riders()[0].name, "Kelsey");
    }

    ///test register driver
    #[test]
    fn test_register_driver() {
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver);
        assert_eq!(get_drivers().len(), 1);
        //check the data was written to the store
        assert_eq!(get_drivers()[0].name, "Kelsey");
    }
    /// test update_driver_rating
    #[test]
    fn test_update_driver_rating() {
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver);
        assert_eq!(get_drivers().len(), 1);
        //check the data was written to the store
        assert_eq!(get_drivers()[0].name, "Kelsey");
        update_driver_rating("Kelsey".to_string(), 5.0);
        assert_eq!(get_drivers()[0].rating, 5.0);
    }
    ///test update_driver_status
    #[test]
    fn test_update_driver_status() {
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
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
    ///test search for driver by address
    #[test]
    fn test_search_driver_by_address() {
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver);
        assert_eq!(get_drivers().len(), 1);
        //check the data was written to the store
        assert_eq!(get_drivers()[0].name, "Kelsey");
        assert_eq!(
            search_driver_by_address(
                "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string()
            )
            .unwrap()
            .name,
            "Kelsey"
        );
    }
    ///test search for rider by address
    #[test]
    fn test_search_rider_by_address() {
        let rider = Rider {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
            email: "test@email.com".to_string(),
            role: "rider".to_string(),
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_rider(rider);
        assert_eq!(get_riders().len(), 1);
        //check the data was written to the store
        assert_eq!(get_riders()[0].name, "Kelsey");
        assert_eq!(
            search_rider_by_address(
                "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string()
            )
            .unwrap()
            .name,
            "Kelsey"
        );
    }

    /// test search for driver_by_contact
    #[test]
    fn test_search_driver_by_contact() {
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver);
        assert_eq!(get_drivers().len(), 1);
        //check the data was written to the store
        assert_eq!(get_drivers()[0].name, "Kelsey");
        assert_eq!(
            search_driver_by_contact("1234567890".to_string())
                .unwrap()
                .name,
            "Kelsey"
        );
    }
    ///test create ride
    #[test]
    fn test_create_ride() {
        //!create driver
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver.clone());
        //create rider
        let rider = Rider {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
            email: "test@email.com".to_string(),
            role: "rider".to_string(),
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_rider(rider.clone());

        //create ride
        let ride = Ride {
            rideid: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
            driver: driver,
            rider: rider,
            pickup: "new york".to_string(),
            dropoff: "san francisco".to_string(),
            status: RideStatus::Active,
            timestamp: "2020-01-01T00:00:00.000Z".to_string(),
            rating: 0.0,
            driverrating: 0.0,
            riderrating: 0.0,
            driverfeedback: "".to_string(),
            riderfeedback: "".to_string(),
            riderconfirmation: "".to_string(),
            driverconfirmation: "".to_string(),
        };
        //register ride
        register_ride(ride);
        //get list of all rides
        let rides = get_rides();
        //assert
        assert_eq!(rides.len(), 1);
    }
    ///test search riders by field and return the rider
    #[test]
    fn test_search_rider_by_field() {
        let rider = Rider::new(
            "Kelsey".to_string(),
            "1234567890".to_string(),
            "test@email.com".to_string(),
            "rider".to_string(),
            "123 Main St".to_string(),
        );
        RIDER_STORE.with(|rider_store| {
            rider_store.borrow_mut().push(rider.clone());
        });
        assert_eq!(get_riders().len(), 1);
        //check the data was written to the store
        assert_eq!(get_riders()[0].name, "Kelsey");
        assert_eq!(
            //get the first rider
            search_rider_by_field("name".to_string(), "Kelsey".to_string())[0].as_ref()
                .unwrap().name,
            "Kelsey"
        );
        assert_eq!(
            //get the first rider
            search_rider_by_field("contact".to_string(), "1234567890".to_string())[0].as_ref()
                .unwrap().name,
            "Kelsey"
        );
    }

    ///test search for driver by field and return the driver
    #[test]
    fn test_search_driver_by_field() {
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver);
        assert_eq!(
            //get the first driver
            search_driver_by_field("name".to_string(), "Kelsey".to_string())[0].as_ref()
                .unwrap().name,
            "Kelsey"
        );
        
            }

    ///test search for driver by name and return the driver
    #[test]
    fn test_search_driver_by_name() {
        //!create driver
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver);

        //search for driver
        let driver_found = search_driver_by_name("Kelsey".to_string());
        //assert
        assert_eq!(driver_found.unwrap().name, "Kelsey");
    }
    ///test search ride by id
    #[test]
    fn test_search_ride_by_id() {
        //create driver
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver.clone());
        //create rider
        let rider = Rider {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
            email: "test@email.com".to_string(),
            role: "rider".to_string(),
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_rider(rider.clone());
        //create ride
        let ride = Ride {
            rideid: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
            driver: driver,
            rider: rider,
            pickup: "new york".to_string(),
            dropoff: "san francisco".to_string(),
            status: RideStatus::Active,
            timestamp: "2020-01-01T00:00:00.000Z".to_string(),
            rating: 0.0,
            driverrating: 0.0,
            riderrating: 0.0,
            driverfeedback: "".to_string(),
            riderfeedback: "".to_string(),
            riderconfirmation: "".to_string(),
            driverconfirmation: "".to_string(),
        };
        //register ride
        register_ride(ride.clone());
        //search ride by id
        let search_ride = search_ride_by_id(ride.clone().rideid);
        //assert
        assert_eq!(search_ride.unwrap().rideid, ride.clone().rideid);
    }
    ///test request ride
    #[test]
    fn test_request_ride() {
        //create driver
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver.clone());
        //create rider
        let rider = Rider {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
            email: "test@email.com".to_string(),
            role: "rider".to_string(),
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_rider(rider.clone());
        //request a ride
        request_ride(
            rider.clone(),
            "new york".to_string(),
            "san francisco".to_string(),
            "2020-01-01T00:00:00.000Z".to_string(),
        );
        //get rides
        let rides = get_rides();
        //get first ride
        let ride = rides.first().unwrap();
        //assert ride exists
        assert_eq!(ride.rider.name, rider.name);
        assert_eq!(ride.driver.name, driver.name);
    }
    //test search ride by field
    #[test]
    fn test_search_ride_by_field() {
        //create driver
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };

        register_driver(driver.clone());
        //create rider
        let rider = Rider {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
            email: "test@email.com".to_string(),
            role: "rider".to_string(),
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_rider(rider.clone());
        //request a ride
        request_ride(
            rider.clone(),
            "new york".to_string(),
            "san francisco".to_string(),
            "2020-01-01T00:00:00.000Z".to_string(),
        );
        //get rides
        let rides = get_rides();
        //get first ride
        let ride = rides.first().unwrap();
        //assert ride exists
        assert_eq!(ride.rider.name, rider.name);
        assert_eq!(ride.driver.name, driver.name);
        //search ride by pickup
    }

    ///test update_driver_for_ride
    #[test]
    fn test_update_driver_for_ride() {
        //create driver
        let driver = Driver {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
            email: "test@gmail.com".to_string(),
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
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_driver(driver.clone());
        //create rider
        let rider = Rider {
            name: "Kelsey".to_string(),
            contact: "1234567890".to_string(),
            email: "test@email.com".to_string(),
            role: "rider".to_string(),
            address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
        };
        register_rider(rider.clone());
        //create ride for register_ride
        let ride = Ride {
            rideid: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae".to_string(),
            rider: rider.clone(),
            driver: driver.clone(),
            pickup: "new york".to_string(),
            dropoff: "san francisco".to_string(),
            timestamp: "2020-01-01T00:00:00.000Z".to_string(),
            status: RideStatus::Active,
            driverrating: 0.0,
            riderrating: 0.0,
            driverconfirmation: "".to_string(),
            riderconfirmation: "".to_string(),
            driverfeedback: "".to_string(),
            riderfeedback: "".to_string(),
            rating: 0.0,
        };

        register_ride(ride.clone());
        let mut new_driver = driver.clone();
        new_driver.update_vehiclemake("Honda".to_string());
        update_driver(driver.address, new_driver.clone());
        let mut new_ride = ride.clone();
        new_ride.driver = new_driver.clone();

        //update_ride with new ride
        update_ride(ride.rideid, new_ride);

        //get rides
        let rides = get_rides();
        //get first ride
        let check_ride = rides.first().unwrap();
        //assert ride exists
        assert_eq!(check_ride.rider.name, rider.name);
        //check for honda
        assert_eq!(check_ride.driver.vehiclemake, "Honda".to_string());
    }
}