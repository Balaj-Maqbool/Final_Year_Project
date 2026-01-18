import Layout from "../frontend/src/outlet/Layout";
import RequireRole from "./src/auth/RequireRole";
import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "./src/auth/Registerpage";
import Loginpage from "./src/auth/Loginpage";
import FreelancerLayout from "./src/freelancer/FreelancerLayout";
import RequireToken from "./src/auth/RequireToken";
import FreelancerDashboard from "./src/freelancer/FreelancerDashboard";
import BrowseJobs from "./src/freelancer/BrowseJobs";
import Bids from "./src/freelancer/JobDetails"

const router = createBrowserRouter([
  //// Authentication pages
  {
    path: "/",
    element: <Layout />,
    children: [
      { index:true, element: <RegisterPage /> },
      { path: "login", element: <Loginpage /> },
    ],
  },
  ////////Freelancer pages

  {
    path: "/freelancer",

    element: (
      <RequireToken>
        <RequireRole allowedRole="freelancer">
          <FreelancerLayout  />
        </RequireRole>
      </RequireToken>
    ),
    children: [
      { path: "freelancerDashboard", element: <FreelancerDashboard /> },
      {path:'jobs',element:<BrowseJobs/>},
        {path:'jobs/:jobId',element:<Bids/>}
    
    ],
  },

//Admin Pages


]);

export default router;
