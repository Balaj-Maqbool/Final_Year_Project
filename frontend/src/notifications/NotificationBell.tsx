import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "./notification.services";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const { data: notifications = [] } = useQuery({
      queryKey: ["notifications"],
      queryFn: getNotifications,
      enabled: !!isAuthenticated && !!user,
      refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const goToNotifications = () => {
    navigate(`/${user?.role?.toLowerCase() || 'freelancer'}/notifications`);
  };

  return (
    <div onClick={goToNotifications} className="bell" style={{ position: "relative", cursor: "pointer", fontSize: "1.4rem", display: 'flex', alignItems: 'center' }}>
      🔔
      {unreadCount > 0 && (
        <span style={{
          position: "absolute",
          top: "-4px",
          right: "-8px",
          backgroundColor: "#ef4444",
          color: "white",
          borderRadius: "50px",
          padding: "2px 6px",
          fontSize: "11px",
          fontWeight: "bold",
          lineHeight: 1,
          boxShadow: "0 0 0 2px var(--bg-main, #0f172a)"
        }}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
