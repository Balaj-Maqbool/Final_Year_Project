import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"


const FreelancerLayout = () => {
<h2>Freelancer Panel</h2>

    return(
        <>
       
        <Navbar/>
<div id="main">
    <Outlet/>
</div>
<Footer/>
    </>
    )
}

export default FreelancerLayout