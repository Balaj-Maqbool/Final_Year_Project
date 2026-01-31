import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToNotifications = () => {
    navigate(`/${user.role}/notifications`);
  };

  return (
    <div onClick={goToNotifications} className="bell">
      🔔
    </div>
  );
};

export default NotificationBell;
