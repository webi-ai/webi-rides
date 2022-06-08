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
import Ride from '../../contracts/Ride.json';
import axios from 'axios';
import QRCode from 'qrcode.react';
import QrReader from 'react-qr-scanner'


const BACKEND_URL = 'http://localhost:8000';

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
  const [rideManager, setRideManager] = React.useState(props.rideManager);
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
  
  // TODO this shouldn't be all the way up here away from other step logic
  function handleScan(data) {
    setQrCodeResult(data);
    if (data === rideContractAddress) {
      setActiveStep(4);
    }
  }

  function handleError(err) {
    console.error(err)
  }

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
        helperText="Before confirming the booking you would need to choose the number of seats that you would wish to book. You can book up to 2 seats on your webI Ride. If you choose to book 2 seats, the pickup and drop location of the co-passenger traveling should be same."
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
    <QrReader
      delay={100}
      style={previewStyle}
      onError={handleError}
      onScan={handleScan}
    />
  );

  const driverRidePickerCard = (
    <div>
      <CardBody>
        <Table
          tableHeaderColor="primary"
          tableHead={["Ride Address", "Rider Address", "From", "To", ""]}
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
    console.log('requesting ride');
    console.log('distance: ' + localStorage.getItem('distance'));
    // TODO distance shouldn't be frontend accessible
    axios.post(BACKEND_URL + '/api/rider/ride/request', {
      "account": account,
      "sourceCoords": {
        "lat": String(localStorage.getItem('sourceLat')),
        "lng": String(localStorage.getItem('sourceLng'))
      },
      "destinationCoords": {
        "lat": String(localStorage.getItem('destinationLat')),
        "lng": String(localStorage.getItem('destinationLng'))
      },
      "distance": web3.utils.padRight(web3.utils.fromAscii(20 + 0.5 * Number(localStorage.getItem('distance').split(" ")[0])), 64)
    }).then((response) => {
      setRideContractAddress(response.rideContractAddress);
      isLoading(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    });
  };

  const riderRetrieveDrivers = () => {
    // TODO precise geolocation
    axios.post(BACKEND_URL + 'api/rider/driver/retrieveLocal', {
      user: {
        "account": account,
        "latitude": 25,
        "longitude": 25
      }
    }).then((response) => {
      console.log(response.data.selectedDrivers);
      let temp = response.data.selectedDrivers;
      // TODO fix all drivers the same
      const tempList = temp.map(data => {
        return (
          [
            web3.utils.hexToUtf8(data.name).trim(),
            web3.utils.hexToUtf8(data.contact).trim(),
            web3.utils.hexToUtf8(data.carNo).trim(),
            data.rating.toString(),
            "0.01 ETH", 
            riderAcceptDriverButton(data)
          ]
        );
      });
      console.log(tempList);
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
    const driverConfirmed = await isDriverConfirmed(rideContractAddress);
    if (driverConfirmed) { 
      alert('Driver has accepted request');
      axios.post(BACKEND_URL + '/rider/ride/confirm', {
        'rideContractAddress': rideContractAddress,
        'rideStatus': true
      }).then((response) => {
        setConfirmed(true);
        // TODO only move to next step on QR code read
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }).catch((err) => {
        console.log(err);
      });
    }
  }
  
  const isDriverConfirmed = async (rideContractAddress) => {
    axios.get(BACKEND_URL + '/ride/driver/isConfirmed', {
      'rideContractAddress': rideContractAddress
    }).then((response) => {
      return response.data.isDriverConfirmed;
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
    let rideContractAddress = await getLatestRideContractAddress(account);
    setRideContractAddress(rideContractAddress);

    let info = await getRideInfo(rideContractAddress);
    
    let sourceDisplayName = localStorage.getItem('sourceName');
    let destDisplayName = localStorage.getItem('destinationName');
    setRideRequests([rideContractAddress, info[0], sourceDisplayName, destDisplayName, driverAcceptRideButton(rideContractAddress)]]);
    isLoading(false);
  }

  const getLatestRideContractAddress = async (driverAddress) => {
    axios.get(BACKEND_URL + '/requests/latest', {
    }).then((response) => {
      return response.data.rideContractAddress;
    }).catch((err) => {
      console.log(err);
    });
  }

  const getRideInfo = async (rideContractAddress) => {
    axios.get(BACKEND_URL + '/ride/info', {
      'rideContractAddress': rideContractAddress
    }).then((response) => {
      return response.data.rideInfo;
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
