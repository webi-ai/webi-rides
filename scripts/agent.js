// Name: agent.js 
// Description: rust contract integration test in javascript
// Maintainer: Kelsey
// Copyright: Webi.ai (c) 2022

//import dfinity actor and agent
import {
    Actor,
    HttpAgent
  } from '@dfinity/agent';

  //import to generate an identity
  import { Ed25519KeyIdentity } from '@dfinity/identity';

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
  export const idlFactory = ({ IDL }) => {
    const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
    const Conf = IDL.Record({
      'transaction_fee' : Tokens,
      'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'ledger_canister_id' : IDL.Principal,
    });
    const Profile_2 = IDL.Record({
      'name' : IDL.Text,
      'description' : IDL.Text,
      'keywords' : IDL.Vec(IDL.Text),
    });
    const Driver_2 = IDL.Record({
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
      'currentstatus' : IDL.Text,
      'rating' : IDL.Text,
      'vehiclemodel' : IDL.Text,
    });
    const Ride_2 = IDL.Record({
      'id' : IDL.Text,
      'status' : IDL.Text,
      'dropoff' : IDL.Text,
      'pickupdatetime' : IDL.Text,
      'dropoffdatetime' : IDL.Text,
      'driverconfirmation' : IDL.Text,
      'riderrating' : IDL.Text,
      'pickup' : IDL.Text,
      'riderfeedback' : IDL.Text,
      'driverfeedback' : IDL.Text,
      'rating' : IDL.Text,
      'pickupaddress' : IDL.Text,
      'riderconfirmation' : IDL.Text,
      'price' : IDL.Text,
      'dropoffaddress' : IDL.Text,
      'driver' : IDL.Text,
      'rider' : IDL.Text,
      'driverrating' : IDL.Text,
    });
    const Rider_2 = IDL.Record({
      'contact' : IDL.Text,
      'name' : IDL.Text,
      'role' : IDL.Text,
      'email' : IDL.Text,
      'address' : IDL.Text,
    });
    const TransferArgs = IDL.Record({
      'to_principal' : IDL.Principal,
      'to_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'amount' : Tokens,
    });
    const Memo = IDL.Nat64;
    const TransferResult = IDL.Variant({ 'Ok' : Memo, 'Err' : IDL.Text });
    return IDL.Service({
      'get' : IDL.Func([IDL.Text], [Profile_2], ['query']),
      'getDriver' : IDL.Func([IDL.Text], [Driver_2], ['query']),
      'getDrivers' : IDL.Func([], [IDL.Vec(Driver_2)], ['query']),
      'getRide' : IDL.Func([IDL.Text], [Ride_2], ['query']),
      'getRider' : IDL.Func([IDL.Text], [Rider_2], ['query']),
      'getRiders' : IDL.Func([], [IDL.Vec(Rider_2)], ['query']),
      'getRides' : IDL.Func([], [IDL.Vec(Ride_2)], ['query']),
      'getSelf' : IDL.Func([], [Profile_2], ['query']),
      'search' : IDL.Func([IDL.Text], [IDL.Opt(Profile_2)], ['query']),
      'transfer' : IDL.Func([TransferArgs], [TransferResult], []),
      'update' : IDL.Func([Profile_2], [], []),
    });
  };
  export const init = ({ IDL }) => {
    const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
    const Conf = IDL.Record({
      'transaction_fee' : Tokens,
      'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'ledger_canister_id' : IDL.Principal,
    });
    return [Conf];
  };

//fetch keys, this is not needed in production
  if (true) {
    await agent.fetchRootKey(); // TODO this should be removed in production
  }
  
  //need to set this canister id properly, currently set to sudograph as placeholder
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai' //'uqklt-lyaaa-aaaai-aajqa-cai'//for prod //rrkah-fqaaa-aaaaa-aaaaq-cai for local dev
  });



  