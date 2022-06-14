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

import axios from 'axios';
import QRCode from 'qrcode.react';
import QrReader from 'react-qr-scanner';
import RandomBigInt from 'random-bigint';
import { Principal } from '@dfinity/principal';
import { getAccountId } from './ICPUtils.js';

import ledgerIDL from './nns_ledger.did.js';


const BACKEND_URL = 'http://localhost:8000/api';

const NNS_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

const WEBI_ICP_WALLET_PRINCIPAL_ID = 'ghekb-nhvbl-y3cnr-lwqbc-xpwyo-akn6f-gbgz6-lpsuj-adq4f-k4dff-zae';

const WEBI_FEE_PERCENTAGE = 0.15;
// const RIDE_COST_ICP_E8S = 300_000_000;
const RIDE_COST_ICP_E8S = 3_000;


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

function getSteps() {
  if (isRider()) {
    return [ 'Confirm Pickup / Dropoff Location', 'Enter Number of Seats', 'Select Driver', 'Confirm Pickup', 'Confirm Dropoff' ];
  } else {
    return [ 'Accept Ride', 'Confirm Pickup', 'Confirm Dropoff' ];
  }
}

const isRider = () => {
  return localStorage.getItem('type') !== null && localStorage.getItem('type') === "0";
}

// TODO fix widgets not showing on step load
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
  const [rideConfirmed, setRideConfirmed] = React.useState(false);
  const [previewStyle, setPreviewStyle] = React.useState({
    height: 220,
    width: 300,
  });
  const [qrCodeResult, setQrCodeResult] = React.useState('');
  
  const steps = getSteps();

  function getStepContent(step) {
    if (isRider()) {
      switch (step) {
        case 0:
          return riderRideDetailsCard;
        case 1:
          // TODO constrain to 1-2 seats (or max seat limit)
          return riderSeatCountPickerCard;
        case 2:
          // TODO fix loading doesn't work
          return loading ? `` : riderPickDriverCard;
        case 3:
          // TODO wait for ride confirmation before showing QR reader?
          return riderQrReaderCard;
        case 4:
          return '';
        case 5:
          return `Ride Completed!`;
        default:
          return 'Unknown step';
      }
    } else {
      switch (step) {
        case 0:
          // TODO fix loading doesn't work
          return loading ? `` : driverRidePickerCard;
        case 1:
          // TODO wait for ride confirmation before showing QR?
          return <div>
            <Card>
              <CardActionArea>
                <CardContent style={{padding:'10px 20px 5px 15px'}}>
                  <QRCode value={rideContractAddress} />
                </CardContent>
              </CardActionArea>
              <CardActions style={{padding:'5px 20px 10px 20px'}}>
                <Typography variant="body2" color="textSecondary" component="p">
                  Show this QR code to your rider to scan to begin the ride
                </Typography>
              </CardActions>
            </Card> 
          </div>
          ; 
        case 2:
          return ``;
        default:
          return 'Unknown step';
      }
    }
  }

  // TODO improve ui text
  const riderRideDetailsCard = (
    <div>
      <Card>
        <CardActionArea>
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
          <Button
            variant="outlined"
            color="secondary"
            href="/admin/maps"
            className={classes.button}
            startIcon={<LocationOn />}
          >
            Go To Maps
          </Button>
        </CardActions>
      </Card>
    </div>
  );

  const riderSeatCountPickerCard = (
    <div>
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

  const riderPickDriverCard = (
    <div>
      <CardBody>
        <Table
          tableHeaderColor="primary"
          tableHead={["Name", "Phone Number", "License Plate", "Rating", "Amount", ""]}
          tableData={selectedDrivers}
        />
      </CardBody>
    </div>
  );

  const riderQrReaderCard = (
    <div>
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
          After scanning your driver's QR code, your wallet will request a pair of transactions: these are your driver's fee and webI's processing fee.<br/>
          As soon as you approve these transfers, you're ready to ride!

        </CardActions>
      </Card>
    </div>
  ); // TODO add fee explainer fine text - webI takes just a 15% fee in order to keep our services running
  function handleQRScan(data) {
    setQrCodeResult(data);
    if (true || data === rideContractAddress) { // TODO remove bypass
      riderConfirmRide();
    }
  }
  function handleQRError(err) {
    console.error(err)
  }

  const driverRidePickerCard = (
    <div>
      <CardBody>
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
  // TODO 'type' should be driver/rider enum
  // TODO handle first step without having to press next button
  const handleNext = async (e) => {
    const { value, id } = e.target;
    if (isRider()) {
      if (activeStep === 0) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else if (activeStep === 1) {
        updateSeats(value);
        riderRequestRide();
      } else if (activeStep === 2) {
        riderRetrieveDrivers();
      } else if (activeStep === 3) {
        riderConfirmRide();
      } else if (activeStep === 4) {
        riderCompleteRide();
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

  // TODO fix distance
  const riderRequestRide = () => {
    const distance = web3.utils.utf8ToHex(localStorage.getItem('distance').split(" ")[0]);
    // TODO distance shouldn't be frontend accessible
    axios.post(BACKEND_URL + '/rider/ride/request', {
      "account": account,
      "sourceCoords": {
        "lat": String(localStorage.getItem('sourceLat')),
        "lng": String(localStorage.getItem('sourceLng'))
      },
      "destinationCoords": {
        "lat": String(localStorage.getItem('destinationLat')),
        "lng": String(localStorage.getItem('destinationLng'))
      },
      "distance": distance
    }).then((response) => {
      setRideContractAddress(response.rideContractAddress);
      isLoading(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    });
  };

  const riderRetrieveDrivers = () => {
    // TODO retrieve nearby drivers for rider geolocation
    axios.post(BACKEND_URL + '/rider/driver/retrieveLocal', {
      user: {
        "account": account,
        "latitude": 25,
        "longitude": 25
      }
    }).then((response) => {
      let temp = response.data.selectedDrivers;
      // TODO fix all drivers the same
      const tempList = temp.map(data => {
        return (
          [
            web3.utils.hexToUtf8(data.name).trim(),
            web3.utils.hexToUtf8(data.contact).trim(),
            web3.utils.hexToUtf8(data.carNo).trim(),
            data.rating.toString(),
            RIDE_COST_ICP_E8S * 10**-8 + ' ICP', 
            riderAcceptDriverButton(data)
          ]
        );
      });
      setSelectedDrivers(tempList);
      isLoading(false);
    }).catch((err) => {
      console.log(err);
    })
  };

  const riderAcceptDriverButton = (data) => (
    <Button
      variant="contained"
      color="primary"
      className={classes.button}
      onClick={() => handleRiderAcceptDriver(data)}
    >
      Accept
    </Button>
  );
  const handleRiderAcceptDriver = (data) => {
    setUserSelectedDriver(data.ethAddress);
    axios.post(BACKEND_URL + '/rider/driver/request', {
      'riderAddress': account,
      'driverAddress': data.ethAddress,
      'rideContractAddress': rideContractAddress
    }).then((response) => {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }).catch((err) => {
      console.log(err);
    });
  };


  const riderConfirmRide = async () => {
    axios.get(BACKEND_URL + '/ride/driver/isConfirmed', {
      'rideContractAddress': rideContractAddress
    }).then(async (response) => {
      const driverConfirmed = response.data.isDriverConfirmed;
      const isMakingPayments = localStorage.getItem('isMakingPayments');
      if (driverConfirmed && !isMakingPayments) {
        localStorage.setItem('isMakingPayments', true);      
        await riderMakePayments();
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  const riderMakePayments = async () => {
    localStorage.setItem('driverTxHeight', null);
    localStorage.setItem('webITxHeight', null);
    // plug wallet
    if (window.ic?.plug) {
      const webIFee = RIDE_COST_ICP_E8S * WEBI_FEE_PERCENTAGE;
      const driverFee = RIDE_COST_ICP_E8S * (1 - WEBI_FEE_PERCENTAGE);

      const TRANSFER_TO_WEBI_TX = {
        idl: ledgerIDL,
        canisterId: NNS_LEDGER_CANISTER_ID,
        methodName: 'send_dfx',
        args: [{
          to: getAccountId(Principal.fromText(WEBI_ICP_WALLET_PRINCIPAL_ID)),
          amount: { e8s: webIFee},
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
      
      const icpBalanceE8s = await getIcpBalanceE8s();
      // TODO fees included in cost?
      if (icpBalanceE8s >= RIDE_COST_ICP_E8S) {
        const result = await window.ic.plug.batchTransactions([TRANSFER_TO_WEBI_TX, TRANSFER_TO_DRIVER_TX]);
      } else {
        alert('Insufficient balance, have ' + icpBalanceE8s * 10**-8 + ' ICP but need ' + RIDE_COST_ICP_E8S * 10**-8 + ' ICP');
      }
    }
  }

  const getIcpBalanceE8s = async () => {
    const balances = await window.ic?.plug?.requestBalance();
    for (const i in balances) {
      if (balances[i].name === 'ICP') {
        return balances[i].amount * 10**8;
      }
    }
    return 0;
  }

  const processWebITx = async (height) => {
    localStorage.setItem('webITxHeight', height);
    // confirm ride if both transactions complete
    if (localStorage.getItem('driverTxHeight') > 0) {
      await finishConfirmRide();
    }
  }
  const processDriverTx = async (height) => {
    localStorage.setItem('driverTxHeight', height);
    // confirm ride if both transactions complete
    if (localStorage.getItem('webITxHeight') > 0) {
      await finishConfirmRide();
    }
  }

  const finishConfirmRide = async () => {
    axios.post(BACKEND_URL + '/rider/ride/confirm', {
      'rideContractAddress': rideContractAddress,
      'rideStatus': true
    }).then(async (response) => {
      setRideConfirmed(true);
      localStorage.setItem('isMakingPayments', false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }).catch((err) => {
      console.log(err);
    });
  }

  const riderCompleteRide = () => {
    axios.post(BACKEND_URL + '/rider/ride/complete', {
      'rideContractAddress': rideContractAddress,
      'rideComplete': true
    }).then((response) => {
      // TODO remove alert
      alert('Ride Completed!');
    }).catch((err) => {
      console.log(err);
    });
  }

  const driverGetRides = async () => {
    // TODO should display multiple and not just the latest
    axios.get(BACKEND_URL + '/driver/requests/latest', {
    }).then((response) => {
      let rideContractAddress = response.data.rideContractAddress;
      setRideContractAddress(rideContractAddress);

      axios.get(BACKEND_URL + '/ride/info', {
        'rideContractAddress': rideContractAddress
      }).then((response) => {
        let info = response.data.rideInfo;
        let sourceDisplayName = localStorage.getItem('sourceName');
        let destDisplayName = localStorage.getItem('destinationName');

        setRideRequests([[rideContractAddress, info[0], sourceDisplayName, destDisplayName, driverAcceptRideButton(rideContractAddress)]]);
        isLoading(false);
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  const driverAcceptRideButton = (rideContractAddress) => (
    <Button
      variant="contained"
      color="primary"
      className={classes.button}
      onClick={() => handleDriverAcceptRide(rideContractAddress)}
    >
      Accept
    </Button>
  );
  const handleDriverAcceptRide = async (rideContractAddress) => {
    axios.post(BACKEND_URL + '/driver/ride/accept', {
      'rideContractAddress': rideContractAddress,
      'driverAddress': account
    }).then((response) => {
      setRideConfirmed(true);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }).catch((err) => {
      console.log(err);
    });
  };


  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // TODO ui quirk - 'Finish' displays when last step started to move to but still in transition
  const cardContainerElement = (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={10}>
          <Card>
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
                          <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            className={classes.button}
                          >
                            Back
                          </Button>
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

  return cardContainerElement;
}
