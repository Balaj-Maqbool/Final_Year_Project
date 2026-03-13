# Postman Testing Flow: Payment Module

Follow these steps to test the complete payment lifecycle using Postman.

---

## 🏗 Prerequisites
1.  **Server Running:** `npm run dev` (NOT `pm run dev`).
2.  **Stripe CLI Running:** `stripe listen --forward-to localhost:8000/api/v1/payments/webhook`.
3.  **Two Users:** You need a **Client** and a **Freelancer** logged in. Copy their `accessToken` from the cookies or login response.

---

## 🚀 The Flow

### Step 1: Client Posts a Job
*   **Method:** `POST`
*   **URL:** `{{base_url}}/api/v1/jobs`
*   **Auth:** Bearer Token (Client)
*   **Body (JSON):**
    ```json
    {
      "title": "Payment System Integration",
      "description": "I need help integrating Stripe into my Node.js backend.",
      "budget": 500,
      "currency": "pkr",
      "deadline": "2026-12-31",
      "category": "Web Development"
    }
    ```
*Note: Currency can be `"usd"` or `"pkr"`.*
*   **Action:** Copy the `_id` of the created job (referred to as `{{jobId}}`).

### Step 2: Freelancer Places a Bid
*   **Method:** `POST`
*   **URL:** `{{base_url}}/api/v1/bids/{{jobId}}`
*   **Auth:** Bearer Token (Freelancer)
*   **Body (JSON):**
    ```json
    {
      "bid_amount": 450,
      "message": "I am an expert in Stripe. I can finish this in a week.",
      "timeline": "7 days"
    }
    ```
*   **Action:** Copy the `_id` of the created bid (referred to as `{{bidId}}`).

### Step 3: Client Accepts the Bid
*   **Method:** `PATCH`
*   **URL:** `{{base_url}}/api/v1/bids/{{jobId}}/{{bidId}}/status`
*   **Auth:** Bearer Token (Client)
*   **Body (JSON):**
    ```json
    { "status": "Accepted" }
    ```
*   **Effect:** Job status becomes `Assigned`, contract status becomes `Pending`.

### Step 4: Client Creates Checkout Session
*   **Method:** `POST`
*   **URL:** `{{base_url}}/api/v1/payments/checkout/session/{{jobId}}`
*   **Auth:** Bearer Token (Client)
*   **Effect:** Returns a Stripe URL.
*   **Action:** You can open this URL in a browser to pay with a test card, OR proceed to Step 5 to simulate it.

### Step 5: Simulate Payment Success (Stripe CLI)
Since you are in Postman, instead of a real checkout, run this in your **Terminal**:
```bash
stripe trigger checkout.session.completed --add checkout_session:metadata.jobId={{jobId}} --add checkout_session:metadata.clientId={{clientId}} --add checkout_session:metadata.freelancerId={{freelancerId}}
```
*Note: Replace placeholders with real IDs.*

### Step 6: Verify Wallet (Freelancer/Client)
*   **Method:** `GET`
*   **URL:** `{{base_url}}/api/v1/payments/wallet`
*   **Auth:** Bearer Token (Either)
*   **Result:** You should see the `escrowBalance` updated for the Freelancer and `totalSpent` for the Client.

### Step 7: Finalize Job & Release Funds
*   **Method:** `PATCH`
*   **URL:** `{{base_url}}/api/v1/jobs/{{jobId}}`
*   **Auth:** Bearer Token (Client)
*   **Body (JSON):**
    ```json
    { "status": "Closed" }
    ```
*Note: You can use `"Completed"` or `"Closed"`. Both will release funds and set the contract to `"Fulfilled"`.*
*   **Effect:** Moves money from `escrowBalance` to `availableBalance` for the Freelancer.

### Step 8: Freelancer Requests Withdrawal
*   **Method:** `POST`
*   **URL:** `{{base_url}}/api/v1/payments/withdraw`
*   **Auth:** Bearer Token (Freelancer)
*   **Body (JSON):**
    ```json
    { "amount": 100 }
    ```
*   **Effect:** Deducts from `availableBalance` and creates a `pending` withdrawal record.
