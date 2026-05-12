# Final Year Project Documentation

## Project Title

**AI-Driven Freelance Marketplace**

## 1. Introduction

The Final Year Project is a full-stack freelance marketplace web application built with the MERN stack. The system connects clients who want to post jobs with freelancers who can browse available work, submit bids, communicate with clients, manage tasks, receive payments, and maintain a professional profile.

The project includes modern marketplace features such as role-based authentication, Google OAuth login, job posting, bidding, task tracking, real-time chat, real-time notifications, Stripe-based payments, wallet balance tracking, Cloudinary media uploads, and Google Gemini-powered AI tools for improving job descriptions, proposals, profiles, and task breakdowns.

## 2. Project Objectives

- Provide a digital platform where clients can post freelance jobs.
- Allow freelancers to browse jobs and submit professional bids.
- Support a complete client-to-freelancer workflow from job posting to task completion.
- Add secure authentication using JWT, cookies, and Google OAuth.
- Enable real-time communication through Socket.IO chat and server-sent event notifications.
- Integrate Stripe payments with a pseudo-escrow workflow.
- Use AI to assist users with writing job details, proposals, profile content, and task lists.
- Provide dashboards for clients and freelancers to track work, spending, earnings, and progress.

## 3. Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router DOM
- Zustand for state management
- TanStack React Query
- Axios and Fetch API clients
- Bootstrap and React Bootstrap
- Framer Motion
- React Hot Toast
- Socket.IO Client
- Stripe.js

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Passport.js with Google OAuth 2.0
- Socket.IO
- Server-Sent Events
- Stripe
- Cloudinary
- Multer
- Nodemailer
- Google Gemini API
- Rate limiter middleware

### Database

- MongoDB is used as the main database.
- Mongoose schemas define users, jobs, bids, tasks, payments, ratings, notifications, chat threads, and messages.

## 4. System Overview

The project is divided into two main applications:

1. **Frontend**
   The frontend is a Vite React application located in the `frontend` folder. It provides user interfaces for landing page, authentication, client dashboard, freelancer dashboard, job management, bidding, profile management, notifications, chat, workroom tasks, and wallet/payment pages.

2. **Backend**
   The backend is an Express API located in the `backend` folder. It exposes REST API endpoints under `/api/v1`, connects to MongoDB, handles authentication, manages business logic, processes payments, sends notifications, supports chat, and communicates with third-party services.

The frontend communicates with the backend using API requests to:

- Development backend URL: `http://localhost:8000`
- Production backend URL: `https://pakfreelance.onrender.com`

## 5. Main Features

### 5.1 Authentication and Authorization

The system supports secure account management for two roles:

- Client
- Freelancer

Authentication features include:

- User registration
- Login and logout
- JWT access and refresh tokens
- HTTP-only cookie support
- Google OAuth login
- Password change
- Forgot password
- Reset password
- Delete account
- Protected routes
- Role-based route access

### 5.2 Client Features

Clients can:

- Register and log in as a client.
- View client dashboard statistics.
- Post new jobs.
- View all posted jobs.
- Receive bids from freelancers.
- Accept or reject bids.
- Open a workroom for an assigned job.
- Create and approve tasks.
- Chat with freelancers.
- Receive real-time notifications.
- Fund jobs using Stripe checkout.
- View wallet and payment activity.
- Rate freelancers after completion.

### 5.3 Freelancer Features

Freelancers can:

- Register and log in as a freelancer.
- View freelancer dashboard statistics.
- Browse open jobs.
- View job details.
- Submit bids.
- Track submitted bids.
- Work on assigned tasks.
- Update task status.
- Chat with clients.
- Receive real-time notifications.
- View wallet balance and earnings.
- Request withdrawals.
- Manage profile, skills, portfolio, and images.

### 5.4 Job and Bidding Workflow

The job workflow follows these steps:

1. A client creates a job with title, description, budget, deadline, category, and required skills.
2. Freelancers browse open jobs and submit bids.
3. The client reviews submitted bids.
4. The client accepts one bid and may reject others.
5. The job status changes from open to assigned.
6. Tasks can be created for the assigned job.
7. The freelancer completes tasks.
8. The client approves completed tasks.
9. Payment and rating workflows can be completed.

### 5.5 Task Management

The system includes a task workflow for active jobs. Tasks can have the following statuses:

- To Do
- In Progress
- Done

Clients create tasks and approve completed work. Freelancers update task status during job execution.

### 5.6 Real-Time Chat

The backend uses Socket.IO for real-time communication. Chat features include:

- Chat thread creation from accepted bids.
- Client and freelancer messaging.
- Message read status.
- Message deletion.
- Thread hiding.
- Blocking and unblocking.
- Attachment support through media URLs.

### 5.7 Notifications

Notifications are used to inform users about important activity such as:

