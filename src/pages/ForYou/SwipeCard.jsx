import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Building2,
  X,
  Bookmark,
  Info,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

function ensureString(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (typeof value === "object") {
    if (value.name) return String(value.name);
    if (value.title) return String(value.title);
    if (value.label) return String(value.label);
    if (value.value) return String(value.value);
  }

  return fallback;
}
/**
 * Helper to generate deterministic gradient background based on company name
 */
function getCompanyGradient(name) {
  const safeName = typeof name === "string" ? name : String(name || "J");
  const charCode = safeName.charCodeAt(0) || 74;
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
function getWorkModeBadge(mode) {
  const safeMode = typeof mode === "string" ? mode : String(mode || "On-site");
  const modeLower = safeMode.toLowerCase();
  if (modeLower.includes("remote")) {
    return "bg-teal-50 text-teal-700 border-teal-200/80";
  }
  if (modeLower.includes("hybrid")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
  }
  return "bg-amber-50 text-amber-700 border-amber-200/80";
}

export default function SwipeCard({
  job,
  isFront,
  stackIndex = 0,
  onSwipe,
  onClickCard,
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  const opacityLeft = useTransform(x, [-120, -20], [1, 0]);
  const opacityRight = useTransform(x, [20, 120], [0, 1]);

  const [exitDirection, setExitDirection] = useState(null);

  const handleDragEnd = (_, info) => {
    if (!isFront) return;
    const swipeThreshold = 90;
    const velocityThreshold = 350;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      setExitDirection("right");
      onSwipe("right");
    } else if (
      info.offset.x < -swipeThreshold ||
      info.velocity.x < -velocityThreshold
    ) {
      setExitDirection("left");
      onSwipe("left");
    }
  };

  const handleActionButton = (direction, e) => {
    e.stopPropagation();
    if (!isFront) return;
    setExitDirection(direction);
    onSwipe(direction);
  };

  // Stack offsets for visual depth
  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 12;
  const zIndex = 10 - stackIndex;

  const jobTitle = ensureString(
    job?.job_title ??
    job?.title ??
    job?.role,
    "Software Engineer"
  );

  const company =
    job?.company && typeof job.company === "object"
      ? job.company
      : {};

  const companyName = ensureString(
    company.company_name ??
    company.name ??
    job?.company_name ??
    job?.company ??
    job?.employer,
    "BluepeakVentures Limited"
  );

  const location = ensureString(
    job?.location ??
    job?.city,
    "Coimbatore, Tamil Nadu, India"
  );

  const experience =
    job?.experience_min !== undefined &&
      job?.experience_max !== undefined
      ? `${job.experience_min}–${job.experience_max} yrs exp`
      : ensureString(
        job?.experience,
        "0–1 yrs exp"
      );

  const workMode = ensureString(
    job?.work_mode ??
    job?.work_type,
    "On-site"
  );

  const jobType = ensureString(
    job?.employment_type ??
    job?.job_type,
    "Full-Time"
  );

  // Salary Formatting
  let salaryStr = "₹4.3L - ₹8.6L / yr";
  if (job?.salary_min || job?.salary_max) {
    const symbol = job.currency === "USD" ? "$" : "₹";
    if (job.currency === "INR" || !job.currency) {
      const minL = (job.salary_min / 100000).toFixed(1);
      const maxL = (job.salary_max / 100000).toFixed(1);
      salaryStr = `${symbol}${minL}L - ${symbol}${maxL}L / yr`;
    } else {
      salaryStr = `${symbol}${job.salary_min?.toLocaleString()} - ${symbol}${job.salary_max?.toLocaleString()} / yr`;
    }
  } else if (job?.salary) {
    salaryStr = String(job.salary);
  }

  const matchScore = job?.match_score || job?.score || 94;
  const avatarGradient = getCompanyGradient(companyName);
  const workModeStyle = getWorkModeBadge(workMode);

  // Extract top skills
  const skillsList = Array.isArray(job?.required_skills)
    ? job.required_skills.slice(0, 3)
    : ["React", "TypeScript", "SQL"];

  return (
    <motion.div
      style={{
        x: isFront ? x : 0,
        rotate: isFront ? rotate : 0,
        zIndex,
      }}
      initial={{ scale: 0.95, y: yOffset + 20, opacity: 0 }}
      animate={{
        scale,
        y: yOffset,
        opacity: stackIndex > 2 ? 0 : 1,
        transition: { duration: 0.3 },
      }}
      exit={{
        x: exitDirection === "right" ? 500 : exitDirection === "left" ? -500 : 0,
        opacity: 0,
        transition: { duration: 0.25 },
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileGrab={{ cursor: "grabbing" }}
      className={`absolute inset-0 w-full h-full rounded-3xl bg-white border border-[#dfe7e2] shadow-2xl shadow-[#123c2c]/15 overflow-hidden flex flex-col justify-between select-none ${isFront ? "cursor-grab" : "pointer-events-none"
        }`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* DRAG SWIPE OVERLAY INDICATORS */}
      {/* ------------------------------------------------------------------ */}
      {isFront && (
        <>
          {/* RIGHT SWIPE INDICATOR (SAVE) */}
          <motion.div
            style={{ opacity: opacityRight }}
            className="absolute top-5 left-5 z-30 pointer-events-none border-4 border-emerald-500 rounded-2xl px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md transform -rotate-12 shadow-lg"
          >
            <span className="text-emerald-600 font-extrabold text-lg sm:text-xl tracking-wider uppercase flex items-center gap-1.5 font-['Space_Grotesk']">
              <Bookmark size={20} className="fill-emerald-600" /> SAVE
            </span>
          </motion.div>

          {/* LEFT SWIPE INDICATOR (PASS) */}
          <motion.div
            style={{ opacity: opacityLeft }}
            className="absolute top-5 right-5 z-30 pointer-events-none border-4 border-rose-500 rounded-2xl px-4 py-1.5 bg-rose-500/20 backdrop-blur-md transform rotate-12 shadow-lg"
          >
            <span className="text-rose-600 font-extrabold text-lg sm:text-xl tracking-wider uppercase flex items-center gap-1.5 font-['Space_Grotesk']">
              <X size={22} strokeWidth={3} /> PASS
            </span>
          </motion.div>
        </>
      )}

      {/* Top Accent Gradient Line */}
      <div className="h-1.5 bg-gradient-to-r from-[#123c2c] via-[#19714e] to-[#b9ef84] w-full shrink-0" />

      {/* ------------------------------------------------------------------ */}
      {/* CARD BODY CONTENT */}
      {/* ------------------------------------------------------------------ */}
      <div
        onClick={() => isFront && onClickCard(job)}
        className="p-5 sm:p-7 flex-1 flex flex-col justify-between cursor-pointer"
      >
        {/* Top Header: AI Match Badge & Work Mode */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dff8eb] text-[#19714e] text-xs font-extrabold border border-[#19714e]/20 shadow-2xs">
              <Sparkles size={13} className="text-[#19714e] animate-pulse" />
              <span>{matchScore * 100}% AI Match</span>
            </div>
            <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-xl border ${workModeStyle}`}>
              {workMode}
            </span>
          </div>

          {/* Company Logo Badge & Job Title */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br ${avatarGradient} font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-md font-['Space_Grotesk'] border border-white/20`}>
              {companyName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#68756f] truncate">
                <Building2 size={13} className="text-[#19714e] shrink-0" />
                <span className="truncate text-[#12221d]">{companyName}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-[#12221d] leading-snug tracking-tight mt-0.5 line-clamp-2">
                {jobTitle}
              </h2>
            </div>
          </div>

          {/* Location & Salary Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-[#52615a] bg-[#f7faf8] px-2.5 py-1 rounded-xl border border-[#dfe7e2]">
              <MapPin size={13} className="text-[#19714e]" />
              <span className="truncate max-w-[140px] text-[11px] font-semibold">{location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#52615a] bg-[#f7faf8] px-2.5 py-1 rounded-xl border border-[#dfe7e2]">
              <Briefcase size={13} className="text-[#19714e]" />
              <span className="text-[11px] font-semibold">{jobType}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#19714e] font-bold bg-[#dff8eb]/80 px-2.5 py-1 rounded-xl border border-[#19714e]/20 font-mono text-xs">
              <IndianRupee size={13} />
              <span>{salaryStr}</span>
            </div>
          </div>

          {/* Required Skills Badges */}
          {skillsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold bg-[#f7faf8] text-[#12221d] border border-[#dfe7e2] px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <ShieldCheck size={11} className="text-[#19714e]" />
                  <span>{String(skill)}</span>
                </span>
              ))}
            </div>
          )}

          {/* Key Job Info */}
          <div className="space-y-2 pt-3 border-t border-[#dfe7e2]/80">
            <div className="flex items-center justify-between text-xs text-[#68756f]">
              <span>Experience Level:</span>
              <span className="font-bold text-[#12221d]">{experience}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#68756f]">
              <span>Department:</span>
              <span className="font-bold text-[#12221d] truncate max-w-[180px]">
                {job?.department || job?.industry || "Engineering"}
              </span>
            </div>
          </div>
        </div>

        {/* Click to view detail callout */}
        <div className="pt-3 flex items-center justify-between text-xs font-bold text-[#19714e] border-t border-[#dfe7e2]/60 hover:underline">
          <span className="flex items-center gap-1.5">
            <Info size={14} /> Tap card for full details
          </span>
          <ChevronRight size={15} />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FRONT CARD SWIPE ACTION BUTTONS */}
      {/* ------------------------------------------------------------------ */}
      {isFront && (
        <div className="p-3.5 sm:p-4 bg-[#f7faf8] border-t border-[#dfe7e2] flex items-center justify-around gap-3 z-20">
          {/* REJECT BUTTON (LEFT SWIPE) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={(e) => handleActionButton("left", e)}
            title="Reject Job (Swipe Left)"
            className="w-12 h-12 rounded-2xl bg-white border-2 border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-400 transition-all flex items-center justify-center shadow-sm"
          >
            <X size={22} strokeWidth={2.5} />
          </motion.button>

          {/* DETAIL BUTTON */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => onClickCard(job)}
            title="View Full Details"
            className="w-10 h-10 rounded-2xl bg-white border border-[#dfe7e2] text-[#19714e] hover:bg-[#dff8eb] transition-all flex items-center justify-center shadow-2xs"
          >
            <Info size={18} />
          </motion.button>

          {/* SAVE BUTTON (RIGHT SWIPE) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={(e) => handleActionButton("right", e)}
            title="Save Job (Swipe Right)"
            className="w-12 h-12 rounded-2xl bg-[#123c2c] text-[#b9ef84] hover:bg-[#19714e] hover:text-white transition-all flex items-center justify-center shadow-md shadow-[#123c2c]/15"
          >
            <Bookmark size={20} className="fill-current" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
