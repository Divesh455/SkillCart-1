import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
} from "lucide-react";

import jobService from "../../services/jobService";

export default function EvaluateFitButton({
  job,
  resId,
  onResult,
}) {
  const [loading, setLoading] =
    useState(false);

  const handleEvaluate = async (event) => {
    // Don't open the job card
    event.stopPropagation();

    // Get job ID
    const jobId =
      job?.id ??
      job?.job_id ??
      job?._id;

    // Get resume ID from prop or localStorage
    const activeResId =
      resId ||
      localStorage.getItem("res_id") ||
      localStorage.getItem("resume_id") ||
      localStorage.getItem("resId");

    console.log(
      "Evaluate Fit clicked"
    );

    console.log(
      "res_id:",
      activeResId
    );

    console.log(
      "job_id:",
      jobId
    );

    // Check resume ID
    if (!activeResId) {
      alert(
        "Resume ID is not available. Please upload your resume first."
      );
      return;
    }

    // Check job ID
    if (!jobId) {
      alert(
        "Job ID is not available."
      );
      return;
    }

    try {
      setLoading(true);

      // Call backend
      const result =
        await jobService.evaluateJobFit({
          resId: activeResId,
          jobId,
        });

      console.log(
        "Evaluation result:",
        result
      );

      // Send result to JobCard
      onResult?.(result);

    } catch (error) {
      console.error(
        "Evaluate Fit error:",
        error
      );

      alert(
        error.message ||
        "Failed to evaluate job."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleEvaluate}
      disabled={loading}
      className="
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
"
    >
      {loading ? (
        <>
          <Loader2
            size={14}
            className="animate-spin"
          />

          <span>
            Evaluating...
          </span>
        </>
      ) : (
        <>
          <Sparkles
            size={14}
            className="text-[#19714e]"
          />

          <span>
            Evaluate Fit
          </span>
        </>
      )}
    </motion.button>
  );
}