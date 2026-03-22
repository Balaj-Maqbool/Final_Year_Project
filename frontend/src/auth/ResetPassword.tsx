import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/apiClient";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage({ type: "danger", text: "Please fill out all fields." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "danger", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiRequest(`/users/password/reset/${token}`, "PATCH", { password });
      setMessage({ type: "success", text: "Your password has been successfully reset. You can now log in with the new password." });
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      setMessage({ type: "danger", text: error.message || "Failed to reset password. The link might be expired or invalid." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Card style={{ maxWidth: "450px", width: "100%", padding: "20px", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
        <Card.Body>
          <h2 className="text-center mb-4 font-weight-bold">Reset Password</h2>
          <p className="text-center text-muted mb-4">Enter your new password below.</p>
          
          {message && <Alert variant={message.type}>{message.text}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3"
              disabled={loading}
              style={{ borderRadius: "8px", fontWeight: 600, padding: "10px" }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Reset Password"}
            </Button>
            
            <div className="text-center mt-3">
              <Link to="/login" className="text-decoration-none">Back to Login</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword;
