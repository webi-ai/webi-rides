const Ride = artifacts.require("../contracts/Ride.sol");

contract("Ride", accounts => {
  it("...should set rider confirmation to true.", async () => {
    const rideInstance = await Ride.deployed();
    const rideInfo = await rideInstance.getRideInfo();
    assert.equal(rideInfo.confirmedByRider, false, "Rider confirmation is not false.");

    // Set Rider Confirmation to true
    await rideInstance.updateRiderConfirmation.set("True");
    const rideInfo2 = await rideInstance.getRideInfo();
    assert.equal(rideInfo2.confirmedByRider, true, "Rider confirmation is not true.");
  });
});
