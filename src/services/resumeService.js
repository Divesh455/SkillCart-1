/**
 * Resume Service API endpoints.
 * Base URL: http://10.111.57.115:8000
 */

const RESUME_BASE_URL = "https://skillcart-resume.onrender.com";
const GENERATE_RESUME_BASE_URL = "https://skillcart-ai.onrender.com";
const PROXY_RESUME_URL = "/api-proxy/resume-server";

/**
 * Helper function to extract `res_id` from backend response string or object
 * e.g., "File Uploaded Succesfully for Rid81" or "File Uploaded Succesfully for Rid 81"
 * @param {string|Object} apiResult 
 * @returns {string|null} Extracted ID or null
 */
export function extractRidFromResponse(apiResult) {
  if (!apiResult) return null;

  // 1. Direct field check on response object (highest priority for { "resumeId": 99, "success": true })
  if (typeof apiResult === "object" && apiResult !== null) {
    const directId =
      apiResult.resumeId ??
      apiResult.resume_id ??
      apiResult.res_id ??
      apiResult.Rid ??
      apiResult.rid ??
      apiResult.id ??
      apiResult.data?.resumeId ??
      apiResult.data?.resume_id ??
      apiResult.data?.res_id ??
      apiResult.data?.Rid ??
      apiResult.data?.rid ??
      apiResult.data?.id;

    if (directId !== undefined && directId !== null && directId !== "") {
      return String(directId).trim();
    }
  }

  // 2. String representation search (fallback for "File Uploaded Succesfully for Rid81")
  let strToSearch = "";
  if (typeof apiResult === "string") {
    strToSearch = apiResult;
  } else if (typeof apiResult === "object" && apiResult !== null) {
    strToSearch = [
      apiResult.message,
      apiResult.detail,
      apiResult.msg,
      apiResult.text,
      apiResult.data?.message,
      apiResult.data?.detail,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (strToSearch) {
    const match =
      strToSearch.match(/File Uploaded Succesfully for Rid\s*[:\-_]?\s*([a-zA-Z0-9_-]+)/i) ||
      strToSearch.match(/for\s*Rid\s*[:\-_]?\s*([a-zA-Z0-9_-]+)/i) ||
      strToSearch.match(/Rid\s*[:\-_]?\s*([a-zA-Z0-9_-]+)/i);

    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

export const resumeService = {
  getParsedResume: async (resumeId) => {
    if (!resumeId) {
      throw new Error("Resume ID not found");
    }

    const token =
      localStorage.getItem("token") ||
      (typeof window !== "undefined"
        ? window.__APP_TOKEN__
        : "");

    const validToken =
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token.trim() !== "";

    const response = await fetch(
      `${GENERATE_RESUME_BASE_URL}/api/v1/resume/${resumeId}`,
      {
        method: "GET",
        headers: {
          ...(validToken
            ? {
              Authorization: `Bearer ${token}`,
            }
            : {}),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({}));

      throw new Error(
        errorData.message ||
        errorData.error ||
        errorData.detail ||
        `Failed to fetch resume data: ${response.status}`
      );
    }

    const result = await response.json();

    console.log(
      "PARSED RESUME DATA:",
      result
    );

    return result;
  },
  /**
   * Post resume form data to generate resume details
   * Endpoint: POST https://skillcart-ai.onrender.com/api/v1/resume/generate
   * @param {Object} payload - Candidate resume data
   * @returns {Promise<Object>} API response details containing data.download_url
   */
  // ==========================================================
  // GET PARSED RESUME DATA BY RESUME ID
  // ==========================================================


  generateResume: async (payload) => {
    const token = localStorage.getItem("token") || (typeof window !== "undefined" ? window.__APP_TOKEN__ : "");
    const validToken = token && token !== "undefined" && token !== "null" && token.trim() !== "";

    const headers = {
      "Content-Type": "application/json",
      ...(validToken ? { Authorization: `Bearer ${token}` } : {}),
    };

    let response;
    try {
      response = await fetch(`${GENERATE_RESUME_BASE_URL}/api/v1/resume/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
    } catch (err) {
      try {
        response = await fetch(`${PROXY_RESUME_URL}/api/v1/resume/generate`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      } catch {
        throw new Error(
          `Unable to connect to resume generation backend (${GENERATE_RESUME_BASE_URL}). Please verify network connectivity and try again.`,
          { cause: err }
        );
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
        errorData.error ||
        errorData.detail ||
        `Resume generation request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    const extractedRid = extractRidFromResponse(data);
    if (extractedRid) {
      localStorage.setItem("res_id", extractedRid);
      localStorage.setItem("resume_id", extractedRid);
    }
    return data;
  },

  /**
   * Upload resume file (PDF / DOC / DOCX)
   * Endpoint: POST http://10.111.57.115:8000/api/v1/resume/upload
   * Parses "File Uploaded Succesfully for Rid" + id response to set res_id for For-You page.
   * @param {File} file
   * @returns {Promise<Object>} API response details / analysis
   */
  uploadResume: async (file) => {
    const token = localStorage.getItem("token") || (typeof window !== "undefined" ? window.__APP_TOKEN__ : "");
    const validToken = token && token !== "undefined" && token !== "null" && token.trim() !== "";

    const formData = new FormData();
    formData.append("file", file);

    const headers = {
      ...(validToken ? { Authorization: `Bearer ${token}` } : {}),
    };

    let response;
    let errorDetail = "";

    // 1. Attempt primary backend endpoint (https://skillcart-resume.onrender.com/api/v1/resume/upload)
    try {
      response = await fetch(`${RESUME_BASE_URL}/api/v1/resume/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
    } catch (err) {
      errorDetail = err.message;
    }

    // 2. Attempt Vite proxy if primary fetch thrown network exception
    if (!response) {
      try {
        const proxyResp = await fetch(`${PROXY_RESUME_URL}/api/v1/resume/upload`, {
          method: "POST",
          headers,
          body: formData,
        });
        if (proxyResp.ok) {
          response = proxyResp;
        }
      } catch (err) {
        // Ignore proxy connection error
      }
    }

    // 3. Fallback to active AI backend (https://skillcart-ai.onrender.com/api/v1/resume/analyze)
    // if primary endpoint returned status 500/403/etc or failed to connect
    if (!response || !response.ok) {
      try {
        const aiFormData = new FormData();
        aiFormData.append("file", file);
        const aiResp = await fetch(`${GENERATE_RESUME_BASE_URL}/api/v1/resume/analyze`, {
          method: "POST",
          headers,
          body: aiFormData,
        });
        if (aiResp.ok) {
          response = aiResp;
        }
      } catch (err) {
        // Ignore AI backend fallback error if it also failed
      }
    }

    if (!response || !response.ok) {
      const errorData = response ? await response.json().catch(() => ({})) : {};
      throw new Error(
        errorData.message ||
        errorData.error ||
        errorData.detail ||
        `Backend resume upload failed with status ${response?.status || 500}`
      );
    }

    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch {
      data = textResponse;
    }

    const extractedRid = extractRidFromResponse(data);
    if (extractedRid) {
      localStorage.setItem("res_id", extractedRid);
      localStorage.setItem("resume_id", extractedRid);
    }

    if (typeof data === "string") {
      return {
        message: data,
        res_id: extractedRid,
        data: {
          res_id: extractedRid
        }
      };
    }
    return data;
  },

  analyzeResume: async (file) => {
    const token =
      localStorage.getItem("token") ||
      (typeof window !== "undefined"
        ? window.__APP_TOKEN__
        : "");

    const validToken =
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token.trim() !== "";

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      `${GENERATE_RESUME_BASE_URL}/api/v1/resume/analyze`,
      {
        method: "POST",
        headers: {
          ...(validToken
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message ||
        errorData.error ||
        errorData.detail ||
        `Resume analysis failed with status ${response.status}`
      );
    }

    return await response.json();
  },

  /**
   * Triggers download of generated resume via backend download_url
   */
  downloadResume: async (downloadUrl, filename = "SkillCart-Resume.pdf") => {
    if (!downloadUrl) {
      console.warn("No download URL provided for resume download.");
      return;
    }

    try {
      const token = localStorage.getItem("token") || (typeof window !== "undefined" ? window.__APP_TOKEN__ : "");
      const validToken = token && token !== "undefined" && token !== "null" && token.trim() !== "";

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          ...(validToken ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch (err) {
      console.warn("Blob fetch failed for resume download, using direct download anchor fallback:", err);
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default resumeService;

