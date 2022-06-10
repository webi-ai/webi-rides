#!/bin/bash
# Maintainer: kelsey
# Copyright: Webi.ai (c) 2022

# This script is used to test the DFX CLI

echo "Testing DFX CLI"
echo "================================================"
echo "Testing DFX CLI - Test 1 register rider "
#register test rider with dfx
dfx canister call token registerRider '(
    record { 
        name = "Kelsey"; 
        contact = "1234567890"; 
        email = "test@email.com"; 
        role =  "rider";
        address = principal "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae" ;
    }
)'

echo "================================================"
echo "Testing DFX CLI - Test 2 get riders "

#get riders with dfx
dfx canister call token get_riders



echo "================================================"
echo "Testing DFX CLI - Test 3 register driver "

#register test driver with dfx
dfx canister call token registerDriver '(
    record {
        name = "Kelsey"; 
        contact = "1234567890"; 
        email = "test@email.com"; 
        role =  "driver";
        address = principal "cjr37-nxx7a-keiqq-efh5n-v47nd-ceddb-2c6hg-aseen-h66ih-so563-hae" ;
        vehicleplatenumber = "1234567890";
        vehicleseatnumber = "4";
        vehiclemake = "Honda";
        vehiclemodel = "test";
        vehiclecolor = "red";
        vehicletype = "car";
        vehicleyear = "2020";
        rating = 5.0;
        currentstatus = variant { "Active" };
    } 
)'

echo "================================================"
echo "Testing DFX CLI - Test 4 get drivers "

#get drivers with dfx
dfx canister call token get_drivers
