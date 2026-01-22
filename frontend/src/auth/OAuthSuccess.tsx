 import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        // const refreshToken = searchParams.get("refreshToken"); // Unused for now

        if (accessToken) {
            // Save tokens to localStorage/Cookies as per your auth logic
            // Assuming your auth logic might use localStorage or just rely on httpOnly cookies
            // If the backend set httpOnly cookies, you might not even need the params if using same domain,
            // but for cross-port dev, params are often used to pass the token to JS.
            
            // Just in case your app uses localStorage for something:
            // localStorage.setItem("accessToken", accessToken); 
            // localStorage.setItem("refreshToken", refreshToken);

            // Navigate to appropriate dashboard
            // Check role? Or just default entry.
            // Let's go to freelancer dashboard for now, or determining based on user profile would be better.
            // But we don't have user info here yet unless we fetch /me.
            
            // Simplest: Go to home or dashboard, let the requireToken wrapper handle fetching profile.
            // If the user's role matters, we'd need to know it. 
            // For now, let's assume successful login leads to the default dashboard.
            
            // Wait, RequireRole wrapper needs the role. 
            // Let's redirect to a general route that decides or just freelancer dashboard if that's the main case.
            // Or better, fetch user profile first?
            
            // Let's try redirecting to /freelancer/freelancerDashboard and let the guard check.
            navigate("/freelancer/freelancerDashboard"); 
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <h2>Logging you in...</h2>
        </div>
    );
};

export default OAuthSuccess;
