// authServices.ts
import type { loginData } from "./Login";
import type { registerData } from "./Register";
import type { NavigateFunction } from "react-router-dom";

export const handleRegister = async (
  data: registerData,
  navigate: NavigateFunction
) => {
  try {
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
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

export const handleLogin = async (
  data: loginData,
  navigate: NavigateFunction
) => {
  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (!response.ok) {
      alert("Login UnSuccessful");
      return;
    }

    localStorage.setItem("token", result.token);
    localStorage.setItem("role", localStorage.user.role);
    localStorage.setItem("user", JSON.stringify(result.user));

    if (result.user.role == "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/freelancer/dashboard");
    }
  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server.");
  }
};
