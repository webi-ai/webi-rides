const RideManager = artifacts.require("./RideManager.sol");

contract("RideManager", accounts => {
  it("...should set return drivers available, which will be false", async () => {
    const rideInstance = await RideManager.deployed();
    const ridesAvailable = await rideInstance.returnDriversAvailable();
    //console.log(ridesAvailable);
    assert.equal(ridesAvailable > 0, false);
  });
  it("...should register a rider", async () => {
    const rideInstance = await RideManager.deployed();
    const result = await rideInstance.registerRider(
        web3.utils.fromAscii("Rider1"),
        web3.utils.fromAscii("1234567890"),
        web3.utils.fromAscii("rider1@webi.io"),
        web3.utils.fromAscii("rider"),
        "0xa09f74450A9fc56238d111f3550a157edBc2E07E"
        
    );
    console.log(result);
  });
});