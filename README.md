# Advanced AI-driven Freelancing Marketplace

A full-stack freelancing marketplace built as a Final Year Project. The platform connects clients and freelancers through secure role-based accounts, job posting, bidding, AI-assisted writing, Stripe-powered pseudo-escrow payments, task-based workrooms, real-time chat, notifications, ratings, and wallet management.

The project is designed as a practical MERN-style software product, not just a prototype screen set. It includes a real backend API, MongoDB models, protected REST routes, Socket.io messaging, Server-Sent Events, Google Gemini AI workflows, Cloudinary media support, Stripe checkout and webhook handling, and a React/Vite frontend connected through service handlers and React Query.

## Live Demo

- Frontend: [https://pakfreelanceforntend.onrender.com/](https://pakfreelanceforntend.onrender.com/)
- Backend API base URL: [https://pakfreelance.onrender.com](https://pakfreelance.onrender.com)
- Local frontend URL: `http://localhost:5173`
- Local backend URL: `http://localhost:8000`

> Note: Render free-tier deployments may take a short time to wake up after inactivity.

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Core Objectives](#core-objectives)
- [Team Members and Responsibilities](#team-members-and-responsibilities)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Application Modules](#application-modules)
- [Database Design](#database-design)
- [API Overview](#api-overview)
- [AI Workflows](#ai-workflows)
- [Payment and Pseudo-Escrow Flow](#payment-and-pseudo-escrow-flow)
- [Real-Time Communication](#real-time-communication)
- [Security Highlights](#security-highlights)
- [Local Setup Guide](#local-setup-guide)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Deployment Notes](#deployment-notes)
- [Known Limitations](#known-limitations)
- [Future Enhancements](#future-enhancements)
- [Documentation](#documentation)
- [License](#license)

## Project Overview

The Advanced AI-driven Freelancing Marketplace is a web-based platform where clients can post work, freelancers can bid on jobs, both parties can communicate in real time, and project payments can be funded through a Stripe-backed pseudo-escrow workflow.

The system supports two main user roles:

- Client: posts jobs, reviews bids, accepts freelancers, funds contracts, creates tasks, approves completed work, manages spending, and rates freelancers.
- Freelancer: browses jobs, writes bids, uses AI-generated proposals, works on assigned tasks, chats with clients, tracks escrow and available balances, and requests withdrawals.

The platform also integrates Google Gemini AI to reduce blank-page friction for users. Clients can generate professional job details from rough ideas, freelancers can generate proposal drafts, users can polish profiles, and accepted work can be broken down into task-board items.

## Problem Statement

Traditional freelance hiring often suffers from three major issues:

1. Clients struggle to write clear job descriptions.
2. Freelancers struggle to write professional proposals.
3. Both sides need better payment trust before work begins.

Many local freelance arrangements happen through informal chat or social media, where there is no structured bidding history, no task tracking, no wallet record, and no escrow-like funding state. This project solves those issues by combining marketplace workflows, generative AI, real-time collaboration, and secure payment processing in one application.

## Core Objectives

- Build a role-based freelancing marketplace for clients and freelancers.
- Provide JWT-based authentication with refresh token support and protected routes.
- Support job posting, job browsing, bidding, bid acceptance, and bid rejection.
- Integrate Google Gemini AI into job creation, profile polishing, proposal writing, and task breakdown workflows.
- Implement a Stripe Checkout payment flow with webhook verification.
- Model a pseudo-escrow wallet system with escrow balance, available balance, total earned, and total spent.
- Provide task-based workrooms for assigned jobs.
- Enable real-time chat through Socket.io.
- Send live notifications through Socket.io and Server-Sent Events.
- Store project data in MongoDB using Mongoose models.
- Provide a clear, testable REST API for frontend integration.

## Team Members and Responsibilities

The project responsibilities were intentionally separated to avoid overlap.

| Team Member | Role | Core Contributions |
| --- | --- | --- |
| Balaj Maqbool | Backend Engineer | Backend architecture, REST API development, MongoDB schema design, JWT auth, Stripe checkout and webhooks, Gemini AI integration, Cloudinary integration, Socket.io/SSE backend, Postman API testing |
| Noman Asghar | Frontend Developer | React/Vite UI implementation, protected routing, Zustand state management, React Query integration, frontend API handlers, chat UI integration, wallet and dashboard screens |
| Nabeel Pervaiz | UI/UX Designer and Documentation Lead | Requirements analysis, SRS gathering, UI/UX planning, usability testing, documentation structure, project report and thesis support |

## Key Features

### Authentication and User Management

- Register as Client or Freelancer.
- Login with email or username.
- Role-aware login validation.
- JWT access token and refresh token support.
- HTTP-only cookie support for browser sessions.
- Google OAuth support through Passport.js.
- Forgot password and reset password workflow.
- Change password workflow.
- Delete account with active-work restrictions.
- Public and private profile management.
- Profile image and cover image support.

### Client Features

- Create new jobs with title, description, budget, deadline, category, and required skills.
- Use AI Job Architect to generate job details from a rough prompt.
- View all posted jobs.
- View bids received for a job.
- Accept or reject freelancer bids.
- Fund accepted work through Stripe Checkout.
- Create tasks for assigned work.
- Use AI Task Breakdown to generate workroom tasks.
- Approve completed tasks.
- Request or complete job closure.
- View wallet and transaction history.
- Receive notifications for bids, messages, task updates, and payment events.
- Rate freelancers after work completion.

### Freelancer Features

- Browse open jobs.
- Search and filter jobs.
- View job details.
- Generate professional proposals using Gemini AI.
- Submit, update, and withdraw bids.
- View personal bid history.
- Receive bid acceptance or rejection updates.
- Access assigned workroom tasks.
- Update task status: To Do, In Progress, Done.
- Request final payment release.
- Chat with clients in real time.
- View escrow balance, available balance, total earned, and transactions.
- Request withdrawals from available balance.
- Polish profile bio and skills using AI.

### AI Features

- Job Architect: turns a rough client idea into a professional job post.
- Profile Polisher: improves user bio and suggests relevant skills.
- Proposal Generator: creates a bid proposal using job and profile context.
- Task Breakdown: converts a job description into actionable tasks.

### Payment and Wallet Features

- Stripe Checkout session creation.
- Stripe webhook verification with raw request body parsing.
- Pseudo-escrow contract state.
- Client spending tracking.
- Freelancer escrow balance tracking.
- Freelancer available balance tracking.
- Withdrawal request flow.
- Transaction history through Payment records.

### Real-Time Features

- Socket.io authenticated connections.
- Real-time chat rooms.
- Message send and receive events.
- Message read status.
- Typing indicators.
- Global new message notifications.
- Persistent notification records.
- Server-Sent Events for live update streams.

## System Architecture

The system follows a client-server architecture.

```text
React/Vite Frontend
        |
        | HTTP REST API with credentials
        v
Express.js Backend API
        |
        | Mongoose
        v
MongoDB Database

Express Backend also integrates with:
- Stripe Checkout and Webhooks
- Google Gemini AI
- Cloudinary Media Storage
- Google OAuth
- SMTP/Nodemailer
- Socket.io
- Server-Sent Events
```

High-level backend request flow:

```text
Frontend Component
    -> Service Handler
    -> apiClient.ts
    -> Express Route
    -> JWT Middleware
    -> Controller
    -> Service or Model
    -> MongoDB / External API
    -> ApiResponse
    -> React Query cache update
```

## Technology Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| React 19 | Component-based user interface |
| TypeScript | Type safety for frontend code |
| Vite | Fast development server and build tool |
| React Router | Client-side routing and protected layouts |
| Zustand | Global auth/user state |
| TanStack React Query | Server-state fetching, caching, and mutation handling |
| Socket.io Client | Real-time chat and notifications |
| Bootstrap / React Bootstrap | UI components and responsive layout |
| React Hot Toast | User feedback and live notifications |
| Framer Motion | UI interaction and animation support |
| Axios / Fetch | API communication |

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB schema modeling |
| JWT | Access and refresh token authentication |
| bcryptjs | Password hashing |
| Passport.js | Google OAuth integration |
| Stripe | Checkout sessions and payment webhooks |
| Socket.io | Real-time chat and events |
| Server-Sent Events | Lightweight real-time notifications |
| Google Gemini AI | Generative AI features |
| Cloudinary | Image and media storage |
| Multer | File upload middleware support |
| Nodemailer | Email sending |
| rate-limiter-flexible | API and socket rate limiting |
| dotenv | Environment configuration |

## Repository Structure

```text
Final_Year_Project/
|
|-- backend/
|   |-- src/
|   |   |-- app.js
|   |   |-- index.js
|   |   |-- constants.js
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- streams/
|   |   |-- utils/
|   |-- _integration_docs/
|   |-- public/
|   |-- package.json
|   |-- .env.example
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- auth/
|   |   |-- ChatRoom/
|   |   |-- client/
|   |   |-- components/
|   |   |-- context/
|   |   |-- freelancer/
|   |   |-- landing/
|   |   |-- notifications/
|   |   |-- outlet/
|   |   |-- payment/
|   |   |-- profile/
|   |   |-- services/
|   |   |-- store/
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |-- router.tsx
|   |-- package.json
|
|-- docs/
|-- FYP_Documentation.md
|-- README.md
```

## Application Modules

### Backend Modules

| Module | Main Files | Description |
| --- | --- | --- |
| Auth | `auth.routes.js`, `auth.controller.js`, `auth.service.js`, `user.model.js` | Registration, login, refresh tokens, OAuth, password reset, account deletion |
| Profile | `profile.routes.js`, `profile.controller.js` | Profile data, avatar, cover image, public profile lookup |
| Jobs | `job.routes.js`, `job.controller.js`, `job.model.js` | Job CRUD, search, filtering, ownership validation |
| Bids | `bid.routes.js`, `bid.controller.js`, `bid.model.js` | Bid placement, bid listing, acceptance, rejection, withdrawal |
| Tasks | `task.routes.js`, `task.controller.js`, `task.model.js` | Workroom tasks, status updates, approval workflow |
| Payments | `payment.routes.js`, `payment.controller.js`, `payment.model.js` | Stripe checkout, webhook, wallet, withdrawal |
| Chat | `chat.routes.js`, `chat.controller.js`, `chat.service.js`, `chat.model.js` | Chat threads, messages, read status, block/unblock |
| Notifications | `notification.routes.js`, `notification.controller.js`, `notification.service.js`, `notification.model.js` | Persistent notifications and real-time dispatch |
| AI | `ai.routes.js`, `ai.controller.js`, `ai.service.js`, `ai.config.js` | Gemini-powered structured generation |
| Media | `media.routes.js`, `media.controller.js`, Cloudinary utils | Signed upload configuration |
| Streams | `SocketManager.js`, `SSEManager.js` | Real-time messaging and event streams |

### Frontend Modules

| Module | Main Files | Description |
| --- | --- | --- |
| Auth | `src/auth/*` | Login, register, reset password, role guards |
| Client | `src/client/*` | Client dashboard, job posting, bids, tasks, notifications |
| Freelancer | `src/freelancer/*` | Freelancer dashboard, job browsing, bids, task workroom |
| Chat | `src/ChatRoom/*`, `src/client/WorkRoom/Chat.tsx` | Thread list, chat window, messages, input |
| Payment | `src/payment/*` | Wallet, payment success, payment cancellation |
| Profile | `src/profile/ProfilePage.tsx` | Public/private profile view and edit |
| Services | `src/services/*` | API handlers for jobs, bids, payments, AI, chat, media, ratings, tasks |
| Store | `src/store/*` | Zustand auth and chat stores |
| Context | `src/context/*` | Socket and theme providers |

## Database Design

The backend uses MongoDB with Mongoose schemas.

| Collection | Purpose | Important Fields |
| --- | --- | --- |
| User | Stores account, profile, role, and wallet data | `username`, `email`, `fullName`, `role`, `skills`, `bio`, `availableBalance`, `escrowBalance`, `totalEarned`, `totalSpent` |
| Job | Stores client job posts and contract state | `title`, `description`, `budget`, `deadline`, `category`, `status`, `poster_id`, `assigned_to`, `agreed_price`, `contract_status` |
| Bid | Stores freelancer offers | `job_id`, `user_id`, `bid_amount`, `message`, `timeline`, `status` |
| Task | Stores workroom task progress | `job_id`, `title`, `description`, `status`, `assigned_user_id`, `is_approved` |
| Payment | Stores transaction and wallet history | `user`, `job`, `amount`, `currency`, `type`, `status`, `stripeSessionId`, `stripePaymentIntentId` |
| ChatThread | Stores conversation context | `participants`, `jobId`, `bidId`, `status`, `lastMessage`, `unreadCounts` |
| Message | Stores individual chat messages | `threadId`, `from`, `to`, `content`, `status`, `replyTo`, `attachments`, `isDeleted` |
| Notification | Stores persistent alerts | `recipient`, `type`, `message`, `relatedId`, `isRead` |
| Rating | Stores reviews | `job_id`, `rated_by_user_id`, `rated_user_id`, `rating`, `comment` |

## API Overview

All backend routes are mounted under:

```text
/api/v1
```

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/users/register` | Register a new user |
| POST | `/users/login` | Login user |
| POST | `/users/logout` | Logout and clear cookies |
| POST | `/users/refresh-token` | Refresh access token |
| GET | `/users/me` | Get current authenticated user |
| GET | `/users/current-user` | Get current authenticated user through auth route |
| GET | `/users/google` | Start Google OAuth |
| GET | `/users/google/callback` | Google OAuth callback |
| PATCH | `/users/password/change` | Change password |
| POST | `/users/password/forgot` | Send password reset email |
| PATCH | `/users/password/reset/:token` | Reset password |
| DELETE | `/users/delete-account` | Delete authenticated account |

### Jobs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/jobs` | Create a job as Client |
| GET | `/jobs` | Get open jobs with optional filters |
| GET | `/jobs/my-jobs` | Get jobs posted by current Client |
| GET | `/jobs/:jobId` | Get job details |
| PATCH | `/jobs/:jobId` | Update job |
| DELETE | `/jobs/:jobId` | Delete job |
| POST | `/jobs/:jobId/request-payment` | Freelancer requests payment release |

### Bids

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/bids/:jobId` | Place a bid |
| GET | `/bids/:jobId` | Get bids for a job |
| GET | `/bids/my-bids` | Get freelancer's bids |
| GET | `/bids/my/:jobId` | Get current freelancer bid for a job |
| PATCH | `/bids/:jobId/:bidId/status` | Accept or reject a bid |
| PUT | `/bids/bid/:bidId` | Update a pending bid |
| DELETE | `/bids/:jobId/:bidId` | Withdraw a bid |

### Payments

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/payments/checkout/session/:jobId` | Create Stripe Checkout session |
| POST | `/payments/webhook` | Stripe webhook endpoint |
| POST | `/payments/verify-session` | Verify checkout session |
| GET | `/payments/wallet` | Get wallet and transaction history |
| POST | `/payments/withdraw` | Request withdrawal |

### AI

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/ai/job-architect` | Generate job details |
| POST | `/ai/profile-polisher` | Improve bio and skills |
| POST | `/ai/proposal-generator` | Generate proposal text |
| POST | `/ai/task-breakdown` | Generate task list |

### Chat

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/chats/start/:bidId` | Start or get chat thread |
| GET | `/chats` | Get current user's threads |
| GET | `/chats/:threadId/messages` | Get messages |
| POST | `/chats/:threadId/messages` | Send message through REST |
| PATCH | `/chats/:threadId/read` | Mark messages as read |
| DELETE | `/chats/messages/:messageId` | Delete message |
| POST | `/chats/:threadId/block` | Block thread |
| POST | `/chats/:threadId/unblock` | Unblock thread |

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/tasks/:jobId` | Create task for assigned job |
| GET | `/tasks/:jobId` | Get job tasks |
| PATCH | `/tasks/:taskId/status` | Update task status |
| PATCH | `/tasks/:taskId/approve` | Approve completed task |
| PUT | `/tasks/:taskId` | Update task details |
| DELETE | `/tasks/:taskId` | Delete task |

### Notifications

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/notifications` | Get user notifications |
| PATCH | `/notifications/read/:notificationId` | Mark one notification as read |
| PATCH | `/notifications/read-all` | Mark all notifications as read |
| DELETE | `/notifications/delete/:notificationId` | Delete notification |

More API details are available in:

- [Backend API Documentation](backend/_integration_docs/api_references/API_DOCUMENTATION.md)
- [Postman Setup](backend/_integration_docs/api_references/POSTMAN_SETUP.md)

## AI Workflows

The AI module uses Google Gemini through backend endpoints. The frontend never calls Gemini directly. This keeps API keys private and allows the backend to validate input and normalize generated output.

```text
Frontend AI Button
    -> aiHandler.ts
    -> /api/v1/ai/*
    -> ai.controller.js
    -> ai.service.js
    -> Google Gemini
    -> JSON parsed response
    -> Frontend form fields
```

The backend asks Gemini to return JSON only, then cleans common markdown wrappers and parses the response. This is useful for form workflows because the UI can place AI output directly into editable fields.

## Payment and Pseudo-Escrow Flow

The payment system uses Stripe Checkout and a database-backed pseudo-escrow model.

```text
1. Client posts a job.
2. Freelancer submits a bid.
3. Client accepts the bid.
4. Job becomes Assigned.
5. Contract status remains Pending.
6. Client creates a Stripe Checkout session.
7. Client pays on Stripe-hosted page.
8. Stripe sends checkout.session.completed webhook.
9. Backend verifies webhook signature.
10. Backend updates job contract_status to Active.
11. Freelancer escrowBalance increases.
12. After work approval, funds can move to availableBalance.
13. Freelancer can request withdrawal.
```

Important payment controls:

- Only Clients can initiate checkout.
- A Client can fund only their own job.
- A job must be assigned before checkout.
- A contract must be Pending before checkout.
- Stripe webhook must be verified before balance updates.
- Withdrawals are blocked if availableBalance is insufficient.

## Real-Time Communication

The platform uses two real-time approaches:

### Socket.io

Used for:

- Chat messages
- Joining and leaving chat threads
- Typing indicators
- Message read status
- New message notifications
- Online user tracking

### Server-Sent Events

Used for:

- Live notification streams
- Dashboard update events
- Lightweight one-way server updates

This combination keeps chat responsive while still supporting simple event streams for dashboard and notification updates.

## Security Highlights

- Password hashing with `bcryptjs`.
- JWT access and refresh tokens.
- HTTP-only cookie support.
- Role-based backend authorization.
- Ownership checks for jobs, bids, payments, tasks, and chats.
- Stripe raw-body webhook verification.
- Rate limiting for auth, payments, media, AI, global API traffic, and socket messages.
- Sensitive user fields removed from JSON responses.
- CORS configured with credentials.
- Centralized error handling through `ApiError`.
- Standardized success responses through `ApiResponse`.

## Local Setup Guide

### Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm
- MongoDB local instance or MongoDB Atlas connection
- Stripe test account
- Google Gemini API key
- Cloudinary account
- SMTP email account or app password

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Final_Year_Project
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Backend Environment

Create a `.env` file inside the `backend` folder.

Important: the current backend code reads the database variable as `DataBase_URI` from `backend/src/constants.js`.

```env
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

DataBase_URI=mongodb://127.0.0.1:27017

ACCESS_TOKEN_SECRET=replace_with_access_secret
ACCESS_TOKEN_EXPIRY=1hr
REFRESH_TOKEN_SECRET=replace_with_refresh_secret
REFRESH_TOKEN_EXPIRY=3d

STRIPE_SECRET_KEY=sk_test_replace
STRIPE_WEBHOOK_SECRET=whsec_replace

GEMINI_API_KEY=replace_with_gemini_key

CLOUDINARY_CLOUD_NAME=replace_with_cloud_name
CLOUDINARY_API_KEY=replace_with_cloudinary_key
CLOUDINARY_API_SECRET=replace_with_cloudinary_secret
CLOUDINARY_ROOT_FOLDER=FreelanceMarketplace

GOOGLE_CLIENT_ID=replace_with_google_client_id
GOOGLE_CLIENT_SECRET=replace_with_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/users/google/callback

SMTP_EMAIL=replace_with_email
SMTP_PASSWORD=replace_with_app_password
SMTP_FROM_NAME=PakFreelance

FRONTEND_LOGIN_PATH=/login
FRONTEND_OAUTH_SUCCESS_PATH=/oauth-success
FRONTEND_RESET_PASSWORD_PATH=/reset-password
FRONTEND_DASHBOARD_PATH=/dashboard
```

The backend app connects to:

```text
${DataBase_URI}/FreelanceMarketplace
```

So if `DataBase_URI=mongodb://127.0.0.1:27017`, the final database becomes:

```text
mongodb://127.0.0.1:27017/FreelanceMarketplace
```

### 5. Run Backend

```bash
cd backend
npm run dev
```

Expected local API:

```text
http://localhost:8000
```

Health check:

```text
GET http://localhost:8000/
```

### 6. Run Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

Expected local frontend:

```text
http://localhost:5173
```

## Environment Variables

| Variable | Required | Used By | Description |
| --- | --- | --- | --- |
| `PORT` | Yes | Backend | Express server port |
| `NODE_ENV` | Yes | Backend | Development or production mode |
| `CORS_ORIGIN` | Yes | Backend | Allowed frontend origin |
| `FRONTEND_URL` | Yes | Backend | Redirect base URL for Stripe/OAuth/password reset |
| `DataBase_URI` | Yes | Backend | MongoDB connection base URI |
| `ACCESS_TOKEN_SECRET` | Yes | Backend | JWT access token secret |
| `ACCESS_TOKEN_EXPIRY` | Yes | Backend | Access token lifetime |
| `REFRESH_TOKEN_SECRET` | Yes | Backend | JWT refresh token secret |
| `REFRESH_TOKEN_EXPIRY` | Yes | Backend | Refresh token lifetime |
| `STRIPE_SECRET_KEY` | Yes | Backend | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Backend | Stripe webhook signing secret |
| `GEMINI_API_KEY` | Yes | Backend | Google Gemini API key |
| `CLOUDINARY_CLOUD_NAME` | Yes | Backend | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Backend | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Backend | Cloudinary API secret |
| `CLOUDINARY_ROOT_FOLDER` | Optional | Backend | Cloudinary folder name |
| `GOOGLE_CLIENT_ID` | Optional | Backend | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Backend | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Optional | Backend | Google OAuth callback URL |
| `SMTP_EMAIL` | Optional | Backend | Email sender account |
| `SMTP_PASSWORD` | Optional | Backend | Email sender password/app password |
| `SMTP_FROM_NAME` | Optional | Backend | Email sender name |

## Available Scripts

### Backend

Run from `backend/`.

| Command | Description |
| --- | --- |
| `npm run dev` | Start backend with nodemon |
| `npm start` | Start backend with Node |
| `npm run format` | Format backend files with Prettier |
| `npm run lint` | Check formatting with Prettier |

### Frontend

Run from `frontend/`.

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build frontend |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Testing and Quality Assurance

Testing was performed around the system's most important workflows.

### Backend/API Testing

Primary responsibility: Balaj Maqbool

Covered areas:

- Registration and login
- Role mismatch login prevention
- Token refresh
- Job CRUD
- Job filtering
- Bid placement
- Duplicate bid prevention
- Bid acceptance and rejection
- Stripe checkout session creation
- Stripe webhook processing
- Wallet balance retrieval
- Withdrawal validation
- AI endpoint responses
- Task creation and approval
- Notification CRUD
- Chat thread and message APIs

### Frontend Integration Testing

Primary responsibility: Noman Asghar

Covered areas:

- Protected routes
- Client dashboard workflow
- Freelancer dashboard workflow
- Job posting form
- AI-generated job details
- Job browsing and bidding
- Bid acceptance and Stripe redirect
- Wallet display
- Chat screens
- Notification pages
- React Query cache updates

### Usability and Documentation Testing

Primary responsibility: Nabeel Pervaiz

Covered areas:

- Client workflow clarity
- Freelancer workflow clarity
- Navigation consistency
- Requirements validation
- SRS completeness
- UI/UX feedback
- Documentation structure

### Important Payment Test Scenarios

| Scenario | Expected Result |
| --- | --- |
| Client funds own assigned job | Stripe session is created |
| Client funds another client's job | Request is rejected |
| Client funds an unassigned job | Request is rejected |
| Client funds an already active contract | Request is rejected |
| Stripe webhook is valid | Contract becomes Active and wallet balances update |
| Freelancer withdraws too much | Request is rejected |

## Deployment Notes

The current frontend config uses:

```ts
export const BACKEND_URL =
  import.meta.env.MODE === "production"
    ? "https://pakfreelance.onrender.com"
    : "http://localhost:8000";
```

For deployment:

1. Deploy backend with all required environment variables.
2. Set backend CORS origin to the deployed frontend URL.
3. Set frontend production backend URL correctly.
4. Configure Stripe webhook endpoint:

```text
https://your-backend-domain.com/api/v1/payments/webhook
```

5. Configure Google OAuth callback:

```text
https://your-backend-domain.com/api/v1/users/google/callback
```

6. Use secure production secrets.
7. Use HTTPS in production.
8. Keep `.env` files out of Git.

## Known Limitations

- Stripe is implemented as a pseudo-escrow model, not a licensed financial escrow service.
- Withdrawal is modeled inside the application and would need real payout integration for production.
- Admin dispute resolution is not fully implemented.
- Native mobile apps are not included.
- AI responses should be reviewed by users before submission.
- Large-scale automated testing and CI/CD pipelines can be added in future versions.
- Render free-tier services may sleep after inactivity.

## Future Enhancements

- Admin dashboard for dispute resolution and moderation.
- Milestone-based payments.
- Real payout integration for withdrawals.
- Advanced freelancer-client matching algorithm.
- Search by skills, rating, budget, and availability.
- Push notifications.
- Email notification preferences.
- File attachments in workrooms and chat with stronger moderation.
- Automated unit and integration tests.
- End-to-end browser tests with Playwright.
- Docker-based local development.
- CI/CD pipeline for linting, testing, and deployment.
- Native mobile app using React Native.

## Documentation

Additional project documentation is available in the repository:

- [FYP Documentation](FYP_Documentation.md)
- [Backend Architecture Guide](backend/_integration_docs/architecture/BACKEND_ARCHITECTURE.md)
- [Project Structure Guide](backend/_integration_docs/architecture/PROJECT_STRUCTURE.md)
- [External Services Guide](backend/_integration_docs/architecture/EXTERNAL_SERVICES.md)
- [API Documentation](backend/_integration_docs/api_references/API_DOCUMENTATION.md)
- [Postman Setup](backend/_integration_docs/api_references/POSTMAN_SETUP.md)
- [Stripe Setup Guide](backend/_integration_docs/payments/STRIPE_SETUP_GUIDE.md)
- [Advanced Payment Tests](backend/_integration_docs/payments/ADVANCED_PAYMENT_TESTS.md)
- [Frontend Chat Guide](backend/_integration_docs/frontend_guides/FRONTEND_CHAT_GUIDE.md)
- [Frontend Media Guide](backend/_integration_docs/frontend_guides/FRONTEND_MEDIA_GUIDE.md)
- [SSE Frontend Guide](backend/_integration_docs/frontend_guides/SSE_FRONTEND_GUIDE.md)

## Academic Context

This repository was developed as a Final Year Project for a software engineering program. It demonstrates:

- Requirement engineering
- SRS preparation
- Client-server architecture
- REST API development
- Frontend integration
- Database schema design
- Third-party API integration
- Real-time communication
- Payment workflow design
- AI-assisted software features
- Testing and quality assurance
- Technical documentation

## License

The backend currently includes an ISC license declaration in `backend/package.json`. If this repository is published publicly, add a root `LICENSE` file that matches the intended project license.

## Project Status

The project is actively maintained as an academic full-stack application and deployment-ready prototype. Core marketplace, AI, chat, payment, wallet, notification, and task workflows are implemented.
