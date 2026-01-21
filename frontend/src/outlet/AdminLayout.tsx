
import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
const AdminLayout=()=>{

    return(

<>
<Navbar/>
<div id="main">
    <Outlet/>
</div>
</>

    )
}

export default AdminLayout