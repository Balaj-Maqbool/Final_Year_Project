import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/apiClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: "danger", text: "Please enter your email." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiRequest("/users/password/forgot", "POST", { email });
      setMessage({ type: "success", text: "An email with a password reset link has been sent." });
    } catch (error: any) {
      setMessage({ type: "danger", text: error.message || "Failed to send reset link." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Card style={{ maxWidth: "450px", width: "100%", padding: "20px", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
        <Card.Body>
          <h2 className="text-center mb-4 font-weight-bold">Forgot Password?</h2>
          <p className="text-center text-muted mb-4">Enter the email address associated with your account and we'll send you a link to reset your password.</p>
          
          {message && <Alert variant={message.type}>{message.text}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? <Spinner animation="border" size="sm" /> : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-decoration-none">Back to Login</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
