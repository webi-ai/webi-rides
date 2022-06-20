// Module : RideShareSteps.js
// Description : RideShareSteps.js is the view for the RideShareSteps component.
// Maintainer : Kelsey and Dixie
// License : Not currently licensed for public use
// Copyright : Webi.ai (c) 2022

//begin imports
import React from "react";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import mapImage from "assets/img/map-image.png";
// core components
import Table from "components/Table/Table.js";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import { LocationOn } from "@material-ui/icons";
import { CardActionArea, TextField } from "@material-ui/core";
//axios will be removed when the old backend is removed
import axios from 'axios';
import QRCode from 'qrcode.react';
import QrReader from 'react-qr-scanner';
import RandomBigInt from 'random-bigint';
import { Principal } from '@dfinity/principal';

import { getAccountId } from './ICPUtils.js';
import ledgerIDL from './nns_ledger.did.js';
import {
  registerRide,
  getDrivers,
  riderSelectDriver,
  isDriverConfirmedForRide,
  updateRiderConfirmationForRider,
  completeRideForRider,
  getOpenRidesForDriver,
  updateDriverConfirmation,
  getMostRecentRideForRider
} from '../../modules/ICAgent.js'; // TODO naming

//remove the backend after port to new api
const BACKEND_URL = 'http://localhost:8000/api';

//ledger canister address
const NNS_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

//webi wallet address
const WEBI_ICP_WALLET_PRINCIPAL_ID = 'lj35m-ts2b6-4hwzr-oefvh-f6phh-3jxmd-brsse-6stci-hnbyz-xfsbp-4ae';

//webi fee is 0.15% of the total price
const WEBI_FEE_PERCENTAGE = 0.15;
//the cost of a ride - hardcoded for now
// const RIDE_COST_ICP_E8S = 300_000_000;
const RIDE_COST_ICP_E8S = 3_000;

