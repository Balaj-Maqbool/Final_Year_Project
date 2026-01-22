import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"


const FreelancerLayout = () => {
<h2>Freelancer Panel</h2>

    return(
        <>
       
        <Navbar/>
<div id="main">
    <Outlet/>
</div>
    </>
    )
}

export default FreelancerLayout