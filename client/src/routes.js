// @material-ui/icons
import Person from "@material-ui/icons/Person";
import LocationOn from "@material-ui/icons/LocationOn";

// core components/views for Admin layout
import UserProfile from "views/UserProfile/UserProfile.js";
import DriverProfile from "views/DriverProfile/DriverProfile.js";
import Maps from "views/Maps/Maps.js";
import { DriveEta } from "@material-ui/icons";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import RideShareSteps from "views/RideShareSteps/RideShareSteps";

const dashboardRoutes = [
  {
    path: "/steps",
    name: "Get a Ride",
    rtlName: "لوحة القيادة",
    icon: FormatListNumberedIcon,
    component: RideShareSteps,
    layout: "/admin"
  },
  {
    path: "/maps",
    name: "Maps",
    rtlName: "خرائط",
    icon: LocationOn,
    component: Maps,
    layout: "/admin"
  },
  {
    path: "/user",
    name: "User Profile",
    rtlName: "ملف تعريفي للمستخدم",
    icon: Person,
    component: UserProfile,
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
