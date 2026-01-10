// RegisterPage.tsx
import { useNavigate } from "react-router-dom";
import Register, { type registerData } from "./Register";
import { handleRegister } from "./authServices";

const RegisterPage = () => {
  const navigate = useNavigate();

  const onSubmit = async (data: registerData) => {
    await handleRegister(data, navigate);
  };

  return <Register onSubmit={onSubmit} />;
};

export default RegisterPage;
