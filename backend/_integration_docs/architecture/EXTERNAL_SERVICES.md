# 🔌 Third-Party Service Map

This document tracks all external APIs and services integrated into the backend.

## 🛠️ Core Services

| Service | Purpose | Dashboard Link | Key Env Variables |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | AI content generation & JSON structuring. | [Google AI Studio](https://aistudio.google.com/) | `GEMINI_API_KEY` |
| **Stripe** | Payment processing & Escrow webhooks. | [Stripe Dashboard](https://dashboard.stripe.com/) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Cloudinary** | Image & Media storage for Profiles/Jobs. | [Cloudinary Console](https://cloudinary.com/console) | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Google Cloud** | OAuth 2.0 (Google Login) integration. | [Google Cloud Console](https://console.cloud.google.com/) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **Nodemailer** | SMTP Email delivery (Verification/Reset). | *Dependent on Provider* | `EMAIL_USER`, `EMAIL_PASS` |
| **MongoDB Atlas** | Managed Database & Search Indexes. | [MongoDB Atlas](https://cloud.mongodb.com/) | `MONGODB_URI` |

## ⚙️ Service Roles

### 🤖 Google Gemini (AI)
- **Use Case**: Generating job descriptions, optimizing user bios, and breaking jobs into actionable tasks.
- **Library**: `@google/generative-ai`
- **Fallback**: Configured in `src/config/ai.config.js`.

### 💳 Stripe (Payments)
- **Use Case**: Secure Checkout Sessions and Webhook-based escrow funding.
- **Workflow**: Client creates session -> Stripe notifies backend via webhook -> backend funds freelancer's escrow.
- **Local Testing**: Requires `stripe-cli` for webhook forwarding.

### ☁️ Cloudinary (Storage)
- **Use Case**: Handling high-quality avatar and cover photo uploads.
- **Integration**: Works with `multer` via `src/middlewares/multer.middleware.js` and `src/utils/cloudinary.utils.js`.

### 📧 SMTP (Nodemailer)
- **Use Case**: sending OTPs, verification links, and system alerts.
- **Provider**: Typically Gmail (using App Passwords) or specialized services like SendGrid/Mailtrap.
- **Templates**: Custom HTML templates stored in `src/utils/emailTemplates.js`.
