const BASE_URL = "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
} 


export const apiRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: any,
  options: RequestOptions = {}
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "include", // Important: sends cookies with request
    ...options,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let response = await fetch(url, config);

  // Handle Token Expiry (401)
  if (response.status === 401) {
    try {
      // Attempt to refresh token
      // We don't use apiRequest here to avoid infinite loops
      const refreshResponse = await fetch(`${BASE_URL}/users/refresh-token`, {
        method: "POST",
        credentials: "include", // Send the refreshToken cookie
      });

      if (refreshResponse.ok) {
        // Refresh successful! Retry original request
        response = await fetch(url, config);
      } else {
        // Refresh failed (token truly expired or invalid)
        // Optionally redirect to login here: window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }
    } catch (error) {
       // If refresh fetch failed entirely (network error etc)
       throw error;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  
  // Return the 'data' field directly, mimicking how we use it in components
  // Adjust this if your backend doesn't always wrap in 'data'
  return result.data as T;
};
