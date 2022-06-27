import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import * as serviceWorker from './serviceWorker';

import { defaultProviders } from "@connect2ic/core/providers"
// import { Connect2ICProvider } from "@connect2ic/react"
// Styles for the ConnectDialog & Button
import "@connect2ic/core/style.css"

// import { ConnectButton, ConnectDialog, Connect2ICProvider, useConnect } from "@connect2ic/react"
// import { PlugWallet } from "@connect2ic/core/providers/plug-wallet"
// import { AstroX } from "@connect2ic/core/providers/astrox"
// import { InternetIdentity } from "@connect2ic/core/providers/internet-identity"
// import { StoicWallet } from "@connect2ic/core/providers/stoic-wallet"
// import { NFID } from "@connect2ic/core/providers/nfid"
// import { EarthWallet } from "@connect2ic/core/providers/earth-wallet"


// TODO useCanister - ride contracts and NNS ledger canisters need auth?
// const ic_providers = [
//   // Either import them from @connect2ic/core
//   AstroX,
//   PlugWallet,
//   // InternetIdentity,
//   // StoicWallet,
//   // //InfinityWallet,
//   // NFID,
//   // EarthWallet
//   // or create your own (check the existing ones to see how they're implemented)
// ]

ReactDOM.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();