- New jobs
- New bids
- Bid status changes
- New tasks
- Task status updates
- Task approvals
- Job completion
- Ratings
- Chat messages
- System events

The backend includes server-sent events for live notification updates.

### 5.8 Payment and Wallet System

The payment module uses Stripe for checkout. It supports:

- Creating checkout sessions for job funding.
- Stripe webhook handling.
- Wallet balance retrieval.
- Transaction history.
- Deposit records.
- Withdrawal requests.
- Platform fee records.
- Pseudo-escrow balances for jobs.

The user model tracks:

- Available balance
- Escrow balance
- Total earned
- Total spent

### 5.9 AI Features

The system integrates Google Gemini AI for productivity features:

- Job Architect: creates professional job descriptions from simple prompts.
- Profile Polisher: improves freelancer profile bios and skills.
- Proposal Generator: writes bid proposals based on job and freelancer details.
- Task Breakdown: converts a job description into actionable task items.

AI endpoints are protected and rate-limited.

### 5.10 Media Uploads

Cloudinary is used for media storage. The system supports:

- Profile image upload
- Cover image upload
- Chat attachments
- Signed Cloudinary upload configuration

## 6. Project Structure

```text
Final_Year_Project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── streams/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── index.js
│   ├── _integration_docs/
│   ├── public/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── auth/
│   │   ├── ChatRoom/
│   │   ├── client/
│   │   ├── components/
│   │   ├── context/
│   │   ├── freelancer/
│   │   ├── landing/
│   │   ├── notifications/
│   │   ├── outlet/
│   │   ├── payment/
│   │   ├── profile/
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.tsx
│   │   ├── config.ts
│   │   └── main.tsx
│   ├── router.tsx
│   └── package.json
├── docs/
├── package.json
└── README.md
```

## 7. Backend Architecture

The backend starts from `src/index.js`, connects to MongoDB, creates an HTTP server, initializes Socket.IO, and starts listening on the configured port.

The Express application in `src/app.js` handles:

- CORS configuration
- Request logging
- Global API rate limiting
- Stripe webhook raw body parsing
- JSON body parsing
- Static public files
- Cookie parsing
- Passport initialization
- API route registration
- Health check route
- Global error handling

Main route groups include:

- `/api/v1/users`
- `/api/v1/jobs`
- `/api/v1/bids`
- `/api/v1/ratings`
- `/api/v1/tasks`
- `/api/v1/dashboard`
- `/api/v1/notifications`
- `/api/v1/stream`
- `/api/v1/chats`
- `/api/v1/media`
- `/api/v1/ai`
- `/api/v1/payments`

## 8. Database Models

### User

Stores user account and profile information, including username, email, full name, role, password hash, Google OAuth ID, profile image, cover image, skills, bio, portfolio, rating, wallet balances, and token-related fields.

### Job

Stores job information such as title, description, budget, deadline, category, required skills, currency, status, poster, assigned freelancer, agreed price, and contract status.

### Bid

Stores freelancer bids for jobs, including job reference, freelancer reference, bid amount, message, timeline, and bid status.

### Task

Stores task items for assigned jobs, including title, description, status, assigned user, and approval state.

### Payment

Stores payment and wallet records, including user, job, amount, currency, type, status, Stripe session ID, and Stripe payment intent ID.

### Rating

Stores ratings and reviews, including job reference, reviewer, rated user, numeric rating, and comment.

### Notification

Stores user notifications, including recipient, notification type, message, related ID, read state, and timestamps.

### ChatThread and Message

Stores chat threads between participants and individual chat messages, including participants, job, bid, status, blocking state, last message, unread counts, attachments, and message read status.

## 9. Frontend Architecture

The frontend is a React application configured with Vite and TypeScript. Routing is handled with `createBrowserRouter`.

Important frontend areas include:

- `auth`: registration, login, OAuth success, forgot password, reset password, route guards.
- `client`: client dashboard, post job, all jobs, view bids, notifications, workroom.
- `freelancer`: freelancer dashboard, browse jobs, job details, bids, notifications, workroom.
- `payment`: wallet, payment success, payment cancellation.
- `profile`: user profile page.
- `ChatRoom` and workroom chat components.
- `services`: API handlers for jobs, bids, AI, media, payments, ratings, tasks, notifications, and chats.
- `store`: Zustand stores for authentication and chat state.
- `context`: theme and socket context providers.

## 10. Frontend Routes

Public routes:

- `/`
- `/register`
- `/login`
- `/forgot-password`
- `/reset-password/:token`
- `/oauth-success`
- `/payment-success`
- `/payment-cancelled`
- `/profile`
- `/profile/:userId`

Freelancer routes:

- `/freelancer/freelancerDashboard`
- `/freelancer/jobs`
- `/freelancer/jobs/:jobId`
- `/freelancer/my-bids`
- `/freelancer/profile`
- `/freelancer/notifications`
- `/freelancer/jobs/:jobId/tasks`
- `/freelancer/chat`
- `/freelancer/chat/:jobId`
- `/freelancer/wallet`

