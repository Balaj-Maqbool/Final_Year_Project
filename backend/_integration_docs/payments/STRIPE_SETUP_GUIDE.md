# Payment Module Integration Guide

This document provides technical details for developers to integrate, test, and verify the Payment module.

---

## 🛠 1. Local Setup (The 3-Terminal Rule)

To test end-to-end payments on your local machine, you must have three horizontal processes running.

### A. Stripe CLI (The Webhook Forwarder)

Stripe cannot send data to your `localhost` without a bridge.

1.  **Download:** Ensure Stripe CLI is installed (`stripe` in terminal).
2.  **Login:** `stripe login`
    - _Will open a browser. Click 'Allow' to authorize._
3.  **Forward Webhooks:**
    ```bash
    stripe listen --forward-to localhost:8000/api/v1/payments/webhook
    ```
4.  **Important:** Copy the `whsec_...` secret printed in the console and put it in `.env` as `STRIPE_WEBHOOK_SECRET`.

### B. Backend Server

1.  `npm run dev`
2.  Ensure `.env` has:
    - `STRIPE_SECRET_KEY`
    - `STRIPE_WEBHOOK_SECRET`
    - `FRONTEND_URL` (for success/cancel redirects)

### C. Frontend App

1.  Run your frontend development server.

---

## 🏗 2. Implementation Flow

- **URL Redirects:** Ensure `FRONTEND_URL` is set in `.env` for success/cancel redirects.
- **Meta Data:** The backend automatically attaches `jobId`, `clientId`, and `freelancerId` to Stripe metadata for asynchronous fulfillment.

---

## 🧪 3. Manual Webhook Testing (No Browser Needed)

If you want to test if your escrow logic works without actually going to a Stripe page:

```bash
# Triggers a fake 'success' event to your local webhook endpoint
stripe trigger checkout.session.completed --add checkout_session:metadata.jobId={{jobId}} --add checkout_session:metadata.clientId={{clientId}} --add checkout_session:metadata.freelancerId={{freelancerId}}
```

---

## 📑 4. Key Statuses

| Field             | Status      | Definition               |
| :---------------- | :---------- | :----------------------- |
| `contract_status` | `Pending`   | Accepted but not funded. |
| `contract_status` | `Active`    | Funded and in Escrow.    |
| `contract_status` | `Fulfilled` | Released to Freelancer.  |
