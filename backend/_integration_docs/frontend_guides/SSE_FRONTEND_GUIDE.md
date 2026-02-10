# Server-Sent Events (SSE) Integration Guide

This guide details how to consume the real-time Notification system on the Frontend (React).

## 1. Connection Endpoint

**URL**: `/api/v1/dashboard/events`
**Method**: `GET`
**Auth**: Requires Authentication (Cookie/JWT). Ensure `withCredentials: true` is set.

## 2. React Implementation

Use the `EventSource` API (native to browsers) to connect.

### Basic Hook: `useSSE.js`

Create a hook to manage the connection globally or on the Dashboard layout.

```javascript
import { useEffect } from "react";
import { toast } from "sonner"; // or your preferred toast library

export const useSSE = () => {
    useEffect(() => {
        // 1. Establish Connection
        // Note: In development, you might need the full URL (e.g., http://localhost:8000/api/v1/dashboard/events)
        const eventSource = new EventSource("/api/v1/dashboard/events", {
            withCredentials: true
        });

        // 2. Connection Handlers
        eventSource.onopen = () => {
            console.log("✅ SSE Connected");
        };

        eventSource.onerror = (err) => {
            console.error("❌ SSE Connection Error", err);
            eventSource.close();
        };

        // 3. Listen for Custom Events

        // A. Dashboard Updates (Generic "Something Happened" or Toast)
        eventSource.addEventListener("DASHBOARD_UPDATE", (e) => {
            const data = JSON.parse(e.data);

            // Show logical toast based on type
            toast(data.message, {
                description: getEventDescription(data.type)
            });

            // Optional: Trigger a re-fetch of data (e.g., queryClient.invalidateQueries)
            if (data.type === "NEW_BID") {
                // refreshBids();
            }
        });

        // B. New Job Alerts (Broadcasts)
        eventSource.addEventListener("NEW_JOB_AVAILABLE", (e) => {
            const data = JSON.parse(e.data);
            toast.success(data.message, {
                description: `New Job: ${data.job.title}`,
                action: {
                    label: "View",
                    onClick: () =>
                        (window.location.href = `/jobs/${data.job._id}`)
                }
            });
        });

        return () => {
            eventSource.close();
        };
    }, []);
};

function getEventDescription(type) {
    switch (type) {
        case "NEW_BID":
            return "A freelancer just placed a bid.";
        case "BID_STATUS_UPDATE":
            return "Check your bid status.";
        case "JOB_MATCH":
            return "A new job matches your skills!";
        default:
            return "New update available.";
    }
}
```

## 3. Event Types Reference

The backend sends the following event types. You should handle them in your frontend logic.

| Event Type           | Sent To         | Triggered When                      | Data Payload                                      |
| :------------------- | :-------------- | :---------------------------------- | :------------------------------------------------ |
| `NEW_JOB_AVAILABLE`  | **Freelancers** | A Client posts a new job.           | `{ message, job: { title, ... } }`                |
| `JOB_MATCH`          | **Freelancers** | A posted job matches user's skills. | `{ message, jobId }`                              |
| `NEW_BID`            | **Client**      | A Freelancer places a bid.          | `{ type: "NEW_BID", message, jobId }`             |
| `BID_WITHDRAWN`      | **Client**      | A Freelancer cancels a bid.         | `{ type: "BID_WITHDRAWN", message, jobId }`       |
| `BID_STATUS_UPDATE`  | **Freelancer**  | Client accepts/rejects a bid.       | `{ type: "BID_STATUS_UPDATE", message, jobId }`   |
| `NEW_TASK`           | **Freelancer**  | Client assigns a task.              | `{ type: "NEW_TASK", message, taskId }`           |
| `TASK_APPROVED`      | **Freelancer**  | Client approves a task.             | `{ type: "TASK_APPROVED", message, taskId }`      |
| `TASK_STATUS_UPDATE` | **Client**      | Freelancer updates task status.     | `{ type: "TASK_STATUS_UPDATE", message, taskId }` |
| `JOB_COMPLETED`      | **Freelancer**  | Client marks job as completed.      | `{ type: "JOB_COMPLETED", message, jobId }`       |
| `NEW_RATING`         | **Freelancer**  | Client rates the freelancer.        | `{ type: "NEW_RATING", message, jobId }`          |

## 4. Notification History (Database)

The Persistence layer is automatic.

- **Endpoint**: `GET /api/v1/notifications`
- **Use Case**: Display these in a "Bell Icon" dropdown.
- **Response**:
    ```json
    {
        "notifications": [
            {
                "_id": "...",
                "type": "NEW_BID",
                "message": "New bid received...",
                "isRead": false,
                "createdAt": "..."
            }
        ],
        "unreadCount": 5
    }
    ```
