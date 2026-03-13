# Payment Module Integration Guide

This document provides technical details for developers to integrate, test, and verify the Payment module.

---

## 🛠 1. Local Setup (The 3-Terminal Rule)

To test end-to-end payments on your local machine, you must have three horizontal processes running.

### A. Stripe CLI (The Webhook Forwarder)
Stripe cannot send data to your `localhost` without a bridge.
1.  **Download:** Ensure Stripe CLI is installed (`stripe` in terminal).
2.  **Login:** `stripe login`
    *   *Will open a browser. Click 'Allow' to authorize.*
3.  **Forward Webhooks:** 
    ```bash
    stripe listen --forward-to localhost:8000/api/v1/payments/webhook
    ```
4.  **Important:** Copy the `whsec_...` secret printed in the console and put it in `.env` as `STRIPE_WEBHOOK_SECRET`.

### B. Backend Server
1.  `npm run dev`
2.  Ensure `.env` has:
    *   `STRIPE_SECRET_KEY`
    *   `STRIPE_WEBHOOK_SECRET`
    *   `FRONTEND_URL` (for success/cancel redirects)

### C. Frontend App
1.  Run your frontend development server.

---

## 🏗 2. Implementation Logic (UI Pattern)

### 1. Bid Acceptance (Start)
When the Client accepts a bid:
*   **Action:** `PATCH /api/v1/bids/:jobId/:bidId/status` -> `{ status: "Accepted" }`
*   **Result:** Backend sets `job.contract_status = "Pending"`.
*   **Currency:** The Job now has a `currency` field (`"usd"` or `"pkr"`).
*   **UI:** Hide the "Accept" button. Show a "Pay" button.

### 2. The "Payment Gate" Pattern (UI Blocking)
To protect your platform, the Client MUST be blocked from sensitive features until `contract_status === "Active"`.

#### Gated Features (Blocked if Status is 'Pending'):
*   **ChatBox:** Prevent sending/receiving messages (hide the input or show a "Pay to Chat" overlay).
*   **Task Management:** Block creating, assigning, or updating tasks.
*   **Dashboard Details:** Hide specific job progress metrics.

#### Suggested UI Logic:
```javascript
// High-level 'Access Guard' pattern
const canProceed = job.contract_status === "Active";

return (
  <div className="job-workspace">
    {!canProceed && (
      <div className="blocking-overlay">
        <h2>🔒 Payment Required</h2>
        <p>You have accepted a bid! Fund the escrow to unlock collaboration tools.</p>
        <button className="primary-btn" onClick={initiateStripeCheckout}>
          Pay Now ($ {job.agreed_price})
        </button>
      </div>
    )}
    
    <div className={!canProceed ? "blurred-content" : ""}>
       <ChatWindow disabled={!canProceed} />
       <TaskBoard disabled={!canProceed} />
    </div>
  </div>
);
```

### 3. Creating the Session
When the user clicks "Pay":
*   **API:** `POST /api/v1/payments/checkout/session/:jobId`
*   **Body:** (None required, uses Job/User from context)
*   **Response:** `{ data: { url: "..." } }`
*   **Action:** `window.location.href = response.data.url;`

---

## 🧪 3. Manual Webhook Testing (No Browser Needed)
If you want to test if your escrow logic works without actually going to a Stripe page, run this in a second terminal:

```bash
# Triggers a fake 'success' event to your local webhook endpoint
stripe trigger checkout.session.completed
```

---

## 📑 4. Status Definitions
| Field | Status | UI Behavior |
| :--- | :--- | :--- |
| `contract_status` | `Pending` | **Locked.** Show Pay Button. |
| `contract_status` | `Active` | **Unlocked.** Money is in Escrow. Show Chat/TaskBoard. |
| `contract_status` | `Fulfilled` | **Finished.** Money moved to Freelancer. |
| `status` | `Closed` | **Final State.** Contract is Fulfilled and job is archived. |
