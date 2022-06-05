# Project Description

Port the Solidity functions found in **/solidity/ridemanager.sol** and **/solidity/ride.sol** into **/rust/token/src/service.rs**

An example of IC functions written in rust is found in **/rust/token/src/main.rs**

Data types have mostly been translated into rust from solidity like so 



**RideManager.Sol:**

```solidity
    //// Inits ////
    bytes32 constant NULL = "";
    address[] driversArray;

    //// Enums ////
    enum roles {
        rider,
        driver
    }
    
    enum currentStatus {
        free,
        busy
    }
    
    
    //// Structs ////
    struct riderStruct {
        bytes32 name;
        bytes32 contact;
        bytes32 email;
        roles role;
        address payable riderAddr;
        address[] rides;
    }
    
    
    struct driverStruct {
        bytes32 name;
        bytes32 contact;
        bytes32 email;
        bytes32 carNo;
        uint256 noOfSeats;
        uint256 rating;
        roles role;
        currentStatus status;
        address payable driverAddr; 
        address[] rides;
    }
```

into

**Service.rs**

```rust
array<Principal> Drivers;

enum Roles {
    rider,
    driver
}

enum CurrentStatus {
    active,
    inactive
}

pub struct Rider {
    name: String,
    contact: u32,
    email: String,
    role: Roles,
    addresses: Option<Vec<Principal>>,
    address: Principal,
}

pub struct Driver {
    name: String,
    contact: u32,
    email: String,
    role: Roles,
    vehicleplatenumber: String,
    vehicleseatnumber: String,
    vehiclemake: String,
    vehiclemodel: String,
    vehiclecolor: String,
    vehicletype: String,
    vehicleyear: String,
    rating: Float,
    role: Roles,
    currentstatus: CurrentStatus,
    addresses: Option<Vec<Principal>>,
    address: Principal,
}

```





for instance, to port the function **returnDriversAvailable()** from RideManager.sol

```solidity
// Solidity code

    function returnDriversAvailable() external view returns(address[] memory) {
        return driversArray;
    }
```

```rust
// Rust Code

pub async fn returnDriversAvailable() -> Vec<Driver> {
    let mut drivers = Vec::new();
    for driver in Drivers {
        if driver.currentstatus == CurrentStatus::active {
            drivers.push(driver);
        }
    }
    drivers
}
```



While porting this I noticed the solidity code does not check if a driver is actually available, so I added that to the rust code. Perfect 1 to 1 porting is not always possible, just try to use best judgement based on function names.

This code even could be split into 2 functions, return all drivers like the solidity code, and return active drivers. It's fine to add both functions when doing a port. We will go back and evaluate which will be most useful when we port the webapp to use the rust contracts. 