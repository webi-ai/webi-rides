import React, { Component } from "react";
import { createBrowserHistory } from "history";
import { BrowserRouter, Router, Route, Switch, Redirect } from "react-router-dom";

// core components
import DriverAuth from "layouts/DriverAuth.js";
import DriverDash from "layouts/DriverDash.js";
import DriverRegister from "layouts/DriverRegister.js";
import RiderAuth from "layouts/RiderAuth.js";
import RiderDash from "layouts/RiderDash.js";
import RiderRegister from "layouts/RiderRegister.js";


import "./assets/css/material-dashboard-react.css";
import "./styles.css";

import Web3 from 'web3';

import { PlugWallet } from "@connect2ic/core/providers/plug-wallet"
import { AstroX } from "@connect2ic/core/providers/astrox"
import { InternetIdentity } from "@connect2ic/core/providers/internet-identity"
import { StoicWallet } from "@connect2ic/core/providers/stoic-wallet"
import { NFID } from "@connect2ic/core/providers/nfid"
import { EarthWallet } from "@connect2ic/core/providers/earth-wallet"
import { ConnectButton, ConnectDialog, Connect2ICProvider, useConnect } from "@connect2ic/react"



const hist = createBrowserHistory();

class App extends Component {
    constructor () {
        super();
        this.state = {
            'account': null,
            'loading': true,
            'web3': null,
        };
    }

    async componentWillMount() {
        // await this.loadWeb3();
        // await this.connectPlug();
        // this.setState({ 'loading': false, 'web3': window.web3 });
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    }

    handleInputChange = (e) => {
        this.setState({
            [ e.target.id ]: e.target.value,
        });
    }

    // TODO move to auth page?
    async connectPlug() {
        if (window.ic?.plug) {
            await window.ic.plug.requestConnect();
        }
    }



    render() {
        // if (!this.state.web3) {
        //     return <div>Loading Web3, accounts, and contract...</div>;
        // }
        // <Admin web3={this.state.web3} account={this.state.account}/>

        // TODO split dashes into driver/rider
        // TODO require wallet auth for rider/driver register
        // TODO require account auth to access rider/driver dashes
        // <AuthedRoute path="/dash/rider">
        //                 <Admin web3={this.state.web3} account={this.state.account}/>
        //             </AuthedRoute>
        // redirect / to /auth/rider if not logged in with existing account, to dash if logged in
        return (
            <div>
            <BrowserRouter history={hist}>
                <Switch>
                    <Route path="/dash/rider">
                        <RiderDash web3={this.state.web3} account={this.state.account}/>
                    </Route>
                    <Route path="/dash/driver">
                        <DriverDash web3={this.state.web3} account={this.state.account}/>
                    </Route>
                    <Route path="/register/rider">
                        <RiderRegister/>
                    </Route>
                    <Route path="/register/driver">
                        <DriverRegister/>
                    </Route>
                    <Route path="/auth/rider">
                        <RiderAuth/>
                    </Route>
                    <Route path="/auth/driver">
                        <DriverAuth/>
                    </Route>
                    <Redirect from="/" to="/auth/rider" />
                    <Redirect from="/dash/rider" to="/dash/rider/map" />
                    <Redirect from="/dash/driver" to="/dash/driver/steps" />
                </Switch>
            </BrowserRouter>
            </div>
        );
        // return (
        //     <div>
        //     <Router history={hist}>
        //         <Switch>
        //             <Route path="/admin">
                        
        //             </Route>
        //             { () => {
        //                 if(true) {
        //                     return (
        //                         <Admin web3={this.state.web3} account={this.state.account}/>
        //                        );
        //                 }
        //             }
        //             }
                    
        //             <Redirect from="/" to="/admin" />
        //         </Switch>
        //     </Router>
        //     </div>
        // );
    }   
}

function AuthedRoute({ children, ...rest }) {
    const isAuthed = true;
    return (
        <Route
            {...rest}
            render={({ location }) =>
                isAuthed ? (
                  children
                ) : (
                  <Redirect
                    to={{
                      pathname: "/auth",
                      state: { from: location }
                    }}
                  />
                )
            }
        />
    );
}


const ic_providers = [
    AstroX,
    PlugWallet,
    InternetIdentity,
    StoicWallet,
    NFID,
    EarthWallet
  ]
// TODO add redirect if unauthenticated

export default () => (
    <Connect2ICProvider providers={ic_providers}>
      <App />
    </Connect2ICProvider>
  )