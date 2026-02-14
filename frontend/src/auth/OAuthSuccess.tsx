import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { useAuthStore } from "../store/useAuthStore";

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuthStore();

    useEffect(() => {
        const success = searchParams.get("success");
        // const role = searchParams.get("role"); 

        const fetchUserAndRedirect = async () => {
            if (success === "true") {
                try {
                    const userData = await apiRequest<any>("/users/current-user");
                    login(userData); // Save to store

                    if (userData.role === "Freelancer") {
                        navigate("/freelancer/freelancerDashboard");
                    } else if (userData.role === "Client") {
                        navigate("/client/clientDashboard");
                    } else {
                        navigate("/dashboard");
                    }
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                    navigate("/login");
                }
            } else {
                navigate("/login");
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