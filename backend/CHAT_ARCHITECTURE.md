# Chat Architecture & Workflow

## 1. Core Concept

A real-time chat system built on **Socket.io** running on the same port as the Express server. It uses a **2-Model Approach** to separate conversation context (`ChatThread`) from the actual content (`Message`), with strict access control based on **Bid Status**.

---

## 2. Database Models

### A. `ChatThread` (The Context)

Represents a unique conversation channel between a Client and a Freelancer for a specific Job context.

- **Participants**: `[ClientId, FreelancerId]` (Indexed for fast lookup).
- **Context**:
    - `jobId`: Ref to Job.
    - `bidId`: Ref to Bid (The trigger for this thread).
- **State**: `status` ("active", "archived", "blocked").
- **Meta**: `lastMessage` (Embedded snapshot for sidebar previews).

### B. `Message` (The Content)

- **Link**: `threadId` (Ref to ChatThread).
- **Author**: `senderId` (Ref to User).
- **Body**: `content` (Text).
- **Lifecycle**: `status` ("sent", "delivered", "read").
- **Future**: `attachments` (Array of file URLs).

---

## 3. Workflow & Access Rules

### Phase 1: Initiation

1.  **Trigger**: Freelancer places a **Bid** on a Job.
2.  **Action**: System automatically checks if a thread exists. If not, it creates a new `ChatThread` linked to that Job+Bid.

### Phase 2: Sending Messages (The Gatekeeper)

When a user attempts to send a message via Socket.io:

1.  **Participant Check**: Is the sender part of this Thread?
2.  **Bid Status Check**:
    - **Pending Bid**:
        - ✅ **Text**: Allowed (Negotiation).
        - ❌ **Files**: Blocked (Security logic in Controller).
    - **Accepted Bid**:
        - ✅ **Text**: Allowed.
        - ✅ **Files**: Allowed.
    - **Rejected/Withdrawn**:
        - ❌ **All Actions**: Blocked (Read-Only).

### Phase 3: Delivery & Status

1.  **Server Receive**: Server gets `send_message` event.
2.  **Check Presence**:
    - Is Recipient Online? -> Status = `"delivered"`.
    - Is Recipient Offline? -> Status = `"sent"`.
3.  **Save**: Message saved to MongoDB.
4.  **Forward**:
    - **Broadcast**: Emits `new_message` to the thread Room (Thread ID).
    - **Notification**: If Recipient is online but NOT in the thread room, emit `new_message_notification`.
5.  **Read Receipt**: When recipient calls API `mark_read` or emits `mark_read`, server updates DB + emits `messages_read`.

---

## 4. File Handling (Future / Postponed)

- **Strategy**: Signed URLs (Direct Upload).
- **Flow**:
    1.  Client uploads file to Cloudinary via REST API.
    2.  Client receives URL.
    3.  Client sends URL in `attachments` array via Socket.io.

---

## 5. Technical Implementation Steps

1.  **Server Upgrade**: `SocketManager` initialized with `httpServer`.
2.  **Handshake Auth**: JWT verification via Cookies or `Authorization` header during handshake.
3.  **SocketManager**: Singleton class handling `io` instance, online presence (`Map<UserId, Set<SocketId>>`), and room management.
4.  **Disconnect Handling**: Auto-cleanup of `onlineUsers` map.
