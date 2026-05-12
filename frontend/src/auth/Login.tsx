import { useRef, useState, useEffect, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import "../css/forms.css";
import { BACKEND_URL } from "../config";

export interface loginData {
  email: string;
  password: string;
  role: string;
}

interface Props {
  onSubmit: (data: loginData) => void;
}

const Login = ({ onSubmit }: Props) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef  = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const [role, setRole]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleError, setGoogleError] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setGoogleError(decodeURIComponent(errorParam));
      // Clean up the URL
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const email = emailRef.current!.value;
    const password = passRef.current!.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email address.";
    if (!password || password.length < 8) newErrors.password = "Password must be at least 8 characters long.";
    if (!role) newErrors.role = "Please select a role.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      email,
      password,
      role,
    });
  };

  const handleGoogle = () => {
    if (!role) { alert("Please select a role before signing in with Google."); return; }
    window.location.href = `${BACKEND_URL}/api/v1/users/google?role=${role}`;
  };

  return (
    <div className="mf-page">
      <div className="mf-card">
        {/* Badge */}
        <div className="mf-badge">Welcome back</div>

        {/* Heading */}
        <h1 className="mf-heading">Sign in to<br />PakFreelance</h1>
        <p className="mf-subheading">Access your dashboard and manage your work.</p>

        {googleError && (
          <div style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            {googleError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mf-group">
            <label className="mf-label">Email address</label>
            <div className="mf-input-wrap">
              <span className="mf-input-icon">✉</span>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                className="mf-input"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px" }}>{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="mf-group">
            <label className="mf-label">Password</label>
            <div className="mf-input-wrap">
              <span className="mf-input-icon">🔒</span>
              <input
                id="login-password"
                ref={passRef}
                type={showPass ? "text" : "password"}
                className="mf-input"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="mf-input-action"
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? "hide" : "show"}
              </button>
            </div>
            {errors.password && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px" }}>{errors.password}</div>}
            <div style={{ textAlign: "right", marginTop: "6px" }}>
              <a href="/forgot-password" style={{ fontSize: "0.8rem", color: "#a78bfa", textDecoration: "none" }}>
                Forgot password?
              </a>
            </div>
          </div>

          {/* Role pill chips */}
          <div className="mf-group">
            <label className="mf-label">Your role</label>
            <div className="mf-chips">
              {["Freelancer", "Client"].map(r => (
                <button
                  key={r}
                  type="button"
                  className={`mf-chip ${role === r ? "active" : ""}`}
                  onClick={() => { setRole(r); setErrors(prev => ({ ...prev, role: "" })); }}
                >
                  {r}
                </button>
              ))}
            </div>
            {errors.role && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px" }}>{errors.role}</div>}
          </div>

          {/* Submit */}
          <button type="submit" className="mf-submit">Sign In</button>

          {/* Divider */}
          <div className="mf-divider">or continue with</div>

          {/* Google */}
          <button type="button" className="mf-btn-social" onClick={handleGoogle}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </form>

        {/* Footer */}
        <div className="mf-footer">
          Don't have an account?
          <button type="button" onClick={() => window.location.href = "/register"}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;