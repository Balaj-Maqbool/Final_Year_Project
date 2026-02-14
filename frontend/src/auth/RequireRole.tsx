import type { JSX } from "react"
import { Navigate } from "react-router-dom"


interface Props {
    children: JSX.Element,
    allowedRole: "Client" | "Freelancer"
}

import { useAuthStore } from "../store/useAuthStore"

const RequireRole = ({ children, allowedRole }: Props) => {
    const { user } = useAuthStore()

    if (user?.role !== allowedRole) {
        return <Navigate to='/login' />
    }

    return children
}

export default RequireRole