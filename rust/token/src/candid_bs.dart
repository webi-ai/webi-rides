type Profile_2 = record {
    "name": text;
    "description": text;
    "keywords": vec text;
};
type Profile = Profile_2;

type Driver_2 = record {
    "name": text;
    "contact": text;
    "email": text;
    "role": text;
    "vehicleplatenumber": text;
    "vehicleseatnumber": text;
    "vehiclemake": text;
    "vehiclemodel": text;
    "vehiclecolor": text;
    "vehicletype": text;
    "vehicleyear": text;
    "rating": text;
    "currentstatus": text;
    "addresses": vec text;
    "address": text;
};

type Driver = Driver_2;

type Rider_2 = record {
    "name": text;
    "contact": text;
    "email": text;
    "role": text;
    "addresses": vec text;
    "address": text;
};



type Ride_2 = record {
    "id": text;
    "driver": text;
    "rider": text;
    "status": text;
    "pickup": text;
    "dropoff": text;
    "pickupaddress": text;
    "dropoffaddress": text;
    "pickupdatetime": text;
    "dropoffdatetime": text;
    "price": text;
    "rating": text;
    "driverrating": text;
    "riderrating": text;
    "driverfeedback": text;
    "riderfeedback": text;
    "driverconfirmation": text;
    "riderconfirmation": text;

}

service : {
    "getSelf": () -> (Profile_2) query;
    "get": (text) -> (Profile_2) query;
    "update": (Profile_2) -> ();
    "search": (text) -> (opt Profile_2) query;
    "getDriver": (text) -> (Driver_2) query;
    "getRider": (text) -> (Rider_2) query;
    "getRide": (text) -> (Ride_2) query;
    "getRides": () -> (vec Ride_2) query;
    "getDrivers": () -> (vec Driver_2) query;
    "getRiders": () -> (vec Rider_2) query;
}