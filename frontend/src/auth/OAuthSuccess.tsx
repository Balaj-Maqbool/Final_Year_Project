import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { useAuthStore } from "../store/useAuthStore";

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuthStore();
    
    // 1. Prevent double-execution in Strict Mode
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;

        const success = searchParams.get("success");
        const role = searchParams.get("role");

        const fetchUserAndRedirect = async () => {
            if (success === "true") {
                try {
                    fetched.current = true; // Mark as started
                    const userData = await apiRequest<any>("/users/current-user");
                    
                    login(userData);

                    // 2. Use a switch or cleaner mapping for routing
                    switch (role) {
                        case "Freelancer":
                            navigate("/freelancer/freelancerDashboard", { replace: true });
                            break;
                        case "Client":
                            navigate("/client/clientDashboard", { replace: true });
                            break;
                        default:
                            navigate("/dashboard", { replace: true });
                    }
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                    navigate("/login", { replace: true });
                }
            } else {
                navigate("/login", { replace: true });
            }
        };

        fetchUserAndRedirect();
    }, [searchParams, navigate, login]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <h2 className="mt-3">Finalizing your login...</h2>
            </div>
        </div>
    );
};

export default OAuthSuccess;