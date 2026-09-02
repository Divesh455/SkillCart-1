import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import jobService from "../../services/jobService";

function getStoredResumeId() {
  const directKeys = ["res_id", "resume_id", "resId", "Rid", "rid"];
  for (const key of directKeys) {
    const val = localStorage.getItem(key);
    if (val && val !== "null" && val !== "undefined" && String(val).trim() !== "") {
      return String(val).trim();
    }
  }

  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      const rid = u?.resumeId || u?.resume_id || u?.res_id || u?.Rid || u?.rid;
      if (rid && rid !== "null" && rid !== "undefined" && String(rid).trim() !== "") {
        return String(rid).trim();
      }
    }
  } catch (e) {}

  return null;
}

export default function EvaluateFitButton({
  job,
  resId,
  onStartEvaluate,
  onResult,
  onError,
  className = "",
}) {
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async (event) => {
    // Don't trigger parent card clicks
    event?.stopPropagation?.();

    // Get job ID
    const jobId =
      job?.id ??
      job?.job_id ??
      job?._id;

    // Get resume ID from prop or localStorage
    const activeResId = resId || getStoredResumeId();

    // Check resume ID
    if (!activeResId) {
      alert(
        "Resume ID was not found. Please upload or save your resume first."
      );
      return;
    }

    // Check job ID
    if (!jobId) {
      alert("Job ID is not available for this role.");
      return;
    }

    try {
      setLoading(true);

      // Trigger modal open in skeleton/loading mode immediately
      onStartEvaluate?.();

      // Call evaluate API
      const result = await jobService.evaluateJobFit({
        resId: activeResId,
        jobId,
      });

      // Send result to parent component
      onResult?.(result);
    } catch (error) {
      console.error("Evaluate Fit error:", error);
      onError?.(error);
      alert(
        error?.message ||
        "Failed to evaluate resume fit with this job."
      );
    } finally {
      setLoading(false);
    }
  };

  const defaultClasses = `
    inline-flex
    items-center
    justify-center
    gap-1.5
    h-12
    px-5
    rounded-2xl
    bg-[#dff8eb]
    hover:bg-[#c9f2df]
    text-[#123c2c]
    text-sm
    font-semibold
    border
    border-[#19714e]/20
    transition-all
    disabled:opacity-50
    disabled:cursor-not-allowed
    cursor-pointer
  `;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleEvaluate}
      disabled={loading}
      className={className || defaultClasses}
    >
      {loading ? (
        <>
          <Loader2 size={15} className="animate-spin text-[#19714e]" />
          <span>Evaluating Fit...</span>
        </>
      ) : (
        <>
          <Sparkles size={15} className="text-[#19714e]" />
          <span>Evaluate Fit</span>
        </>
      )}
    </motion.button>
  );
}