import { useRef, type FormEvent } from "react";
import { Button, Form, FormGroup, Row, Stack, Card, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export interface registerData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface Props {
  onSubmit: (data: registerData) => void;
}

const Register = ({ onSubmit }: Props) => {
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: nameRef.current!.value,
      email: emailRef.current!.value,
      password: passRef.current!.value,
      role: roleRef.current!.value,
    });
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "90vh" }}>
      <Card style={{ maxWidth: "500px", width: "100%" }} className="shadow-sm border-0">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Create Account</h2>
            <p className="text-muted">Join us by filling out the information below</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Stack direction="vertical" gap={3}>
              <Row>
                <FormGroup controlId="name">
                  <Form.Label className="fw-semibold">Full Name</Form.Label>
                  <Form.Control 
                    ref={nameRef} 
                    placeholder="Enter your name" 
                    required 
                  />
                </FormGroup>
              </Row>

              <Row>
                <FormGroup controlId="email">
                  <Form.Label className="fw-semibold">Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    ref={emailRef} 
                    placeholder="name@example.com" 
                    required 
                  />
                </FormGroup>
              </Row>

              <Row>
                <FormGroup controlId="password">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    ref={passRef} 
                    placeholder="Create a password" 
                    required 
                  />
                </FormGroup>
              </Row>

              <Row>
                <FormGroup controlId="role">
                  <Form.Label className="fw-semibold">Role</Form.Label>
                  <Form.Select ref={roleRef} required>
                    <option value="">Select a role</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </FormGroup>
              </Row>

              <Button variant="primary" type="submit" className="w-100 mt-2 py-2 fw-bold">
                Register
              </Button>

              <Stack direction="horizontal" className="justify-content-center mt-3" gap={2}>
                <span className="text-muted">Already have an account?</span>
                <Button 
                  onClick={() => navigate('/login')} 
                  variant="link" 
                  type="button" 
                  className="p-0 text-decoration-none fw-bold"
                >
                  Login
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;