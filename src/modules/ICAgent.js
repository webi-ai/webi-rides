// Module : ICAgent.js
// Description : ICAgent.js handles interactions with the IC agent
// Maintainer : Kelsey and Dixie
// License : Not currently licensed for public use
// Copyright : Webi.ai (c) 2022

import { v4 as uuidv4 } from "uuid";

//import the actor from agent script to interact with smart contracts
import actor from "../scripts/agent.js";

//create a placeholder driver for the ride
const PLACEHOLDER_DRIVER = {
  contact: "",
  name: "",
  email: "",
  role: "driver",
  vehicleplatenumber: "",
  vehicleseatnumber: "",
  vehiclemake: "",
  vehiclemodel: "",
  vehiclecolor: "",
  vehicletype: "",
  vehicleyear: "",
  rating: 0,
  currentstatus: { Active: null },
  address: "",
};

//create a placeholder rider for the ride
const PLACEHOLDER_RIDER = {
  contact: "",
  name: "",
  email: "",
  role: "rider",
  address: "",
};

//registerRider registers a new rider using actor.register_rider
const registerRider = async (rider) => {
  actor.register_rider(rider).then(
    (success) => {
      console.log("register_rider success, rider address", rider.address);
    },
    (error) => {
      console.error("register_rider error", error);
    }
  );
};

// rider wallet address primary id?
//registerRide registers a new ride using actor.register_ride
const registerRide = async (riderAddress, pickup, dropoff) => {
  console.log("register_ride for rider address", riderAddress);
  // retrieve logged in rider
  const rider = await searchRiderByAddress(riderAddress);
  const rideId = uuidv4(); // generate unique ride id
  const pickupJson = JSON.stringify({
    lat: pickup.lat,
    lng: pickup.lng,
    address_text: pickup.address_text,
  });
  const dropoffJson = JSON.stringify({
    lat: dropoff.lat,
    lng: dropoff.lng,
    address_text: dropoff.address_text,
  });
  const ride = {
    rideid: rideId,
    pickup: pickupJson,
    dropoff: dropoffJson,
    status: { Active: null },
    timestamp: Date.now().toString(),
    rating: 0,
    driver: PLACEHOLDER_DRIVER, // placeholder values, driver should be opt so it can be null until one accepts ride
    driverrating: 0,
    driverfeedback: "",
    driverconfirmation: "",
    rider: rider, // currently logged in rider
    riderrating: 0,
    riderfeedback: "",
    riderconfirmation: "",
  };
  // console.log(ride);
  // console.log("register_ride", rideId);
  await actor.register_ride(ride);
  // console.log("register_ride success, ride id ", rideId);

  const newRide = await getMostRecentRideForRider(riderAddress);
  // console.log(newRide);
  if (!newRide) {
    console.log('can\'t find ride', rideId);
  } else if (newRide.rideId !== rideId) {
    console.log('ride id mismatch, rideid ', rideId, ' doesn\'t match found id ', newRide.rideId);
  } else {
    console.log('ride registered', rideId);
  }
  return rideId;
};

//searchRiderByAddress searches for a rider by their wallet address using actor.search_rider
const searchRiderByAddress = async (walletAddress) => {
  const rider = await actor.search_rider_by_address(walletAddress);
  console.log("search_rider_by_address success for address", walletAddress);
  return rider[0];
};

//searchDriverByAddress searches for a driver by their wallet address using actor.search_driver
const searchDriverByAddress = async (walletAddress) => {
  const driver = await actor.search_driver_by_address(walletAddress);
  console.log("search_driver_by_address success for address", walletAddress);
  return driver[0];
}

//get rides for a rider using actor.search_rides_by_field
const getRidesForRider = async (riderAddress) => {
  const rides = await actor.search_ride_by_field("rideraddress", riderAddress);
  console.log("search_ride_by_field success for rider address", riderAddress);
  return rides;
};

//get rides for a driver using actor.search_rides_by_field
const getRidesForDriver = async (driverAddress) => {
  const rides = await actor.search_ride_by_field(
    "driveraddress",
    driverAddress
  );
  console.log("search_ride_by_field success for driver address", driverAddress);
  return rides;
};

//get most recent ride for a driver using actor.search_rides_by_field
const getMostRecentRideForDriver = async (driverAddress) => {
  const rides = await actor.search_ride_by_field(
    "driveraddress",
    driverAddress
  );
  console.log("search_ride_by_field success for driver address", driverAddress);
  return getMostRecentRide(rides);
};

const getMostRecentRide = (rides) => {
  return rides.reduce(function (prev, curr) { return (prev.timestamp > curr.timestamp) ? prev : curr; });
}

