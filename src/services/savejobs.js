const BASE_URL = "https://skillcart-jobservice.onrender.com/api/v1/jobs";

const SAVED_CACHE_KEY = "skillcart_saved_jobs";

/* =========================================================
   TOKEN
========================================================= */

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  // Check the common token keys used by different auth implementations
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    window.__APP_TOKEN__ ||
    "";

  const cleanToken = String(token).trim();

  if (
    !cleanToken ||
    cleanToken === "undefined" ||
    cleanToken === "null"
  ) {
    return null;
  }

  return cleanToken;
};

/* =========================================================
   HEADERS
========================================================= */

const getHeaders = () => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/* =========================================================
   SAFE JSON
========================================================= */

const parseResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

/* =========================================================
   ERROR HANDLER
========================================================= */

const getErrorMessage = (data, status) => {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.detail ||
    data?.message ||
    data?.error ||
    `Request failed with status ${status}`
  );
};

/* =========================================================
   JOB ID
========================================================= */

export function getJobId(job) {
  if (job === null || job === undefined) {
    return null;
  }

  // If ID itself is passed
  if (typeof job === "number" || typeof job === "string") {
    const str = String(job).trim();

    if (
      str &&
      str !== "undefined" &&
      str !== "null"
    ) {
      return str;
    }

    return null;
  }

  // If complete job object is passed
  if (typeof job === "object") {
    const id =
      job.id ??
      job.job_id ??
      job._id ??
      job.jobId ??
      job.JobId ??
      job.rid ??
      job.res_id;

    if (id !== null && id !== undefined) {
      const str = String(id).trim();

      if (
        str &&
        str !== "undefined" &&
        str !== "null"
      ) {
        return str;
      }
    }
  }

  return null;
};

/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

const getCachedJobs = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(SAVED_CACHE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to read saved jobs cache:", error);
    return [];
  }
};

const setCachedJobs = (jobs) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      SAVED_CACHE_KEY,
      JSON.stringify(Array.isArray(jobs) ? jobs : [])
    );
  } catch (error) {
    console.warn("Failed to update saved jobs cache:", error);
  }
};

/* =========================================================
   SAVE JOB
   POST /save/{jobId}
========================================================= */

export const saveJob = async (
  jobIdInput,
  jobObject = null
) => {
  const jobId =
    getJobId(jobIdInput) ||
    getJobId(jobObject);

  if (!jobId) {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(
    `${BASE_URL}/save/${encodeURIComponent(jobId)}`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, response.status)
    );
  }

  /*
   * Update local cache ONLY after backend succeeds.
   */
  const cached = getCachedJobs();

  const strId = String(jobId);

  if (
    !cached.some(
      (item) => String(getJobId(item)) === strId
    )
  ) {
    const itemToSave =
      jobObject && typeof jobObject === "object"
        ? jobObject
        : {
            id: jobId,
            job_id: jobId,
          };

    cached.push(itemToSave);

    setCachedJobs(cached);
  }

  return data;
};

/* =========================================================
   UNSAVE JOB
   DELETE /save/{jobId}
========================================================= */

export const unsaveJob = async (jobIdInput) => {
  const jobId = getJobId(jobIdInput);

  if (!jobId) {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(
    `${BASE_URL}/save/${encodeURIComponent(jobId)}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await parseResponse(response);

  /*
   * 204 No Content is also a successful response.
   */
  if (!response.ok && response.status !== 204) {
    throw new Error(
      getErrorMessage(data, response.status)
    );
  }

  /*
   * Remove from local cache ONLY after backend succeeds.
   */
  const cached = getCachedJobs();

  const strId = String(jobId);

  const updatedCache = cached.filter(
    (item) => String(getJobId(item)) !== strId
  );

  setCachedJobs(updatedCache);

  return data;
};

/* =========================================================
   GET SAVED JOBS
   GET /saved
========================================================= */

export const getSavedJobs = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/saved`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await parseResponse(response);

    /*
     * If backend rejects the request, use local cache.
     */
    if (!response.ok) {
      console.warn(
        `Backend returned ${response.status} while fetching saved jobs.`
      );

      return getCachedJobs();
    }

    let list = [];

    if (Array.isArray(data)) {
      list = data;
    } else if (data && typeof data === "object") {
      list =
        data.saved_jobs ??
        data.jobs ??
        data.items ??
        data.data ??
        [];
    }

    if (!Array.isArray(list)) {
      list = [];
    }

    /*
     * Merge backend jobs with local cache.
     * This preserves rich job details.
     */
    const localSaved = getCachedJobs();

    const mergedMap = new Map();

    localSaved.forEach((item) => {
      const id = getJobId(item);

      if (id) {
        mergedMap.set(String(id), item);
      }
    });

    list.forEach((item) => {
      const id = getJobId(item);

      if (!id) {
        return;
      }

      const key = String(id);
      const existing = mergedMap.get(key);

      if (
        existing &&
        typeof existing === "object" &&
        typeof item === "object"
      ) {
        /*
         * Backend data + existing rich local data
         */
        mergedMap.set(key, {
          ...item,
          ...existing,
        });
      } else if (typeof item === "object") {
        mergedMap.set(key, item);
      } else {
        mergedMap.set(key, {
          id,
          job_id: id,
        });
      }
    });

    const result = Array.from(
      mergedMap.values()
    );

    setCachedJobs(result);

    return result;
  } catch (error) {
    console.warn(
      "Backend fetch saved jobs failed. Using localStorage fallback:",
      error
    );

    return getCachedJobs();
  }
};

/* =========================================================
   CHECK JOB SAVED
   GET /saved/{jobId}
========================================================= */

export const checkJobSaved = async (
  jobIdInput
) => {
  const jobId = getJobId(jobIdInput);

  if (!jobId) {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(
    `${BASE_URL}/saved/${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, response.status)
    );
  }

  /*
   * Backend returns:
   * true / false
   */
  if (typeof data === "boolean") {
    return data;
  }

  /*
   * Backend returns:
   * { isSaved: true }
   * { saved: true }
   * { is_saved: true }
   */
  if (
    data &&
    typeof data === "object"
  ) {
    if (typeof data.isSaved === "boolean") {
      return data.isSaved;
    }

    if (typeof data.saved === "boolean") {
      return data.saved;
    }

    if (typeof data.is_saved === "boolean") {
      return data.is_saved;
    }
  }

  return Boolean(data);
};

/* =========================================================
   ALIAS
========================================================= */

export const isJobSaved = checkJobSaved;

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const saveJobService = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkJobSaved,
  isJobSaved,
  getJobId,
};

export default saveJobService;