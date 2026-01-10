import  Register, {type registerData} from "./freelancer/Register"; 

const App = () => {
  const handleRegister = async (data: registerData) => {
    try {
      // Use the exact URL you tested in Postman
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Registration Successful:", result);
        alert("Account created successfully!");
        // Optional: Redirect to login or clear state
      } else {
        // This catches errors sent by your backend (e.g., 400 Bad Request)
        alert(`Registration failed: ${result.message}`);
      }
    } catch (error) {
      // This catches network errors (e.g., server is down)
      console.error("Network Error:", error);
      alert("Unable to connect to the server. Is your backend running?");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Register onSubmit={handleRegister} />
    </div>
  );
};

export default App