//get most recent ride for a rider using actor.search_rides_by_field
const getMostRecentRideForRider = async (riderAddress) => {
  const rides_result = await actor.search_ride_by_field("rideraddress", riderAddress);
  console.log("search_ride_by_field success for rider address", riderAddress);
  const ride = rides_result.map((ride) => {
    return getMostRecentRide(ride);
  }
  );
  return ride[0];
}

//get last n rides by a rider offset by a number using actor.search_rides_by_field
const getLastNRidesByRider = async (riderAddress, n) => {
  const rides = await actor.search_ride_by_field("rideraddress", riderAddress);
  console.log("search_ride_by_field success for rider address", riderAddress);
  return rides.slice(0, n);
};

//get last n rides by a driver offset by a number using actor.search_rides_by_field
const getLastNRidesByDriver = async (driverAddress, n) => {
  const rides = await actor.search_ride_by_field(
    "driveraddress",
    driverAddress
  );
  console.log("search_ride_by_field success for driver address", driverAddress);
  return rides.slice(0, n);
};

//get the rideid for the most recent ride for a driver using actor.search_rides_by_field
const getMostRecentRideIdForDriver = async (driverAddress) => {
  const rides = await actor.search_ride_by_field(
    "driveraddress",
    driverAddress
  );
  console.log("search_ride_by_field success for driver address", driverAddress);
  return rides[0].rideid;
};

//get the rideid for the most recent ride for a rider using actor.search_rides_by_field
const getMostRecentRideIdForRider = async (riderAddress) => {
  const rides = await actor.search_ride_by_field("rideraddress", riderAddress);
  console.log("search_ride_by_field success for rider address", riderAddress);
  return rides[0].rideid;
};

//check a ride object is valid by calling get_type expecting value of 'Ride'
const isValidRide = async (ride) => {
  if (!ride) {
    return false;
  }
  return true;
  // TODO fix Unhandled Rejection (TypeError): ride.get_type is not a function
  const type = await ride.get_type();
  console.log("get_type success for ride", ride);
  return type === "Ride";
};

//register driver
const registerDriver = async (driver) => {
  actor.register_driver(driver).then(
    (success) => {
      console.log("register_driver success, driver address", driver.address);
    },
    (error) => {
      console.error("register_driver error", error);
    }
  );
};

////update driver of a ride by rideid using ride.update_driver
const updateDriver = async (rideId, driver) => {
  const ride = await getRideById(rideId);
  // check ride is valid
  if (!(await isValidRide(ride))) {
    console.error("update_driver error, ride is not valid");
    return;
  }
  //call ride.update_driver
  await ride.update_driver(driver);
  console.log("update_driver success, driver address", driver.address);
}

//update driver feedback after a ride by rideid using ride.update_driver_feedback
const updateDriverFeedback = async (rideId, feedback) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  ride.update_driver_feedback(feedback);
  console.log("update_driver_feedback success for ride id", rideId);
};

//update rider feedback after a ride by rideid using ride.update_rider_feedback
const updateRiderFeedback = async (rideId, feedback) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  ride.update_rider_feedback(feedback);
  console.log("update_rider_feedback success for ride id", rideId);
};

//update ride driver rating after a ride by rideid using ride.update_rating
const updateDriverRating = async (rideId, rating) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  ride.update_rating(rating);
  console.log("update_rating success for ride id", rideId);
};

//update ride rider rating after a ride by rideid using ride.update_rating
const updateRiderRating = async (rideId, rating) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  ride.update_rating(rating);
  console.log("update_rating success for ride id", rideId);
};

//update a ride status by rideid using ride.update_status
const updateRideStatus = async (rideId, status) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  ride.update_status(status);
  console.log("update_status success for ride id", rideId);
};

//update a ride for a user found by most recent address using ride.update_status 
const updateRideStatusByAddress = async (address, status) => {
  const ride_results = await actor.search_ride_by_field("rideraddress", address);
  console.log("search_ride_by_field success for rider address", address);
  const ride = ride_results[0];
  ride.update_status(status);
  console.log("update_status success for ride id", rideId);
}


//change dropoff location of a ride by rideid using ride.update_dropoff
const updateDropoff = async (rideId, dropoff) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  ride.update_dropoff(dropoff);
  console.log("update_dropoff success for ride id", rideId);
};

//change pickup location of a ride by rideid using ride.update_pickup
const updatePickup = async (rideId, pickup) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  ride.update_pickup(pickup);
  console.log("update_pickup success for ride id", rideId);
};

