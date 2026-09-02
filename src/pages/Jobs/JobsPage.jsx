import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  AlertCircle,
  Briefcase,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";

import saveJobService from "../../services/savejobs";
import AppHeader from "../../components/common/AppHeader";
import JobCard from "../../components/common/JobCard";
import JobCardSkeleton from "../../components/common/JobCardSkeleton";
import Pagination from "../../components/common/Pagination";
import JobDetailModal from "../ForYou/JobDetailModal";
import jobService from "../../services/jobService";

const SAVED_JOBS_KEY = "skillcart_saved_jobs";


export default function JobsPage() {

  const [savedJobIds, setSavedJobIds] = useState(
    new Set()
  );

  const [savingJobId, setSavingJobId] =
    useState(null);

  const [saveMessage, setSaveMessage] =
    useState("");
  // =========================================================
  // JOB DATA
  // =========================================================

  const [jobs, setJobs] = useState([]);
  const [totalJobsCount, setTotalJobsCount] = useState(0);

  // =========================================================
  // LOADING / ERROR
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================
  // SELECTED JOB
  // =========================================================

  const [selectedJob, setSelectedJob] =
    useState(null);

  // =========================================================
  // SAVED JOBS
  // =========================================================

  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      const saved = localStorage.getItem(
        SAVED_JOBS_KEY
      );

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const list = await saveJobService.getSavedJobs();
        if (Array.isArray(list)) {
          setSavedJobs(list);
          const ids = new Set(
            list.map((item) => String(item?.id ?? item?.job_id ?? item?._id ?? item)).filter(Boolean)
          );
          setSavedJobIds(ids);
        }
      } catch (err) {
        console.warn("Failed to fetch saved jobs on mount:", err);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleSaveJob = async (job) => {
    const jobId =
      job?.id ??
      job?.job_id ??
      job?._id;

    if (!jobId) {
      setSaveMessage("Job ID not found.");
      return;
    }

    const isAlreadySaved =
      savedJobIds.has(String(jobId)) ||
      savedJobs.some(
        (savedJob) =>
          String(savedJob?.id ?? savedJob?.job_id ?? savedJob?._id) === String(jobId)
      );

    try {
      setSavingJobId(jobId);
      setSaveMessage("");

      if (isAlreadySaved) {
        setSavedJobIds((previous) => {
          const next = new Set(previous);
          next.delete(String(jobId));
          return next;
        });

        setSavedJobs((previous) => {
          const updated = previous.filter(
            (savedJob) =>
              String(savedJob?.id ?? savedJob?.job_id ?? savedJob?._id) !== String(jobId)
          );
          try {
            localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        await saveJobService.unsaveJob(jobId);
        setSaveMessage("Job removed from saved jobs.");
      } else {
        setSavedJobIds((previous) => {
          const next = new Set(previous);
          next.add(String(jobId));
          return next;
        });

        if (job) {
          setSavedJobs((previous) => {
            const updated = [...previous, job];
            try {
              localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }

        await saveJobService.saveJob(jobId, job);
        setSaveMessage("Job saved successfully.");
      }
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (err) {
      console.error("Save job API error:", err);
      setSaveMessage(err.message || "Failed to update saved status.");
      setTimeout(() => {
        setSaveMessage("");
      }, 4000);
    } finally {
      setSavingJobId(null);
    }
  };

  const handleToggleSaveJob = handleSaveJob;

  // =========================================================
  // PAGINATION
  // =========================================================

  const LIMIT = 20;

  const [offset, setOffset] =
    useState(0);

  // =========================================================
  // SEARCH
  // =========================================================

  const [searchTerm, setSearchTerm] =
    useState("");

  // =========================================================
  // FETCH JOBS
  // =========================================================

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await jobService.getJobs({
          limit: LIMIT,
          offset,
        });

      setJobs(
        Array.isArray(response.items)
          ? response.items
          : []
      );

      setTotalJobsCount(
        Number(response.total ?? 0)
      );
    } catch (err) {
      console.error(
        "Jobs API error:",
        err
      );

      setJobs([]);
      setTotalJobsCount(0);

      setError(
        err?.message ||
        "Unable to load jobs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [offset]);

  // =========================================================
  // FETCH WHEN OFFSET CHANGES
  // =========================================================

  useEffect(() => {
    fetchJobs();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [fetchJobs]);

  // =========================================================
  // SAVE JOBS TO LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        SAVED_JOBS_KEY,
        JSON.stringify(savedJobs)
      );
    } catch (err) {
      console.warn(
        "Could not save jobs to localStorage:",
        err
      );
    }
  }, [savedJobs]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
  };



  // =========================================================
  // SEARCH FILTER
  // =========================================================

  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase();

  const filteredJobs = jobs.filter(
    (job) => {
      if (!normalizedSearch) {
        return true;
      }

      const jobTitle =
        job.job_title ||
        job.title ||
        "";

      const companyName =
        job.company_name ||
        job.company?.company_name ||
        job.company?.name ||
        "";

      const department =
        job.department ||
        "";

      const location =
        job.location ||
        "";

      const requiredSkills = Array.isArray(
        job.required_skills
      )
        ? job.required_skills.join(" ")
        : "";

      const preferredSkills =
        Array.isArray(
          job.preferred_skills
        )
          ? job.preferred_skills.join(" ")
          : "";

      const searchableText = [
        jobTitle,
        companyName,
        department,
        location,
        requiredSkills,
        preferredSkills,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    }
  );

  // =========================================================
  // RESET FILTER
  // =========================================================

  const handleResetFilters = () => {
    setSearchTerm("");
    setOffset(0);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#12221d] font-sans flex flex-col selection:bg-[#dff8eb] selection:text-[#19714e]">

      {saveMessage && (
        <div
          className="
      fixed
      top-5
      right-5
      z-[9999]
      px-5
      py-3
      rounded-xl
      shadow-lg
      font-semibold
      text-sm
      bg-white
      border
      border-[#dfe7e2]
    "
        >
          {saveMessage}
        </div>
      )}
      {/* =====================================================
          HEADER
      ====================================================== */}

      <AppHeader />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ===================================================
            PAGE HEADER
        ==================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-white via-[#f7faf8] to-[#dff8eb]/30 border border-[#dfe7e2] p-6 rounded-3xl shadow-2xs">

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dff8eb] text-[#19714e] text-xs font-bold mb-2 border border-[#19714e]/20">

              <Zap
                size={14}
                className="text-[#19714e] animate-pulse"
              />

              Live Job Listings
            </div>

            <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-[#12221d] tracking-tight">
              Explore Tech Opportunities
            </h1>

            <p className="text-xs sm:text-sm text-[#68756f] mt-1">
              Browse real-time job opportunities
              directly from SkillCart.
            </p>
          </div>

          {/* Refresh */}
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={fetchJobs}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#123c2c]/15 disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin text-[#b9ef84]"
                  : "text-[#b9ef84]"
              }
            />

            <span>
              {loading
                ? "Refreshing..."
                : "Refresh Listings"}
            </span>
          </motion.button>
        </div>

        {/* ===================================================
            SEARCH
        ==================================================== */}

        <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 mb-8 shadow-sm">

          <div className="relative flex items-center">

            <Search
              size={18}
              className="absolute left-4 text-[#19714e] pointer-events-none"
            />

            <input
              type="text"
              placeholder="Search job title, company, skill, or location..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              className="w-full py-3 pl-11 pr-4 text-xs sm:text-sm bg-[#f7faf8] border border-[#dfe7e2] rounded-2xl text-[#12221d] placeholder-[#68756f]/60 outline-none focus:border-[#19714e] focus:bg-white focus:ring-2 focus:ring-[#19714e]/20 transition-all shadow-inner"
            />

          </div>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="space-y-6">

            <motion.div
              initial={{
                opacity: 0,
                y: -6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="flex items-center justify-between p-4 px-6 bg-gradient-to-r from-white via-[#dff8eb]/40 to-white border border-[#dff8eb] rounded-3xl shadow-xs"
            >

              <div className="flex items-center gap-3.5">

                <div className="w-9 h-9 rounded-2xl bg-[#dff8eb] text-[#19714e] flex items-center justify-center animate-pulse border border-[#19714e]/20">

                  <Sparkles size={18} />

                </div>

                <div>

                  <h4 className="text-xs font-bold text-[#12221d] font-['Space_Grotesk'] flex items-center gap-2">

                    <span>
                      Loading real job opportunities
                    </span>

                    <Loader2
                      size={14}
                      className="text-[#19714e] animate-spin"
                    />

                  </h4>

                  <p className="text-[11px] text-[#68756f]">
                    Fetching jobs from SkillCart API...
                  </p>

                </div>

              </div>

              <span className="text-xs font-bold text-[#19714e] bg-[#dff8eb] px-3.5 py-1 rounded-full border border-[#19714e]/20 hidden sm:inline-block">
                Live API
              </span>

            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <JobCardSkeleton count={6} />

            </div>

          </div>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {!loading && error && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="my-8 p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center max-w-xl mx-auto flex flex-col items-center shadow-lg"
          >

            <AlertCircle
              size={36}
              className="text-rose-500 mb-2"
            />

            <h3 className="font-bold text-sm text-rose-900">
              Failed to load jobs
            </h3>

            <p className="text-xs text-rose-700 mt-1 mb-4">
              {error}
            </p>

            <button
              onClick={fetchJobs}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Try Again
            </button>

          </motion.div>
        )}

        {/* ===================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          filteredJobs.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="py-16 px-6 bg-white border border-[#dfe7e2] rounded-3xl text-center max-w-md mx-auto my-8 shadow-xs space-y-4"
            >

              <div className="w-14 h-14 rounded-2xl bg-[#dff8eb] text-[#19714e] flex items-center justify-center mx-auto border border-[#19714e]/20">

                <Briefcase size={26} />

              </div>

              <div>

                <h3 className="font-bold text-base text-[#12221d] font-['Space_Grotesk']">
                  No matching jobs found
                </h3>

                <p className="text-xs text-[#68756f] mt-1 leading-relaxed">

                  {jobs.length > 0
                    ? "No jobs match your search."
                    : "No jobs are currently available."}

                </p>

              </div>

              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#123c2c] text-white text-xs font-bold rounded-xl hover:bg-[#19714e] transition-colors shadow-md"
              >
                Reset Search
              </button>

            </motion.div>
          )}

        {/* ===================================================
            JOB GRID
        ==================================================== */}

        {!loading &&
          !error &&
          filteredJobs.length > 0 && (

            <div className="space-y-6">

              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {
                    opacity: 0,
                  },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >

                {filteredJobs.map(
                  (job) => {
                    const jobId =
                      job.id ??
                      job._id ??
                      job.job_id;

                    const isSaved =
                      savedJobs.some(
                        (savedJob) =>
                          String(
                            savedJob.id ??
                            savedJob._id ??
                            savedJob.job_id
                          ) ===
                          String(jobId)
                      );

                    return (
                      <motion.div
                        key={jobId}
                        variants={{
                          hidden: {
                            opacity: 0,
                            y: 18,
                            scale: 0.98,
                          },
                          show: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                              duration: 0.35,
                            },
                          },
                        }}
                      >

                        <JobCard
                          job={job}
                          onClick={() => setSelectedJob(job)}
                          isSaved={savedJobIds.has(
                            String(
                              job?.id ??
                              job?.job_id ??
                              job?._id
                            )
                          )}
                          saving={
                            savingJobId ===
                            (
                              job?.id ??
                              job?.job_id ??
                              job?._id
                            )
                          }
                          onToggleSave={handleSaveJob}
                        />

                      </motion.div>
                    );
                  }
                )}

              </motion.div>

              {/* =================================================
                  PAGINATION
              ================================================== */}

              <Pagination
                offset={offset}
                limit={LIMIT}
                currentCount={jobs.length}
                totalCount={totalJobsCount}
                onPageChange={
                  handlePageChange
                }
              />

            </div>
          )}

      </main>

      {/* =====================================================
          JOB DETAIL MODAL
      ====================================================== */}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() =>
            setSelectedJob(null)
          }
          isSaved={savedJobs.some(
            (savedJob) =>
              String(
                savedJob.id ??
                savedJob._id ??
                savedJob.job_id
              ) ===
              String(
                selectedJob.id ??
                selectedJob._id ??
                selectedJob.job_id
              )
          )}
          onToggleSave={
            handleToggleSaveJob
          }
        />
      )}

    </div>
  );
}