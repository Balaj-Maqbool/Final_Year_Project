# Freelance Marketplace Backend

A robust backend REST API for a private SaaS freelancing platform. Built with **Node.js**, **Express**, and **MongoDB**, featuring role-based authentication, complex aggregation pipelines, and a complete job/bidding lifecycle.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT & Passport.js (Google OAuth)
- **File Storage**: Cloudinary (Multer)

## ✨ Key Features

- **🔐 Authentication & User Management**

    - Role-based access (Client vs. Freelancer).
    - Google OAuth integration.
    - Profile & Cover image management.

- **💼 Job Management**

    - Create, Update, Delete jobs.
    - **Advanced Search**: Filter by regex title, category, and budget range.

- **🙋‍♂️ Bidding System**

    - Freelancers can bid on open jobs.
    - Clients can **Accept/Reject** bids.
    - Automatic job status updates upon assignment.

- **✅ Task Tracking**

    - Kanban-style status (To Do, In Progress, Done).
    - Client approval workflow for completed tasks.

- **⭐ Ratings & Reviews**

    - Clients rate Freelancers upon job completion.
    - Automatic average rating calculation.

- **📊 Dashboards**

    - Aggregated analytics for Clients (Spending, Hires) and Freelancers (Earnings, Success Rate).

- **🔔 Real-time Notifications (SSE)**
    - **Instant Alerts**: Users get real-time toasts for new bids, job matches, and task updates.
    - **Email-like History**: All notifications are saved to the database for later viewing.
    - **Smart Filtering**: Notifications are role-aware (e.g., only Freelancers see "New Job" alerts).

## 🛠️ Installation & Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    ACCESS_TOKEN_SECRET=your_jwt_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_refresh_secret
    REFRESH_TOKEN_EXPIRY=10d
    CLOUDINARY_CLOUD_NAME=...
    CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...
    GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/users/google/callback
    ```
4.  **Run the server**:
    ```bash
    npm run dev
    ```

## 📖 API Documentation

Detailed endpoint specifications are available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---
