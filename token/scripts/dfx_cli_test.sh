#!/bin/bash
# Maintainer: kelsey
# Copyright: Webi.ai (c) 2022

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
#get riders with dfx
dfx canister call token get_riders

