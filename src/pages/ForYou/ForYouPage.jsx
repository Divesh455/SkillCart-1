import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { useSearchParams, useNavigate } from "react-router-dom";

import {
  useLocation,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Sparkles,
  BookmarkCheck,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import AppHeader from "../../components/common/AppHeader";

import saveJobService from "../../services/savejobs";
import jobService from "../../services/jobService";

import SwipeCard from "./SwipeCard";
import SwipeCardSkeleton from "./SwipeCardSkeleton";
import JobDetailModal from "./JobDetailModal";
import SavedJobs from "./SavedJobs";

// ============================================================
// CACHE KEYS
// ============================================================

const JOBS_CACHE_KEY =
  "skillcart_foryou_jobs_cache";

const CURRENT_INDEX_CACHE_KEY =
  "skillcart_foryou_current_index";

const SAVED_JOBS_CACHE_KEY =
  "skillcart_foryou_saved_jobs";


// ============================================================
// COMPONENT
// ============================================================

export default function ForYouPage() {
  const navigate = useNavigate();
  const location =
    useLocation();

  // ==========================================================
  // RECOMMENDED JOBS
  // ==========================================================

  const [jobs, setJobs] =
    useState(() => {
      try {
        const cached =
          sessionStorage.getItem(
            JOBS_CACHE_KEY
          );

        return cached
          ? JSON.parse(cached)
          : [];
      } catch {
        return [];
      }
    });

  // ==========================================================
  // CURRENT CARD INDEX
  // ==========================================================

  const [currentIndex, setCurrentIndex] =
    useState(() => {
      try {
        const cachedIndex =
          sessionStorage.getItem(
            CURRENT_INDEX_CACHE_KEY
          );

        return cachedIndex
          ? Number(cachedIndex)
          : 0;
      } catch {
        return 0;
      }
    });

  // ==========================================================
  // SAVED JOBS
  // ==========================================================

  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      const saved = localStorage.getItem("skillcart_saved_jobs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSavedJobsLoading, setIsSavedJobsLoading] =
    useState(false);

  const [savedJobsError, setSavedJobsError] =
    useState(null);

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [selectedJob, setSelectedJob] =
    useState(null);

  const [showSaved, setShowSaved] =
    useState(() =>
      location.search.includes(
        "view=saved"
      )
    );

  const [isLoading, setIsLoading] =
    useState(
      () => jobs.length === 0
    );

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  // ==========================================================
  // URL → SAVED VIEW
  // ==========================================================

  useEffect(() => {
    if (
      location.search.includes(
        "view=saved"
      ) ||
      location.hash === "#saved" ||
      location.pathname === "/saved" ||
      location.pathname === "/saved-jobs"
    ) {
      setShowSaved(true);
    } else {
      setShowSaved(false);
    }
  }, [location]);

  const fetchSavedJobs = useCallback(
    async () => {
      setIsSavedJobsLoading(true);
      setSavedJobsError(null);

      try {
        const jobs =
          await saveJobService.getSavedJobs();

        console.log(
          "Saved jobs loaded:",
          jobs
        );

        setSavedJobs(jobs);
      } catch (error) {
        console.error(
          "Failed to load saved jobs:",
          error
        );

        setSavedJobs([]);
        setSavedJobsError(
          error?.message ||
          "Failed to load saved jobs."
        );
      } finally {
        setIsSavedJobsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs, showSaved]);

  // ==========================================================
  // FETCH AI RECOMMENDATIONS
  // ==========================================================

  const fetchMatchedJobs =
    useCallback(
      async (
        forceRefresh = false
      ) => {
        if (forceRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        try {
          // --------------------------------------------------
          // jobService gets res_id from localStorage
          // and calls:
          //
          // POST
          // https://skillcart-ai.onrender.com
          // api/v1/career/match
          // --------------------------------------------------

          const matchedJobs =
            await jobService.getMatchedJobs();

          if (
            !Array.isArray(
              matchedJobs
            ) ||
            matchedJobs.length === 0
          ) {
            throw new Error(
              "No recommended jobs found."
            );
          }

          // --------------------------------------------------
          // Store real AI recommendations
          // --------------------------------------------------

          setJobs(matchedJobs);

          // Start from first recommendation
          setCurrentIndex(0);

          // --------------------------------------------------
          // Cache recommendations
          // --------------------------------------------------

          try {
            sessionStorage.setItem(
              JOBS_CACHE_KEY,
              JSON.stringify(
                matchedJobs
              )
            );

            sessionStorage.setItem(
              CURRENT_INDEX_CACHE_KEY,
              "0"
            );
          } catch (cacheError) {
            console.warn(
              "Could not cache recommendations:",
              cacheError
            );
          }
        } catch (err) {
          console.error(
            "Failed to fetch AI recommendations:",
            err
          );

          setJobs([]);
          setCurrentIndex(0);

          const message =
            err?.message ||
            "Failed to load recommended jobs.";

          setError(message);
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      []
    );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    /*
     * If cached jobs exist, show them immediately.
     *
     * Otherwise call AI API.
     */
    if (jobs.length === 0) {
      fetchMatchedJobs();
    }
  }, [
    jobs.length,
    fetchMatchedJobs,
  ]);

  // ==========================================================
  // CURRENT INDEX CACHE
  // ==========================================================

  useEffect(() => {
    try {
      sessionStorage.setItem(
        CURRENT_INDEX_CACHE_KEY,
        String(currentIndex)
      );
    } catch (error) {
      console.warn(
        "Could not save current index:",
        error
      );
    }
  }, [currentIndex]);

  // ==========================================================
  // SAVED JOBS CACHE
  // ==========================================================

  useEffect(() => {
    if (showSaved) {
      fetchSavedJobs();
    }
  }, [
    showSaved,
    fetchSavedJobs,
  ]);

  // ==========================================================
  // JOB ID HELPER
  // ==========================================================

  const getJobId = (
    job
  ) => {
    return (
      job?.id ??
      job?._id ??
      job?.job_id
    );
  };

  // ==========================================================
  // SWIPE
  // ==========================================================

  const handleSwipe = (direction) => {
    if (currentIndex >= jobs.length) {
      return;
    }

    const currentJob = jobs[currentIndex];

    // Right Swipe = Save Job via API
    if (direction === "right" && currentJob) {
      const currentId = getJobId(currentJob);
      if (currentId !== undefined && currentId !== null && currentId !== "") {
        // Call saveJob API asynchronously with silent catch block
        saveJobService.saveJob(currentId, currentJob).catch((err) => {
          console.error("Failed to save job on backend right swipe:", err);
        });

        // Update local saved jobs state & cache
        setSavedJobs((previousJobs) => {
          const alreadySaved = previousJobs.some(
            (savedJob) => String(getJobId(savedJob)) === String(currentId)
          );

          if (alreadySaved) {
            return previousJobs;
          }

          const updated = [...previousJobs, currentJob];
          try {
            localStorage.setItem(
              "skillcart_saved_jobs",
              JSON.stringify(updated)
            );
          } catch (e) {}
          return updated;
        });
      }
    }
    // Left Swipe = Dismiss/Ignore (No save API call)

    // Remove/pop card from current viewing stack by advancing index
    setCurrentIndex((previousIndex) => {
      const nextIndex = previousIndex + 1;
      if (jobs.length > 0 && nextIndex >= jobs.length) {
        return 0;
      }
      return nextIndex;
    });
  };

  // ==========================================================
  // TOGGLE SAVE
  // ==========================================================

  const handleToggleSaveJob =
    async (jobToToggle) => {
      if (!jobToToggle) {
        return;
      }

      const jobId =
        getJobId(
          jobToToggle
        );

      if (
        jobId === undefined ||
        jobId === null ||
        jobId === ""
      ) {
        return;
      }

      const isAlreadySaved = savedJobs.some(
        (job) => String(getJobId(job)) === String(jobId)
      );

      try {
        if (isAlreadySaved) {
          setSavedJobs((previousJobs) => {
            const updated = previousJobs.filter(
              (job) => String(getJobId(job)) !== String(jobId)
            );
            try {
              localStorage.setItem("skillcart_saved_jobs", JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
          saveJobService.unsaveJob(jobId).catch((err) => console.warn("Backend unsaveJob:", err));
        } else {
          setSavedJobs((previousJobs) => {
            const updated = [...previousJobs, jobToToggle];
            try {
              localStorage.setItem("skillcart_saved_jobs", JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
          saveJobService.saveJob(jobId, jobToToggle).catch((err) => console.warn("Backend saveJob:", err));
        }
      } catch (err) {
        console.error("Failed to toggle save job:", err);
      }
    };

  // ==========================================================
  // REMOVE SAVED JOB
  // ==========================================================

  const handleRemoveSavedJob =
    async (jobId) => {
      if (jobId === undefined || jobId === null || jobId === "") {
        return;
      }

      try {
        await saveJobService.unsaveJob(jobId);
        setSavedJobs(
          (previousJobs) =>
            previousJobs.filter(
              (job) =>
                String(
                  getJobId(job)
                ) !==
                String(jobId)
            )
        );
      } catch (err) {
        console.error("Failed to remove saved job:", err);
      }
    };

  // ==========================================================
  // RESET DECK
  // ==========================================================

  const handleResetStack =
    () => {
      setCurrentIndex(0);
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#0e1d18] text-[#12221d] font-sans relative overflow-hidden flex flex-col">

      {/* ====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 bg-gradient-to-br from-[#123c2c] via-[#0b241b] to-[#19714e]/40 pointer-events-none" />

      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-[#19714e]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-[#b9ef84]/15 rounded-full blur-3xl pointer-events-none" />

      {/* ====================================================
          HEADER
      ===================================================== */}

      <AppHeader />

      {/* ====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 flex flex-col">



        {/* ==================================================
            CONTENT
        =================================================== */}

        <div className="flex-1 flex flex-col justify-center items-center">

          {/* =================================================
              SAVED JOBS
          ================================================= */}

          {showSaved ? (
            <div className="w-full">

              <SavedJobs
                savedJobs={savedJobs}
                isLoading={isSavedJobsLoading}
                error={savedJobsError}
                onSelectJob={(job) => setSelectedJob(job)}
                onRemoveSaved={handleRemoveSavedJob}
                onBackToSwipe={() => navigate("/jobs")}
              />

            </div>
          ) : (

            <div className="w-full max-w-md flex flex-col items-center">

              {/* =============================================
                  ERROR
              ============================================== */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="mb-4 w-full p-4 bg-rose-500/20 border border-rose-400/40 backdrop-blur-md rounded-2xl text-rose-100 text-xs shadow-lg"
                >

                  <div className="flex items-start gap-3">

                    <AlertCircle
                      size={18}
                      className="shrink-0 mt-0.5"
                    />

                    <div className="flex-1">

                      <p className="font-bold">
                        Unable to load recommendations
                      </p>

                      <p className="mt-1 text-rose-200/90">
                        {error}
                      </p>

                    </div>

                  </div>

                  {error.includes("Resume ID not found") ? (
                    <button
                      type="button"
                      onClick={() => navigate("/resume")}
                      className="mt-3 w-full py-2.5 bg-[#b9ef84] hover:bg-white text-[#123c2c] rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Upload Resume Now
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        fetchMatchedJobs(
                          true
                        )
                      }
                      disabled={
                        isRefreshing
                      }
                      className="mt-3 w-full py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >

                      <RefreshCw
                        size={14}
                        className={
                          isRefreshing
                            ? "animate-spin"
                            : ""
                        }
                      />

                      {isRefreshing
                        ? "Retrying..."
                        : "Try Again"}

                    </button>
                  )}

                </motion.div>
              )}

              {/* =============================================
                  LOADING
              ============================================== */}

              {isLoading && (
                <div className="relative w-full h-[440px] xs:h-[480px] sm:h-[550px] my-auto">

                  <SwipeCardSkeleton />

                </div>
              )}

              {/* =============================================
                  EMPTY
              ============================================== */}

              {!isLoading &&
                !error &&
                (
                  jobs.length ===
                  0 ||
                  currentIndex >=
                  jobs.length
                ) && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 p-6 sm:p-10 rounded-3xl text-center text-white shadow-2xl flex flex-col items-center justify-center space-y-4 my-auto"
                  >

                    <div className="w-14 h-14 rounded-3xl bg-[#b9ef84]/20 border border-[#b9ef84]/30 text-[#b9ef84] flex items-center justify-center">

                      <CheckCircle2
                        size={32}
                      />

                    </div>

                    <div>

                      <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white">
                        You're All Caught Up!
                      </h2>

                      <p className="text-xs text-white/70 max-w-xs leading-relaxed mt-1">
                        You've reviewed all recommended jobs.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleResetStack
                      }
                      className="w-full max-w-xs py-2.5 rounded-2xl bg-[#b9ef84] text-[#123c2c] font-bold text-xs hover:bg-white transition-all shadow-md flex items-center justify-center gap-2"
                    >

                      <RotateCcw
                        size={15}
                      />

                      Restart Deck

                    </button>

                  </motion.div>
                )}

              {/* =============================================
                  CARD STACK
              ============================================== */}

              {!isLoading &&
                !error &&
                jobs.length > 0 &&
                currentIndex <
                jobs.length && (
                  <div className="w-full flex flex-col items-center">

                    {/* Swipe hint */}

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mb-2 flex items-center justify-center gap-2 text-[11px] font-semibold text-white/90 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15"
                    >

                      <span className="flex items-center gap-1 text-rose-300">
                        <ArrowLeft
                          size={12}
                        />

                        Swipe left to skip
                      </span>

                      <span className="text-white/30">
                        |
                      </span>

                      <span className="flex items-center gap-1 text-[#b9ef84]">
                        Swipe right to save

                        <ArrowRight
                          size={12}
                        />
                      </span>

                    </motion.div>

                    {/* Card stack */}

                    <div className="relative w-full max-w-md h-[440px] xs:h-[480px] sm:h-[550px] my-auto">

                      <AnimatePresence mode="popLayout">

                        {jobs
                          .slice(
                            currentIndex,
                            currentIndex + 3
                          )
                          .map(
                            (
                              job,
                              index
                            ) => {

                              const jobId =
                                getJobId(
                                  job
                                );

                              return (
                                <SwipeCard
                                  key={
                                    jobId ??
                                    `job-${currentIndex}-${index}`
                                  }
                                  job={job}
                                  isFront={
                                    index ===
                                    0
                                  }
                                  stackIndex={
                                    index
                                  }
                                  onSwipe={
                                    handleSwipe
                                  }
                                  onClickCard={(
                                    clickedJob
                                  ) =>
                                    setSelectedJob(
                                      clickedJob
                                    )
                                  }
                                />
                              );
                            }
                          )}

                      </AnimatePresence>

                    </div>

                  </div>
                )}

            </div>
          )}

        </div>

      </main>

      {/* ====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() =>
            setSelectedJob(null)
          }
          isSaved={savedJobs.some(
            (savedJob) =>
              String(
                getJobId(
                  savedJob
                )
              ) ===
              String(
                getJobId(
                  selectedJob
                )
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