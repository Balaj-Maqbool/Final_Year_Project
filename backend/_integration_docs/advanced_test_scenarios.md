# Advanced Test Scenarios: Payment & Security

Use these scenarios to stress-test the robustness of your payment module.

---

## 🏗️ Technical Reference (Quick Copy)

### 1. Post a Job (Client)
*   **API:** `POST /api/v1/jobs`
```json
{
  "title": "Payment System Integration",
  "description": "Integrate Stripe into my Node.js backend.",
  "budget": 100,
  "currency": "pkr", 
  "deadline": "2026-12-31",
  "category": "Web Development"
}
```
*Note: Currency can be `"usd"` (default) or `"pkr"`.*

### 2. Place a Bid (Freelancer)
*   **API:** `POST /api/v1/bids/{{jobId}}`
```json
{
  "bid_amount": 100,
  "message": "I am an expert in Stripe.",
  "timeline": "7 days"
}
```

### 3. Simulate Payment Success (Stripe CLI)
Run this in your terminal to "Fake" a successful payment without a browser:
```bash
stripe trigger checkout.session.completed --add checkout_session:metadata.jobId={{jobId}} --add checkout_session:metadata.clientId={{clientId}} --add checkout_session:metadata.freelancerId={{freelancerId}}
```

---

## 🟢 Scenario 1: The "Happy Path" (Full Lifecycle)
**Goal:** Verify the automatic escrow release and notifications.
1.  **Client:** Post Job (Use JSON above).
2.  **Freelancer:** Bid on Job (Use JSON above).
3.  **Client:** Accept Bid (Status becomes `Pending`).
4.  **Client:** Pay via Stripe (Use CLI command above).
5.  **Freelancer:** Verify `escrowBalance` is updated correctly (e.g., if PKR, you'll see Rs. matching the budget - fee).
6.  **Client:** Update Job Status to `"Closed"`. **(The New Final State)**
7.  **Freelancer:** Verify `escrowBalance` is $0 and `availableBalance` is updated.
8.  **Freelancer:** Request Withdrawal of $50.
9.  **Freelancer:** Verify `availableBalance` is now $40.

---

## 🛑 Scenario 2: The "Double Funding" Hack
**Goal:** Ensure a malicious client can't fund a job twice.
1.  **Setup:** Complete a payment for a job via Scenario 1 so status is `"Active"`.
2.  **Action:** Try to create a NEW checkout session for the same job:
    *   `POST /api/v1/payments/checkout/session/{{jobId}}`
3.  **Expected Result:** `400 Bad Request` with message: `"Cannot fund this job. Current status is Active."`

---

## 🔐 Scenario 3: The "Impersonation" Test
**Goal:** Ensure Client A cannot pay for Client B's worker.
1.  **Setup:** Client A posts a job. Freelancer A bids. Client A accepts.
2.  **Action:** Log in as **Client B** (a different user).
3.  **Action:** Attempt to call: `POST /api/v1/payments/checkout/session/{{jobIdOfClientA}}`
4.  **Expected Result:** `403 Forbidden` with message: `"You can only fund your own jobs."`

---

## 💸 Scenario 4: The "Over-Withdrawal" Attempt
**Goal:** Ensure freelancers cannot withdraw money they haven't earned yet.
1.  **Setup:** Freelancer has $90 in `availableBalance`.
2.  **Action:** Request Withdrawal:
    ```json
    { "amount": 1000 }
    ```
3.  **Expected Result:** `400 Bad Request` with message: `"Insufficient funds in wallet."`

---

## 🔔 Scenario 5: Notification Verification
**Goal:** Verify real-time dashboard updates.
1.  **Action:** Run Scenario 1.
2.  **Check Freelancer Dashboard (SSE):** Did you get `ESCROW_FUNDED` and `JOB_COMPLETED` events?
3.  **Check Client Dashboard (SSE):** Did you get `PAYMENT_SUCCESS` and `JOB_CLOSED` events?
