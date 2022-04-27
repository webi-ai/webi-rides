pragma solidity ^0.4.7;

contract SimpleStorage {
    uint storageData;

    function get() constant returns(uint) {
        return storageData;
    }
    
    function set(uint n) public {
        storageData = n;
    }

    function increment(uint n) public {
        storageData = storageData + n;
    }

    function decrement(uint n) public {
        storageData = storageData - n;
    }

}
