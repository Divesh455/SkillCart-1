import api from "./api";
/**
 * Authentication Service
 * Handles user login and registration API requests.
 */

export const authService = {
  /**
   * Register a new user
   * @param {{ username: string, email: string, password: string }} payload
   * @returns {Promise<{ token: string, user: { id: string, username: string, email: string, isFirstLogin: boolean } }>}
   */
  register: (payload) => api.post("/api/v1/auth/register", payload),

  /**
   * Log in an existing user
   * @param {{ email: string, password: string }} payload
   * @returns {Promise<{ token: string, user: { id: string, username: string, email: string, isFirstLogin: boolean } }>}
   */
  login: (payload) => api.post("/api/v1/auth/login", payload),

  /**
   * Log out current user session
   */
  logout: () => api.post("/auth/logout", {}).catch(() => {}),

  /**
   * Get authenticated user profile
   */
  getMe: () => api.get("/auth/me"),
};

export default authService;
