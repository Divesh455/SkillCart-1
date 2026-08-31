import api from "./api";
import saveJobService from "./savejobs";

const JOBS_API_URL =
  "https://skillcartcompany-4b97f884.fastapicloud.dev";

const AI_API_URL =
  "https://skillcart-ai.fastapicloud.dev";

async function fetchWithTimeout(
  url,
  options = {},
  timeoutMs = 30000
) {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const jobService = {
  getJobs: async ({
    limit = 20,
    offset = 0,
  } = {}) => {
    const response =
      await fetchWithTimeout(
        `${JOBS_API_URL}/jobs?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        15000
      );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch jobs (${response.status})`
      );
    }

    const data =
      await response.json();

    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
        limit,
        offset,
      };
    }

    return {
      items: data.items ?? data.data ?? [],
      total: data.total ?? 0,
      limit: data.limit ?? limit,
      offset: data.offset ?? offset,
    };
  },

  getJobById: async (jobId) => {
    if (
      jobId === undefined ||
      jobId === null ||
      jobId === ""
    ) {
      throw new Error(
        "Job ID is required."
      );
    }

    const response =
      await fetchWithTimeout(
        `${JOBS_API_URL}/jobs/${jobId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        15000
      );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch job ${jobId} (${response.status})`
      );
    }

    const data =
      await response.json();

    return (
      data?.data ??
      data?.job ??
      data?.item ??
      data
    );
  },
  evaluateJobFit: async ({
    resId,
    jobId,
  }) => {
    if (!resId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    if (!jobId) {
      throw new Error(
        "Job ID is required."
      );
    }

    const response = await fetch(
      "https://skillcart-ai.fastapicloud.dev/api/v1/resume/evaluate",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body: JSON.stringify({
          res_id: String(resId),
          job_id: String(jobId),
        }),
      }
    );

    const data =
      await response.json().catch(
        () => null
      );

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        data?.message ||
        `Evaluation failed (${response.status})`
      );
    }

    return data;
  },

  getMatchedJobs: async () => {
    const resId =
      localStorage.getItem("res_id") ||
      localStorage.getItem("resume_id") ||
      localStorage.getItem("resId");

    if (!resId) {
      throw new Error(
        "Resume ID not found. Please upload your resume first."
      );
    }

    const response =
      await fetchWithTimeout(
        `${AI_API_URL}/api/v1/career/match`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify({
            res_id: String(resId),
            top_k: 20,
          }),
        },
        30000
      );

    if (!response.ok) {
      throw new Error(
        `AI recommendation failed (${response.status})`
      );
    }

    const data =
      await response.json();

    let recommendations =
      data?.data?.recommended_jobs ??
      data?.recommended_jobs ??
      data?.results ??
      data?.data ??
      data;

    if (!Array.isArray(recommendations)) {
      throw new Error(
        "No recommended jobs returned."
      );
    }

    if (
      recommendations.length > 0 &&
      Array.isArray(
        recommendations[0]
      )
    ) {
      recommendations =
        recommendations[0];
    }

    const jobs =
      await Promise.all(
        recommendations
          .slice(0, 10)
          .map(async (item) => {
            const jobId =
              item?.job_id ??
              item?.id ??
              item?._id;

            const score = Number(
              item?.score ??
              item?.similarity ??
              item?.match_score ??
              0
            );

            if (!jobId) {
              return null;
            }

            try {
              const job =
                await jobService.getJobById(
                  jobId
                );

              return {
                ...job,
                matchScore:
                  score <= 1
                    ? Math.round(
                      score * 100
                    )
                    : Math.round(score),
                match_score: score,
              };
            } catch (error) {
              console.error(
                `Failed to load job ${jobId}:`,
                error
              );

              return null;
            }
          })
      );

    const validJobs =
      jobs.filter(Boolean);

    if (validJobs.length === 0) {
      throw new Error(
        "Could not load recommended job details."
      );
    }

    return validJobs;
  },

  saveJob: (jobId) => saveJobService.saveJob(jobId),

  unsaveJob: (jobId) => saveJobService.unsaveJob(jobId),

  getSavedJobs: () => saveJobService.getSavedJobs(),

  checkJobSaved: (jobId) => saveJobService.checkJobSaved(jobId),

  isJobSaved: (jobId) => saveJobService.checkJobSaved(jobId),
};

export default jobService;