Client routes:

- `/client/clientDashboard`
- `/client/postjob`
- `/client/alljobs`
- `/client/view-bids/:jobId`
- `/client/notifications`
- `/client/tasks/:jobId`
- `/client/chat`
- `/client/chat/:jobId`
- `/client/wallet`

## 11. API Summary

### Authentication and Users

- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `POST /api/v1/users/logout`
- `POST /api/v1/users/refresh-token`
- `GET /api/v1/users/google`
- `GET /api/v1/users/google/callback`
- `PATCH /api/v1/users/password/change`
- `POST /api/v1/users/password/forgot`
- `PATCH /api/v1/users/password/reset/:token`
- `GET /api/v1/users/current-user`
- `DELETE /api/v1/users/delete-account`

### Jobs

- `POST /api/v1/jobs`
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/my-jobs`
- `GET /api/v1/jobs/:jobId`
- `PATCH /api/v1/jobs/:jobId`
- `DELETE /api/v1/jobs/:jobId`

### Bids

- `POST /api/v1/bids/:jobId`
- `GET /api/v1/bids/:jobId`
- `GET /api/v1/bids/my-bids`
- `GET /api/v1/bids/job/:jobId/my-bid`
- `PATCH /api/v1/bids/:bidId`
- `PATCH /api/v1/bids/:jobId/:bidId/status`
- `DELETE /api/v1/bids/:jobId/:bidId`

### Tasks

- `POST /api/v1/tasks/:jobId`
- `GET /api/v1/tasks/:jobId`
- `PATCH /api/v1/tasks/:taskId/status`
- `PATCH /api/v1/tasks/:taskId/approve`

### Chat

- `POST /api/v1/chats/start/:bidId`
- `GET /api/v1/chats`
- `GET /api/v1/chats/:threadId/messages`
- `PATCH /api/v1/chats/:threadId/read`
- `DELETE /api/v1/chats/:threadId`
- `DELETE /api/v1/chats/messages/:messageId`
- `POST /api/v1/chats/:threadId/block`
- `POST /api/v1/chats/:threadId/unblock`

### Payments

- `POST /api/v1/payments/checkout/session/:jobId`
- `POST /api/v1/payments/verify-session`
- `GET /api/v1/payments/wallet`
- `POST /api/v1/payments/withdraw`
- `POST /api/v1/payments/webhook`

### AI

- `POST /api/v1/ai/job-architect`
- `POST /api/v1/ai/profile-polisher`
- `POST /api/v1/ai/proposal-generator`
- `POST /api/v1/ai/task-breakdown`

## 12. Environment Variables

The backend requires a `.env` file. The project provides `backend/.env.example`.

Required variables include:

```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/freelance-marketplace
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=your_gemini_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/auth/google/callback
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com
```

## 13. Installation and Setup

### Prerequisites

- Node.js 18 or later
- MongoDB
- Stripe account
- Cloudinary account
- Google OAuth credentials
- Gemini API key
- Email account or SMTP credentials

### Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

The backend runs on:

```text
http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

### Production Build

```bash
cd frontend
npm run build
```

### Backend Production Start

```bash
cd backend
npm start
```

## 14. Security Features

- Password hashing with bcrypt.
- JWT access and refresh token authentication.
- HTTP-only cookie support.
- Protected backend routes through JWT middleware.
- Role-based frontend routing for clients and freelancers.
- Google OAuth support through Passport.js.
- Rate limiting for global API routes, authentication routes, AI routes, and payment routes.
- Standardized error handling.
- Sensitive fields hidden from serialized user responses.
- Stripe webhook signature support.
- Environment variables for secrets and third-party credentials.

## 15. Testing and Quality Notes

The project includes formatting and linting scripts:

Backend:

```bash
npm run format
npm run lint
```

Frontend:

```bash
npm run lint
npm run build
```

Recommended future testing additions:

- Unit tests for controllers and services.
- Integration tests for authentication, jobs, bids, payments, and chat.
- Frontend component tests for major pages.
- End-to-end tests for client and freelancer workflows.
- Stripe webhook test coverage.

## 16. Future Enhancements

- Add admin dashboard for platform moderation.
- Add automated dispute resolution workflow.
- Add milestone-based payments.
- Add freelancer verification.
- Add job recommendation engine.
- Add advanced search filters.
- Add file sharing permissions per chat thread.
- Add automated test suite.
- Add deployment documentation for frontend, backend, database, and environment configuration.

## 17. Conclusion

The Final Year Project is a comprehensive freelance marketplace application that demonstrates full-stack development, authentication, database design, real-time communication, payment integration, cloud media management, and AI-assisted workflows. The project has a clear separation between frontend and backend responsibilities and includes several production-style features commonly required in modern SaaS marketplace platforms.
