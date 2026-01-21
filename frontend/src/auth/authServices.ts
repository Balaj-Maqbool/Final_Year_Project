
// authServices.ts
import type { loginData } from "./Login";
import type { registerData } from "./Register";
import type { NavigateFunction } from "react-router-dom";

export const handleRegister = async (
  data: registerData,
  navigate: NavigateFunction
) => {
  try {
    const response = await fetch("http://localhost:8000/api/v1/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Account created successfully!");
      navigate("/login");
    } else {
      alert(`Registration failed: ${result.message}`);
    }
  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server.");
  }
};
/////handler function for login
export const handleLogin = async (
  data: loginData,
  navigate: NavigateFunction
) => {
  try {
    const response = await fetch("http://localhost:8000/api/v1/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(`Login failed: ${result.message || response.statusText}`);
      return;
    }

    
    localStorage.setItem("token", result.data.accessToken);
    localStorage.setItem("role", result.data.user.role);
    localStorage.setItem("user", JSON.stringify(result.data.user));

    console.log("TOKEN SAVED:", result.data.accessToken);

    // role-based redirect
    if (result.data.user.role === "Freelancer") {
      navigate("/freelancer/freelancerDashboard");
    } else {
      navigate("/client/dashboard"); // Assuming client dashboard path
    }
  } catch (error) {
    console.error(error);
  }
};
