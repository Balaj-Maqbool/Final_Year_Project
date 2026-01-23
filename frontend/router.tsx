// import Layout from "../frontend/src/outlet/Layout";
import RequireRole from "./src/auth/RequireRole";
import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "./src/auth/Registerpage";
import Loginpage from "./src/auth/Loginpage";
import OAuthSuccess from "./src/auth/OAuthSuccess";
import FreelancerLayout from "./src/outlet/FreelancerLayout";
import RequireToken from "./src/auth/RequireToken";
import FreelancerDashboard from "./src/freelancer/FreelancerDashboard";
import BrowseJobs from "./src/freelancer/BrowseJobs";
import Bids from "./src/freelancer/JobDetails"
import MyBids from "./src/freelancer/MyBids";
import LandingPage from "./src/landing/LandingPage";
import ProfilePage from "./src/profile/ProfilePage";
import ClientDashboard from "./src/client/ClientDashboard";

const router = createBrowserRouter([
  //// Authentication pages
  {
    path: "/",
    element: <LandingPage />,
  },
  {
      path: "/register",
      element: <RegisterPage />,
  },
  {
      path: "/login",
      element: <Loginpage />,
  },
  {
      path: "/oauth-success",
      element: <OAuthSuccess />,
  },
  ////////Freelancer pages

  {
    path: "/freelancer",

    element: (
      <RequireToken>
        <RequireRole allowedRole="Freelancer">
          <FreelancerLayout  />
        </RequireRole>
      </RequireToken>
    ),
    children: [
      { path: "freelancerDashboard", element: <FreelancerDashboard /> },
      {path:'jobs',element:<BrowseJobs/>},
        {path:'jobs/:jobId',element:<Bids/>},
        {path:'my-bids',element:<MyBids/>},
      { path: "freelancerDashboard", element: <FreelancerDashboard /> },
      {path:'jobs',element:<BrowseJobs/>},
      {path:'jobs/:jobId',element:<Bids/>},
      {path:'my-bids',element:<MyBids/>},
      {path:'profile',element:<ProfilePage/>}
    
    ],
  },

//Admin Pages
{
  path:'/client',

   element: (
      <RequireToken>
        <RequireRole allowedRole="Client">
          <FreelancerLayout  />
        </RequireRole>
      </RequireToken>
    ),
    children:[
      { path: "clientDashboard", element: <ClientDashboard /> },
    ]
},

//profile pages
{
  path:'/profile',
  element:<ProfilePage/>
},

]);

export default router;
