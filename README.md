# rides_frontend

## Running the application on local dev server

These steps should be performed in the `client` directory

1. Install dependencies
```bash
npm install
```

2. Start local development server
```bash
npm run start
```

## Running the application on dfx local

These steps should be performed in the `client` directory

1. Install `dfx` if not already installed:
```bash
sh -ci "$(curl -fsSL https://smartcontracts.org/install.sh)"
```

2. Install project dependencies:
```bash
npm install
```

3. Start the local dfx environment:
```bash
dfx start
```

4. Background the dfx server or open a new terminal window, then build and deploy the project to the local dfx server:
```bash
dfx deploy
```
The output will show the URL to the application deployed to local dfx (such as `http://127.0.0.1:8000/?canisterId=r7inp-6aaaa-aaaaa-aaabq-cai`)


## Running the application on-chain on the Internet Computer

These steps should be performed in the `client` directory

1. Install `dfx` if not already installed:
```bash
sh -ci "$(curl -fsSL https://smartcontracts.org/install.sh)"
```

2. If you haven't already, create a cycle wallet, claim free cycles and set wallet address using the steps here: https://smartcontracts.org/docs/quickstart/cycles-faucet.html

* ICP tokens can be converted into more cycles if needed: https://smartcontracts.org/docs/quickstart/4-2-convert-ICP-to-cycles.html
  
3. Check that wallet is configured and has a balance:
```bash
dfx wallet --network ic balance
```

4. Install project dependencies:
```bash
npm install
```

5. Deploy the project to a canister on the Internet Computer chain:
```bash
dfx deploy --network ic --with-cycles 1000000000000
```
If successful, the output will show a URL to the dashboard on-chain, such as `https://5h5yf-eiaaa-aaaaa-qaada-cai.ic0.app/`

6. Check the status of running canisters:
```bash
dfx canister status --all
```
* Stop the on-chain `client_assets` canister:
```bash
dfx canister stop client_assets
```
* Delete the stopped on-chain `client_assets` canister:
```bash
dfx canister delete client_assets
```

More `dfx canister` commands: https://smartcontracts.org/docs/developers-guide/cli-reference/dfx-canister.html

`dfx` CLI reference: https://smartcontracts.org/docs/developers-guide/cli-reference.html

***

View the backend repository <a href="https://github.com/webi-ai/rides_backend">here</a>.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[MIT License Link](https://github.com/webi-ai/rides_frontend/blob/main/LICENSE)
