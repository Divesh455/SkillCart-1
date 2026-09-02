import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Target,
  FileText,
  Copy,
  Check,
  Building2,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  Wand2,
  Loader2,
  RefreshCw,
  Cpu,
} from "lucide-react";

/**
 * Score Color & Fit Label Helper
 */
function getScoreDetails(score) {
  const num = typeof score === "number" ? score : Number(score) || 0;
  if (num >= 75) {
    return {
      textColor: "text-[#19714e]",
      bgColor: "bg-[#dff8eb]",
      borderColor: "border-[#19714e]/30",
      barColor: "bg-[#19714e]",
      label: "Strong Fit",
      desc: "High alignment with this job's core requirements and ATS criteria.",
    };
  }
  if (num >= 50) {
    return {
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      barColor: "bg-amber-500",
      label: "Moderate Fit",
      desc: "Good foundation, but requires addressing missing keywords & gaps.",
    };
  }
  return {
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    barColor: "bg-rose-500",
    label: "Needs Improvement",
    desc: "Significant gaps in experience and keywords compared to this job description.",
  };
}

/**
 * Skeleton Loader for Evaluation Modal
 */
function EvaluationModalSkeleton({ job, onClose }) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* ── HEADER SKELETON ── */}
      <div className="shrink-0 bg-white border-b border-[#dfe7e2] p-5 sm:px-7 sm:py-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] flex items-center justify-center shrink-0 shadow-md animate-pulse">
            <Sparkles size={24} className="animate-spin" style={{ animationDuration: "3s" }} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-6 w-48 sm:w-64 bg-gray-200 animate-pulse rounded-xl" />
              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#dff8eb] text-[#19714e] border border-[#19714e]/20 animate-pulse">
                <Loader2 size={11} className="animate-spin" />
                Analyzing Fit...
              </span>
            </div>

            {job?.job_title ? (
              <p className="text-xs font-semibold text-[#68756f] flex items-center gap-1.5 mt-1.5">
                <Building2 size={13} className="text-[#19714e]" />
                <span className="text-[#12221d] font-bold">{job.job_title}</span>
                {job.company_name && (
                  <>
                    <span>•</span>
                    <span>{job.company_name}</span>
                  </>
                )}
              </p>
            ) : (
              <div className="h-3.5 w-36 bg-gray-200 animate-pulse rounded-md mt-2" />
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-[#f7faf8] hover:bg-gray-200/80 text-[#68756f] hover:text-[#12221d] border border-[#dfe7e2] transition-colors cursor-pointer"
          title="Cancel evaluation"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── AI SCANNING STATUS STRIP ── */}
      <div className="shrink-0 bg-gradient-to-r from-[#dff8eb]/70 via-[#f7faf8] to-[#dff8eb]/70 border-b border-[#dfe7e2] px-5 sm:px-7 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#19714e] font-semibold">
          <Cpu size={15} className="animate-pulse text-[#19714e]" />
          <span className="animate-pulse">
            AI Engine scanning resume text, ATS compatibility, and requirements alignment...
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#68756f] hidden sm:inline-block">
          Please wait a few seconds
        </span>
      </div>

      {/* ── SCORE SUMMARY HERO BAR SKELETON ── */}
      <div className="shrink-0 bg-white px-5 sm:px-7 py-4 border-b border-[#dfe7e2]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch">
          {/* ATS Score Card Skeleton */}
          <div className="p-3.5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] flex items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-28 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-3.5 w-36 bg-gray-200 animate-pulse rounded-md" />
            </div>
            <div className="h-8 w-14 bg-gray-200 animate-pulse rounded-xl shrink-0" />
          </div>

          {/* JD Alignment Score Card Skeleton */}
          <div className="p-3.5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] flex items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-3.5 w-36 bg-gray-200 animate-pulse rounded-md" />
            </div>
            <div className="h-8 w-14 bg-gray-200 animate-pulse rounded-xl shrink-0" />
          </div>

          {/* Composite Fit Badge Skeleton */}
          <div className="p-3.5 rounded-2xl bg-[#dff8eb]/50 border border-[#19714e]/20 flex items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-24 bg-[#19714e]/20 animate-pulse rounded-md" />
              <div className="h-4 w-28 bg-[#19714e]/20 animate-pulse rounded-md" />
            </div>
            <div className="h-8 w-16 bg-[#19714e]/20 animate-pulse rounded-xl shrink-0" />
          </div>
        </div>
      </div>

      {/* ── TABS SKELETON ── */}
      <div className="shrink-0 bg-white/60 px-5 sm:px-7 pt-3 border-b border-[#dfe7e2] flex items-center gap-3 overflow-x-auto scrollbar-none">
        <div className="pb-3 pt-2 px-3.5 text-xs font-bold flex items-center gap-2 text-[#19714e] border-b-2 border-[#19714e]">
          <Target size={15} />
          <span>Role Alignment</span>
          <span className="h-4 w-6 bg-[#dff8eb] rounded-full animate-pulse" />
        </div>
        <div className="pb-3 pt-2 px-3.5 text-xs font-bold flex items-center gap-2 text-gray-400">
          <ShieldCheck size={15} />
          <span>ATS Compatibility</span>
        </div>
        <div className="pb-3 pt-2 px-3.5 text-xs font-bold flex items-center gap-2 text-gray-400">
          <FileText size={15} />
          <span>Grammar & Format</span>
        </div>
        <div className="pb-3 pt-2 px-3.5 text-xs font-bold flex items-center gap-2 text-gray-400">
          <Wand2 size={15} />
          <span>Actionable Fixes</span>
        </div>
      </div>

      {/* ── CONTENT BODY SKELETON ── */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
        {/* Alignment Summary Skeleton Card */}
        <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#dff8eb] animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 animate-pulse rounded-md" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-full bg-gray-200 animate-pulse rounded-md" />
            <div className="h-3.5 w-11/12 bg-gray-200 animate-pulse rounded-md" />
            <div className="h-3.5 w-4/5 bg-gray-200 animate-pulse rounded-md" />
          </div>
        </div>

        {/* Requirements Gaps Skeleton Card */}
        <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#dfe7e2]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-200 animate-pulse" />
              <div className="h-4 w-44 bg-gray-200 animate-pulse rounded-md" />
            </div>
            <div className="h-3 w-32 bg-gray-200 animate-pulse rounded-md" />
          </div>

          <div className="space-y-2.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/50"
              >
                <div className="w-5 h-5 rounded-full bg-amber-200/60 animate-pulse shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-full bg-amber-100/70 animate-pulse rounded-md" />
                  <div className="h-3 w-3/4 bg-amber-100/50 animate-pulse rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Keywords Skeleton Card */}
        <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#dfe7e2]">
            <div className="w-5 h-5 rounded-full bg-rose-200 animate-pulse" />
            <div className="h-4 w-36 bg-gray-200 animate-pulse rounded-md" />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[24, 32, 20, 28, 36, 18, 26, 30].map((w, idx) => (
              <div
                key={idx}
                className={`h-7 bg-rose-50 border border-rose-200/60 rounded-xl animate-pulse`}
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER SKELETON ── */}
      <div className="shrink-0 bg-white border-t border-[#dfe7e2] p-4 sm:px-7 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#68756f]">
          <Loader2 size={14} className="animate-spin text-[#19714e]" />
          <span>Evaluation in progress...</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs sm:text-sm font-bold transition-all ml-auto cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function JobEvaluationModal({
  result,
  job,
  isLoading = false,
  error = null,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("jd_alignment");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedKeywords, setCopiedKeywords] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Extract nested data payload reliably
  const payload =
    result?.data?.data ??
    result?.data ??
    result;

  // 1. ATS Analysis
  const atsAnalysis = payload?.ats_analysis || {};
  const atsScore =
    typeof atsAnalysis?.score === "number"
      ? atsAnalysis.score
      : atsAnalysis?.score !== undefined
      ? Number(atsAnalysis.score)
      : null;
  const atsFindings = Array.isArray(atsAnalysis?.findings)
    ? atsAnalysis.findings
    : [];
  const missingKeywords = Array.isArray(atsAnalysis?.missing_keywords)
    ? atsAnalysis.missing_keywords
    : [];
  const missingSections = Array.isArray(atsAnalysis?.missing_sections)
    ? atsAnalysis.missing_sections
    : [];

  // 2. Grammar & Formatting
  const grammarFormatting = payload?.grammar_formatting || {};
  const grammarIssues = Array.isArray(grammarFormatting?.grammar_issues)
    ? grammarFormatting.grammar_issues
    : [];
  const formattingIssues = Array.isArray(grammarFormatting?.formatting_issues)
    ? grammarFormatting.formatting_issues
    : [];

  // 3. JD Alignment
  const jdAlignment = payload?.jd_alignment || {};
  const relevanceScore =
    typeof jdAlignment?.relevance_score === "number"
      ? jdAlignment.relevance_score
      : jdAlignment?.relevance_score !== undefined
      ? Number(jdAlignment.relevance_score)
      : null;
  const alignmentSummary =
    jdAlignment?.alignment_summary ||
    payload?.summary ||
    payload?.overall_summary ||
    "";
  const gaps = Array.isArray(jdAlignment?.gaps) ? jdAlignment.gaps : [];

  // 4. Actionable Suggestions
  const suggestions = Array.isArray(payload?.suggestions)
    ? payload.suggestions
    : [];

  // Legacy / fallback formats
  const legacyScore =
    payload?.overall_score ?? payload?.match_score ?? payload?.score;
  const matchedSkills =
    payload?.matched_skills ?? payload?.matching_skills ?? [];
  const missingSkills =
    payload?.missing_skills ?? payload?.skills_to_improve ?? [];

  // Effective Display Scores
  const displayAtsScore = atsScore ?? (legacyScore ? Number(legacyScore) : null);
  const displayJdScore = relevanceScore ?? (legacyScore ? Number(legacyScore) : null);
  const compositeScore =
    displayAtsScore !== null && displayJdScore !== null
      ? Math.round((displayAtsScore + displayJdScore) / 2)
      : displayAtsScore ?? displayJdScore ?? null;

  const scoreMeta = getScoreDetails(compositeScore ?? 60);

  // Copy helper for suggestion
  const handleCopySuggestion = (text, index) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2500);
  };

  // Copy all missing keywords
  const handleCopyAllKeywords = () => {
    if (!missingKeywords.length) return;
    navigator.clipboard.writeText(missingKeywords.join(", "));
    setCopiedKeywords(true);
    setTimeout(() => {
      setCopiedKeywords(false);
    }, 2500);
  };

  // Tabs definition
  const tabs = [
    {
      id: "jd_alignment",
      label: "Role Alignment",
      icon: Target,
      badge: gaps.length > 0 ? `${gaps.length} gaps` : null,
    },
    {
      id: "ats_analysis",
      label: "ATS Compatibility",
      icon: ShieldCheck,
      badge: missingKeywords.length > 0 ? `${missingKeywords.length} missing` : null,
    },
    {
      id: "grammar_formatting",
      label: "Grammar & Format",
      icon: FileText,
      badge: grammarIssues.length + formattingIssues.length > 0
        ? `${grammarIssues.length + formattingIssues.length}`
        : null,
    },
    {
      id: "suggestions",
      label: "Actionable Fixes",
      icon: Wand2,
      badge: suggestions.length > 0 ? `${suggestions.length} items` : null,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#f7faf8] border border-[#dfe7e2] rounded-3xl shadow-2xl overflow-hidden relative font-sans my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── SKELETON LOADING STATE ── */}
        {isLoading ? (
          <EvaluationModalSkeleton job={job} onClose={onClose} />
        ) : error ? (
          /* ── ERROR STATE ── */
          <div className="p-8 sm:p-12 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-md">
              <AlertCircle size={32} />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-rose-950 font-['Space_Grotesk']">
                Evaluation Request Failed
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                {typeof error === "string" ? error : error?.message || "Failed to evaluate resume fit with this job."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : !result ? null : (
          /* ── SUCCESSFUL REPORT STATE ── */
          <>
            {/* ── HEADER BANNER ── */}
            <div className="shrink-0 bg-white border-b border-[#dfe7e2] p-5 sm:px-7 sm:py-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles size={24} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-[#12221d] font-['Space_Grotesk']">
                      Resume Evaluation Report
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#dff8eb] text-[#19714e] border border-[#19714e]/20">
                      AI Analyzed
                    </span>
                  </div>

                  {job?.job_title && (
                    <p className="text-xs font-semibold text-[#68756f] flex items-center gap-1.5 mt-0.5">
                      <Building2 size={13} className="text-[#19714e]" />
                      <span className="text-[#12221d]">{job.job_title}</span>
                      {job.company_name && (
                        <>
                          <span>•</span>
                          <span>{job.company_name}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-[#f7faf8] hover:bg-gray-200/80 text-[#68756f] hover:text-[#12221d] border border-[#dfe7e2] transition-colors cursor-pointer"
                title="Close evaluation"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── SCORE SUMMARY HERO BAR ── */}
            <div className="shrink-0 bg-white px-5 sm:px-7 py-4 border-b border-[#dfe7e2]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch">
                {/* ATS Score Card */}
                <div className="p-3.5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#68756f]">
                      ATS Compatibility
                    </p>
                    <h4 className="text-xs font-semibold text-[#12221d] mt-0.5">
                      Resume Parser Score
                    </h4>
                  </div>
                  <div className="flex items-baseline gap-0.5 font-['Space_Grotesk']">
                    <span className="text-2xl font-extrabold text-[#123c2c]">
                      {displayAtsScore !== null ? displayAtsScore : "--"}
                    </span>
                    <span className="text-xs font-bold text-[#68756f]">/100</span>
                  </div>
                </div>

                {/* JD Alignment Score Card */}
                <div className="p-3.5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#68756f]">
                      JD Alignment
                    </p>
                    <h4 className="text-xs font-semibold text-[#12221d] mt-0.5">
                      Job Match Relevance
                    </h4>
                  </div>
                  <div className="flex items-baseline gap-0.5 font-['Space_Grotesk']">
                    <span className="text-2xl font-extrabold text-[#19714e]">
                      {displayJdScore !== null ? displayJdScore : "--"}
                    </span>
                    <span className="text-xs font-bold text-[#68756f]">/100</span>
                  </div>
                </div>

                {/* Composite Fit Badge */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${scoreMeta.bgColor} ${scoreMeta.borderColor}`}
                >
                  <div>
                    <p className={`text-[10px] uppercase tracking-wider font-extrabold ${scoreMeta.textColor}`}>
                      Overall Fit Status
                    </p>
                    <h4 className={`text-sm font-bold font-['Space_Grotesk'] ${scoreMeta.textColor}`}>
                      {scoreMeta.label}
                    </h4>
                  </div>
                  <span className={`text-lg font-extrabold font-['Space_Grotesk'] ${scoreMeta.textColor}`}>
                    {compositeScore !== null ? `${compositeScore}%` : "Analyzed"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── TABS NAVIGATION ── */}
            <div className="shrink-0 bg-white/60 px-5 sm:px-7 pt-3 border-b border-[#dfe7e2] flex items-center gap-2 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-3 pt-2 px-3.5 rounded-t-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? "text-[#123c2c]"
                        : "text-[#68756f] hover:text-[#12221d]"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? "text-[#19714e]" : "text-[#68756f]"}
                    />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#123c2c] text-[#b9ef84]"
                            : "bg-[#dfe7e2] text-[#52615a]"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}

                    {isActive && (
                      <motion.div
                        layoutId="activeEvaluationTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#19714e]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── SCROLLABLE TAB CONTENT ── */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              <AnimatePresence mode="wait">
                {/* =========================================================
                    TAB 1: ROLE ALIGNMENT (JD)
                ========================================================= */}
                {activeTab === "jd_alignment" && (
                  <motion.div
                    key="jd_alignment"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    {/* Alignment Summary */}
                    {alignmentSummary ? (
                      <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-[#dff8eb] text-[#19714e] flex items-center justify-center">
                            <Sparkles size={16} />
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[#12221d] font-['Space_Grotesk']">
                            Candidate Alignment Summary
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-[#52615a] leading-relaxed">
                          {alignmentSummary}
                        </p>
                      </div>
                    ) : (
                      <div className="p-6 bg-white rounded-2xl border border-[#dfe7e2] text-center text-xs text-[#68756f]">
                        No alignment summary available.
                      </div>
                    )}

                    {/* Identified Gaps */}
                    <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-[#dfe7e2]">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={18} className="text-amber-600" />
                          <h3 className="text-sm font-bold text-[#12221d] font-['Space_Grotesk']">
                            Identified Requirements Gaps ({gaps.length})
                          </h3>
                        </div>
                        <span className="text-[11px] font-semibold text-[#68756f]">
                          Key differences between resume & role
                        </span>
                      </div>

                      {gaps.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#68756f] flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} className="text-[#19714e]" />
                          <span>No major gaps identified for this role.</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5">
                          {gaps.map((gap, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80"
                            >
                              <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <p className="text-xs sm:text-sm text-amber-950 leading-snug flex-1">
                                {typeof gap === "string" ? gap : JSON.stringify(gap)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Legacy matching skills if available */}
                    {matchedSkills.length > 0 && (
                      <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                        <h3 className="text-sm font-bold text-[#12221d] font-['Space_Grotesk'] flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#19714e]" />
                          <span>Matched Skills ({matchedSkills.length})</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {matchedSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 rounded-xl bg-[#dff8eb] text-[#19714e] text-xs font-semibold border border-[#19714e]/20"
                            >
                              {typeof skill === "string" ? skill : skill?.name || ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* =========================================================
                    TAB 2: ATS COMPATIBILITY
                ========================================================= */}
                {activeTab === "ats_analysis" && (
                  <motion.div
                    key="ats_analysis"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    {/* ATS Findings */}
                    <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#dfe7e2]">
                        <ShieldCheck size={18} className="text-[#19714e]" />
                        <h3 className="text-sm font-bold text-[#12221d] font-['Space_Grotesk']">
                          ATS Structure & Parsing Findings ({atsFindings.length})
                        </h3>
                      </div>

                      {atsFindings.length === 0 ? (
                        <p className="text-xs text-[#68756f]">
                          No specific structural findings reported.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {atsFindings.map((finding, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]"
                            >
                              <span className="text-[#19714e] font-bold text-sm shrink-0 mt-0.5">
                                •
                              </span>
                              <p className="text-xs sm:text-sm text-[#52615a] leading-relaxed">
                                {typeof finding === "string" ? finding : JSON.stringify(finding)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Missing Keywords Cloud */}
                    <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#dfe7e2]">
                        <div className="flex items-center gap-2">
                          <Target size={18} className="text-rose-600" />
                          <h3 className="text-sm font-bold text-[#12221d] font-['Space_Grotesk']">
                            Missing Keywords ({missingKeywords.length})
                          </h3>
                        </div>

                        {missingKeywords.length > 0 && (
                          <button
                            type="button"
                            onClick={handleCopyAllKeywords}
                            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#dff8eb] text-[#19714e] hover:bg-[#19714e] hover:text-white border border-[#19714e]/20 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            {copiedKeywords ? (
                              <>
                                <Check size={13} />
                                <span>Keywords Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Copy All Keywords</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {missingKeywords.length === 0 ? (
                        <div className="py-4 text-center text-xs text-[#68756f]">
                          No critical keywords missing from your resume!
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {missingKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200/90 shadow-2xs hover:bg-rose-100 transition-colors"
                            >
                              + {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Missing Sections */}
                    {missingSections.length > 0 && (
                      <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                        <div className="flex items-center gap-2">
                          <Layers size={17} className="text-amber-600" />
                          <h3 className="text-sm font-bold text-[#12221d] font-['Space_Grotesk']">
                            Missing Recommended Sections ({missingSections.length})
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {missingSections.map((section, idx) => (
                            <span
                              key={idx}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200"
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* =========================================================
                    TAB 3: GRAMMAR & FORMATTING
                ========================================================= */}
                {activeTab === "grammar_formatting" && (
                  <motion.div
                    key="grammar_formatting"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    {/* Grammar Issues */}
                    <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#dfe7e2]">
                        <AlertCircle size={18} className="text-rose-600" />
                        <h3 className="text-sm font-bold text-[#12221d] font-['Space_Grotesk']">
                          Grammar & Content Issues ({grammarIssues.length})
                        </h3>
                      </div>

                      {grammarIssues.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#68756f] flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} className="text-[#19714e]" />
                          <span>No major grammatical or date errors found.</span>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {grammarIssues.map((issue, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950"
                            >
                              <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs sm:text-sm leading-relaxed flex-1">
                                {typeof issue === "string" ? issue : JSON.stringify(issue)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Formatting Issues */}
                    <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#dfe7e2]">
                        <FileText size={18} className="text-amber-600" />
                        <h3 className="text-sm font-bold text-[#12221d] font-['Space_Grotesk']">
                          Formatting & Consistency Issues ({formattingIssues.length})
                        </h3>
                      </div>

                      {formattingIssues.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#68756f] flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} className="text-[#19714e]" />
                          <span>Formatting is clean and consistent throughout.</span>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {formattingIssues.map((issue, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950"
                            >
                              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs sm:text-sm leading-relaxed flex-1">
                                {typeof issue === "string" ? issue : JSON.stringify(issue)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* =========================================================
                    TAB 4: ACTIONABLE SUGGESTIONS
                ========================================================= */}
                {activeTab === "suggestions" && (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between pb-1">
                      <h3 className="text-sm font-bold text-[#12221d] font-['Space_Grotesk'] flex items-center gap-2">
                        <Wand2 size={17} className="text-[#19714e]" />
                        <span>AI Tailored Resume Fixes ({suggestions.length})</span>
                      </h3>
                      <span className="text-[11px] text-[#68756f]">
                        Copy recommendations directly into your resume
                      </span>
                    </div>

                    {suggestions.length === 0 ? (
                      <div className="py-12 bg-white rounded-3xl border border-[#dfe7e2] text-center p-6 space-y-2">
                        <CheckCircle2 size={24} className="text-[#19714e] mx-auto" />
                        <h4 className="text-sm font-bold text-[#12221d]">
                          Your resume is well optimized!
                        </h4>
                        <p className="text-xs text-[#68756f]">
                          No additional specific rewrite suggestions generated for this job.
                        </p>
                      </div>
                    ) : (
                      suggestions.map((item, index) => {
                        const isCopied = copiedIndex === index;

                        return (
                          <div
                            key={index}
                            className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#19714e]/40 transition-colors"
                          >
                            {/* Suggestion Section Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#123c2c] text-[#b9ef84] font-bold text-xs flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                <span className="px-3 py-1 rounded-xl bg-[#dff8eb] text-[#19714e] text-xs font-bold border border-[#19714e]/20">
                                  {item.section || "General"}
                                </span>
                              </div>

                              {item.suggested_change && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopySuggestion(item.suggested_change, index)
                                  }
                                  className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-[#f7faf8] hover:bg-[#dff8eb] text-[#123c2c] border border-[#dfe7e2] hover:border-[#19714e]/30 flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check size={14} className="text-[#19714e]" />
                                      <span className="text-[#19714e] font-bold">
                                        Copied to Clipboard!
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={14} className="text-[#68756f]" />
                                      <span>Copy Recommended Text</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Current Resume Text (if present) */}
                            {item.current_text && (
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-[#68756f]">
                                  Current Resume Text:
                                </p>
                                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed font-mono">
                                  {item.current_text}
                                </div>
                              </div>
                            )}

                            {/* Suggested Change */}
                            {item.suggested_change && (
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#19714e]">
                                  AI Recommended Change:
                                </p>
                                <div className="p-3.5 rounded-2xl bg-[#dff8eb]/60 border border-[#19714e]/30 text-xs sm:text-sm text-[#123c2c] font-medium leading-relaxed">
                                  {item.suggested_change}
                                </div>
                              </div>
                            )}

                            {/* Rationale */}
                            {item.rationale && (
                              <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]/80 flex items-start gap-2.5">
                                <Sparkles
                                  size={15}
                                  className="text-[#19714e] shrink-0 mt-0.5"
                                />
                                <div>
                                  <span className="text-[11px] font-bold text-[#12221d] block">
                                    Why this improves your score:
                                  </span>
                                  <p className="text-xs text-[#52615a] leading-relaxed mt-0.5">
                                    {item.rationale}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── FOOTER ACTIONS ── */}
            <div className="shrink-0 bg-white border-t border-[#dfe7e2] p-4 sm:px-7 flex items-center justify-between gap-3">
              <p className="text-xs text-[#68756f] hidden sm:block">
                Evaluation generated dynamically by SkillCart AI Career Engine
              </p>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs sm:text-sm font-bold shadow-md transition-all ml-auto cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}