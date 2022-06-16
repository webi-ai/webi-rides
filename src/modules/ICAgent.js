// Module : ICAgent.js
// Description : ICAgent.js handles interactions with the IC agent
// Maintainer : Kelsey and Dixie
// License : Not currently licensed for public use
// Copyright : Webi.ai (c) 2022

import { v4 as uuidv4 } from 'uuid';

//import the actor from agent script to interact with smart contracts
import actor from '../scripts/agent.js';

//create a placeholder driver for the ride
const PLACEHOLDER_DRIVER = { 
  contact: '',
  name: '',
  email: '',
  role: 'driver',
  vehicleplatenumber: '',
  vehicleseatnumber: '',
  vehiclemake: '',
  vehiclemodel: '',
  vehiclecolor: '',
  vehicletype: '',
  vehicleyear: '',
  rating: 0,
  currentstatus: {Active: null},
  address: '',
};

//create a placeholder rider for the ride
const PLACEHOLDER_RIDER = {
  contact: '',
  name: '',
  email: '',
  role: 'rider',
  address: '',
};



//registerRider registers a new rider using actor.register_rider
const registerRider = async (rider) => {
  actor.register_rider(rider)
    .then((success) => {
      console.log('register_rider success, rider address', rider.address);
    }, (error) => {
      console.error('register_rider error', error);
    });
}

// rider wallet address primary id?
//registerRide registers a new ride using actor.register_ride
const registerRide = async (riderAddress, pickup, dropoff) => {
  console.log('register_ride for rider address', riderAddress);
  // retrieve logged in rider
  const rider = await searchRiderByAddress(riderAddress);
  const rideId = uuidv4(); // generate unique ride id
  const ride = {
    'rideid': rideId, 
    'pickup': {
        'lat': pickup.lat,
        'lng': pickup.lng,
        'address_text': pickup.address_text
      }.toString(),
    'dropoff': {
        'lat': dropoff.lat,
        'lng': dropoff.lng,
        'address_text': dropoff.address_text
      }.toString(),
    'status': { Active: null },
    'driverconfirmation': '',
    'riderconfirmation': '',
    'timestamp': Date.now().toString(),
    'rating': 0,
    'driver': PLACEHOLDER_DRIVER, // placeholder values, driver should be opt so it can be null until one accepts ride
    'driverrating': 0,
    'driverfeedback': '',
    'rider': rider, // currently logged in rider
    'riderrating': 0,
    'riderfeedback': ''
  };
  await actor.register_ride(ride);
  console.log('register_ride success, ride id ', rideId);
  return rideId;
}

//searchRiderByAddress searches for a rider by their wallet address using actor.search_rider
const searchRiderByAddress = async (walletAddress) => {
  const rider = await actor.search_rider_by_address(walletAddress);
  console.log('search_rider_by_address success for address', walletAddress);
  return rider[0];
}

//get rides for a rider using actor.search_rides_by_field
const getRides = async (riderAddress) => {
  const rides = await actor.search_ride_by_field("rideraddress", riderAddress);
  console.log('search_ride_by_field success for rider address', riderAddress);
  return rides;
}

//get rides for a driver using actor.search_rides_by_field
const getRidesForDriver = async (driverAddress) => {
  const rides = await actor.search_ride_by_field("driveraddress", driverAddress);
  console.log('search_ride_by_field success for driver address', driverAddress);
  return rides;
}

//get most recent ride for a driver using actor.search_rides_by_field
const getMostRecentRideForDriver = async (driverAddress) => {
  const rides = await actor.search_ride_by_field("driveraddress", driverAddress);
  console.log('search_ride_by_field success for driver address', driverAddress);
  return rides[0];
}

//get most recent ride for a rider using actor.search_rides_by_field
const getMostRecentRideForRider = async (riderAddress) => {
  const rides = await actor.search_ride_by_field("rideraddress", riderAddress);
  console.log('search_ride_by_field success for rider address', riderAddress);
  return rides[0];
}

//get last n rides by a rider offset by a number using actor.search_rides_by_field
const getLastNRidesByRider = async (riderAddress, n) => {
  const rides = await actor.search_ride_by_field("rideraddress", riderAddress);
  console.log('search_ride_by_field success for rider address', riderAddress);
  return rides.slice(0, n);
}

//get last n rides by a driver offset by a number using actor.search_rides_by_field
const getLastNRidesByDriver = async (driverAddress, n) => {
  const rides = await actor.search_ride_by_field("driveraddress", driverAddress);
  console.log('search_ride_by_field success for driver address', driverAddress);
  return rides.slice(0, n);
}

//register driver
const registerDriver = async (driver) => {
  actor.register_driver(driver)
    .then((success) => {
      console.log('register_driver success, driver address', driver.address);
    }, (error) => {
      console.error('register_driver error', error);
    });
}

//update driver feedback after a ride by rideid using ride.update_driver_feedback
const updateDriverFeedback = async (rideId, feedback) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log('search_ride_by_field success for ride id', rideId);
  ride.update_driver_feedback(feedback);
  console.log('update_driver_feedback success for ride id', rideId);
}

//update rider feedback after a ride by rideid using ride.update_rider_feedback
const updateRiderFeedback = async (rideId, feedback) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log('search_ride_by_field success for ride id', rideId);
  ride.update_rider_feedback(feedback);
  console.log('update_rider_feedback success for ride id', rideId);
}

//update ride driver rating after a ride by rideid using ride.update_rating
const updateDriverRating = async (rideId, rating) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log('search_ride_by_field success for ride id', rideId);
  ride.update_rating(rating);
  console.log('update_rating success for ride id', rideId);
}

//update ride rider rating after a ride by rideid using ride.update_rating
const updateRiderRating = async (rideId, rating) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log('search_ride_by_field success for ride id', rideId);
  ride.update_rating(rating);
  console.log('update_rating success for ride id', rideId);
}


//update a ride status by rideid using ride.update_status
const updateRideStatus = async (rideId, status) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log('search_ride_by_field success for ride id', rideId);
  ride.update_status(status);
  console.log('update_status success for ride id', rideId);
}

//change dropoff location of a ride by rideid using ride.update_dropoff
const updateDropoff = async (rideId, dropoff) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log('search_ride_by_field success for ride id', rideId);
  ride.update_dropoff(dropoff);
  console.log('update_dropoff success for ride id', rideId);
}

//change pickup location of a ride by rideid using ride.update_pickup
const updatePickup = async (rideId, pickup) => {
  const ride = await actor.search_ride_by_field("rideid", rideId);
  console.log('search_ride_by_field success for ride id', rideId);
  ride.update_pickup(pickup);
  console.log('update_pickup success for ride id', rideId);
}



//exports
export {
  registerRider,
  registerRide
};
