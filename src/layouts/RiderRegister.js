import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import RiderProfile from 'views/RiderProfile/RiderProfile.js';


const styles = {
  profileCard: {
    margin: "100px"
  }
};
const useStyles = makeStyles(styles);


export default function RiderRegister({ ...rest }) {
  const classes = useStyles();

  return (
    <RiderProfile className={classes.profileCard}/>
  );
}
