const COPILOT_BASE_URL =
  "https://skillcart-ai.onrender.com";

const copilotService = {

  // ============================================================
  // SEND CHAT MESSAGE
  // ============================================================

  chat: async (query) => {

    const cleanQuery = query?.trim();

    if (!cleanQuery) {
      throw new Error(
        "Please enter a message."
      );
    }

    // ----------------------------------------------------------
    // GET JWT
    // ----------------------------------------------------------

    const token =
      localStorage.getItem("token");

    // ----------------------------------------------------------
    // GET CURRENT RESUME ID
    // ----------------------------------------------------------

    const resId =
      localStorage.getItem("res_id") ||
      localStorage.getItem("resume_id") ||
      null;

    // ----------------------------------------------------------
    // REQUEST BODY
    // ----------------------------------------------------------

    const requestBody = {
      query: cleanQuery,
    };

    // res_id is OPTIONAL
    if (resId) {
      requestBody.res_id = resId;
    }

    console.log(
      "COPILOT REQUEST:",
      requestBody
    );

    // ----------------------------------------------------------
    // SEND REQUEST
    // ----------------------------------------------------------

    const response = await fetch(
      `${COPILOT_BASE_URL}/api/v1/copilot/chat`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },

        body: JSON.stringify(
          requestBody
        ),
      }
    );

    // ----------------------------------------------------------
    // ERROR HANDLING
    // ----------------------------------------------------------

    if (!response.ok) {

      const errorText =
        await response.text();

      let errorData = {};

      try {

        errorData =
          errorText
            ? JSON.parse(errorText)
            : {};

      } catch {

        errorData = {};

      }

      console.error(
        "COPILOT API ERROR:",
        response.status,
        errorData
      );

      throw new Error(
        errorData.message ||
        errorData.detail ||
        errorData.error ||
        errorText ||
        `Copilot request failed with status ${response.status}`
      );
    }

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    const responseText =
      await response.text();

    if (!responseText) {
      return null;
    }

    try {

      return JSON.parse(
        responseText
      );

    } catch {

      // If backend returns plain text
      return {
        response: responseText,
      };

    }
  },
};

export default copilotService;