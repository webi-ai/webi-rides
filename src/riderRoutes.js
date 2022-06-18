import LocationOn from "@material-ui/icons/LocationOn";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';

import Map from "views/Map/Map.js";
import RideShareSteps from "views/RideShareSteps/RideShareSteps";

const riderRoutes = [
  {
    path: "/map",
    name: "Choose Pickup / Dropoff",
    rtlName: "خرائط",
    icon: LocationOn,
    component: Map,
    layout: "/dash/rider"
  },
  {
    path: "/steps",
    name: "Book a Ride",
    rtlName: "لوحة القيادة",
    icon: FormatListNumberedIcon,
    component: RideShareSteps,
    layout: "/dash/rider"
  }
];

export default riderRoutes;
