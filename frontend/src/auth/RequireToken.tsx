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
            // Optimistic check: if user exists, show content but verify in background
            if (user) {
                setIsValid(true);
                // We don't return here anymore, we continue to verify with backend
            }

            try {
                const userData = await apiRequest<any>("/users/current-user");
                // If backend returns a user, update store to ensure sync
                if (JSON.stringify(user) !== JSON.stringify(userData)) {
                    login(userData);
                }
                setIsValid(true);
            } catch (error) {
                // If API fails (401/403), and we trusted the store... we should probably logout
                console.error("Session verification failed", error);

                // Only redirect if we don't have a user in store (initial load)
                // OR if we want to force logout on token expiry immediately
                // For now, let's strictly enforce: if backend fails, you are out.
                // But apiRequest might not throw on all errors depending on implementation?
                // Assuming apiRequest throws on non-200.
                setIsValid(false);
            } finally {
                setLoading(false);
            }
        }

        verifySession()
    }, [login]) // Removed 'user' from dependency to avoid infinite loop if login() updates reference

    if (loading) return <div>Loading access...</div>

    if (!isValid) {
        return <Navigate to="/login" />
    }

    return children
}

export default RequireToken