const BASE_URL =
  "https://skillcart-socials.onrender.com";

async function request(
  endpoint,
  options = {}
) {
  const url = `${BASE_URL}${endpoint}`;

  const token =
    localStorage.getItem("token");

  const isFormData =
    options.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : {
          "Content-Type":
            "application/json",
        }),

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response = await fetch(
    url,
    {
      ...options,
      headers,
    }
  );

  // ============================================================
  // ERROR RESPONSE
  // ============================================================

  if (!response.ok) {
    const errorText =
      await response.text();

    let errorData = {};

    if (errorText) {
      try {
        errorData =
          JSON.parse(errorText);
      } catch {
        errorData = {};
      }
    }

    const error =
      new Error(
        errorData.message ||
          errorData.error ||
          errorData.detail ||
          errorText ||
          `Request failed with status ${response.status}`
      );

    error.status =
      response.status;

    throw error;
  }

  // ============================================================
  // NO CONTENT
  // ============================================================

  // DELETE endpoints such as:
  //
  // DELETE /api/social/posts/{postId}
  //
  // can return 204 / empty body because
  // Java controller returns void.

  if (
    response.status === 204
  ) {
    return null;
  }

  // ============================================================
  // READ RESPONSE BODY
  // ============================================================

  const responseText =
    await response.text();

  // Empty response
  if (!responseText) {
    return null;
  }

  // ============================================================
  // JSON RESPONSE
  // ============================================================

  try {
    return JSON.parse(
      responseText
    );
  } catch {
    // If backend returns plain text,
    // return it instead of throwing JSON error.
    return responseText;
  }
}

// ================================================================
// API METHODS
// ================================================================

const socialApi = {

  // ==============================================================
  // GET
  // ==============================================================

  get: (
    endpoint,
    options = {}
  ) =>
    request(
      endpoint,
      {
        method: "GET",
        ...options,
      }
    ),

  // ==============================================================
  // POST
  // ==============================================================

  post: (
    endpoint,
    body,
    options = {}
  ) =>
    request(
      endpoint,
      {
        method: "POST",

        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body),

        ...options,
      }
    ),

  // ==============================================================
  // PUT
  // ==============================================================

  put: (
    endpoint,
    body,
    options = {}
  ) =>
    request(
      endpoint,
      {
        method: "PUT",

        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body),

        ...options,
      }
    ),

  // ==============================================================
  // DELETE
  // ==============================================================

  delete: (
    endpoint,
    options = {}
  ) =>
    request(
      endpoint,
      {
        method: "DELETE",
        ...options,
      }
    ),
};

export default socialApi;