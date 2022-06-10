// Name: agent.js 
// Description: rust contract integration test in javascript
// Maintainer: Kelsey
// Copyright: Webi.ai (c) 2022

//import dfinity actor and agent
const Actor = require("@dfinity/agent");
const HttpAgent = Actor.HttpAgent;

//import to generate an identit
const Identity = require("@dfinity/identity");
const Ed25519KeyIdentity = Identity.Ed25519KeyIdentity;
const Principal = require("@dfinity/principal");

//generate the identity using ed25519
const identity = Ed25519KeyIdentity.generate(require('crypto').randomBytes(32));


//create the agent and give it the local replica addresss
const agent = new HttpAgent({
  //identity,
  fetch,
  host: "http://127.0.0.1:8000" //"https://boundary.ic0.app" //local replica url if local dev
});


//idl factory generated with the following command:
//didc bind token.did --target js
const idlFactory = ({ IDL }) => {
  const Profile_2 = IDL.Record({
    'name': IDL.Text,
    'description': IDL.Text,
    'keywords': IDL.Vec(IDL.Text),
  });
  const Driver_2 = IDL.Record({
    'contact': IDL.Text,
    'vehiclemake': IDL.Text,
    'vehiclecolor': IDL.Text,
    'vehicletype': IDL.Text,
    'vehicleyear': IDL.Text,
    'vehicleplatenumber': IDL.Text,
    'name': IDL.Text,
    'role': IDL.Text,
    'email': IDL.Text,
    'address': IDL.Principal,
    'vehicleseatnumber': IDL.Text,
    'currentstatus': IDL.Variant({
      'Inactive': IDL.Null,
      'Active': IDL.Null,
    }),
    'rating': IDL.Float64,
    'vehiclemodel': IDL.Text,
  });
  const Ride_2 = IDL.Record({
    'id': IDL.Text,
    'status': IDL.Text,
    'dropoff': IDL.Text,
    'pickupdatetime': IDL.Text,
    'dropoffdatetime': IDL.Text,
    'driverconfirmation': IDL.Text,
    'riderrating': IDL.Text,
    'pickup': IDL.Text,
    'riderfeedback': IDL.Text,
    'driverfeedback': IDL.Text,
    'rating': IDL.Text,
    'pickupaddress': IDL.Text,
    'riderconfirmation': IDL.Text,
    'price': IDL.Text,
    'dropoffaddress': IDL.Text,
    'driver': IDL.Text,
    'rider': IDL.Text,
    'driverrating': IDL.Text,
  });
  const Rider_2 = IDL.Record({
    'contact': IDL.Text,
    'name': IDL.Text,
    'role': IDL.Text,
    'email': IDL.Text,
    'address': IDL.Principal,
  });
  const Tokens = IDL.Record({ 'e8s': IDL.Nat64 });
  const TransferArgs = IDL.Record({
    'to_principal': IDL.Principal,
    'to_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'amount': Tokens,
  });
  const Memo = IDL.Nat64;
  const TransferResult = IDL.Variant({ 'Ok': Memo, 'Err': IDL.Text });
  return IDL.Service({
    'get': IDL.Func([IDL.Text], [Profile_2], ['query']),
    'getSelf': IDL.Func([], [Profile_2], ['query']),
    'get_driver': IDL.Func([IDL.Text], [Driver_2], ['query']),
    'get_drivers': IDL.Func([], [IDL.Vec(Driver_2)], ['query']),
    'get_ride': IDL.Func([IDL.Text], [Ride_2], ['query']),
    'get_rider': IDL.Func([IDL.Text], [Rider_2], ['query']),
    'get_riders': IDL.Func([], [IDL.Vec(Rider_2)], ['query']),
    'get_rides': IDL.Func([], [IDL.Vec(Ride_2)], ['query']),
    'registerDriver': IDL.Func([Driver_2], [], []),
    'registerRider': IDL.Func([Rider_2], [], []),
    'search': IDL.Func([IDL.Text], [IDL.Opt(Profile_2)], ['query']),
    'transfer': IDL.Func([TransferArgs], [TransferResult], []),
    'update': IDL.Func([Profile_2], [], []),
  });
};
const init = ({ IDL }) => { return []; };


//fetch keys, this is not needed in production
if (true) {
  agent.fetchRootKey(); // TODO this should be removed in production
}

//need to set this canister id properly, currently set to sudograph as placeholder
const actor = Actor.Actor.createActor(idlFactory, {
  agent,
  canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai' //'uqklt-lyaaa-aaaai-aajqa-cai'//for prod //rrkah-fqaaa-aaaaa-aaaaq-cai for local dev
});


//create a test registerRider data object
record_insert = {
  contact: "1234567890",
  name: "Kelsey",
  email: "test@email.com",
  role: "rider",
  address: Principal.Principal.fromText("cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae"),
}

//call actor.registerRider with the data object
actor.registerRider(record_insert).then(res => {
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
record_driver_insert = {
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
  rating: "0.0",
  currentstatus: "available",
  address: Principal.Principal.fromText("cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae"),
}

//call actor.registerDriver with the data object
actor.registerDriver(record_driver_insert).then(res => {
  console.log(res);
  actor.get_drivers().then(res => {
    console.log(res);
  }
  ).catch(err => {
    console.log(err);
  }
  )
});
