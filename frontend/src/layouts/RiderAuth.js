import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardFooter from "components/Card/CardFooter.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";

import { useHistory } from 'react-router-dom';


// import { ConnectButton, ConnectDialog, Connect2ICProvider, useConnect } from "@connect2ic/react"
// // Styles for the ConnectDialog & Button
// import "@connect2ic/core/style.css"

import { isRider } from 'modules/ICAgent.js';

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
  authCardInstructions: {
    lineHeight: "0.2"
  },
  webIRidesLogo: {
    width: "500px",
    margin: "50px auto auto auto"
  }
};
const useStyles = makeStyles(styles);


export default function RiderAuth({ ...rest }) {
  const classes = useStyles();
  const history = useHistory();

  async function connectPlug() {
    if (window.ic?.plug) {
      const publicKey = await window.ic.plug.requestConnect();
      if (publicKey) {
        console.log('authed with Plug, principal id', window.ic.plug.principalId);
        const isRiderAccount = await isRider(window.ic.plug.principalId);
        if (false) { // TODO
          console.log('rider account exists', window.ic.plug.principalId);
          // redirect to rider dash 
          history.push('/dash/rider/map');
        } else {
          console.log('rider account does not exist, registering rider profile', window.ic.plug.principalId);
          // redirect to rider register profile page
          history.push('/register/rider');
        }
      }
    }
  }

  // const { isConnected, principal, activeProvider } = useConnect({
  //   onConnect: () => {
  //     alert('connected');
  //   },
  //   onDisconnect: () => {
  //     // Signed out
  //   }
  // })

  return (
    <div>
      <Card className={classes.authCard}>
        {/* <CardHeader color="webi">
          <center>
            <h2 className={classes.authCardTitle}>webI Rides</h2>
          </center>
        </CardHeader> */}
        <CardBody>
          <center>
            <img src={webiRidesLogo} className={classes.webIRidesLogo}/>
            <p>To login as a rider, connect your wallet:</p> {/* TODO style text - gray etc */}
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
