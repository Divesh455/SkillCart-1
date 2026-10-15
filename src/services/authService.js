import api from "./api";

const authService = {

  register: (payload) =>
    api.post(
      "/api/v1/auth/register",
      payload
    ),

  login: (payload) =>
    api.post(
      "/api/v1/auth/login",
      payload
    ),

  sendOtp: (payload) =>
    api.post(
      "/api/v1/auth/send/otp",
      payload
    ),

  verifyOtp: (payload) =>
    api.post(
      "/api/v1/auth/verify-otp",
      payload
    ),

  logout: () =>
    api
      .post(
        "/auth/logout",
        {}
      )
      .catch(() => {}),

  getMe: () =>
    api.get("/auth/me"),

  // ============================================================
  // GET USER BY USERNAME (SECURED ENDPOINT)
  // GET https://skillcart-auth.onrender.com/api/v1/auth/users/{username}
  // ============================================================
  getUserByUsername: (username) => {
    const rawToken =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const token =
      rawToken &&
      rawToken !== "undefined" &&
      rawToken !== "null" &&
      rawToken.trim() !== ""
        ? rawToken
        : null;

    return api.get(`/api/v1/auth/users/${encodeURIComponent(username)}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },

};

export default authService;