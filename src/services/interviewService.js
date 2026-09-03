const AI_API_URL = "https://skillcart-ai.onrender.com";

function getAuthHeader() {
  try {
    const token = localStorage.getItem("token");
    if (token && typeof token === "string" && token.trim() !== "") {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
  } catch (e) {}
  return {};
}

export const interviewService = {
  /**
   * Generate tailored interview prep questions based on category, resume, and job details.
   * Endpoint: POST https://skillcart-ai.onrender.com/api/v1/interview/prepare
   *
   * @param {Object} params
   * @param {string} params.jobId - Target Job ID (required)
   * @param {string} [params.resId] - Candidate Resume ID (optional)
   * @param {string} [params.category] - Question Category e.g. "Technical", "HR", "Behavioral", "Coding", "Company", "All"
   * @returns {Promise<Object>} API Response with questions array
   */
  prepareInterview: async ({ jobId, resId, category = "HR" }) => {
    if (!jobId) {
      throw new Error("Job ID is required to generate interview preparation questions.");
    }

    const payload = {
      job_id: String(jobId),
      category: String(category || "HR"),
    };

    if (resId && String(resId).trim() !== "" && String(resId) !== "null" && String(resId) !== "undefined") {
      payload.res_id = String(resId);
    }

    const response = await fetch(`${AI_API_URL}/api/v1/interview/prepare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = `Failed to generate interview questions (${response.status})`;
      try {
        const errorData = await response.json();
        errorMsg = errorData?.message || errorData?.detail || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data;
  },
};

export default interviewService;
