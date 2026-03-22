import { useRef, type FormEvent } from "react"
import "./auth.css";

export interface loginData {
    email: string,
    password: string,
    role: string
}

interface Props {
    onSubmit: (data: loginData) => void
}

const Login = ({ onSubmit }: Props) => {




    const emailRef = useRef<HTMLInputElement>(null)
    const passRef = useRef<HTMLInputElement>(null)
    const roleRef = useRef<HTMLSelectElement>(null)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        onSubmit({
            email: emailRef.current!.value,
            password: passRef.current!.value,
            role: roleRef.current!.value
        })
    }


    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Please enter your details to login</p>
                </div>

                <form onSubmit={handleSubmit}>
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
                            placeholder="Enter password"
                            required
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <a href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'none' }}>Forgot password?</a>
                        </div>
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
                        Login
                    </button>

                    <button
                        type="button"
                        className="btn-auth btn-google mt-3"
                        style={{ backgroundColor: "#db4437" }}
                        onClick={() => {
                            const role = roleRef.current?.value || "Client";

                            window.location.href = `http://localhost:8000/api/v1/users/google?role=${role}`;
                        }}
                    >
                        Sign in with Google
                    </button>

                    <div className="auth-footer">
                        <span>Don't have an account?</span>
                        <button type="button" onClick={() => window.location.href = '/register'} className="auth-link">
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login