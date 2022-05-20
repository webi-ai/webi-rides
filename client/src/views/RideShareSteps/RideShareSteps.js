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
  const [confirmed, setConfirmed] = React.useState(false);
  const [previewStyle, setPreviewStyle] = React.useState({
    height: 220,
    width: 300,
  });
  const [qrcodeResult, setqrcodeResult] = React.useState('');
  
  // TODO this shouldn't be all the way up here away from other step logic
  function handleScan(data) {
    setqrcodeResult(data);
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
          return (
            <div>
              
              <Card>
                <CardActionArea>
                  <CardMedia
                    title="Maps"
                    className={classes.media}
                    image={mapImage}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h4">
                      Pickup / Dropoff Location
                    </Typography>
                    {
                      localStorage.getItem("destinationLng") === null ?
                        <Typography variant="body2" color="textSecondary" component="p">
                          To book a webI Ride all you would need to do is login to your webI Rides account and choose a location. Enter your pickup and dropoff locations and click on ‘Ride Now’.
                        </Typography>
                        :
                        <Typography variant="body2" color="textSecondary" component="p">
                          Pickup: {localStorage.getItem('sourceName')} <br />
                          Dropoff: {localStorage.getItem('destinationName')} <br />
                          Distance: {localStorage.getItem('distance')}<br />
                          Time: {localStorage.getItem('time')}<br />
                        </Typography>
                    }
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button
                    variant="outlined"
                    color="secondary"
                    href="/admin/map"
                    className={classes.button}
                    startIcon={<LocationOn />}
                  >
                    Go to map
                  </Button>
                </CardActions>
              </Card>

            </div>);
        case 1:
          // TODO constrain to 1-2 seats (or max seat limit)
          return (
            <div>
              <CardBody>
              <TextField
                type='number'
                label="Number of Seats"
                className={classes.textField}
                value={seats}
                variant="outlined"
              />
              </CardBody>
            </div>);
        case 2:
          // TODO fix loading doesn't work
          return loading ? `` : <div>
            <CardBody>
              <Table
                tableHeaderColor="primary"
                tableHead={["Name", "Phone Number", "License Plate", "Rating", "Amount", ""]}
                tableData={selectedDrivers}
              />
            </CardBody>
          </div>;
        case 3:
          // TODO wait for ride confirmation before showing QR reader?
          return <div>
              <Card>
                <CardActionArea>
                  <CardContent style={{padding:'10px 20px 5px 15px'}}>
                    <QrReader
                      delay={100}
                      style={previewStyle}
                      onError={handleError}
                      onScan={handleScan}
                    />
                  </CardContent>
                </CardActionArea>
                <CardActions style={{padding:'5px 20px 10px 20px'}}>
                  <Typography variant="body2" color="textSecondary" component="p" >
                    Scan your driver's QR code to confirm your pickup
                  </Typography>
                </CardActions>
              </Card>
            </div>;
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
          return loading ? `` :  <div>
            <CardBody>
              <Table
                tableHeaderColor="primary"
                tableHead={["Ride Address", "Rider Address", "From", "To", ""]}
                tableData={rideRequests}
              />
            </CardBody>
          </div>;
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

  // TODO naming
  // TODO factor out steps
  // TODO magic step number -> enum sequence
  // TODO 'type' should be driver/rider enum
  // TODO handle first step without having to press next button
  const handleNext = async (e) => {
    const { value, id } = e.target;
    if (isRider()) {

      if (activeStep === 0) {
        console.log(account);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
      else if (activeStep === 1) {
        updateSeats(value);
        // TODO make async
        rideManager.methods.requestRide(
            account,
            [String(localStorage.getItem('sourceLat')), String(localStorage.getItem('sourceLng'))],
            [String(localStorage.getItem('destinationLat')), String(localStorage.getItem('destinationLng'))],
            web3.utils.padRight(web3.utils.fromAscii(20 + 0.5 * Number(localStorage.getItem('distance').split(" ")[0])), 64)
          )
          .send({ from: account })
          .once('receipt', async (receipt) => {
            let data = await rideManager.methods.getRiderInfo(account).call({ 'from': account });
            console.log(data);
            console.log(data[5][data[5].length - 1]);
            setRideContractAddress(data[5][data[5].length - 1]);
            isLoading(false);
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
          });
      } else if (activeStep === 2) {
        // TODO precise geolocation
        axios.post('http://localhost:8000/api/rider/request-ride', {
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
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={() => {
                    setUserSelectedDriver(data.ethAddress);
                    rideManager.methods.requestDriver(account, data.ethAddress, rideContractAddress)
                      .send({ from: account })
                      .once('receipt', async (receipt) => {
                        console.log(receipt);
                        setActiveStep((prevActiveStep) => prevActiveStep + 1);
                      });
                  }}
                >
                  Accept
                </Button>
              ]
            );
          });
          console.log(tempList);
          setSelectedDrivers(tempList);
          isLoading(false);
        }).catch((err) => {
          console.log(err);
        })
        props.notifyNotificationListener("Sample")

      } else if (activeStep === 3) {
        const ride = new web3.eth.Contract(Ride.abi, rideContractAddress);
        let events = await ride.getPastEvents('UpdateConfirmationEvent', { filter: { _riderAddr: account }, fromBlock: 0, toBlock: 'latest' });
        events = events.filter((event) => {
          return event.returnValues._riderAddr === account && event.returnValues._driverAddr === userSelectedDriver;
        });
        console.log(events);
        if (events.length > 0) { 
          alert('Driver has accepted request');
          ride.methods.updateRiderConfirmation(true).send({ from: account })
            .once('receipt', async (receipt) => {
              console.log(receipt);
            });
          setConfirmed(true);
          // TODO only move to next step on QR code read
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }

      } else if (activeStep === 4) {
        const ride = new web3.eth.Contract(Ride.abi, rideContractAddress);
        ride.methods.updateRideComplete(true).send({ from: account })
          .once('receipt', async (receipt) => {
            console.log(receipt);
            let info = await ride.methods.getRideInfo().call({ from: account });
            console.log(info);
            alert('Ride Completed!');
          });
      }
    } else {
      //For Driver
      if (activeStep === 0) { 
        let events = await rideManager.getPastEvents('requestDriverEvent', { filter: { _driverAddr: account }, fromBlock: 0, toBlock: 'latest' });
        events = events.filter((event) => {
          return event.returnValues._driverAddr === account;
        });
        console.log(events);
        setRideContractAddress(events[events.length - 1].returnValues.rideAddr);

        const ride = new web3.eth.Contract(Ride.abi, events[events.length - 1].returnValues.rideAddr);
        let info = await ride.methods.getRideInfo().call({ from: account });
        
        let sourceDisplayName = localStorage.getItem('sourceName');
        let destDisplayName = localStorage.getItem('destinationName');
        setRideRequests([[events[events.length - 1].returnValues.rideAddr, info[0], sourceDisplayName, destDisplayName,
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={async () => {
                // workaround to avoid two transactions before next step
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                // TODO avoid 2 distinct transactions here
                await ride.methods.updateDriverAddress(account).send({ from: account })
                  .once('receipt', async (receipt) => {
                    console.log(receipt);
                    await ride.methods.updateDriverConfirmation(true).send({ from: account })
                      .once('receipt', async (receipt) => {
                        console.log(receipt);
                        setConfirmed(true);
                        setActiveStep((prevActiveStep) => prevActiveStep + 1);
                      });
                  });
              }}
            >
              Accept
            </Button>
        ]]);
        isLoading(false);

      } else if (activeStep === 1) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);

      } else if (activeStep === 2) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);

      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // TODO ui quirk - 'Finish' displays when last step started to move to but still in transition
  return (
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
}
