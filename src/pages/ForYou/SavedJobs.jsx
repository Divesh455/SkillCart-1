import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Building2,
  BookmarkCheck,
  ChevronRight,
} from "lucide-react";

import SavedJobSkeleton from "./SavedJobSkeleton";
import saveJobService from "../../services/savejobs";
import jobService from "../../services/jobService";
import JobDetailModal from "./JobDetailModal";

// Universal ID Extractor (handles primitives 1 / "1" and objects)
function getJobId(job) {
  if (job === null || job === undefined) return null;
  if (typeof job === "number" || typeof job === "string") {
    const str = String(job).trim();
    return str !== "" && str !== "undefined" && str !== "null" ? str : null;
  }
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
      if (str !== "" && str !== "undefined" && str !== "null") return str;
    }
  }
  return null;
}

function getJobTitle(job) {
  if (!job || typeof job !== "object") return "";
  return (
    job.job_title ??
    job.title ??
    job.role ??
    job.position ??
    job.name ??
    ""
  );
}

function getCompanyName(job) {
  if (!job || typeof job !== "object") return "";
  if (job.company && typeof job.company === "object") {
    return (
      job.company.company_name ??
      job.company.name ??
      ""
    );
  }
  return (
    job.company ??
    job.company_name ??
    job.employer ??
    job.organization ??
    ""
  );
}

export default function SavedJobs({
  savedJobs: initialSavedJobs = [],
  isLoading: initialLoading = false,
  error: initialError = null,
  onSelectJob,
  onRemoveSaved,
  onBackToSwipe,
}) {
  const [list, setList] = useState(initialSavedJobs);
  const [loading, setLoading] = useState(true);
  const [errMessage, setErrMessage] = useState(initialError);
  const [internalSelectedJob, setInternalSelectedJob] = useState(null);

  // Fetch saved jobs dynamically from API on mount
  useEffect(() => {
    let mounted = true;
    const fetchSaved = async () => {
      setLoading(true);
      setErrMessage(null);
      try {
        const data = await saveJobService.getSavedJobs();
        if (mounted && Array.isArray(data)) {
          setList(data);
        }
      } catch (err) {
        console.error("Failed to fetch saved jobs:", err);
        if (mounted) {
          setErrMessage(err?.message || "Failed to load saved jobs.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSaved();

    return () => {
      mounted = false;
    };
  }, []);

  // Remove / Unsave handler
  const handleRemove = async (jobId) => {
    if (!jobId) return;

    // Dynamically update UI list without full page reload
    setList((prev) =>
      prev.filter((job) => {
        const id = getJobId(job);
        return String(id) !== String(jobId);
      })
    );

    try {
      await saveJobService.unsaveJob(jobId);
    } catch (err) {
      console.error("Failed to unsave job:", err);
    }

    if (onRemoveSaved) {
      onRemoveSaved(jobId);
    }
  };

  // Card click handler to open Full Job Details View
  const handleCardClick = (job) => {
    if (onSelectJob) {
      onSelectJob(job);
    } else {
      setInternalSelectedJob(job);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white/90 backdrop-blur-md border border-[#dfe7e2] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#12221d] flex items-center gap-2">
              <BookmarkCheck size={22} className="text-[#19714e]" />
              <span>Saved Opportunities</span>
            </h2>
            <p className="text-xs text-[#68756f] mt-0.5">
              Review and manage your saved jobs.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#19714e] bg-[#dff8eb] px-3.5 py-1.5 rounded-full border border-[#19714e]/20">
          {list.length} {list.length === 1 ? "Job Saved" : "Jobs Saved"}
        </span>
      </div>

      {/* LOADING */}
      {loading && <SavedJobSkeleton count={3} />}

      {/* ERROR */}
      {errMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errMessage}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && list.length === 0 && (
        <div className="bg-white/90 backdrop-blur-md border border-[#dfe7e2] rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#f7faf8] border border-[#dfe7e2] text-[#68756f] flex items-center justify-center mx-auto">
            <BookmarkCheck size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-['Space_Grotesk'] text-[#12221d]">
              No Saved Jobs Yet
            </h3>
            <p className="text-xs text-[#68756f] mt-1 max-w-sm mx-auto">
              Save jobs from the For You section or Jobs Board and they will appear here.
            </p>
          </div>
          {onBackToSwipe && (
            <button
              type="button"
              onClick={onBackToSwipe}
              className="px-6 py-3 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Find Jobs</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* SAVED JOBS LIST */}
      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((job, index) => (
            <SavedJobCard
              key={getJobId(job) ?? `saved-job-${index}`}
              job={job}
              index={index}
              onSelectJob={handleCardClick}
              onRemoveSaved={handleRemove}
            />
          ))}
        </div>
      )}

      {/* REUSED JOB DETAIL MODAL */}
      {internalSelectedJob && (
        <JobDetailModal
          job={internalSelectedJob}
          onClose={() => setInternalSelectedJob(null)}
          isSaved={true}
          onToggleSave={async (jobToToggle) => {
            const id = getJobId(jobToToggle);
            if (id) {
              await handleRemove(id);
              setInternalSelectedJob(null);
            }
          }}
        />
      )}
    </motion.div>
  );
}

function SavedJobCard({
  job,
  index,
  onSelectJob,
  onRemoveSaved,
}) {
  const [fullJob, setFullJob] = useState(() => (typeof job === "object" ? job : null));
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const jobId = getJobId(job);

  useEffect(() => {
    const title = getJobTitle(job);
    const company = getCompanyName(job);
    if (title && company) {
      setFullJob(job);
      return;
    }

    if (!jobId) return;

    let isMounted = true;
    setIsFetchingDetails(true);
    jobService
      .getJobById(jobId)
      .then((data) => {
        if (isMounted && data && typeof data === "object") {
          setFullJob((prev) => ({ ...(prev || {}), ...data }));
        }
      })
      .catch((err) => {
        console.warn(`Failed to fetch details for saved job ${jobId}:`, err);
      })
      .finally(() => {
        if (isMounted) setIsFetchingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [jobId, job]);

  const activeJob = fullJob || (typeof job === "object" ? job : { id: jobId });
  const jobTitle = getJobTitle(activeJob) || (isFetchingDetails ? "Loading position..." : `Opportunity #${jobId}`);
  const companyName = getCompanyName(activeJob) || (isFetchingDetails ? "Loading company..." : "Company");

  return (
    <motion.div
      key={jobId ?? `saved-job-${index}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-[#dfe7e2] hover:border-[#19714e] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 group cursor-pointer"
      onClick={() => onSelectJob?.(activeJob)}
    >
      {/* DISPLAY ONLY COMPANY NAME AND ROLE/JOB TITLE */}
      <div className="space-y-1 flex-1 min-w-0">
        <p className="text-xs font-bold text-[#19714e] flex items-center gap-1.5 truncate">
          <Building2 size={14} className="shrink-0 text-[#19714e]" />
          <span className="truncate">{companyName}</span>
        </p>
        <h3 className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-[#12221d] group-hover:text-[#19714e] transition-colors truncate">
          {jobTitle}
        </h3>
      </div>

      {/* DELETE / UNSAVE BUTTON */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemoveSaved?.(jobId);
        }}
        title="Unsave Job"
        className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
      >
        <Trash2 size={15} />
        <span>Delete</span>
      </button>
    </motion.div>
  );
}