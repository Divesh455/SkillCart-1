const AYUSH_API_URL =
  "https://skillcartcampany-production.up.railway.app";

/**
 * Save job
 *
 * POST /saved
 *
 * Body:
 * {
 *   job_id: 123
 * }
 */
const saveJob = async (jobId) => {
  if (!jobId) {
    throw new Error("Job ID is missing.");
  }

  const response = await fetch(
    `${AYUSH_API_URL}/saved`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        job_id: Number(jobId),
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        `Failed to save job (${response.status})`
    );
  }

  return data;
};

export default {
  saveJob,
};