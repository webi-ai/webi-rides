const Ride = artifacts.require("../contracts/Ride.sol");

contract("Ride", accounts => {
  it("...should set rider confirmation to true.", async () => {
    const rideInfo = await Ride.getRideInfo();
    assert.equal(rideInfo.confirmedByRider, false, "Rider confirmation is not false.");

    // Set Rider Confirmation to true
    await Ride.updateRiderConfirmation.set("True");
    assert.equal(rideInfo.confirmedByRider, true, "Rider confirmation is not true.");
  });
});
