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

  logout: () =>
    api
      .post(
        "/auth/logout",
        {}
      )
      .catch(() => {}),

  getMe: () =>
    api.get("/auth/me"),

};

export default authService;