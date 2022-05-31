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
}

service : {
    "getSelf": () -> (Profile_2) query;
    "get": (text) -> (Profile_2) query;
    "update": (Profile_2) -> ();
    "search": (text) -> (opt Profile_2) query;
}