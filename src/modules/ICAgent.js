// Module : ICAgent.js
// Description : ICAgent.js handles interactions with the IC agent
// Maintainer : Kelsey and Dixie
// License : Not currently licensed for public use
// Copyright : Webi.ai (c) 2022

import { v4 as uuidv4 } from 'uuid';

import actor from '../scripts/agent.js';


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


const registerRider = async (rider) => {
  actor.register_rider(rider)
    .then((success) => {
      console.log('register_rider success, rider address', rider.address);
    }, (error) => {
      console.error('register_rider error', error);
    });
}

// rider wallet address primary id?
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

const searchRiderByAddress = async (walletAddress) => {
  const rider = await actor.search_rider_by_address(walletAddress);
  console.log('search_rider_by_address success for address', walletAddress);
  return rider[0];
}

export {
  registerRider,
  registerRide
};
