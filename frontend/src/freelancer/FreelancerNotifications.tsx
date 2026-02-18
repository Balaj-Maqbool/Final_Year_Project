import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAsRead } from "../notifications/notification.services";
import "../css/Notifications.css";

const FreelancerNotifications = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch notifications
    const {
        data = [], // Default to empty array
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
    });

    // Mark as read mutation
    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: (_, id) => {
            queryClient.setQueryData(["notifications"], (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((n: any) =>
                    n._id === id ? { ...n, isRead: true } : n
                );
            });
        },
    });

    const getRedirectLink = (notification: any) => {
        const { type, relatedId } = notification;
        if (!relatedId) return "#";

        switch (type) {
            case "BID_STATUS_UPDATE":
                // If bid status changed, maybe go to "My Bids" or the Job details
                return `/freelancer/my-bids`;
            case "NEW_JOB_AVAILABLE":
            case "JOB_MATCH":
            case "NEW_JOB":
                // If relatedId is job ID
                return `/freelancer/jobs/${relatedId}`;
            default:
                // Fallback
                return `/freelancer/freelancerDashboard`;
        }
    };

    const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        markReadMutation.mutate(id);
    };

    const handleView = (notification: any) => {
        const url = getRedirectLink(notification);
        if (url !== "#") {
            // Optionally mark as read when viewing
            if (!notification.isRead) {
                markReadMutation.mutate(notification._id);
            }
            navigate(url);
        }
    };

    if (isLoading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    if (isError) return <div className="alert alert-danger m-3">Failed to load notifications</div>;

    return (
        <div className="notifications-page-container">
            <div className="container">
                <h2 className="notifications-title">Freelancer Notifications</h2>

                {data.length === 0 ? (
                    <div className="empty-notifications">
                        <div className="empty-icon">🔔</div>
                        <p>You have no notifications at the moment.</p>
                    </div>
                ) : (
                    <div className="notification-list">
                        {data.map((n: any) => (
                            <div
                                key={n._id}
                                className={`notification-card ${n.isRead ? "read" : "unread"}`}
                                onClick={() => handleView(n)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="notification-header">
                                    <span className="notification-type">{n.type.replace(/_/g, " ")}</span>
                                    <span className="notification-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>

                                <p className="notification-message">{n.message}</p>

                                <div className="notification-actions">
                                    {!n.isRead && (
                                        <button
                                            className="btn-notif-action btn-mark-read"
                                            onClick={(e) => handleMarkAsRead(e, n._id)}
                                            disabled={markReadMutation.isPending}
                                        >
                                            {markReadMutation.isPending ? "Marking..." : "Mark as Read"}
                                        </button>
                                    )}
                                    <button
                                        className="btn-notif-action btn-view-details"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleView(n);
                                        }}
                                    >
                                        View Details
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

export default FreelancerNotifications;