// @material-ui/icons
import Person from "@material-ui/icons/Person";
import LocationOn from "@material-ui/icons/LocationOn";

// core components/views for Admin layout
import RiderProfile from "views/RiderProfile/RiderProfile.js";
import DriverProfile from "views/DriverProfile/DriverProfile.js";
import Map from "views/Map/Map.js";
import { DriveEta } from "@material-ui/icons";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import RideShareSteps from "views/RideShareSteps/RideShareSteps";

const dashboardRoutes = [
  
  {
    path: "/map",
    name: "Choose Pickup / Dropoff",
    rtlName: "خرائط",
    icon: LocationOn,
    component: Map,
    layout: "/admin"
  },
  {
    path: "/steps",
    name: "Book a Ride",
    rtlName: "لوحة القيادة",
    icon: FormatListNumberedIcon,
    component: RideShareSteps,
    layout: "/admin"
  },
  {
    path: "/rider",
    name: "Rider Profile",
    rtlName: "ملف تعريفي للمستخدم",
    icon: Person,
    component: RiderProfile,
    layout: "/admin"
  },
  {
    path: "/driver",
    name: "Driver Profile",
    rtlName: "ملف تعريفي للمستخدم",
    icon: DriveEta,
    component: DriverProfile,
    layout: "/admin"
  }
];

export default dashboardRoutes;
