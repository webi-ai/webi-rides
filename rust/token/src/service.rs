/**
* Module        :  service.rs
* Copyright     :  2022 Webi.ai
* License       :  GPL 3.0
* Maintainer    :  Kelsey 
* Stability     :  Who Knows?
* Description   :  Token Service Contracts
*/

use candid::{candid_method, CandidType, Deserialize, Int, Nat};
use cap_sdk::{handshake, insert, Event, IndefiniteEvent, TypedEvent};
use cap_std::dip20::cap::DIP20Details;
use cap_std::dip20::{Operation, TransactionStatus, TxRecord};
use ic_cdk_macros::*;
use ic_kit::{ic, Principal};
use std::cell::RefCell;
use std::collections::HashMap;
use std::collections::VecDeque;
use std::convert::Into;
use std::iter::FromIterator;
use std::string::String;

#[derive(CandidType, Default, Deserialize, Clone)]
pub struct TxLog {
  pub ie_records: VecDeque<IndefiniteEvent>,
}

#[derive(Deserialize, CandidType, Clone, Debug)]
struct StatsData {
  logo: String,
  name: String,
  symbol: String,
  decimals: u8,
  total_supply: Nat,
  owner: Principal,
  fee: Nat,
  fee_to: Principal,
  history_size: usize,
  deploy_time: u64,
}

#[allow(non_snake_case)]
#[derive(Deserialize, CandidType, Clone, Debug)]
struct TokenInfo {
  metadata: Metadata,
  feeTo: Principal,
  // status info
  historySize: usize,
  deployTime: u64,
  holderNumber: usize,
  cycles: u64,
}
