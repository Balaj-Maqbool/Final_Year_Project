import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAsRead } from "./notification.services";

const Notifications = () => {
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
            case "NEW_BID":
            case "BID_WITHDRAWN":
                return `/client/view-bids/${relatedId}`;
            case "BID_STATUS_UPDATE":
            case "NEW_JOB_AVAILABLE":
            case "JOB_MATCH":
                // If relatedId is job ID
                return `/freelancer/jobs/${relatedId}`;
            case "NEW_JOB":
                // If relatedId is job ID
                return `/freelancer/jobs/${relatedId}`;
            default:
                return "#";
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
        <div className="container mt-4">
            <h2 className="mb-4">Notifications</h2>

            {data.length === 0 ? (
                <p className="text-muted">No notifications yet.</p>
            ) : (
                <div className="list-group">
                    {data.map((n: any) => (
                        <div
                            key={n._id}
                            className={`list-group-item list-group-item-action flex-column align-items-start ${!n.isRead ? "active-notification" : ""}`}
                            style={{
                                backgroundColor: n.isRead ? "#fff" : "#f0f8ff",
                                borderLeft: n.isRead ? "none" : "5px solid #007bff"
                            }}
                        >
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">{n.type.replace(/_/g, " ")}</h5>
                                <small className="text-muted">{new Date(n.createdAt).toLocaleDateString()}</small>
                            </div>
                            <p className="mb-1">{n.message}</p>

                            <div className="mt-2">
                                {!n.isRead && (
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={(e) => handleMarkAsRead(e, n._id)}
                                        disabled={markReadMutation.isPending}
                                    >
                                        {markReadMutation.isPending ? "Marking..." : "Mark as Read"}
                                    </button>
                                )}
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleView(n)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
