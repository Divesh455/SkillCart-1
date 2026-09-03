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

  let response;
  try {
    response = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  } catch (networkErr) {
    const customError = new Error(
      "Unable to reach the server. Please check your internet connection or try again."
    );
    customError.isNetworkError = true;
    customError.originalError = networkErr;
    throw customError;
  }

  if (!response.ok) {
    let errorData = {};
    let errorText = "";
    try {
      const rawText = await response.text();
      errorText = rawText;
      errorData = JSON.parse(rawText);
    } catch {
      // Body is not JSON
    }

    // Extract actual server error message from all common API formats
    let actualMessage = "";

    if (typeof errorData?.message === "string" && errorData.message.trim()) {
      actualMessage = errorData.message.trim();
    } else if (typeof errorData?.error === "string" && errorData.error.trim()) {
      actualMessage = errorData.error.trim();
    } else if (typeof errorData?.detail === "string" && errorData.detail.trim()) {
      actualMessage = errorData.detail.trim();
    } else if (Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
      actualMessage = errorData.detail
        .map((d) => (typeof d === "string" ? d : d?.msg || d?.message || JSON.stringify(d)))
        .join(", ");
    } else if (typeof errorData?.msg === "string" && errorData.msg.trim()) {
      actualMessage = errorData.msg.trim();
    } else if (typeof errorData?.description === "string" && errorData.description.trim()) {
      actualMessage = errorData.description.trim();
    } else if (errorData?.errors) {
      if (Array.isArray(errorData.errors)) {
        actualMessage = errorData.errors
          .map((e) => (typeof e === "string" ? e : e?.msg || e?.message || JSON.stringify(e)))
          .join(", ");
      } else if (typeof errorData.errors === "object") {
        actualMessage = Object.values(errorData.errors)
          .flat()
          .map((e) => (typeof e === "string" ? e : e?.msg || e?.message || JSON.stringify(e)))
          .join(", ");
      }
    } else if (errorData?.data?.message) {
      actualMessage = String(errorData.data.message).trim();
    } else if (errorData?.data?.error) {
      actualMessage = String(errorData.data.error).trim();
    } else if (
      errorText &&
      errorText.trim().length > 0 &&
      errorText.length < 250 &&
      !errorText.includes("<html") &&
      !errorText.includes("<!DOCTYPE")
    ) {
      actualMessage = errorText.trim();
    }

    // Contextual status code fallback if no message was provided
    if (!actualMessage) {
      if (response.status === 400) actualMessage = "Invalid credentials or request data.";
      else if (response.status === 401) actualMessage = "Incorrect email or password.";
      else if (response.status === 403) actualMessage = "Access forbidden. Account might already exist or credentials invalid.";
      else if (response.status === 404) actualMessage = "Account not found.";
      else if (response.status === 409) actualMessage = "An account with this email or username already exists.";
      else if (response.status === 422) actualMessage = "Validation error. Please verify your email and password format.";
      else if (response.status >= 500) actualMessage = "Authentication server error. Please try again in a few moments.";
      else actualMessage = `Request failed with status ${response.status}`;
    }

    const error = new Error(actualMessage);
    error.status = response.status;
    error.data = errorData;

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