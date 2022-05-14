const RideManager = artifacts.require("./RideManager.sol");

contract("RideManager", accounts => {
  it("...should set return drivers available, which will be false", async () => {
    const rideInstance = await RideManager.deployed();
    const ridesAvailable = await rideInstance.returnDriversAvailable();
    //console.log(ridesAvailable);
    assert.equal(ridesAvailable > 0, false);
  });

});

