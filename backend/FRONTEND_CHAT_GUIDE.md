# Frontend Chat Integration Guide

This guide details how to implement the Chat UI using the backend's Socket.io and REST API.

## 1. Setup

### Dependencies
```bash
npm install socket.io-client
```

### Connection
Initialize the socket connection **Once** (e.g., in a Context Provider or Top-level component).
```javascript
import { io } from "socket.io-client";

// Ensure you pass the token (Cookie is auto-sent, but Header fallback is safer)
const socket = io("http://localhost:8000", {
  withCredentials: true, // IMPORTANT for Cookies
  extraHeaders: {
    Authorization: `Bearer ${accessToken}` // Fallback
  }
});
```

---

## 2. API Endpoints (REST)

Use these for loading data and managing threads.

| Action | Method | URL | Params/Body |
| :--- | :--- | :--- | :--- |
| **Start Chat** | `POST` | `/api/v1/chats/start/:bidId` | URL Param: `bidId` |
| **Get Threads** | `GET` | `/api/v1/chats` | Query: `?page=1` |
| **Get Messages** | `GET` | `/api/v1/chats/:threadId/messages` | Query: `?page=1` |
| **Mark Read** | `PATCH` | `/api/v1/chats/:threadId/read` | - |
| **Block** | `POST` | `/api/v1/chats/:threadId/block` | - |
| **Unblock** | `POST` | `/api/v1/chats/:threadId/unblock` | - |
| **Delete Msg** | `DELETE` | `/api/v1/chats/messages/:messageId` | - |

---

## 3. Real-time Events (Socket.io)

### A. Core Workflow

**1. Join Room (On Chat Open)**
When user opens a chat window:
```javascript
useEffect(() => {
  socket.emit("join_thread", threadId);
  
  return () => {
    socket.emit("leave_thread", threadId);
  };
}, [threadId]);
```

**2. Send Message**
```javascript
const sendMessage = (content, attachments = []) => {
  socket.emit("send_message", {
    threadId,
    content,
    // Attachments must be uploaded via Media API first
    attachments // Array of { url, publicId, resourceType }
  });
  // Optimistically add to UI with status: "sending"
};
```

**3. Receive Message**
```javascript
socket.on("new_message", (message) => {
  // message: { _id, content, from: { ... }, status: "sent" | "delivered" }
  // Append to message list
});
```

### B. Status Updates

**1. Message Delivered/Read**
Updates statuses of *your* sent messages.
```javascript
socket.on("messages_read", ({ threadId, readerId }) => {
  // Update all my "sent"/"delivered" messages in this thread to "read"
});
```

**2. Typing Indicators**
```javascript
// Send
socket.emit("typing_start", threadId);

// Receive
socket.on("user_typing", ({ userId, isTyping }) => {
  // Show "User is typing..."
});
```

### C. Global Notifications (Toast)

Listen for this **Globally** (even when not in a chat page).
```javascript
socket.on("new_message_notification", ({ title, message, threadId, senderId }) => {
  toast.info(`${title}: ${message}`);
});
```

---

## 4. Message Data Structure

The `new_message` event payload matches the API response:

```json
{
  "_id": "msg_123",
  "threadId": "thread_abc",
  "content": "Hello!",
  "attachments": [],
  "status": "sent", // or "delivered" if user was online
  "from": {
    "_id": "user_xyz",
    "fullName": "John Doe",
    "profileImage": "..."
  },
  "createdAt": "2024-02-02T10:00:00Z"
}
```

## 5. Implementation Tips
1.  **Optimistic UI**: Add messages to the list immediately when sending. Update their status when the server ack/event comes back (or just trust the `new_message` event).
2.  **Unread Counts**: Use the `unreadCounts` map from the `ChatThread` object returned by `/api/v1/chats`.
3.  **Attachments**: See `FRONTEND_MEDIA_GUIDE.md`. Upload file -> Get Metadata (url, publicId) -> Send in Socket message.
