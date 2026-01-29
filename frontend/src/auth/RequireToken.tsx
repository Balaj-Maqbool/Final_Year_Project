import { type JSX, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import { apiRequest } from "../services/apiClient"

const RequireToken = ({ children }: { children: JSX.Element }) => {
    const { user, login } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        const verifySession = async () => {
            if (user) {
                setIsValid(true)
                setLoading(false)
                return
            }

            try {
                // Try to fetch current user (checks cookie)
                const userData = await apiRequest<any>("/users/current-user")
                login(userData)
                setIsValid(true)
            } catch (error) {
                setIsValid(false)
            } finally {
                setLoading(false)
            }
        }

        verifySession()
    }, [user, login])

    if (loading) return <div>Loading access...</div>

    if (!isValid) {
        return <Navigate to="/login" />
    }

    return children
}

export default RequireToken