
import { Outlet } from "react-router-dom"
import ClientNavbar from "../components/ClientNavbar"
const AdminLayout=()=>{

    return(

<>
<ClientNavbar/>
<div id="main">
    <Outlet/>
</div>
</>

    )
}

export default AdminLayout