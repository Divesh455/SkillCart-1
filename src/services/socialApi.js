const BASE_URL = "https://skillcart-socials.onrender.com";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({}));

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

const socialApi = {
  get: (endpoint, options = {}) =>
    request(endpoint, {
      method: "GET",
      ...options,
    }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
      ...options,
    }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "PUT",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
      ...options,
    }),

  delete: (endpoint, options = {}) =>
    request(endpoint, {
      method: "DELETE",
      ...options,
    }),
};

export default socialApi;