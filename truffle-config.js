const HDWalletProvider = require("@truffle/hdwallet-provider");
const path = require("path");
const mnemonic = "tuition ginger maximum evolve agree million shock mobile dirt visual victory thumb ten anxiety divide";


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    ropsten: {
	          provider: function() {
			          return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/49e2a7d54e1940a99e8fdf0b5468332d")
			        },
	          network_id: 3
	        },
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: '*'
    }
  }
};
