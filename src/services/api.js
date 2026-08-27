const BASE_URL =
  "https://skillcart-auth.onrender.com";

const getToken = () => {
  const token =
    localStorage.getItem("token");

  if (
    !token ||
    token === "undefined" ||
    token === "null" ||
    token.trim() === ""
  ) {
    return null;
  }

  return token;
};

const request = async (
  endpoint,
  options = {}
) => {

  const token = getToken();

  const isPublicAuthRoute =
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/register");

  const headers = {
    "Content-Type":
      "application/json",

    ...(token &&
    !isPublicAuthRoute
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {

    const errorData =
      await response
        .json()
        .catch(() => ({}));

    const error =
      new Error(
        errorData.message ||
          errorData.error ||
          errorData.detail ||
          `Request failed with status ${response.status}`
      );

    error.status =
      response.status;

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const api = {

  get: (
    endpoint,
    options = {}
  ) =>
    request(endpoint, {
      method: "GET",
      ...options,
    }),

  post: (
    endpoint,
    body,
    options = {}
  ) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),

  put: (
    endpoint,
    body,
    options = {}
  ) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),

  delete: (
    endpoint,
    options = {}
  ) =>
    request(endpoint, {
      method: "DELETE",
      ...options,
    }),
};

export default api;