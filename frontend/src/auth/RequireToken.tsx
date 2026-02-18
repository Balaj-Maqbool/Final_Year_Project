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


            try {
                const userData = await apiRequest<any>("/users/current-user");
                // If backend returns a user, update store to ensure sync
                if (JSON.stringify(user) !== JSON.stringify(userData)) {
                    console.log("[RequireToken] Updating user store with fresh data.");
                    login(userData);
                }
                setIsValid(true);
            } catch (error) {
                const err = error as any; // Cast to access custom status property
                if (err.status === 401 || err.status === 403) {
                    // Start of actual auth failure handling
                    console.error("[RequireToken] Auth failed (401/403). Logging out.", error);
                    setIsValid(false);
                } else {
                    // Non-auth error (e.g. 500, network error)
                    console.error("[RequireToken] Session verification error (non-auth).", error);
                    if (user) {
                        // Optimistic auth: Keep user logged in if we have their data
                        console.warn("[RequireToken] Suppressing logout due to non-auth error. User remains logged in.");
                        setIsValid(true);
                    } else {
                        // determining that we can't verify identity
                        setIsValid(false);
                    }
                }
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

//future
// 1. Implement "Redirect Memory"
// Currently, when a user is kicked to /login, they lose the URL they were trying to access. Once they log in, they are stuck on the dashboard instead of being sent back to their intended destination.

// Action: Use useLocation from react-router-dom.

// Goal: Pass the current path into the Maps state so the Login page can redirect back after a successful auth.

// 2. Prevent Memory Leaks (Cleanup)
// If a user navigates away or closes a tab while verifySession is still fetching, the app might try to update the state of an unmounted component.

// Action: Implement an AbortController or a simple isMounted flag within the useEffect.

// Goal: Ensure setIsValid and setLoading only fire if the component is still active.

// 3. Handle "Soft" vs "Hard" Loading
// Currently, the user sees "Loading access..." on every single page refresh, even if the useAuthStore already has a valid user.

// Action: Modify the logic to check if user exists in the store first. If it does, show the children immediately while the background "silent" check runs.

// Goal: Improve UX by removing the "flicker" for already-authenticated users.

// 4. Robust Object Comparison
// JSON.stringify for comparison is fragile (it fails if key order changes).

// Action: Swap the sync check for a more robust deep-equal utility (like lodash.isEqual) or only compare specific fields like user.id and user.updatedAt.