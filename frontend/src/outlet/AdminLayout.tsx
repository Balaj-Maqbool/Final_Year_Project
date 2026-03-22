
import { Outlet } from "react-router-dom"
import ClientNavbar from "../components/ClientNavbar"
import Footer from "../components/Footer"
const AdminLayout=()=>{

    return(

<>
<ClientNavbar/>
<div id="main">
    <Outlet/>
</div>
<Footer/>
</>

    )
}

export default AdminLayout