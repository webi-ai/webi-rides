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

impl fmt::Display for CurrentStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CurrentStatus::Active => write!(f, "Active"),
            CurrentStatus::Inactive => write!(f, "Inactive"),
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

#[query(name = "getSelf")]
fn get_self() -> Profile {
    let id = ic_cdk::api::caller();
    PROFILE_STORE.with(|profile_store| profile_store.borrow().get(&id).cloned().unwrap_or_default())
}

#[query]
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
#[query(name = "getRides")]
fn get_rides() -> RidesStore {
    RIDES_STORE.with(|rides_store| rides_store.borrow().clone())
}

///get riders
#[query]
fn get_riders() -> RiderStore {
    RIDER_STORE.with(|rider_store| rider_store.borrow().clone())
}

///get drivers
#[query]
fn get_drivers() -> DriverStore {
    DRIVER_STORE.with(|driver_store| driver_store.borrow().clone())
}

///register rider
#[update(name = "registerRider")]
fn register_rider(rider: Rider) {
    RIDER_STORE.with(|rider_store| {
        rider_store.borrow_mut().push(rider);
    });
}

///register driver
#[update(name = "registerDriver")]
fn register_driver(driver: Driver) {
    DRIVER_STORE.with(|driver_store| {
        driver_store.borrow_mut().push(driver);
    });
}

/// update driver rating value
#[update(name = "updateDriverRating")]
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

///search for driver by principal_id and return the driver
#[query]
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

///search for rider by principal_id and return the rider
#[query]
fn search_rider_by_principal_id(principal_id: String) -> Option<Rider> {
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
} // end of impl Driver

///search for rider by field and return the rider
#[query]
#[export_name = "search_rider_by_field"]
fn search_rider_by_field(field: String, value: String) -> Option<Rider> {
    RIDER_STORE.with(|rider_store| {
        for rider in rider_store.borrow().iter() {
            if rider.get_field(field.clone()) == value {
                return Some(rider.clone());
            }
        }
        None
    })
}

///search for driver by field and return the driver  
#[query]
fn search_driver_by_field(field: String, value: String) -> Option<Driver> {
    DRIVER_STORE.with(|driver_store| {
        for driver in driver_store.borrow().iter() {
            if driver.get_field(field.clone()) == value {
                return Some(driver.clone());
            }
        }
        None
    })
}

//search for ride by field and return the ride
#[query]
fn search_ride_by_field(field: String, value: String) -> Option<Ride> {
    RIDES_STORE.with(|ride_store| {
        for ride in ride_store.borrow().iter() {
            if ride.get_field(field.clone()) == value {
                return Some(ride.clone());
            }
        }
        None
    })
}

/// ridestatus enum for ride struct to represent the status of the ride
#[derive(PartialEq, Clone, Copy, Debug, CandidType, Deserialize)]
pub enum RideStatus {
    Active,
    Completed,
    Cancelled,
}

impl fmt::Display for RideStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            RideStatus::Active => write!(f, "Active"),
            RideStatus::Completed => write!(f, "Completed"),
            RideStatus::Cancelled => write!(f, "Cancelled"),
        }
    }
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
            _ => "".to_string(),
        }
    }
}

///register ride to RIDES_STORE
#[update(name = "registerRide")]
fn register_ride(ride: Ride) {
    RIDES_STORE.with(|rides_store| {
        rides_store.borrow_mut().push(ride);
    });
}

///search ride by
#[allow(dead_code)]
fn search_ride_by_id(rideid: String) -> Option<Ride> {
    let mut rides = get_rides();
    for ride in rides.iter_mut() {
        if ride.rideid == rideid {
            return Some(ride.clone());
        }
    }
    None
}

export_service!();

#[query(name = "getCandid")]
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
    ///test search for driver by principal_id
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
    ///test search for rider by principal_id
    #[test]
    fn test_search_rider_by_principal_id() {
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
            search_rider_by_principal_id(
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
        assert_eq!(
            search_rider_by_field("name".to_string(), "Kelsey".to_string())
                .unwrap()
                .name,
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
            search_driver_by_field("name".to_string(), "Kelsey".to_string())
                .unwrap()
                .name,
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
}
