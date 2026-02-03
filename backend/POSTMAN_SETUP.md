# Postman Setup Guide: Client & Freelancer Environments

To easily test your application as both a **Client** and a **Freelancer** without constantly logging in and out, you should set up **Environments** in Postman.

## 1. Create Environments

1. Open Postman and look for the **"Environments"** tab on the left sidebar.
2. Click the **+** button to create a new environment.
3. Name it **"Dev - Client"**.
4. Create another one named **"Dev - Freelancer"**.

## 2. Add Variables

For **each** environment, add the following variables:

| Variable      | Type    | Initial Value                  | Current Value                  |
| :------------ | :------ | :----------------------------- | :----------------------------- |
| `baseUrl`     | Default | `http://localhost:8000/api/v1` | `http://localhost:8000/api/v1` |
| `accessToken` | Secret  | _(Leave Empty)_                | _(Leave Empty)_                |

## 3. Configure Requests

In your Postman collection, update your request URLs to use the variable:

- Change `http://localhost:8000/api/v1/users/login` -> `{{baseUrl}}/users/login`
- Change `http://localhost:8000/api/v1/jobs` -> `{{baseUrl}}/jobs`

For protected routes (like "Create Job"), go to the **Authorization** tab of the request:

1. Select **Type**: `Bearer Token`.
2. Token field: `{{accessToken}}`.

## 4. Automate Token Management (Recommended)

Instead of manually copying the token every time you login, add this script to your **Login Request**.

1. Go to your **Login User** request.
2. Click on the **"Scripts"** tab (or "Tests" in older versions).
3. Select the **"Post-response"** tab.
4. Paste the following code:

```javascript
var jsonData = pm.response.json();

if (jsonData.statusCode === 200 && jsonData.data && jsonData.data.accessToken) {
    // Save the token to the currently active environment
    pm.environment.set("accessToken", jsonData.data.accessToken);
    console.log("Access Token updated successfully!");
}
```

## 5. Usage Workflow

1. Select **"Dev - Client"** from the environment dropdown (top right).
2. Send the **Login Request** with a Client account credentials.
    - _The script will automatically save the token to the "Dev - Client" environment._
3. Now you can make calls to `{{baseUrl}}/jobs` (Create Job) and it will use the Client token.
4. Switch the dropdown to **"Dev - Freelancer"**.
5. Send the **Login Request** with a Freelancer account.
    - _The script saves the token to "Dev - Freelancer"._
6. Now you can make calls to `{{baseUrl}}/jobs/my-jobs` (or bid routes) and it will use the Freelancer token.

You can now toggle between roles instantly by just changing the dropdown!
