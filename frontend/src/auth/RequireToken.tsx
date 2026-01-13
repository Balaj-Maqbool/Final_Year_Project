import { type JSX } from "react"
import { Navigate } from "react-router-dom"

const RequireToken=({children}:{children:JSX.Element})=>{

    const token=localStorage.getItem('token')
    if(!token){
       return <Navigate to="/login" />
    }
    else
    return children
}

export default RequireToken