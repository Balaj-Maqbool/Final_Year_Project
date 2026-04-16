import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../css/forms.css";
import { BACKEND_URL } from "../config";

export interface registerData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

interface Props {
  onSubmit: (data: registerData) => void;
}

const Register = ({ onSubmit }: Props) => {
  const navigate = useNavigate();
  const fullNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef    = useRef<HTMLInputElement>(null);
  const passRef     = useRef<HTMLInputElement>(null);

  const [role, setRole]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("");

  // Password strength
  const getStrength = (p: string) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)           score++;
    if (/[A-Z]/.test(p))         score++;
    if (/[0-9]/.test(p))         score++;
    if (/[^A-Za-z0-9]/.test(p))  score++;
    return score;
  };
  const strength = getStrength(password);
  const strengthColor = ["#ef4444","#f97316","#eab308","#22c55e"][strength - 1] ?? "transparent";
  const strengthLabel = ["","Weak","Fair","Good","Strong"][strength];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!role) { alert("Please select a role."); return; }
    onSubmit({
      fullName: fullNameRef.current!.value,
      username: usernameRef.current!.value,
      email:    emailRef.current!.value,
      password: passRef.current!.value,
      role,
    });
  };

  const handleGoogle = () => {
    if (!role) { alert("Please select a role before signing up with Google."); return; }
    window.location.href = `${BACKEND_URL}/api/v1/users/google?role=${role}`;
  };

  return (
    <div className="mf-page">
      <div className="mf-card">
        {/* Badge */}
        <div className="mf-badge">New Account</div>

        {/* Heading */}
        <h1 className="mf-heading">Create your<br />workspace</h1>
        <p className="mf-subheading">Join Pakistan's leading freelance marketplace.</p>

        <form onSubmit={handleSubmit}>
          {/* Name row */}
          <div className="mf-row">
            <div className="mf-group">
              <label className="mf-label">Full Name</label>
              <input
                id="reg-fullname"
                ref={fullNameRef}
                type="text"
                className="mf-input"
                placeholder="Aisha Khan"
                required
              />
            </div>
            <div className="mf-group">
              <label className="mf-label">Username</label>
              <input
                id="reg-username"
                ref={usernameRef}
                type="text"
                className="mf-input"
                placeholder="aishakhan"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mf-group">
            <label className="mf-label">Email address</label>
            <div className="mf-input-wrap">
              <span className="mf-input-icon">✉</span>
              <input
                id="reg-email"
                ref={emailRef}
                type="email"
                className="mf-input"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Role chips */}
          <div className="mf-group">
            <label className="mf-label">Your role</label>
            <div className="mf-chips">
              {["Freelancer", "Client"].map(r => (
                <button
                  key={r}
                  type="button"
                  className={`mf-chip ${role === r ? "active" : ""}`}
                  onClick={() => setRole(r)}
                >
                  {r === "Freelancer" ? "🧑‍💻 Freelancer" : "🏢 Client"}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="mf-group">
            <label className="mf-label">Password</label>
            <div className="mf-input-wrap">
              <span className="mf-input-icon">🔒</span>
              <input
                id="reg-password"
                ref={passRef}
                type={showPass ? "text" : "password"}
                className="mf-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="mf-input-action"
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? "hide" : "show"}
              </button>
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1,
                      height: "3px",
                      borderRadius: "3px",
                      background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)",
                      transition: "background 0.25s"
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: "0.75rem", color: strengthColor, marginTop: "4px", display: "block" }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="mf-submit">Create Account</button>

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
            Sign up with Google
          </button>
        </form>

        {/* Footer */}
        <div className="mf-footer">
          Already have an account?
          <button type="button" onClick={() => navigate("/login")}>Sign in</button>
        </div>
      </div>
    </div>
  );
};

export default Register;