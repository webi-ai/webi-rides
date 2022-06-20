// Name: agent.js 
// Description: rust contract integration test in javascript
// Maintainer: Kelsey
// Copyright: Webi.ai (c) 2022

//import dfinity actor and agent
import { Actor, HttpAgent } from '@dfinity/agent';
//import to generate an identity
import { Ed25519KeyIdentity } from '@dfinity/identity';


//generate the identity using ed25519
const identity = Ed25519KeyIdentity.generate(require('crypto').randomBytes(32));


//create the agent and give it the local replica addresss
const agent = new HttpAgent({
  //identity,
  // fetch: self.fetch.bind(self),
  host: "https://boundary.ic0.app" //"http://127.0.0.1:8000" //"https://boundary.ic0.app" //local replica url if local dev
});



//idl factory generated with the following command:
//didc bind token.did --target js
export const idlFactory = ({ IDL }) => {
  const Profile = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'keywords' : IDL.Vec(IDL.Text),
  });
  const CurrentStatus = IDL.Variant({
    'Inactive' : IDL.Null,
    'Active' : IDL.Null,
  });
  const Driver = IDL.Record({
    'contact' : IDL.Text,
    'vehiclemake' : IDL.Text,
    'vehiclecolor' : IDL.Text,
    'vehicletype' : IDL.Text,
    'vehicleyear' : IDL.Text,
    'vehicleplatenumber' : IDL.Text,
    'name' : IDL.Text,
    'role' : IDL.Text,
    'email' : IDL.Text,
    'address' : IDL.Text,
    'vehicleseatnumber' : IDL.Text,
    'currentstatus' : CurrentStatus,
    'rating' : IDL.Float64,
    'vehiclemodel' : IDL.Text,
  });
  const Rider = IDL.Record({
    'contact' : IDL.Text,
    'name' : IDL.Text,
    'role' : IDL.Text,
    'email' : IDL.Text,
    'address' : IDL.Text,
  });
  const RideStatus = IDL.Variant({
    'Active' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const Ride = IDL.Record({
    'status' : RideStatus,
    'dropoff' : IDL.Text,
    'rideid' : IDL.Text,
    'driverconfirmation' : IDL.Text,
    'riderrating' : IDL.Float64,
    'pickup' : IDL.Text,
    'riderfeedback' : IDL.Text,
    'timestamp' : IDL.Text,
    'driverfeedback' : IDL.Text,
    'rating' : IDL.Float64,
    'riderconfirmation' : IDL.Text,
    'driver' : Driver,
    'rider' : Rider,
    'driverrating' : IDL.Float64,
  });
  return IDL.Service({
    'get' : IDL.Func([IDL.Text], [Profile], ['query']),
    'get_drivers' : IDL.Func([], [IDL.Vec(Driver)], ['query']),
    'get_riders' : IDL.Func([], [IDL.Vec(Rider)], ['query']),
    'get_rides' : IDL.Func([], [IDL.Vec(Ride)], ['query']),
    'get_self' : IDL.Func([], [Profile], ['query']),
    'register_driver' : IDL.Func([Driver], [], ['update']),
    'register_ride' : IDL.Func([Ride], [], ['update']),
    'register_rider' : IDL.Func([Rider], [], ['update']),
    'search_driver_by_address' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(Driver)],
        ['query'],
      ),
    'search_driver_by_contact' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(Driver)],
        ['query'],
      ),
    'search_driver_by_field' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(IDL.Opt(Driver))],
        ['query'],
      ),
    'search_driver_by_name' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(Driver)],
        ['query'],
      ),
    'search_ride_by_field' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(IDL.Opt(Ride))],
        ['query'],
      ),
    'search_ride_by_id' : IDL.Func([IDL.Text], [IDL.Opt(Ride)], ['query']),
    'search_rider_by_address' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(Rider)],
        ['query'],
      ),
    'search_rider_by_field' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(IDL.Opt(Rider))],
        ['query'],
      ),
    'update' : IDL.Func([Profile], [], []),
    'update_driver_rating' : IDL.Func([IDL.Text, IDL.Float64], [], []),
    'update_driver_status' : IDL.Func([IDL.Text, CurrentStatus], [], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };

//fetch keys, this is not needed in production
if (true) {
  agent.fetchRootKey(); // TODO this should be removed in production
}

//need to set this canister id properly, currently set to sudograph as placeholder
const actor = Actor.createActor(idlFactory, {
  agent,
  canisterId: 'ihde4-fiaaa-aaaap-aahcq-cai' //'ihde4-fiaaa-aaaap-aahcq-cai'//for prod //rrkah-fqaaa-aaaaa-aaaaq-cai for local dev
});

//export the actor
export default actor;

/*
//create a test registerRider data object
const record_insert = {
  contact: "1234567890",
  name: "Kelsey",
  email: "test@email.com",
  role: "rider",
  address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae",
}

//call actor.registerRider with the data object
actor.register_rider(record_insert).then(res => {
  console.log(res);
  actor.get_riders().then(res => {
    console.log(res);
  }
  ).catch(err => {
    console.log(err);
  }
  );

}
).catch(err => {
  console.log(err);
}
);


//create a test registerDriver data object
const record_driver_insert = {
  contact: "1234567890",
  name: "Kelsey",
  email: "test@email.com",
  role: "driver",
  vehicleplatenumber: "ABC123",
  vehicleseatnumber: "1",
  vehiclemake: "Toyota",
  vehiclemodel: "Corolla",
  vehiclecolor: "Black",
  vehicletype: "SUV",
  vehicleyear: "2020",
  //Float64 becomes a js float
  rating: 4.5,
  //enum becomes variant like this
  currentstatus: {Active: null},
  address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae",
}

//call actor.registerDriver with the data object
actor.register_driver(record_driver_insert).then(res => {
  console.log(res);
  actor.get_drivers().then(res => {
    console.log(res);
  }
  ).catch(err => {
    console.log(err);
  }
  )
});

//create ride data object
const record_ride_insert = {
  rideid: "1234567890",
  timestamp: "2020-01-01T00:00:00.000Z",
  pickup: "san francisco",
  dropoff: "san jose",
  status: { Active: null },
  rating: 4.5,
  driverrating: 4.5,
  riderrating: 4.5,
  driverfeedback: "good driver",
  riderfeedback: "good rider",
  riderconfirmation: "yes",
  driverconfirmation: "yes",
  rider: {
    contact: "1234567890",
    name: "Kelsey",
    email: "test@email.com",
    role: "rider",
    address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae",
  },
  driver: {
    contact: "1234567890",
    name: "Kelsey",
    email: "test@email.com",
    role: "driver",
    vehicleplatenumber: "ABC123",
    vehicleseatnumber: "1",
    vehiclemake: "Toyota",
    vehiclemodel: "Corolla",
    vehiclecolor: "Black",
    vehicletype: "SUV",
    vehicleyear: "2020",
    //Float64 becomes a js float
    rating: 4.5,
    //enum becomes variant like this
    currentstatus: {Active: null},
    address: "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae",
  },
}

//call actor.registerRide with the data object
actor.register_ride(record_ride_insert).then(res => {
  console.log(res);
  actor.get_rides().then(res => {
    console.log(res);
  }
  ).catch(err => {
    console.log(err);
  }
  )
}
).catch(err => {
  console.log(err);
}
);
*/
