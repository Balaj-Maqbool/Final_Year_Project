# Chat Architecture & Workflow

## 1. Core Concept
A real-time chat system built on **WebSockets (`ws`)** running on the same port as the Express server. It uses a **2-Model Approach** to separate conversation context (`ChatThread`) from the actual content (`Message`), with strict access control based on **Bid Status**.

---

## 2. Database Models

### A. `ChatThread` (The Context)
Represents a unique conversation channel between a Client and a Freelancer for a specific Job context.
*   **Participants**: `[ClientId, FreelancerId]` (Indexed for fast lookup).
*   **Context**:
    *   `jobId`: Ref to Job.
    *   `bidId`: Ref to Bid (The trigger for this thread).
*   **State**: `status` ("active", "archived", "blocked").
*   **Meta**: `lastMessage` (Embedded snapshot for sidebar previews).

### B. `Message` (The Content)
*   **Link**: `threadId` (Ref to ChatThread).
*   **Author**: `senderId` (Ref to User).
*   **Body**: `content` (Text).
*   **Lifecycle**: `status` ("sent", "delivered", "read").
*   **Future**: `attachments` (Array of file URLs).

---

## 3. Workflow & Access Rules

### Phase 1: Initiation
1.  **Trigger**: Freelancer places a **Bid** on a Job.
2.  **Action**: System automatically checks if a thread exists. If not, it creates a new `ChatThread` linked to that Job+Bid.

### Phase 2: Sending Messages (The Gatekeeper)
When a user attempts to send a message via WebSocket:

1.  **Participant Check**: Is the sender part of this Thread?
2.  **Bid Status Check**:
    *   **Pending Bid**:
        *   ✅ **Text**: Allowed (Negotiation).
        *   ❌ **Files**: Blocked (Security).
        *   ⚠️ **Rate Limit**: Applied.
    *   **Accepted Bid**:
        *   ✅ **Text**: Allowed.
        *   ✅ **Files**: Allowed.
    *   **Rejected/Withdrawn**:
        *   ❌ **All Actions**: Blocked (Read-Only).

### Phase 3: Delivery & Status
1.  **Server Receive**: Server gets JSON payload.
2.  **Save**: Message saved to MongoDB with status `"sent"`.
3.  **Forward**:
    *   **One-on-One**: Lookup recipient in `ChatManager`.
    *   **If Online**: Send immediately via WS. Status -> `"delivered"`.
    *   **If Offline**: Do nothing (Client fetches on reconnect).
4.  **Read Receipt**: When recipient opens chat, front-end sends `READ_ACK`, server updates message status to `"read"`.

---

## 4. File Handling (Future / Postponed)
*   **Strategy**: Signed URLs (Direct Upload).
*   **Flow**:
    1.  Client requests "Upload Signature" from API (`POST /api/chat/sign-upload`).
    2.  Server verifies logic (Bid Accepted?) and returns Signed URL (Cloudinary/S3).
    3.  Client uploads file directly to Cloud.
    4.  Client sends the *Link* via WebSocket as a normal message attachment.

---

## 5. Technical Implementation Steps
1.  **Server Upgrade**: Modify `index.js` to expose raw HTTP server for dual HTTP/WS handling.
2.  **Handshake Auth**: Manual JWT verification during WebSocket `upgrade` event (reading Cookies).
3.  **ChatManager**: In-memory Map for `UserId -> WebSocket` management.
4.  **Disconnect Handling**: Auto-update "Last Seen" and cleanup connections.
