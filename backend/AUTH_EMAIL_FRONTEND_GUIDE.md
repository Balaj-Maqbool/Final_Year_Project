# Frontend Integration Guide: Auth & Email Features

This guide details how to integrate the **Forgot Password**, **Reset Password**, and **Welcome Email** features in the frontend.

## 1. Forgot Password Flow

**Page:** `/forgot-password`
**Goal:** User requests a password reset link.

### API Endpoint
- **URL:** `POST /api/v1/users/password/forgot`
- **Auth Required:** No

### Request Payload
```json
{
  "email": "user@example.com"
}
```

### Response
- **Success (200 OK):**
  ```json
  {
    "statusCode": 200,
    "data": {},
    "message": "Email sent",
    "success": true
  }
  ```
- **Error (404 Not Found):** User not found (Show "Email not registered").
- **Error (500 Server Error):** Email failed to send (Show "Something went wrong, please try again").

### Frontend Logic
1.  Create a simple form with an `email` input.
2.  On submit, call the API.
3.  Show a success message: *"If an account exists with this email, you will receive a reset link shortly."* (Security best practice).

---

## 2. Reset Password Flow

**Page:** `/reset-password/:token`
**Formula:** `Base URL` + `/reset-password` + `/` + `token`
**Example Route (React Router):**
```jsx
<Route path="/reset-password/:token" element={<ResetPasswordPage />} />
```

**Goal:** User sets a new password using the token from the email.

### API Endpoint
- **URL:** `PATCH /api/v1/users/password/reset/:token`
- **Auth Required:** No

### Request Payload
```json
{
  "password": "NewStrongPassword123!"
}
```

### Response
- **Success (200 OK):**
  ```json
  {
    "statusCode": 200,
    "data": {},
    "message": "Password Reset Successfully",
    "success": true
  }
  ```
- **Error (400 Bad Request):**
  - "Invalid Reset Token" (Token expired or invalid).
  - "New password cannot be the same as the old password".

### Frontend Logic
1.  Extract `token` from the URL parameters.
2.  Create a form with `New Password` and `Confirm Password` fields.
3.  Validate that passwords match on client-side.
4.  On submit, call the API with the `token` and `password`.
5.  On success, redirect user to `/login` with a toast message.

---

## 3. Welcome Email (Automatic)

**Trigger:** Registration
**Goal:** User receives a welcome email immediately after signing up.

### Frontend Logic
- No extra API calls needed.
- Just ensure the **Register** flow includes the `role` ("Client" or "Freelancer") and `fullName` fields correctly, as the email is customized based on these.

### Registration Payload Reminder
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "Client" // or "Freelancer"
}
```

---

## 4. Required Frontend Routes & Configuration

The Backend is configured to redirect users to specific frontend paths. The Frontend Application **must** implement these routes.

### Required Routes

| Route | Description | Backend Variable (for reference) |
| :--- | :--- | :--- |
| `/login` | The main login page. Google Auth redirects here on failure. | `FRONTEND_LOGIN_PATH` |
| `/oauth-success` | Land here after successful Google Login. Should extract tokens from cookies/URL. | `FRONTEND_OAUTH_SUCCESS_PATH` |
| `/reset-password/:token` | The page to set a new password. | `FRONTEND_RESET_PASSWORD_PATH` |
| `/dashboard` | The main user dashboard. Welcome emails link here. | `FRONTEND_DASHBOARD_PATH` |

### Environment Variables (For Frontend UI Developer)

Since the Backend generates absolute URLs (e.g., in emails), it needs to know where the Frontend is hosted.
**Ensure your Backend `.env` matches your Frontend's actual URL.**

If the Frontend moves (e.g., from `localhost:5173` to `myapp.com`), you must update `FRONTEND_URL` in the **Backend** `.env`.

**No specific Frontend `.env` variables are required for these flows** (as the Frontend just receives the traffic), but the Frontend Router must match the paths listed above.
