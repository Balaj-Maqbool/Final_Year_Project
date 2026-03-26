import { useRef, type FormEvent } from "react";
import "./auth.css";
import { useNavigate } from "react-router-dom";
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
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName: fullNameRef.current!.value,
      username: usernameRef.current!.value,
      email: emailRef.current!.value,
      password: passRef.current!.value,
      role: roleRef.current!.value,
    });
  };

  
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Join us by filling out the information below</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            className="form-control"
                            ref={fullNameRef}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            className="form-control"
                            ref={usernameRef}
                            placeholder="Choose a username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email address</label>
                        <input
                            id="email"
                            className="form-control"
                            type="email"
                            ref={emailRef}
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="form-control"
                            type="password"
                            ref={passRef}
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">Role</label>
                        <select id="role" className="form-select" ref={roleRef} required>
                            <option value="">Select a role</option>
                            <option value="Freelancer">Freelancer</option>
                            <option value="Client">Client</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-auth">
                        Register
                    </button>

                     <button 
                        type="button" 
                        className="btn-auth btn-google mt-3" 
                        style={{ backgroundColor: "#db4437" }}
                        onClick={() => {
                            const role = roleRef.current?.value || "Client";
                            window.location.href = `${BACKEND_URL}/api/v1/users/google?role=${role}`;
                        }}
                    >
                       Sign up with Google
                    </button>

                    <div className="auth-footer">
                        <span>Already have an account?</span>
                        <button type="button" onClick={() => navigate('/login')} className="auth-link">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;