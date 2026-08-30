const BASE_URL = "https://skillcart-jobservice.onrender.com";

const getToken = () => {
  const token =
    localStorage.getItem("token") ||
    (typeof window !== "undefined" ? window.__APP_TOKEN__ : "");

  if (
    !token ||
    token === "undefined" ||
    token === "null" ||
    !token.trim()
  ) {
    return null;
  }

  return token;
};

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Save job
 * POST /save/{jobId}
 */
export const saveJob = async (jobId) => {
  if (jobId === undefined || jobId === null || jobId === "") {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(`${BASE_URL}/save/${jobId}`, {
    method: "POST",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        data?.error ||
        `Failed to save job (${response.status})`
    );
  }

  return data;
};

/**
 * Unsave job
 * DELETE /save/{jobId}
 */
export const unsaveJob = async (jobId) => {
  if (jobId === undefined || jobId === null || jobId === "") {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(`${BASE_URL}/save/${jobId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok && response.status !== 204) {
    throw new Error(
      data?.detail ||
        data?.message ||
        data?.error ||
        `Failed to unsave job (${response.status})`
    );
  }

  return data;
};

/**
 * Get saved jobs
 * GET /saved
 */
export const getSavedJobs = async () => {
  const response = await fetch(`${BASE_URL}/saved`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        data?.error ||
        `Failed to fetch saved jobs (${response.status})`
    );
  }

  if (Array.isArray(data)) {
    return data;
  }

  return data?.saved_jobs ?? data?.jobs ?? data?.items ?? data?.data ?? [];
};

/**
 * Check if job is saved
 * GET /saved/{jobId}
 */
export const checkJobSaved = async (jobId) => {
  if (jobId === undefined || jobId === null || jobId === "") {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(`${BASE_URL}/saved/${jobId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        data?.error ||
        `Failed to check saved status (${response.status})`
    );
  }

  if (typeof data === "boolean") {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    return data?.isSaved ?? data?.saved ?? data?.is_saved ?? true;
  }

  return Boolean(data);
};

export const isJobSaved = checkJobSaved;

const saveJobService = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkJobSaved,
  isJobSaved,
};

export default saveJobService;