import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import CursorBlob from "../components/CursorBlob"

const FreelancerLayout = () => {
<h2>Freelancer Panel</h2>

    return(
        <>
        <CursorBlob />
        <Navbar/>
<div id="main">
    <Outlet/>
</div>
<Footer/>
    </>
    )
}

export default FreelancerLayout