import React, { Component } from "react";
import { createBrowserHistory } from "history";
import { Router, Route, Switch, Redirect } from "react-router-dom";

// core components
import Admin from "layouts/Admin.js";

import "./assets/css/material-dashboard-react.css";
import "./styles.css";

import Web3 from 'web3';


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
        await this.loadWeb3();
        await this.connectPlug();
        this.setState({ 'loading': false, 'web3': window.web3 });
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

    async loadBlockChain() {
        //dead code
    }

    async connectPlug() {
        if (window.ic?.plug) {
            await window.ic.plug.requestConnect();
        }
    }

    render() {
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        return (
            <Router history={hist}>
                <Switch>
                    <Route
                        path="/admin"
                        render={(props) => (
                            <Admin web3={this.state.web3} account={this.state.account}/>
                        )}
                    />
                    <Redirect from="/" to="/admin/map" />
                </Switch>
            </Router>
        );
    }
}

export default App;
