# Backend API Documentation

**Base URL**: `http://localhost:3000/api/v1`

**Authentication**:
- Most endpoints require a JWT token in the header.
- **Header Format**: `Authorization: Bearer <your-access-token>`
- **Cookies**: The API also supports HTTP-only `accessToken` and `refreshToken` cookies for browser clients.

---

## 1. Authentication (`/users`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Register a new user | **JSON**: <br>`{ "email": "user@example.com", "username": "user123", "password": "securePass123", "fullName": "John Doe", "role": "Client" or "Freelancer" }` |
| **POST** | `/login` | Login user | **JSON**: <br>`{ "email": "user@example.com", "password": "securePass123" }` <br>*(Can also use "username" instead of email)* |
| **POST** | `/logout` | Logout (clears cookies) | *No Body* |
| **POST** | `/refresh-token` | Get new access token | *Cookies (auto-sent)* |
| **GET** | `/google` | Initiate Google OAuth | **Query**: `?role=Client` (Default) or `?role=Freelancer` |
| **GET** | `/google/callback` | Google Redirect | **Query**: `?code=...` (Handled by browser) |
| **PATCH** | `/password/change` | Change password | **JSON**: <br>`{ "oldPassword": "old", "newPassword": "new" }` |
| **DELETE** | `/delete-account` | Delete my account | *No Body* |

---

## 2. Profile Management (`/users`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **GET** | `/me` | Get current user details | *No Body* |
| **GET** | `/` | Get list of all users | *No Body* |
| **GET** | `/profile/:id` | Get public profile | **Param**: `id` (User ID) |
| **PATCH** | `/profile` | Update account details | **JSON** (All optional): <br>`{ "fullName": "New Name", "bio": "My Bio", "skills": ["React", "Node"], "portfolio": "http://..." }` |
| **PATCH** | `/profile/image` | Update Profile Pic | **Multipart/Form-Data**: <br>Key: `profileImage` (File) |
| **DELETE** | `/profile/image` | Remove Profile Pic | *No Body* |
| **PATCH** | `/profile/cover` | Update Cover Pic | **Multipart/Form-Data**: <br>Key: `coverImage` (File) |
| **DELETE** | `/profile/cover` | Remove Cover Pic | *No Body* |

---

## 3. Jobs (`/jobs`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Create a new job (Client) | **JSON**: <br>`{ "title": "Fix Bug", "description": "Details...", "budget": 500, "deadline": "2024-12-31", "category": "Web Dev" }` |
| **GET** | `/` | Get all "Open" jobs | **Query** (Optional): <br>`?search=Bug` <br>`?category=Web Dev` <br>`?minBudget=100` <br>`?maxBudget=1000` |
| **GET** | `/my-jobs` | Get my posted jobs | *No Body* |
| **GET** | `/:jobId` | Get job details | **Param**: `jobId` |
| **PATCH** | `/:jobId` | Update job details | **JSON**: <br>`{ "title": "Updated Title", "budget": 600 }` (Partial updates allowed) |
| **DELETE** | `/:jobId` | Delete a job | **Param**: `jobId` |

---

## 4. Bidding System (`/bids`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/:jobId` | Place a bid (Freelancer) | **JSON**: <br>`{ "bid_amount": 400, "message": "I can do this", "timeline": "3 Days" }` |
| **GET** | `/:jobId` | Get bids for my job (Client)| **Param**: `jobId` |
| **GET** | `/my-bids` | Get my active bids (Freelancer) | *No Body* |
| **GET** | `/job/:jobId/my-bid` | Check if I already bid on this job | **Param**: `jobId` |
| **PATCH** | `/:bidId` | Update my pending bid | **JSON**: <br>`{ "bid_amount": 550, "message": "Typo fix..." }` |
| **PATCH** | `/:jobId/:bidId/status` | Accept/Reject a bid | **JSON**: <br>`{ "status": "Accepted" }` or `{ "status": "Rejected" }` |
| **DELETE** | `/:jobId/:bidId` | Withdraw bid (If Pending) | **Params**: `jobId`, `bidId` |

---

## 5. Tasks (`/tasks`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/:jobId` | Create a task (Client) | **JSON**: <br>`{ "title": "Design Homepage", "description": "Use Figma" }` |
| **GET** | `/:jobId` | Get tasks for a job | **Param**: `jobId` |
| **PATCH** | `/:taskId/status` | Update status (Freelancer) | **JSON**: <br>`{ "status": "In Progress" }` <br>*(Options: "To Do", "In Progress", "Done")* |
| **PATCH** | `/:taskId/approve` | Approve task (Client) | **Param**: `taskId` (Must be status:"Done") |

---

## 6. Ratings & Reviews (`/ratings`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/:jobId` | Rate a freelancer (Client) | **JSON**: <br>`{ "rating": 5, "comment": "Excellent work!" }` (Rating: 1-5 integer) |
| **PATCH** | `/:ratingId` | Update rating | **JSON**: <br>`{ "rating": 4, "comment": "Changed my mind" }` |
| **GET** | `/freelancer/:freelancerId` | Get reviews for freelancer | **Param**: `freelancerId` |

---

## 7. Chat (`/chats`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/start/:bidId` | Start/Get Chat Thread | **Param**: `bidId` <br>*(Used for Lazy Initialization)* |
| **GET** | `/` | Get my threads | **Query**: `?page=1` `?limit=10` |
| **DELETE** | `/:threadId` | Hide/Delete thread | **Param**: `threadId` |
| **GET** | `/:threadId/messages` | Get/Load messages | **Param**: `threadId` <br>**Query**: `?page=1` `?limit=20` |
| **PATCH** | `/:threadId/read` | Mark Messages as Read | **Param**: `threadId` |
| **DELETE** | `/messages/:messageId` | Delete a specific message | **Param**: `messageId` |
| **POST** | `/:threadId/block` | Block a thread/user | **Param**: `threadId` |
| **POST** | `/:threadId/unblock` | Unblock a thread/user | **Param**: `threadId` |

---

## 8. Notifications (`/notifications`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get my notifications | **Query**: `?page=1` `?limit=10` |
| **PATCH** | `/read-all` | Mark all as read | *No Body* |
| **PATCH** | `/read/:notificationId` | Mark one as read | **Param**: `notificationId` |
| **DELETE** | `/delete/:notificationId` | Delete a notification | **Param**: `notificationId` |

---

## 9. Dashboards (`/dashboard`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **GET** | `/client` | Get Client Stats | *No Body* <br>Returns: `{ stats: { totalJobs... }, recentJobs: [...] }` |
| **GET** | `/freelancer` | Get Freelancer Stats | *No Body* <br>Returns: `{ stats: { totalBids... }, earnings: {...}, activeJobs: [...] }` |

---

## 10. Real-time Stream (`/stream`)

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **GET** | `/connect` | Subscribe to Event Stream | **Header**: `Accept: text/event-stream` <br>**Note**: Keep-alive connection. |
