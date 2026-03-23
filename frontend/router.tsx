// import Layout from "../frontend/src/outlet/Layout";
import RequireRole from "./src/auth/RequireRole";
import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "./src/auth/Registerpage";
import Loginpage from "./src/auth/Loginpage";
import ForgotPassword from "./src/auth/ForgotPassword";
import ResetPassword from "./src/auth/ResetPassword";
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
import PostJob from "./src/client/PostJob";
import AllJobs from "./src/client/AllJobs";
import ViewBids from "./src/client/ViewBids";
import Notifications from "./src/client/ClientNotifications";
import FreelancerNotifications from "./src/freelancer/FreelancerNotifications";
import AdminLayout from "./src/outlet/AdminLayout";
import Tasks from "./src/client/WorkRoom/Tasks";
import FreelancerTasks from "./src/freelancer/WorkRoom/FreelancerTasks";
import Chat from "./src/client/WorkRoom/Chat";
import PaymentSuccess from "./src/payment/PaymentSuccess";
import PaymentCancelled from "./src/payment/PaymentCancelled";
import Wallet from "./src/payment/Wallet";

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
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/oauth-success",
    element: <OAuthSuccess />,
  },
  {
    path: "/payment-success",
    element: <PaymentSuccess />,
  },
  {
    path: "/payment-cancelled",
    element: <PaymentCancelled />,
  },
  ////////Freelancer pages

  {
    path: "/freelancer",

    element: (
      <RequireToken>
        <RequireRole allowedRole="Freelancer">
          <FreelancerLayout />
        </RequireRole>
      </RequireToken>
    ),
    children: [
      { path: "freelancerDashboard", element: <FreelancerDashboard /> },
      { path: 'jobs', element: <BrowseJobs /> },
      { path: 'jobs/:jobId', element: <Bids /> },
      { path: 'my-bids', element: <MyBids /> },
      { path: "freelancerDashboard", element: <FreelancerDashboard /> },
      { path: 'jobs', element: <BrowseJobs /> },
      { path: 'jobs/:jobId', element: <Bids /> },
      { path: 'my-bids', element: <MyBids /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'notifications', element: <FreelancerNotifications /> },
      { path: "jobs/:jobId/tasks", element: <FreelancerTasks /> },
      { path: "chat", element: <Chat /> },
      { path: "chat/:jobId", element: <Chat /> },
      { path: "wallet", element: <Wallet /> }

    ],
  },

  //Admin Pages
  {
    path: '/client',

    element: (
      <RequireToken>
        <RequireRole allowedRole="Client">
          <AdminLayout />
        </RequireRole>
      </RequireToken>
    ),
    children: [
      { path: "clientDashboard", element: <ClientDashboard /> },
      { path: "postjob", element: <PostJob /> },
      { path: "alljobs", element: <AllJobs /> },
      { path: "view-bids/:jobId", element: <ViewBids /> },
      { path: 'notifications', element: <Notifications /> },
      { path: "tasks/:jobId", element: <Tasks /> },
      { path: "chat/:jobId", element: <Chat /> },
      { path: "wallet", element: <Wallet /> }
    ]
  },

  //profile pages
  {
    path: '/profile',
    element: <ProfilePage />
  },
  {
    path: '/profile/:userId',
    element: <ProfilePage />
  },

]);

export default router;
