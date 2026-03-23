
import { Outlet } from "react-router-dom"
import ClientNavbar from "../components/ClientNavbar"
import Footer from "../components/Footer"
import CursorBlob from "../components/CursorBlob"

const AdminLayout=()=>{

    return(

<>
<CursorBlob />
<ClientNavbar/>
<div id="main">
    <Outlet/>
</div>
<Footer/>
</>

    )
}

export default AdminLayout