//update rider confirmations of a ride by rideid using ride.update_rider_confirmation
const updateRiderConfirmation = async (rideId, confirmation) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  // TODO fix, remove bypass
  // ride.update_rider_confirmation(confirmation);
  // console.log("update_rider_confirmation success for ride id", rideId);
}

//update driver confirmations of a ride by rideid using ride.update_driver_confirmation
const updateDriverConfirmation = async (rideId, confirmation) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  // TODO fix, remove bypass
  // ride.update_driver_confirmation(confirmation);
  // console.log("update_driver_confirmation success for ride id", rideId);
}


//update driver confirmations of the most recent ride by address using ride.update_driver_confirmation
const updateDriverConfirmationForDriver = async (driverAddress, confirmation) => {
  const rideId = await getMostRecentRideIdForDriver(driverAddress);
  console.log("getMostRecentRideIdForDriver success for driver address", driverAddress);
  const rides_result = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  const ride = rides_result[0];
  ride.update_driver_confirmation(confirmation);
  console.log("update_driver_confirmation success for ride id", rideId);
}

//update rider confirmations of the most recent ride by address using ride.update_rider_confirmation
const updateRiderConfirmationForRider = async (riderAddress, confirmation) => {
  const rideId = await getMostRecentRideIdForRider(riderAddress);
  console.log("getMostRecentRideIdForRider success for rider address", riderAddress);
  const rides_result = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  const ride = rides_result[0];
  ride.update_rider_confirmation(confirmation);
  console.log("update_rider_confirmation success for ride id", rideId);
}



//get_rider_confirmation returns the rider confirmation for a ride by rideid using ride.get_rider_confirmation
const getRiderConfirmation = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_rider_confirmation();
};

//get_driver_confirmation returns the driver confirmation for a ride by rideid using ride.get_driver_confirmation
const getDriverConfirmation = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_driver_confirmation();
};

//get_driver_rating returns the driver rating for a ride by rideid using ride.get_driver_rating
const getDriverRating = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_driver_rating();
};

//get_rider_rating returns the rider rating for a ride by rideid using ride.get_rider_rating
const getRiderRating = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_rider_rating();
};

//get_driver_feedback returns the driver feedback for a ride by rideid using ride.get_driver_feedback
const getDriverFeedback = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_driver_feedback();
};

//get_rider_feedback returns the rider feedback for a ride by rideid using ride.get_rider_feedback
const getRiderFeedback = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_rider_feedback();
};

//get_rating returns the rating for a ride by rideid using ride.get_rating
const getRating = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_rating();
};

//get_status returns the status for a ride by rideid using ride.get_status
const getStatus = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_status();
};

//get_timestamp returns the timestamp for a ride by rideid using ride.get_timestamp
const getTimestamp = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_timestamp();
};

//get_dropoff returns the dropoff location for a ride by rideid using ride.get_dropoff
const getDropoff = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_dropoff();
};

//get_pickup returns the pickup location for a ride by rideid using ride.get_pickup
const getPickup = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_pickup();
};

//get_rider_id returns the rider id for a ride by rideid using ride.get_rider_id
const getRiderId = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_rider_id();
};

//get_driver_id returns the driver id for a ride by rideid using ride.get_driver_id
const getDriverId = async (rideId) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log("search_ride_by_field success for ride id", rideId);
  return ride.get_driver_id();
};

//driver.get_name returns the name for a driver by address using actor.search_driver_by_field driver.get_name
const getDriverNameByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.get_name();
};

//driver.contact returns the contact for a driver by address using actor.search_driver_by_field driver.contact
const getDriverContactByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.contact();
};

//driver.get_rating returns the rating for a driver by address using actor.search_driver_by_field driver.get_rating
const getDriverRatingByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.get_rating();
};

//driver.get_feedback returns the feedback for a driver by address using actor.search_driver_by_field driver.get_feedback
const getDriverFeedbackByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.get_feedback();
};

//driver.email returns the email for a driver by address using actor.search_driver_by_field driver.email
const getDriverEmailByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.email();
};

//driver.vehicleplatenumber returns the vehicle plate number for a driver by address using actor.search_driver_by_field driver.vehicleplatenumber
const getDriverVehiclePlateNumberByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.vehicleplatenumber();
};

//driver.vehicletype returns the vehicle type for a driver by address using actor.search_driver_by_field driver.vehicletype
const getDriverVehicleTypeByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.vehicletype();
};

//driver.vehiclecolor returns the vehicle color for a driver by address using actor.search_driver_by_field driver.vehiclecolor
const getDriverVehicleColorByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.vehiclecolor();
};

//driver.vehiclemodel returns the vehicle model for a driver by address using actor.search_driver_by_field driver.vehiclemodel
const getDriverVehicleModelByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.vehiclemodel();
};

