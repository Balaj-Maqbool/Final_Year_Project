# Freelance Marketplace Backend

A robust backend REST API for a private SaaS freelancing platform. Built with **Node.js**, **Express**, and **MongoDB**, featuring role-based authentication, complex aggregation pipelines, and a complete job/bidding lifecycle.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT & Passport.js (Google OAuth)
- **Payments**: Stripe Checkout & Webhooks
- **Real-time**: Socket.io & SSE
- **File Storage**: Cloudinary (Multer)
- **AI**: Google Gemini AI

## ✨ Key Features

- **🔐 Authentication & User Management**

    - Role-based access (Client vs. Freelancer).
    - Google OAuth integration.
    - Password reset & email verification.
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

- **💰 Payment & Financials**

    - **Stripe Integration**: Secure checkout for job funding.
    - **Escrow System**: Funds held in platform pseudo-escrow until job completion.
    - **Payment Hub**: View wallet balance, transaction history, and earnings.
    - **Withdrawals**: Freelancers can request manual bank payouts.

- **🤖 AI Integration (Gemini)**

    - **Job Architect**: Draft professional job descriptions from simple prompts.
    - **Profile Polisher**: Enhance bios and suggest relevant skills.
    - **Proposal Generator**: Write personalized cover letters for job bids.
    - **Task Breakdown**: Automatically decompose jobs into actionable tasks.

- **📊 Dashboards & Analytics**

    - Aggregated stats for Clients (Spending, Hires) and Freelancers (Earnings, Success Rate).

- **🔔 Real-time Communication**
    - **Notifications**: Instant SSE-based alerts for bids, messages, and milestones.
    - **Chat System**: Real-time messaging between clients and freelancers (Socket.io).

## 🛡️ Security & Quality

- **Rate Limiting**: Protection against DDoS and AI quota abuse.
- **Validation**: Strict input validation using a global helper class.
- **Error Handling**: Standardized API error/success response architecture.
- **Privacy**: Cookie-only JWT policies and secure HTTP secrets.

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
    MONGODB_URI=...
    ACCESS_TOKEN_SECRET=...
    REFRESH_TOKEN_SECRET=...
    STRIPE_SECRET_KEY=...
    STRIPE_WEBHOOK_SECRET=...
    GEMINI_API_KEY=...
    CLOUDINARY_CLOUD_NAME=...
    CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...
    ```
4.  **Run the server**:
    ```bash
    npm run dev
    ```

## 📖 API Documentation

Detailed endpoint specifications are available in [API_DOCUMENTATION.md](./_integration_docs/api_references/API_DOCUMENTATION.md).

---

## 👨‍💻 Connect with Me

I'm **Balaj Maqbool**, a passionate MERN Stack Developer. Feel free to reach out for collaborations or inquiries!

- **Portfolio**: [balaj-maqbool.vercel.app](https://balaj-maqbool.vercel.app/)
- **LinkedIn**: [balaj-maqbool](https://linkedin.com/in/balaj-maqbool)
- **GitHub**: [@balaj-maqbool](https://github.com/balaj-maqbool)
- **Email**: [balajmaqbool54@gmail.com](mailto:balajmaqbool54@gmail.com)
- **WhatsApp**: [Direct Message](https://wa.me/923252624261)

---
