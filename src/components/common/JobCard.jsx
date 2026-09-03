import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Building2,
  Bookmark,
  ArrowUpRight,
  Sparkles,
  Zap,
  BrainCircuit,
} from "lucide-react";

import EvaluateFitButton from "./EvaluateFitButton";
import JobEvaluationModal from "./JobEvaluationModal";
import PrepareCategoryModal from "./PrepareCategoryModal";
/**
 * Helper to generate deterministic gradient background based on company name
 */
function getCompanyGradient(name = "J") {
  const charCode = name.charCodeAt(0) || 74;
  const gradients = [
    "from-[#123c2c] to-[#19714e] text-[#b9ef84]",
    "from-indigo-900 to-purple-800 text-purple-200",
    "from-emerald-900 to-teal-700 text-teal-200",
    "from-cyan-900 to-blue-800 text-cyan-200",
    "from-slate-900 to-emerald-900 text-emerald-300",
  ];
  return gradients[charCode % gradients.length];
}

/**
 * Helper to style work mode badge with distinct color combinations
 */
function getWorkModeBadge(mode = "On-site") {
  const modeLower = mode.toLowerCase();
  if (modeLower.includes("remote")) {
    return "bg-teal-50 text-teal-700 border-teal-200/80";
  }
  if (modeLower.includes("hybrid")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
  }
  return "bg-amber-50 text-amber-700 border-amber-200/80";
}

