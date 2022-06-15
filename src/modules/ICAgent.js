// Module : ICAgent.js
// Description : ICAgent.js handles interactions with the IC agent
// Maintainer : Kelsey and Dixie
// License : Not currently licensed for public use
// Copyright : Webi.ai (c) 2022

import { v4 as uuidv4 } from 'uuid';

import actor from '../scripts/agent.js';


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
  const rider = searchRiderByAddress(riderAddress);
  const rideId = uuidv4(); // generate unique ride id
  const ride = {
    'rideid': rideId, 
    'pickup': {
      'lat': pickup.lat,
      'lng': pickup.lng,
      'address_text': pickup.address_text
    },
    'dropoff': {
      'lat': dropoff.lat,
      'lng': dropoff.lng,
      'address_text': dropoff.address_text
    },
    'status': { Active: null },
    'driverconfirmation': null,
    'riderconfirmation': null,
    'timestamp': Date.now(),
    'rating': null,
    'driver': null, // null until driver accepts
    'driverrating': null,
    'driverfeedback': null,
    // TODO retrieve current rider from wallet address? auth id?
    'rider': Rider, // currently logged in rider
    'riderrating': null,
    'riderfeedback': null
  };
  actor.register_ride(ride)
    .then((success) => {
      console.log('register_ride success, ride id ', rideId);
    }, (error) => {
      console.error('register_ride error', error);
    });
  // check status
  return rideId;
}

const searchRiderByAddress = async (walletAddress) => {
  const rider = await actor.search_rider_by_address(walletAddress);
  console.log(rider);
  return rider;
}

export {
  registerRider,
  registerRide
};
