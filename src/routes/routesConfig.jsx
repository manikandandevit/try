import { Images } from "../common/assets";
// import { PERMISSIONS } from "../constants/permissionMaster";

//public components
import Login from "../pages/auth/login";
import ForgotPassword from "../pages/forgotPassword/forgotPassword";
import ResetPassword from "../pages/resetPassword/resetPassword";
import ChangePassword from "../pages/change-password/changePassword";
//protect components
import Dashboard from "../pages/Dashboard/dashboard";
import Quotation from "../pages/quotation/quotation";
import Customers from "../pages/customer/customer";
import Users from "../pages/user/user";
import Setting from "../pages/setting/setting";
import Profile from "../pages/profile/profile";
import path from "path";
import CustomerQuotation from "../pages/customer/customerQuotation";

export const publicRoutes = [
  { path: "/", element: <Login /> },
  { path: "/forgotpassword", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
];


export const ProtectedRoutes = [
  {
    name: "Dashboard",
    icon: Images.dashboard,
    activeIcon: Images.actDashboard,
    showInSidebar: true,
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    name: "Quotation",
    icon: Images.quote,
    activeIcon: Images.actQuote,
    showInSidebar: true,
    // permission: PERMISSIONS.DASHBOARD_VIEW,
    path: "/quotation",
    element: <Quotation />
  },
  {
    name: "Customers",
    icon: Images.customer,
    activeIcon: Images.actCustomer,
    showInSidebar: true,
    path: "/customer",
    element: <Customers />
  },
  {
    name: "Users",
    icon: Images.user,
    activeIcon: Images.actUser,
    showInSidebar: true,
    path: "/users",
    element: <Users />
  },


  // {
  //   group: "Masters",
  //   menus: [      
  //     {
  //       name: "Locations",
  //       icon: Images.locationIcon,
  //       activeIcon: Images.locationIcon,
  //       showInSidebar: true,
  //       children: [
  //         {
  //           name: "Location",
  //           icon: Images.locationIcon,
  //           activeIcon: Images.locationIcon,
  //           showInSidebar: true,
  //           path: "/location",
  //           element: <Locations />
  //         },
  //         {
  //           name: "Sub Location",
  //           icon: Images.locationIcon,
  //           activeIcon: Images.locationIcon,
  //           showInSidebar: true,
  //           path: "/sub-location",
  //           element: <SubLocations />
  //         },
  //       ]
  //     },
  //   ],
  // },

  {
    name: "Change Password",
    showInSidebar: false,
    element: <ChangePassword />,
  },
  {
    name: "Settings",
    path: "/settings",
    showInSidebar: false,
    element: <Setting />,
  },
  {
    name: "Profile",
    path: "/profile",
    showInSidebar: false,
    element: <Profile />,
  },
  {
    name: "Customer Quotation",
    path: "/customer/quote/:id",
    showInSidebar: false,
    element: <CustomerQuotation />,
  },
];

//only Sidebar render
export const bottomMenus = [
  {
    name: "Setting",
    path: "/settings",
    icon: Images.setting,
    activeIcon: Images.actSetting,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: Images.profile,
    activeIcon: Images.actProfile,
  },
];