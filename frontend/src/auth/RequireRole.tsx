import type { JSX } from "react"
import { Navigate } from "react-router-dom"


interface Props{
    children:JSX.Element,
    allowedRole:"admin"|"freelancer"
}

const RequireRole=({children,allowedRole}:Props){

const role=localStorage.getItem('role')
if(role!==allowedRole){
    return <Navigate to='/login' />
}
else
    return children

}