//set up the styles
const useStyles = makeStyles((theme) => {
  return {
    ...styles,
    button: {
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
    media: {
      height: 120,
    },
  }
});

//get steps from localstorage
function getSteps() {
  //get the steps depending on if the user is a rider or a driver
  if (isRider()) {
    return ['Confirm Pickup / Dropoff Location', 'Enter Number of Seats', 'Select Driver', 'Confirm Pickup', 'Confirm Dropoff'];
  } else {
    return ['Accept Ride', 'Confirm Pickup', 'Confirm Dropoff'];
  }
}

//is the user a rider or a driver
const isRider = () => {
  //get the user from localstorage and check if they are a rider
  return localStorage.getItem('userType') !== null && localStorage.getItem('userType') === 'rider';
}



// TODO fix widgets not showing on step load
//RideShareSteps component - displays the steps for the ride share
export default function RideShareSteps(props) {
  const classes = useStyles();
  const [account, setAccount] = React.useState(props.account);
  const [web3, setWeb3] = React.useState(props.web3);
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, isLoading] = React.useState(true);
  const [seats, updateSeats] = React.useState(1);
  const [selectedDrivers, setSelectedDrivers] = React.useState([]);
  const [userSelectedDriver, setUserSelectedDriver] = React.useState('');
  const [rideRequests, setRideRequests] = React.useState([]);
  const [rideContractAddress, setRideContractAddress] = React.useState('');
  const [currentRideId, setCurrentRideId] = React.useState('');
  const [rideConfirmed, setRideConfirmed] = React.useState(false);
  const [previewStyle, setPreviewStyle] = React.useState({
    height: 220,
    width: 300,
  });
  const [qrCodeResult, setQrCodeResult] = React.useState('');

  //get the steps from localstorage
  const steps = getSteps();


  //get the current step
  function getStepContent(step) {
    //check if the user is a rider or a driver
    if (isRider()) {
      //for each step return the content
      switch (step) {
        //confirm pickup / dropoff location
        case 0:
          return riderRideDetailsCard;
        //enter number of seats
        case 1:
          // TODO constrain to 1-2 seats (or max seat limit)
          return riderSeatCountPickerCard;
        //select driver
        case 2:
          // TODO fix loading doesn't work
          return loading ? `` : riderPickDriverCard;
        //confirm pickup
        case 3:
          // TODO wait for ride confirmation before showing QR reader?
          return riderQrReaderCard;
        //confirm dropoff
        case 4:
          return '';
        //ride is complete
        case 5:
          return `Ride Completed!`;
        //default - return error
        default:
          return 'Unknown step';
      }
    } else {
      //switch statement for driver steps - check if the ride is confirmed
      switch (step) {
        //accept ride
        case 0:
          // TODO fix loading doesn't work
          return loading ? `` : driverRidePickerCard;
        //confirm pickup
        case 1:
          // TODO wait for ride confirmation before showing QR?
          return <div>
            {/* QR Card */}
            <Card>
              <CardActionArea>
                <CardContent style={{ padding: '10px 20px 5px 15px' }}>
                  <QRCode value={currentRideId} />
                </CardContent>
              </CardActionArea>
              <CardActions style={{ padding: '5px 20px 10px 20px' }}>
                <Typography variant="body2" color="textSecondary" component="p">
                  Show this QR code to your rider to scan to begin the ride
                </Typography>
              </CardActions>
            </Card>
          </div>
            ;
        // case 2 do nothing
        case 2:
          return ``;
        //default case - do nothing
        default:
          return 'Unknown step';
      }
    }
  }

  // TODO improve ui text
  //RiderRideDetailsCard component - displays the card for the rider to enter the pickup and dropoff locations
  const riderRideDetailsCard = (
    <div>
      {/* Ride details card */}
      <Card>
        <CardActionArea>
          {/* Maps media */}
          <CardMedia
            title="Google Maps"
            className={classes.media}
            image={mapImage}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              webI Ride Location
            </Typography>
            {
              localStorage.getItem("destinationLng") === null ?
                <Typography variant="body2" color="textSecondary" component="p">
                  To book a webI Ride all you would need to do is login to your webI Rides account and choose a location. Enter your pickup and drop locations and click on ‘Ride Now’.
                </Typography>
                :
                <Typography variant="body2" color="textSecondary" component="p">
                  Time: {localStorage.getItem('time')}<br />
                  Distance: {localStorage.getItem('distance')}<br />
                </Typography>
            }
          </CardContent>
        </CardActionArea>
        <CardActions>
          {/* Go To Maps button */}
          <Button
            variant="outlined"
            color="secondary"
            href="/admin/map"
            className={classes.button}
            startIcon={<LocationOn />}
          >
            Go To Maps
          </Button>
        </CardActions>
      </Card>
    </div>
  );

  //RiderSeatCountPickerCard component - displays the card for the rider to enter the number of seats
  const riderSeatCountPickerCard = (
    <div>
      {/* Seat count picker card */}
      <TextField
        type='number'
        label="No. of Seats"
        id="filled-margin-none"
        defaultValue={1}
        className={classes.textField}
        value={seats}
        helperText="Pick the number of seats you'll need on your ride."
        variant="outlined"
      />
    </div>
  );


  //RiderPickDriverCard component - displays the card for the rider to select the driver
  const riderPickDriverCard = (
    <div>
      {/* Pick driver card */}
      <CardBody>
        <Table
          tableHeaderColor="primary"
          tableHead={["Name", "Phone Number", "License Plate", "Rating", "Amount", ""]}
          tableData={selectedDrivers}
        />
      </CardBody>
    </div>
  );

  //RiderQrReaderCard component - displays the card for the rider to scan the QR code
  const riderQrReaderCard = (
    <div>
      {/* QR reader card */}
      <Card>
        <CardActionArea>
          <CardContent>
            <QrReader
              delay={100}
              style={previewStyle}
              onError={handleQRError}
              onScan={handleQRScan}
            />

          </CardContent>
        </CardActionArea>
        <CardActions>
          After scanning your driver's QR code, your wallet will request a pair of transactions: these are your driver's fee and webI's processing fee.<br />
          As soon as you approve these transfers, you're ready to ride!
        </CardActions>
      </Card>
    </div>
  ); // TODO add fee explainer fine text - webI takes just a 15% fee to keep our services running
  //handleQRScan function - called when the QR code is scanned
  function handleQRScan(data) {
    //set the QR code result
    setQrCodeResult(data);
    //check if the QR code is a valid address
    if (true || (data === currentRideId)) {
      //confirm the ride
      riderConfirmRide();
    }
  }
  //handleQRError function - called when the QR code is scanned with an error
  //todo - retry scan?
  function handleQRError(err) {
    //log the error
    console.error(err)
  }

  //DriverRidePickerCard component - displays the card for the driver to select the ride
  const driverRidePickerCard = (
    <div>
      {/* Ride picker card */}
      <CardBody>
        {/* Ride picker table */}
        <Table
          tableHeaderColor="primary"
          tableHead={["Driver ID", "Rider ID", "From", "To", ""]}
          tableData={rideRequests}
        />
      </CardBody>
    </div>
  );



  // TODO naming
  // TODO magic step number -> enum sequence
  // TODO handle first step without having to press next button
  //handleNext function - called when the next button is pressed
  const handleNext = async (e) => {
    await connectPlug();

    //if the current step is 0, then we need to get the ride details
    const { value, id } = e.target;
    //if the current step is 1, then we need to get the number of seats
    if (isRider()) {
      if (activeStep === 0) {
        initRide();
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else if (activeStep === 1) {
        updateSeats(value);
        await riderRequestRide();
      }
      //if the current step is 2, then we need to get the driver 
      else if (activeStep === 2) {
        await riderRetrieveDrivers();
      }
      //if the current step is 3, confirm the ride
      else if (activeStep === 3) {
        // riderConfirmRide(); // TODO shouldn't be able to hit next button, only QR scan
      }
      //if the current step is 4, complete the ride 
      else if (activeStep === 4) {
        await riderCompleteRide();
      }
    } else {
      //For Driver
      if (activeStep === 0) {
        driverGetRides();
      } else if (activeStep === 1) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else if (activeStep === 2) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  // make sure plug wallet connected
  const connectPlug = async () => {
    console.log('connectPlug', await window.ic?.plug?.isConnected(), window.ic?.plug?.principalId);
    if (window.ic?.plug && !(await window.ic.plug.isConnected() && window.ic?.plug?.principalId)) {
      console.log('plug not connected, connecting...');
      await window.ic.plug.requestConnect();
    }
  }

  //initRide function - called when the rider requests a ride
  const initRide = () => {
    localStorage.removeItem('isMakingPayments');
  }

  // TODO fix distance
  //riderRequestRide function - called when the rider requests a ride
  const riderRequestRide = async () => {
    const pickup = {
      "lat": String(localStorage.getItem('sourceLat')),
      "lng": String(localStorage.getItem('sourceLng')),
      "address_text": String(localStorage.getItem('sourceName'))
    }
    const dropoff = {
      "lat": String(localStorage.getItem('destinationLat')),
      "lng": String(localStorage.getItem('destinationLng')),
      "address_text":  String(localStorage.getItem('destinationName'))
    }
    await registerRide(getUserAddress(), pickup, dropoff);
    isLoading(false);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    // TODO replace rideContractAddress interactions with retrieving ride by driver/rider ids
  };

  //riderRetrieveDrivers function - called when the rider requests a ride
  const riderRetrieveDrivers = async () => {
    // TODO retrieve nearby drivers for rider geolocation
    // TODO 
    const drivers = await getDrivers();

    // trim to 5 drivers for demo
    const driverTableData = drivers.slice(0, 5)
      .map((driver) => {
        return ([
          driver.name.trim(),
          driver.contact.trim(),
          driver.vehicleplatenumber.trim(),
          driver.rating.toString(),
          RIDE_COST_ICP_E8S * 10 ** -8 + ' ICP',
          riderAcceptDriverButton(driver)
        ])});
    
    setSelectedDrivers(driverTableData);
    isLoading(false);
    
    // axios.post(BACKEND_URL + '/rider/driver/retrieveLocal', {
    //   user: {
    //     "account": account,
    //     "latitude": 25,
    //     "longitude": 25
    //   }
    // }).then((response) => {
    //   let temp = response.data.selectedDrivers;
    //   // TODO fix all drivers the same
    //   const tempList = temp.map(data => {
    //     return (
    //       [
    //         web3.utils.hexToUtf8(data.name).trim(),
    //         web3.utils.hexToUtf8(data.contact).trim(),
    //         web3.utils.hexToUtf8(data.carNo).trim(),
    //         data.rating.toString(),
    //         RIDE_COST_ICP_E8S * 10 ** -8 + ' ICP',
    //         riderAcceptDriverButton(data)
    //       ]
    //     );
    //   });
    //   setSelectedDrivers(tempList);
    //   isLoading(false);
    // }).catch((err) => {
    //   console.log(err);
    // })
  };

  // riderAcceptDriverButton() is a function that returns a button that accepts the driver
  const riderAcceptDriverButton = (data) => (
    //accept driver button
    <Button
      variant="contained"
      color="primary"
      className={classes.button}
      onClick={() => handleRiderAcceptDriver(data)}
    >
      Accept
    </Button>
  );

  // handleRiderAcceptDriver is a function that accepts the driver
  const handleRiderAcceptDriver = async (data) => {
    setUserSelectedDriver(data.address);
    const updateSucceeded = await riderSelectDriver(getUserAddress(), data.address);
    if(updateSucceeded) {
      setCurrentRideId(await getMostRecentRideForRider(getUserAddress())?.rideid);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      console.log('handleRiderAcceptDriver failed to select driver [', data.address, '] for rider [', account, ']'); 
    }

    // axios.post(BACKEND_URL + '/rider/driver/request', {
    //   'riderAddress': account,
    //   'driverAddress': data.ethAddress,
    //   'rideContractAddress': rideContractAddress
    // }).then((response) => {
    //   setActiveStep((prevActiveStep) => prevActiveStep + 1);
    // }).catch((err) => {
    //   console.log(err);
    // });
  };

  const getUserAddress = () => {
    // TODO retrieve principalId from whatever wallet
    if (window.ic?.plug) {
      return window.ic.plug.principalId;
    }
    return account; // may be null
  }


  // riderConfirmRide function - called when the rider confirms a ride
  const riderConfirmRide = async () => {
    let isDriverConfirmed = await isDriverConfirmedForRide(getUserAddress());
    if (!isDriverConfirmed) {
      // TODO handling for when driver is not confirmed
      console.log('driver not yet confirmed');
      
      // TODO remove this bypass after demo
      isDriverConfirmed = true;
    }
    const isMakingPayments = localStorage.getItem('isMakingPayments');

    if (isDriverConfirmed && !isMakingPayments) {
      localStorage.setItem('isMakingPayments', true);
      await riderMakePayments();
    }
  }


  // riderMakePayments function - called when the rider makes payments
  const riderMakePayments = async () => {
    localStorage.removeItem('driverTxHeight');
    localStorage.removeItem('webITxHeight');
    // plug wallet address here to make payments
    if (window.ic?.plug) {
      const webIFee = RIDE_COST_ICP_E8S * WEBI_FEE_PERCENTAGE;
      const driverFee = RIDE_COST_ICP_E8S * (1 - WEBI_FEE_PERCENTAGE);
      //TRANSFER TO WEBI WALLET
      const TRANSFER_TO_WEBI_TX = {
        idl: ledgerIDL,
        canisterId: NNS_LEDGER_CANISTER_ID,
        methodName: 'send_dfx',
        args: [{
          to: getAccountId(Principal.fromText(WEBI_ICP_WALLET_PRINCIPAL_ID)),
          amount: { e8s: webIFee },
          fee: { e8s: 10000 },
          memo: RandomBigInt(32),
          from_subaccount: [],
          created_at_time: []
        }],
        onSuccess: async (res) => {
          console.log('Transferred ICP to webI successfully, tx block height ', res);
          await processWebITx(res);
        },
        onFail: (res) => {
          console.log('error transferring ICP to webI', res);
        },
      };
      //TRANSFER TO DRIVER
      const TRANSFER_TO_DRIVER_TX = {
        idl: ledgerIDL,
        canisterId: NNS_LEDGER_CANISTER_ID,
        methodName: 'send_dfx',
        args: [{
          // TODO set to principal id from driver profile
          to: getAccountId(Principal.fromText('ghekb-nhvbl-y3cnr-lwqbc-xpwyo-akn6f-gbgz6-lpsuj-adq4f-k4dff-zae')),
          amount: { e8s: driverFee },
          fee: { e8s: 10000 },
          memo: RandomBigInt(32),
          from_subaccount: [],
          created_at_time: []
        }],
        onSuccess: async (res) => {
          console.log('Transferred ICP to driver successfully, tx block height ', res);
          await processDriverTx(res);
        },
        onFail: (res) => {
          console.log('error transferring ICP to driver', res);
        },
      };
      //get the icp balance of the wallet
      const icpBalanceE8s = await getIcpBalanceE8s();
      // TODO fees included in cost?
      //if the icp balance is greater than the cost of the ride, make the transfer
      if (icpBalanceE8s >= RIDE_COST_ICP_E8S) {;
        //make the batch transfer
        const result = await window.ic.plug.batchTransactions([TRANSFER_TO_WEBI_TX, TRANSFER_TO_DRIVER_TX]);
      } else {
        //if the icp balance is less than the cost of the ride, show an error
        alert('Insufficient balance, have ' + icpBalanceE8s * 10 ** -8 + ' ICP but need ' + RIDE_COST_ICP_E8S * 10 ** -8 + ' ICP');
      }
    }
  }

  // processWebITx function - called when the rider makes payments
  const getIcpBalanceE8s = async () => {
    const balances = await window.ic?.plug?.requestBalance();
    for (const i in balances) {
      if (balances[i].name === 'ICP') {
        return balances[i].amount * 10 ** 8;
      }
    }
    return 0;
  }

  // processWebITx function - called when the rider makes payments
  const processWebITx = async (height) => {
    localStorage.setItem('webITxHeight', height);
    // confirm ride if both transactions complete
    if (localStorage.getItem('driverTxHeight') > 0) {
      await finishConfirmRide();
    }
  }
  // processDriverTx function - called when the rider makes payments
  const processDriverTx = async (height) => {
    localStorage.setItem('driverTxHeight', height);
    // confirm ride if both transactions complete
    if (localStorage.getItem('webITxHeight') > 0) {
      await finishConfirmRide();
    }
  }

  // finishConfirmRide function - called when the rider makes payments
  const finishConfirmRide = async () => {
    await updateRiderConfirmationForRider(getUserAddress(), 'confirmed');
    setRideConfirmed(true);
    localStorage.setItem('isMakingPayments', false);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

    // axios.post(BACKEND_URL + '/rider/ride/confirm', {
    //   'rideContractAddress': rideContractAddress,
    //   'rideStatus': true
    // }).then(async (response) => {
    //   setRideConfirmed(true);
    //   localStorage.setItem('isMakingPayments', false);
    //   setActiveStep((prevActiveStep) => prevActiveStep + 1);
    // }).catch((err) => {
    //   console.log(err);
    // });
  }

  // riderCancelRide function - called when the rider completes a ride
  const riderCompleteRide = async () => {
    await completeRideForRider(getUserAddress());
    // axios.post(BACKEND_URL + '/rider/ride/complete', {
    //   'rideContractAddress': rideContractAddress,
    //   'rideComplete': true
    // }).then((response) => {
    //   // TODO remove alert
    //   alert('Ride Completed!');
    // }).catch((err) => {
    //   console.log(err);
    // });
  }

  //driverGetRides function - called when the driver gets rides
  const driverGetRides = async () => {
    const rides = await getOpenRidesForDriver(getUserAddress());
    console.log(rides);

    // TODO should display multiple and not just the latest
    // TODO use rides[0] if this becomes list of rides instead of list of 1-length arrays of rides
    const pickup = JSON.parse(rides[0][0].pickup);
    const dropoff = JSON.parse(rides[0][0].dropoff);
    console.log(pickup);
    console.log(dropoff);
    setRideRequests([[getUserAddress(), rides[0][0].rider?.address, pickup.address_text, dropoff.address_text, driverAcceptRideButton(rides[0][0].rideid)]]);
    isLoading(false);
    
    // axios.get(BACKEND_URL + '/driver/requests/latest', {
    // }).then((response) => {
    //   let rideContractAddress = response.data.rideContractAddress;
    //   setRideContractAddress(rideContractAddress);

    //   axios.get(BACKEND_URL + '/ride/info', {
    //     'rideContractAddress': rideContractAddress
    //   }).then((response) => {
    //     let info = response.data.rideInfo;
    //     let sourceDisplayName = localStorage.getItem('sourceName');
    //     let destDisplayName = localStorage.getItem('destinationName');

    //     setRideRequests([[rideContractAddress, info[0], sourceDisplayName, destDisplayName, driverAcceptRideButton(rideContractAddress)]]);
    //     isLoading(false);
    //   }).catch((err) => {
    //     console.log(err);
    //   });
    // }).catch((err) => {
    //   console.log(err);
    // });
  }

  // driverAcceptRide function - called when the driver accepts a ride
  const driverAcceptRideButton = (rideid) => (
    <Button
      variant="contained"
      color="primary"
      className={classes.button}
      onClick={() => handleDriverAcceptRide(rideid)}
    >
      Accept
    </Button>
  );
  //handleDriverAcceptRide function - called when the driver accepts a ride
  const handleDriverAcceptRide = async (rideid) => {
    await updateDriverConfirmation(rideid, 'confirmed');
    setCurrentRideId(rideid);
    setRideConfirmed(true);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    // axios.post(BACKEND_URL + '/driver/ride/accept', {
    //   'rideContractAddress': rideContractAddress,
    //   'driverAddress': getUserAddress()
    // }).then((response) => {
    //   setRideConfirmed(true);
    //   setActiveStep((prevActiveStep) => prevActiveStep + 1);
    // }).catch((err) => {
    //   console.log(err);
    // });
  };


  //handleBack function - move back to the previous step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  //handleReset function - reset the form
  const handleReset = () => {
    setActiveStep(0);
  };

  // TODO ui quirk - 'Finish' displays when last step started to move to but still in transition
  //cardContainerElement - the container for the card
  const cardContainerElement =
    //set up grid of cards for the rides to be displayed
    (
      <div>
        {/* <Grid container spacing={3}> */}
        <GridContainer>
          {/* <Grid item xs={12}> */}
          <GridItem xs={12} sm={12} md={10}>
            {/* <Card> */}
            <Card>
              {/* <CardHeader color="primary"> */}
              <CardHeader color="webi">
                <h4 className={classes.cardTitleWhite}>webI Rides</h4>
                <p className={classes.cardCategoryWhite}>
                  Rideshare made easy
                </p>
              </CardHeader>
              <CardBody>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                      <StepContent>
                        <div>
                          {getStepContent(index)}
                        </div>
                        <div className={classes.actionsContainer}>
                          <div>
                            {/* Back button */}
                            <Button
                              disabled={activeStep === 0}
                              onClick={handleBack}
                              className={classes.button}
                            >
                              Back
                            </Button>
                            {/* Next button */}
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleNext}
                              className={classes.button}
                            >
                              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                            </Button>
                          </div>
                        </div>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
                {activeStep === steps.length && (
                  <Paper square elevation={0} className={classes.resetContainer}>
                    {/* Reset button */}
                    <Button onClick={handleReset} className={classes.button}>
                      Reset
                    </Button>
                  </Paper>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );

  // return the cardContainerElement - the container for the card
  return cardContainerElement;
}
