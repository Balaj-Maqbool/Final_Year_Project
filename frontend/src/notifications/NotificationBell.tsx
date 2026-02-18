import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const goToNotifications = () => {
    navigate(`/${user?.role}/notifications`);
  };

  return (
    <div onClick={goToNotifications} className="bell">
      🔔
    </div>
  );
};

export default NotificationBell;
