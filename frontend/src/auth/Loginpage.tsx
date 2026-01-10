import { useNavigate } from "react-router-dom";
import Login, { type loginData } from "./Login";
import { handleLogin } from "./authServices";

const Loginpage = () => {
  const navigate = useNavigate();

  const onSubmit = async (data: loginData) => {
    await handleLogin(data, navigate);
  };

  return <Login onSubmit={onSubmit} />;
};

export default Loginpage;
