const RideManager = artifacts.require("./RideManager.sol");

contract("RideManager", accounts => {
  it("...should set return drivers available.", async () => {
    const rideInstance = await RideManager.deployed();
    const rideInfo = await rideInstance.returnDriversAvailable();
  });
});
