pragma solidity >=0.4.21 <0.7.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SimpleStorage.sol";

contract TestSimpleStorage {

  function testItStoresAValue() public {
    simpleStorage mysimpleStorage = simpleStorage(DeployedAddresses.SimpleStorage());

    mysimpleStorage.set(89);

    uint expected = 89;

    Assert.equal(mysimpleStorage.get(), expected, "It should store the value 89.");
  }

}
