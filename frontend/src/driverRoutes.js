import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';

import RideShareSteps from "views/RideShareSteps/RideShareSteps";

const driverRoutes = [
  {
    path: "/steps",
    name: "Rides",
    rtlName: "لوحة القيادة",
    icon: FormatListNumberedIcon,
    component: RideShareSteps,
    layout: "/dash/driver"
  }
];

export default driverRoutes;
