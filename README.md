# rides_frontend

<img src="https://user-images.githubusercontent.com/7106059/164817829-eb7de2b1-aade-4a74-b531-81bca478e611.png" width="600px"/>

## The problem it solves

<img src="https://d3lkc3n5th01x7.cloudfront.net/wp-content/uploads/2018/08/12061600/Ride_Sharing_Diagram.svg"/>

<p>The current ridesharing systems like Uber and Ola have many loopholes due to the centralized approach to manage business operations. These are huge markets that are only going to get bigger with time, as more users become comfortable with the idea of getting cabs to their location with the help of their mobile phones. However, these centralized system faces problems like</p>

<ul>
  <li>High fees due to intermediaries.</li>
  <li>Lack of transparency.</li>
  <li>Lack of safety standards.</li>
</ul>  
  
By using blockchain, we aim to improve the current cab service platforms. The benefits include

<ul>
  <li>Cost reduction.</li>
  <li>Transparency in the pricing.</li>
  <li>Safety and security standards.</li>
  <li>Environmentally cleaner.</li>
  <li>Economic opportunity.</li>
</ul>

## Challenges we ran into
<ul>
  <li>Integrating Google Maps API into our application due to the clashing versions.</li>
  <li>Blockchain is a relatively new topic so, it took time and effort to understand fundamental concepts and how to use it in our problem statement.</li>
  <li>There were so many components and processes going on that we had to really focus on to make sure it all worked together.</li>
  <li>Due to time contraints we were unable to implement Portis.</li>
</ul>

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
ICP tokens can be converted into more cycles if needed: https://smartcontracts.org/docs/quickstart/4-2-convert-ICP-to-cycles.html
  
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

View the backend repository <a href="https://github.com/webi-ai/rides-backend">here</a>.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[MIT License Link](https://github.com/webi-ai/rides-frontend/blob/main/LICENSE)