//driver.vehicleyear returns the vehicle year for a driver by address using actor.search_driver_by_field driver.vehicleyear
const getDriverVehicleYearByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.vehicleyear();
};

//driver.vehiclemake returns the vehicle make for a driver by address using actor.search_driver_by_field driver.vehiclemake
const getDriverVehicleMakeByAddress = async (address) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.vehiclemake();
};

//use driver.get_field by address
const getDriverFieldByAddress = async (address, field) => {
  const driver = await actor.search_driver_by_field("address", address);
  console.log("search_driver_by_field success for address", address);
  return driver.get_field(field);
};

//get rider field by address
const getRiderFieldByAddress = async (address, field) => {
  const rider = await actor.search_rider_by_field("address", address);
  console.log("search_rider_by_field success for address", address);
  return rider.get_field(field);
};

// get all drivers
// TODO only nearby geolocation
const getDrivers = async () => {
  const drivers = await actor.get_drivers();
  console.log("get_drivers success, found ", drivers.length);
  return drivers;
}

//make new rider with actor.Rider.new
const makeNewRider = async (name, contact, email, role, address) => {
  const rider = await actor.Rider.new(name, contact, email, role, address);
  console.log("Rider.new success for name", name);
  return rider;
};

//make new driver with actor.Driver.new
const makeNewDriver = async (
  name,
  contact,
  email,
  role,
  vehicleplatenumber,
  vehicleseatnumber,
  vehiclemake,
  vehiclemodel,
  vehiclecolor,
  vehicleyear,
  rating,
  currentstatus,
  address
) => {
  const driver = await actor.Driver.new(
    name,
    contact,
    email,
    role,
    vehicleplatenumber,
    vehicleseatnumber,
    vehiclemake,
    vehiclemodel,
    vehiclecolor,
    vehicleyear,
    rating,
    currentstatus,
    address
  );
  console.log("Driver.new success for name", name);
  return driver;
};

const riderSelectDriver = async (riderAddress, driverAddress) => {
  console.log('riderSelectDriver', riderAddress, driverAddress);
  const ride = await getMostRecentRideForRider(riderAddress);
  console.log('getMostRecentRideForRider', ride);
  // check ride is valid
  if (!(await isValidRide(ride))) {
    console.log("invalid ride");
    return false;
  }

  const driver = await searchDriverByAddress(driverAddress);
  console.log('searchDriverByAddress', driver);
  // call update_driver with driver

  // TODO fix this, remove bypass
  // await ride.update_driver(driver);
  // console.log("update_driver success, driver address", driver.address);
  console.log('bypassed update_driver');
  return true;
}

const isDriverConfirmedForRide = async (riderAddress) => {
  console.log('isDriverConfirmedForRide', riderAddress);
  // TODO pass around rideid in state instead of retrieving most recent, can cause errors if rider manages to create a newer ride during ride flow
  const ride = await getMostRecentRideForRider(riderAddress);
  console.log('getMostRecentRideForRider', ride);
  // check ride is valid
  if (!(await isValidRide(ride))) {
    console.log("invalid ride");
    return false;
  }

  console.log('ride id ', ride.rideid, ' has driverconfirmation [', ride.driverConfirmation, ']');
  return ride.driverconfirmation === 'confirmed';
}

const completeRideForRider = async (riderAddress) => {
  console.log('completeRideForRider', riderAddress);
  await updateRideStatusByAddress(riderAddress, { Completed: null });
}

const getOpenRidesForDriver = async (driverAddress) => {
  console.log('getOpenRidesForDriver', driverAddress);
  // search for rides with no driver assigned
  const rides = await getRidesForDriver("");
  console.log('found ', rides.length, ' open rides');
  return rides;
}

  
// returns true if there exists a driver with the given wallet address, false otherwise
const isDriver = async (walletAddress) => {
  const drivers = await actor.search_driver_by_address(walletAddress);
  if (drivers.length > 0) {
    return true;
  }
  return false;
};

// returns true if there exists a rider with the given wallet address, false otherwise
const isRider = async (walletAddress) => {
  const riders = await actor.search_rider_by_address(walletAddress);
  if (riders.length > 0) {
    return true;
  }
  return false;
};



//exports
export {
  completeRideForRider,
  getDrivers,
  getMostRecentRideForRider,
  getOpenRidesForDriver,
  isDriver,
  isDriverConfirmedForRide,
  isRider,
  registerDriver,
  registerRide,
  registerRider,
  riderSelectDriver,
  updateDriverConfirmation,
  updateRiderConfirmationForRider,
};
