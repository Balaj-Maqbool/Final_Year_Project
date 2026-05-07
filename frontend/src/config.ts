export const BACKEND_URL =
  import.meta.env.MODE === "production"
    ? "https://pakfreelance.onrender.com"
    : "http://localhost:8000";
