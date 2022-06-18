import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";

import { useHistory } from 'react-router-dom';

import { ConnectButton, ConnectDialog, Connect2ICProvider, useConnect } from "@connect2ic/react"

import { isDriver } from 'modules/ICAgent.js';

import pluglogomini from 'assets/img/pluglogomini.png';
import webiRidesLogo from 'assets/img/webi-rides.png';


const styles = {
  authCard: {
    margin: "80px auto",
    width: "auto",
    maxWidth: "500px",
  },
  authCardTitle: {
    lineHeight: "0.2"
  },
  webIRidesLogo: {
    width: "500px",
    margin: "50px auto auto auto"
  }
};
const useStyles = makeStyles(styles);


export default function DriverAuth({ ...rest }) {

  const classes = useStyles();
  const history = useHistory();

  async function connectPlug() {
    if (window.ic?.plug) {
      const publicKey = await window.ic.plug.requestConnect();
      if (publicKey) {
        console.log('authed with Plug, principal id', window.ic.plug.principalId);
        const isDriverAccount = await isDriver(window.ic.plug.principalId);
        if (isDriverAccount) { // TODO
          console.log('driver account exists', window.ic.plug.principalId);
          // redirect to rider dash 
          history.push('/dash/driver/steps');
        } else {
          console.log('driver account does not exist, registering driver profile', window.ic.plug.principalId);
          // redirect to driver register profile page
          history.push('/register/driver');
        }
      }
    }
  }

  return (
    <div>
      <Card className={classes.authCard}>
        {/* <CardHeader color="webi" >
          <center>
            <h2 className={classes.authCardTitle}>webI Rides</h2>
            <h4 className={classes.authCardTitle}>for Drivers</h4>
            
          </center>
        </CardHeader> */}
        <CardBody>
          <center>
            <img src={webiRidesLogo} className={classes.webIRidesLogo}/>
            <p>To login as a driver, connect your wallet:</p> {/* TODO style text*/}
            <Button startIcon={<img src={pluglogomini}/>}
                variant="contained" color="rose" onClick={connectPlug}>
              Connect with Plug
            </Button>
          </center>
        </CardBody>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}