export default function JobCard({ job, resId, onClick, isSaved, onToggleSave, saving = false, }) {
  const navigate = useNavigate();
  const saved = isSaved ?? false;

  // Helper to format currency salary cleanly
  const formatSalary = (min, max, currency) => {
    if (!min && !max) return "Competitive Salary";
    const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : `${currency} `;

    if (currency === "INR" && (min >= 100000 || max >= 100000)) {
      const minL = (min / 100000).toFixed(min % 100000 === 0 ? 0 : 1);
      const maxL = (max / 100000).toFixed(max % 100000 === 0 ? 0 : 1);
      return `${symbol}${minL}L - ${symbol}${maxL}L / yr`;
    }
    return `${symbol}${min?.toLocaleString()} - ${symbol}${max?.toLocaleString()} / yr`;
  };

  // Helper to format experience range
  const formatExperience = (min, max) => {
    if (min === 0 && max === 0) return "Freshers / Entry";
    if (min === 0 && max === 1) return "0–1 yrs exp";
    return `${min}–${max} yrs exp`;
  };

  // Format date string
  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isClosingSoon = job.status?.toUpperCase() === "CLOSING SOON";
  const avatarGradient = getCompanyGradient(job.company_name);
  const workModeStyle = getWorkModeBadge(job.work_mode);

  const handleBookmarkClick = (e) => {
    e.stopPropagation();

    if (onToggleSave && !saving) {
      onToggleSave(job);
    }
  };
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleSelectCategory = (category) => {
    setIsCategoryModalOpen(false);
    const jobId = job?.id ?? job?.job_id ?? job?._id;
    if (jobId) {
      navigate(`/interview/prepare/${jobId}?category=${encodeURIComponent(category)}`, {
        state: { job, resId, category },
      });
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -5,
          scale: 1.01,
          transition: { duration: 0.22, ease: "easeOut" },
        }}
        onClick={onClick}
        className="bg-white border border-[#dfe7e2] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs hover:shadow-xl hover:shadow-[#19714e]/10 hover:border-[#19714e]/50 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
      >
        {/* Top Accent Gradient Border Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#123c2c] via-[#19714e] to-[#b9ef84] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div>
          {/* Top Header: Company Avatar, Title, Status & Bookmark */}
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <div className="flex items-start gap-2.5 sm:gap-3.5 flex-1 min-w-0">
              {/* Company Logo Badge */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 4 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${avatarGradient} font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-md font-['Space_Grotesk'] border border-white/20`}
              >
                {job.company_name ? job.company_name.charAt(0).toUpperCase() : "J"}
              </motion.div>

              <div className="flex-1 min-w-0">
                {/* Job Title */}
                <h3 className="font-bold text-sm sm:text-lg text-[#12221d] font-['Space_Grotesk'] group-hover:text-[#19714e] transition-colors line-clamp-1 leading-snug">
                  {job.job_title}
                </h3>

                {/* Company Name & Dept */}
                <p className="text-[11px] sm:text-xs font-medium text-[#68756f] flex items-center gap-1 mt-0.5 truncate">
                  <Building2 size={13} className="text-[#19714e]" />
                  <span className="text-[#12221d] font-semibold truncate">{job.company_name}</span>
                  {job.department && (
                    <>
                      <span className="text-[#68756f]/50">•</span>
                      <span className="text-[#68756f] truncate">{job.department}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Bookmark Action */}
            <motion.button
              whileHover={{ scale: saving ? 1 : 1.15 }}
              whileTap={{ scale: saving ? 1 : 0.85 }}
              onClick={handleBookmarkClick}
              disabled={saving}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 shrink-0 border ${saved
                  ? "bg-[#dff8eb] text-[#19714e] border-[#19714e]/30 shadow-xs"
                  : "bg-[#f7faf8] text-[#68756f] border-[#dfe7e2] hover:text-[#12221d] hover:bg-white"
                }`}
              title={
                saving
                  ? "Saving..."
                  : saved
                    ? "Saved"
                    : "Save Job"
              }
            >
              <Bookmark
                size={16}
                className={saved ? "fill-[#19714e]" : ""}
              />
            </motion.button>
          </div>

          {/* Badges Row: Work Mode, Employment Type, Status */}
          <div className="flex flex-wrap items-center gap-1.5 my-3">
            <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl border ${workModeStyle}`}>
              {job.work_mode || "On-site"}
            </span>

            <span className="text-[10px] sm:text-[11px] font-semibold text-[#12221d] bg-[#f7faf8] border border-[#dfe7e2] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl">
              {job.employment_type || "Full-Time"}
            </span>

            {isClosingSoon && (
              <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl animate-pulse">
                🔥 Closing Soon
              </span>
            )}

            {job.industry && (
              <span className="text-[10px] sm:text-[11px] font-medium text-[#68756f] bg-white border border-[#dfe7e2] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl truncate max-w-[130px] sm:max-w-[170px]">
                {job.industry}
              </span>
            )}
          </div>

          {/* Job Details Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3.5 pt-3 border-t border-[#dfe7e2]/70 text-xs text-[#68756f]">
            <div className="flex items-center gap-2 truncate p-2 rounded-xl bg-[#f7faf8]/60 border border-[#dfe7e2]/50">
              <MapPin size={14} className="text-[#19714e] shrink-0" />
              <span className="truncate font-medium text-[#12221d]">{job.location || "Multiple Locations"}</span>
            </div>

            <div className="flex items-center gap-2 truncate p-2 rounded-xl bg-[#f7faf8]/60 border border-[#dfe7e2]/50">
              <Briefcase size={14} className="text-[#19714e] shrink-0" />
              <span className="truncate font-medium text-[#12221d]">{formatExperience(job.experience_min, job.experience_max)}</span>
            </div>

            <div className="flex items-center gap-2 col-span-1 sm:col-span-2 text-[#19714e] font-bold p-2.5 rounded-xl bg-[#dff8eb]/50 border border-[#19714e]/20 mt-0.5">
              <IndianRupee size={15} className="shrink-0" />
              <span className="font-mono text-xs text-[#123c2c]">
                {formatSalary(job.salary_min, job.salary_max, job.currency)}
              </span>
            </div>
          </div>

        </div>

        {/* Action Buttons Row: Evaluate Fit | Prepare | Apply */}
        <div className="flex items-center justify-between w-full gap-1.5 sm:gap-2 pt-1">

          {/* 1. EVALUATE FIT */}
          <EvaluateFitButton
            job={job}
            resId={resId}
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 sm:gap-1.5 h-10 sm:h-11 px-2 sm:px-3 rounded-xl sm:rounded-2xl bg-[#dff8eb] hover:bg-[#c9f2df] text-[#123c2c] text-[11px] sm:text-xs font-bold border border-[#19714e]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs truncate"
            onStartEvaluate={() => {
              setIsEvaluationModalOpen(true);
              setIsEvaluating(true);
              setEvaluationError(null);
              setEvaluationResult(null);
            }}
            onResult={(result) => {
              setEvaluationResult(result);
              setIsEvaluating(false);
            }}
            onError={(err) => {
              setEvaluationError(err?.message || "Evaluation failed.");
              setIsEvaluating(false);
            }}
          />

          {/* 2. PREPARE (Interview Preparation) */}
          <motion.button
            type="button"
            whileHover={{
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.94,
            }}
            onClick={(e) => {
              e.stopPropagation();
              const jobId = job?.id ?? job?.job_id ?? job?._id;
              if (jobId) {
                setIsCategoryModalOpen(true);
              } else {
                alert("Job ID not available for interview preparation.");
              }
            }}
            className="
              flex-1
              min-w-0
              inline-flex
              items-center
              justify-center
              gap-1
              sm:gap-1.5
              h-10
              sm:h-11
              px-2
              sm:px-3
              rounded-xl
              sm:rounded-2xl
              bg-[#f7faf8]
              hover:bg-[#eaf5ef]
              text-[#123c2c]
              hover:text-[#19714e]
              text-[11px]
              sm:text-xs
              font-bold
              border
              border-[#dfe7e2]
              hover:border-[#19714e]/40
              transition-all
              shadow-2xs
              hover:shadow-xs
              cursor-pointer
              truncate
            "
            title="Prepare for this Interview with AI"
          >
            <BrainCircuit size={14} className="text-[#19714e] shrink-0" />
            <span className="truncate">Prepare</span>
          </motion.button>

          {/* 3. APPLY */}
          <motion.button
            type="button"
            whileHover={{
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.94,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) {
                onClick();
              }
            }}
            className="
              flex-1
              min-w-0
              inline-flex
              items-center
              justify-center
              gap-1
              sm:gap-1.5
              h-10
              sm:h-11
              px-2
              sm:px-3
              rounded-xl
              sm:rounded-2xl
              bg-[#123c2c]
              hover:bg-[#19714e]
              text-white
              text-[11px]
              sm:text-xs
              font-bold
              transition-all
              shadow-md
              shadow-[#123c2c]/15
              cursor-pointer
              truncate
            "
          >
            <span className="truncate">Apply</span>
            <ArrowUpRight size={13} className="shrink-0" />
          </motion.button>

        </div>

      </motion.article>

      {/* EVALUATION MODAL */}
      {isEvaluationModalOpen && (
        <JobEvaluationModal
          isLoading={isEvaluating}
          result={evaluationResult}
          error={evaluationError}
          job={job}
          onClose={() => {
            setIsEvaluationModalOpen(false);
            setIsEvaluating(false);
            setEvaluationResult(null);
            setEvaluationError(null);
          }}
        />
      )}

      {/* PREPARE CATEGORY SELECTION MODAL */}
      <PrepareCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        job={job}
        onSelectCategory={handleSelectCategory}
      />
    </>
  );
}

