import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "./notification.services";
import "../css/buttons.css";
import "../css/Notifications.css";

const Notifications = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const { data = [], isLoading, isError } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
    });

    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: (_, id) => {
            queryClient.setQueryData(["notifications"], (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((n: any) => n._id === id ? { ...n, isRead: true } : n);
            });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.setQueryData(["notifications"], (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((n: any) => ({ ...n, isRead: true }));
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteNotification,
        onSuccess: (_, id) => {
            queryClient.setQueryData(["notifications"], (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.filter((n: any) => n._id !== id);
            });
        },
    });

    const getRedirectLink = (notification: any) => {
        const { type, relatedId } = notification;
        if (!relatedId) return "#";
        
        const basePath = user?.role === "Client" ? "/client" : "/freelancer";

        switch (type) {
            case "NEW_BID":
            case "BID_WITHDRAWN":
                return `/client/view-bids/${relatedId}`;
            case "BID_STATUS_UPDATE":
            case "NEW_JOB_AVAILABLE":
            case "JOB_MATCH":
            case "NEW_JOB":
                return `/freelancer/jobs/${relatedId}`;
            case "TASK_STATUS_UPDATE":
            case "SUBMISSION_STATUS_UPDATE":
                return `${basePath}/tasks/${relatedId}`;
            case "NEW_CHAT_MESSAGE":
                return `${basePath}/chat/${relatedId}`;
            default:
                return "#";
        }
    };

    const handleView = (notification: any) => {
        const url = getRedirectLink(notification);
        if (url !== "#") {
            if (!notification.isRead) markReadMutation.mutate(notification._id);
            navigate(url);
        }
    };

    if (isLoading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-primary" />
        </div>
    );
    if (isError) return <div className="alert alert-danger m-3">Failed to load notifications</div>;

    const hasUnread = data.some((n: any) => !n.isRead);

    return (
        <div className="notifications-page-container">
            <div className="container py-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <h2 className="notifications-title mb-0">Notifications</h2>
                    {hasUnread && (
                        <button
                            className="btn-notif-action btn-mark-read"
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={markAllReadMutation.isPending}
                        >
                            {markAllReadMutation.isPending ? "Marking..." : "✓ Mark All as Read"}
                        </button>
                    )}
                </div>

                {data.length === 0 ? (
                    <div className="empty-notifications">
                        <div className="empty-icon">🔔</div>
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="notification-list">
                        {data.map((n: any) => (
                            <div
                                key={n._id}
                                className={`notification-card ${n.isRead ? "read" : "unread"}`}
                            >
                                <div className="notification-header">
                                    <span className="notification-type">
                                        {n.type.replace(/_/g, " ")}
                                    </span>
                                    <span className="notification-time">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="notification-message">{n.message}</p>

                                <div className="notification-actions">
                                    {!n.isRead && (
                                        <button
                                            className="btn-notif-action btn-mark-read"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markReadMutation.mutate(n._id);
                                            }}
                                            disabled={markReadMutation.isPending}
                                        >
                                            ✓ Mark as Read
                                        </button>
                                    )}
                                    <button
                                        className="btn-notif-action btn-view-details"
                                        onClick={() => handleView(n)}
                                    >
                                        View Details →
                                    </button>
                                    <button
                                        className="btn-notif-action btn-delete-notif"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMutation.mutate(n._id);
                                        }}
                                        disabled={deleteMutation.isPending}
                                        title="Delete notification"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
