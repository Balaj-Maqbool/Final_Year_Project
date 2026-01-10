import { useRef, type FormEvent } from "react";
import { Button, Form, FormGroup, Row, Stack } from "react-bootstrap";

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
    <Form onSubmit={handleSubmit}>
      <Stack direction="vertical">
        <Row>
          <FormGroup controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control ref={nameRef} required />
          </FormGroup>
        </Row>

        <Row>
          <FormGroup controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control ref={emailRef} required />
          </FormGroup>
        </Row>

        <Row>
          <FormGroup controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control ref={passRef} required />
          </FormGroup>
        </Row>

        <Row>
          <FormGroup controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Select ref={roleRef} required>
              <option value="">Select a role</option>
              <option value="freelancer">Freelancer</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </FormGroup>
        </Row>
      </Stack>

      <Stack direction="horizontal" className="m-4 justify-content-end" gap={4}>
        <Button variant="primary" type="submit">
          Save
        </Button>

        <Button variant="outline-secondary" type="button">
          Login
        </Button>
      </Stack>
    </Form>
  );
};

export default Register;
