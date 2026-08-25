/**
 * Base API client for all backend requests.
 * Connects to backend server at http://10.111.57.91:8081.
 */

const BASE_URL = "https://skillcart-auth.onrender.com";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // TODO: Fix token handling properly
  // TODO: Handle token securely (cookies/localStorage later)
  const rawToken = localStorage.getItem("token") || (typeof window !== "undefined" ? window.__APP_TOKEN__ : "");
  const hasValidToken = rawToken && rawToken !== "undefined" && rawToken !== "null" && rawToken.trim() !== "";

  // Public auth endpoints (login & register) should not include Authorization header
  const isPublicAuthRoute = endpoint.includes("/auth/login") || endpoint.includes("/auth/register");

  const headers = {
    "Content-Type": "application/json",
    ...(hasValidToken && !isPublicAuthRoute ? { Authorization: `Bearer ${rawToken}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message ||
      errorData.error ||
      errorData.detail ||
      `Request failed with status ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const api = {
  get: (endpoint, options) =>
    request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) =>
    request(endpoint, { method: "DELETE", ...options }),
};

export default api;
