import Layout from "../frontend/src/outlet/Layout"

import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "./src/auth/Registerpage";
import Loginpage from "./src/auth/Loginpage";


const router=createBrowserRouter([

{
    path:'/',
    element:<Layout/>,
    children:[
         { path: "", element: <RegisterPage /> },
        {path:'login',element:<Loginpage/>}
    ]
}

])

export default router