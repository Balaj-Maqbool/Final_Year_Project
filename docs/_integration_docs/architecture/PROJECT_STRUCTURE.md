# 📂 Project Structure Map

This document provides a visual and descriptive overview of the backend directory structure.

## 🌳 Directory Tree

```text
backend/
├── .github/                # Automation Workflows
│   └── workflows/          # GitHub Actions (CI/CD)
├── _integration_docs/      # 📖 Project Knowledge Base
│   ├── api_references/     # Postman & Endpoint Specs
│   ├── architecture/       # Deep dives (Master Guide, Structure)
│   ├── frontend_guides/    # React/Frontend Integration guides
│   ├── payments/           # Stripe & Escrow technical docs
│   └── PROJECT_ROADMAP.md  # Historical Task Tracker
├── public/                 # Static Assets (Templates/Images)
├── src/                    # 🚀 Source Code
│   ├── config/             # Third-party service initializers
│   ├── controllers/        # Request handlers (Gatekeepers)
│   ├── middlewares/        # Security & Validation guards
│   ├── models/             # Database Schemas (Mongoose)
│   ├── routes/             # API Endpoints mapping
│   ├── services/           # Business Logic (Brain)
│   ├── streams/            # Real-time (Socket.io/SSE)
│   ├── utils/              # Generic Helpers & Toolkit
│   ├── app.js              # Express App configuration
│   └── index.js            # Server entry point
├── .editorconfig           # IDE Consistency settings
├── .env.example            # Environment Variable template
├── .gitignore              # Files to ignore in Git
├── .prettierignore         # Files to ignore in Prettier
├── .prettierrc             # Code Formatting rules
├── package.json            # Dependencies & Scripts
└── Readme.md               # Main Project Overview
```

## 🛠️ Main Component Roles

| Folder | Responsibility |
| :--- | :--- |
| **`controllers/`** | Validates incoming requests and returns standardized `ApiResponse`. |
| **`services/`** | Handles complex logic (AI orchestration, Stripe math, Notifications). |
| **`models/`** | Defines data structures and performs aggregation logic. |
| **`streams/`** | Manages ephemeral real-time connections (WebSockets/SSE). |
| **`middlewares/`** | Centralizes security (JWT, Rate-Limiting, Multer). |
| **`_integration_docs/`** | Essential "Source of Truth" for frontend and documentation. |
