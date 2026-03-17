import { type JSX, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"

const RequireToken = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuthStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div>Verifying session...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />
    }

    return children
}

export default RequireToken