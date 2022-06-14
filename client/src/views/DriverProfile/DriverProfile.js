import React, { useState } from "react";
// @material-ui/core components
import { withStyles, makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import avatar from "assets/img/faces/driver.png";
import { TableBody, TableContainer, Table, TableCell, TableRow } from "@material-ui/core";
import Paper from '@material-ui/core/Paper';
import axios from 'axios';

// TODO config one place
const BACKEND_URL = 'http://localhost:8000/api';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const styles = {

  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  }
};

const useStyles = makeStyles(styles);

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function DriverProfile(props) {
  const classes = useStyles();
  const [ show, setHide ] = useState(false)
  const [ open, setOpen ] = React.useState(false);
  const [ web3, setWeb3 ] = useState(props.web3);
  const [ loading, isLoading ] = useState(false);
  const [ formData, setFormData ] = useState({
    name: "",
    contact: "",
    email: "",
    carNo: "",
    noOfSeats: 0,
    rating: 5
  })
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  const handleSuccess = () => {
    setOpen(true);
  };

  function handleChange(event) {
    const { id, value } = event.target
    setFormData({ ...formData, [ id ]: value })
  }

  function handleSubmit(event) {
    setHide(true);

    // TODO replace placeholder IC principal with address from auth & wallet connect
    // TODO should these be set globally?
    localStorage.setItem('account', 'ghekb-nhvbl-y3cnr-lwqbc-xpwyo-akn6f-gbgz6-lpsuj-adq4f-k4dff-zae');
    localStorage.setItem('name', formData.name);
    localStorage.setItem('contact', formData.contact);
    localStorage.setItem('email', formData.email);
    localStorage.setItem('carNo', formData.carNo);
    localStorage.setItem('noOfSeats', formData.noOfSeats);
    localStorage.setItem('rating', formData.rating);
    localStorage.setItem('type', '1');

    var name = web3.utils.padRight(web3.utils.fromAscii(formData.name), 64);
    var contact = web3.utils.padRight(web3.utils.fromAscii(formData.contact), 64);
    var email = web3.utils.padRight(web3.utils.fromAscii(formData.email), 64);
    var carNo = web3.utils.padRight(web3.utils.fromAscii(formData.carNo), 64);

    axios.post(BACKEND_URL + '/driver/register', {
      driver: {
        name: name,
        contact: contact,
        email: email,
        carNo: carNo,
        noOfSeats: Number(formData.noOfSeats),
        role: Number(localStorage.getItem('type')),
        account: localStorage.getItem('account')
      }
    }).then((response) => {
      isLoading(false);
    }).catch((err) => {
      console.log(err);
    });
    handleSuccess()
    event.preventDefault();
  }

  return (
    <div>
      <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          Added Driver Profile
        </Alert>
      </Snackbar>
      <GridContainer>
        <GridItem xs={12} sm={12} md={7}>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>Driver Profile</h4>
                <p className={classes.cardCategoryWhite}>Add your profile</p>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={5}>
                    <CustomInput
                      inputProps={{
                        onChange: (e) => handleChange(e),
                        type: "text"
                      }}
                      labelText="Full Name"
                      id="name"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      inputProps={{
                        onChange: (e) => handleChange(e),
                        type: "tel"
                      }}
                      labelText="Phone Number"
                      id="contact"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      inputProps={{
                        onChange: (e) => handleChange(e),
                        type: "email"
                      }}
                      labelText="Email Address"
                      id="email"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={6}>
                    <CustomInput
                      inputProps={{
                        onChange: (e) => handleChange(e),
                        type: "text"
                      }}
                      labelText="License Plate Number"
                      id="carNo"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={6}>
                    <CustomInput
                      inputProps={{
                        onChange: (e) => handleChange(e),
                        type: "number"
                      }}
                      labelText="Number of Seats"
                      id="noOfSeats"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter>
                <Button color="primary" type="submit">Submit</Button>
              </CardFooter>
            </Card>
          </form>
        </GridItem>
        {
          show && <GridItem xs={12} sm={12} md={5}>
            <Card profile>
              <CardAvatar profile>
                <a href="#pablo" onClick={e => e.preventDefault()}>
                  <img src={avatar} alt="..." />
                </a>
              </CardAvatar>
              <CardBody profile>
                <p className={classes.cardCategory}>DRIVER</p>
                <h4 className={classes.cardTitle}>{formData.name}</h4>
                <p className={classes.description}>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="customized table">
                      <TableBody>
                        <StyledTableRow>
                          <StyledTableCell component="th" scope="row">
                            Phone Number
                          </StyledTableCell>
                          <StyledTableCell align="right">{formData.contact}</StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell component="th" scope="row">
                            Email Address
                          </StyledTableCell>
                          <StyledTableCell align="right">{formData.email}</StyledTableCell>

                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell component="th" scope="row">
                            License Plate Number
                          </StyledTableCell>
                          <StyledTableCell align="right">{formData.carNo}</StyledTableCell>

                        </StyledTableRow>
                        <StyledTableRow>
                          <StyledTableCell component="th" scope="row">
                            Number of Seats
                          </StyledTableCell>
                          <StyledTableCell align="right">{formData.noOfSeats}</StyledTableCell>
                        </StyledTableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </p>

                <Button color="primary" round onClick={e => e.preventDefault()}>
                  Edit
              </Button>
              </CardBody>
            </Card>
          </GridItem>
        }
      </GridContainer>
    </div >
  );
}
