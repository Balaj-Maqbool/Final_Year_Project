# 🏗️ Backend Architecture Guide (For Frontend/UI Devs)

Welcome! This guide explains the backend organization so you know which endpoints to hit, how real-time events work, and where the rules live.

---

## 📂 Project Structure Overview

### 1. `src/config/` (The Initializers)

Contains boilerplate for external services. You don't usually need to worry about this.

- `db.js`: Database connection.
- `passport.js`: Google OAuth setup.
- `cloudinary.js`: Handles image/file uploads you send from the frontend.

### 2. `src/streams/` (The Real-Time Hub) 🌊

This is where the "live" stuff happens.

- **`ChatManager.js`**: Handles WebSockets. When you send a message via WS, this manages the pipe.
- **`SSEManager.js`**: Replaces standard polling. It pushes notifications (Likes, Bids, Chat Alerts) to your UI instantly.

### 3. `src/services/` (The Business Brains) 🧠

This is where the **Business Rules** reside.

- **`ai.service.js`**: Wraps the Google Gemini API to generate content (Job Descriptions, Proposals, etc.).
- **`chat.service.js`**: Handles chat logic and permissions.

### 4. `src/middlewares/` (The Guardians) 🛡️

- **`rateLimiter.middleware.js`**: Protects the API from abuse.
    - **Global API**: 500 reqs / 15 mins.
    - **Auth**: Strict limits on login/register.
    - **AI**: Shared global limit of 10 reqs / min (token bucket).

### 5. `src/controllers/` (The Gatekeepers) 🚪

Matches your API routes.

- Handles your HTTP requests (`req`) and sends responses (`res`).
- If you hit `POST /api/v1/bids`, it goes to `bid.controller.js`.

### 6. `src/utils/` (The Toolkit) 🛠️

Small, generic helpers like `parseDuration` or custom Error/Response wrappers.

---

## 💡 Types of Programming Logic Explained

| Logic Type         | Description                                                               | Location                             |
| :----------------- | :------------------------------------------------------------------------ | :----------------------------------- |
| **Business Logic** | The "Rules of the Game." (e.g., "Only 10 messages for pending bids").     | `src/services/`                      |
| **Request Logic**  | Validating the incoming data (e.g., "Is the email formatted correctly?"). | `src/controllers/` or `middlewares/` |
| **System Logic**   | Technical plumbing (e.g., "How to upgrade HTTP to WebSockets").           | `src/streams/` or `index.js`         |
| **Utility Logic**  | Generic math/parsing tools (e.g., Converting "1d" to milliseconds).       | `src/utils/`                         |

---

## 🚀 How to Integrate

1. **REST APIs**: Standard `fetch`/`axios` to URLs in `routes/`.
2. **SSE Events**: Use `new EventSource('/api/v1/streams/connect')`. Listen for event types like `NEW_CHAT_MESSAGE`.
3. **WebSockets**: Connect to the root URL. Expect JSON payloads like `{ type: "NEW_MESSAGE", data: {...} }`.

> [!TIP]
> Always check `src/models/` to see the exact JSON structure the backend expects and returns.
