
/**
 * This file was created by truffle-test-generator.
 * For every test, a new contract will be created in the
 * top beforeEach block. This line uses the arguments for
 * your contract's constructor with the same variable names.
 * Each public, non-constant (view) method has a describe
 * block generated for it.
 */
const RideManager = artifacts.require('RideManager')

contract('RideManager', (accounts) => {
  const maintainer = accounts[0]
  const user1 = accounts[1]
  const user2 = accounts[2]
  const stranger = accounts[3]

  let ridemanager

  beforeEach(async () => {
    ridemanager = await RideManager.new({from: maintainer})
  })

  describe('driversMapping', () => {

  })

  describe('ridersMapping', () => {

  })

  describe('registerRider', () => {
    it("should register a rider", async () => {
      const result = await ridemanager.registerRider(
          web3.utils.fromAscii("Rider1"),
          web3.utils.fromAscii("1234567890"),
          web3.utils.fromAscii("rider1@webi.io"),
          web3.utils.fromAscii("rider"),
          "0xa09f74450A9fc56238d111f3550a157edBc2E07E"
          
      );
      console.log(result);
    });
  })

  describe('getRiderInfo', () => {

  })

  describe('cancelRide', () => {

  })

  describe('updateDriverRating', () => {

  })

  describe('registerDriver', () => {

  })

  describe('getDriverInfo', () => {

  })

  describe('updateDriverStatus', () => {

  })

  describe('updateRideInformation', () => {

  })

  describe('requestRide', () => {

  })

  describe('returnDriversAvailable', () => {
    it("should set return drivers available, which will be false", async () => {
      const ridesAvailable = await ridemanager.returnDriversAvailable();
      //console.log(ridesAvailable);
      assert.equal(ridesAvailable > 0, false);
    });
  })

  describe('requestDriver', () => {

  })
})
