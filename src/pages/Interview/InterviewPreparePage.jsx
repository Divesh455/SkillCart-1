import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  BrainCircuit,
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  RefreshCw,
  Search,
  CheckCircle2,
  Lightbulb,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpenCheck,
  GraduationCap,
  MessageSquareQuote,
  SlidersHorizontal,
  PenTool,
  Bookmark,
  Share2,
} from "lucide-react";

import AppHeader from "../../components/common/AppHeader";
import InterviewQuestionSkeleton from "../../components/common/InterviewQuestionSkeleton";
import interviewService from "../../services/interviewService";
import jobService from "../../services/jobService";
import saveJobService from "../../services/savejobs";

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

const CATEGORIES = [
  { id: "Technical", label: "Technical" },
  { id: "HR", label: "HR" },
  { id: "Behavioral", label: "Behavioral" },
  { id: "Coding", label: "Coding" },
  { id: "Company", label: "Company" },
];

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export default function InterviewPreparePage() {
  const { jobId: paramJobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Job ID resolution from route params or query string
  const queryParams = new URLSearchParams(location.search);
  const jobId = paramJobId || queryParams.get("jobId") || queryParams.get("id");
  const initialCategoryParam = queryParams.get("category") || location.state?.category || "Technical";

  // Initial Job data passed from navigation state if available
  const stateJob = location.state?.job;
  const stateResId = location.state?.resId;

  const [job, setJob] = useState(stateJob || null);
  const [jobLoading, setJobLoading] = useState(!stateJob && Boolean(jobId));
  const [activeResId, setActiveResId] = useState(stateResId || getStoredResumeId());

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryParam);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Interactive UI state per question
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [practiceOpen, setPracticeOpen] = useState({});
  const [practiceAnswers, setPracticeAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(`skillcart_prep_notes_${jobId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [checkedCriteria, setCheckedCriteria] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Fetch job details if not provided via state
  useEffect(() => {
    if (!job && jobId) {
      let isMounted = true;
      setJobLoading(true);
      jobService
        .getJobById(jobId)
        .then((data) => {
          if (isMounted && data) {
            setJob(data);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch job info:", err);
        })
        .finally(() => {
          if (isMounted) setJobLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [jobId, job]);

  // Fetch interview preparation questions
  const loadInterviewQuestions = useCallback(
    async (categoryToFetch = "Technical") => {
      if (!jobId) {
        setError("Job ID is required to generate interview preparation questions.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentResId = activeResId || getStoredResumeId();
        const response = await interviewService.prepareInterview({
          jobId,
          resId: currentResId,
          category: categoryToFetch || "Technical",
        });

        const rawQuestions =
          response?.data?.questions ||
          response?.questions ||
          (Array.isArray(response?.data) ? response.data : []);

        if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
          setQuestions(rawQuestions);
          // Auto-expand all answers by default for convenience
          const initialExpanded = {};
          rawQuestions.forEach((_, idx) => {
            initialExpanded[idx] = true;
          });
          setExpandedAnswers(initialExpanded);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Interview Prepare Error:", err);
        setError(
          err?.message ||
            "Unable to generate interview preparation questions at this time. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [jobId, activeResId]
  );

  // Initial questions load
  useEffect(() => {
    if (jobId) {
      loadInterviewQuestions(initialCategoryParam);
    }
  }, [jobId, initialCategoryParam, loadInterviewQuestions]);

  // Handle category tab change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    loadInterviewQuestions(category);
    navigate(`?category=${encodeURIComponent(category)}`, {
      replace: true,
      state: { ...(location.state || {}), job, resId: activeResId, category },
    });
  };

  // Handle Copy text
  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Handle Toggle expand/collapse answer
  const toggleAnswer = (idx) => {
    setExpandedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Handle Toggle practice area
  const togglePractice = (idx) => {
    setPracticeOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Handle Practice Answer text change
  const handlePracticeChange = (idx, text) => {
    const updated = { ...practiceAnswers, [idx]: text };
    setPracticeAnswers(updated);
    try {
      localStorage.setItem(`skillcart_prep_notes_${jobId}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Filtered Questions based on search query
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const query = searchQuery.toLowerCase().trim();
    return questions.filter((q) => {
      const qText = `${q.question || ""} ${q.intent || ""} ${q.sample_answer || ""} ${(q.evaluation_criteria || []).join(" ")}`.toLowerCase();
      return qText.includes(query);
    });
  }, [questions, searchQuery]);

  // Format Difficulty Color
  const getDifficultyBadge = (diff = "Medium") => {
    const d = (diff || "").toLowerCase();
    if (d.includes("easy")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    }
    if (d.includes("hard")) {
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    }
    return "bg-amber-50 text-amber-700 border-amber-200/80";
  };

  const jobTitle = job?.job_title || job?.title || "Target Position";
  const companyName = job?.company_name || job?.company || "Company";
  const jobLocation = job?.location || "India / Remote";

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#12221d] flex flex-col font-sans">
      {/* Top Navbar */}
      <AppHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-8 space-y-4 sm:space-y-6">
        {/* ====================================================
            NAVIGATION & BREADCRUMB
        ==================================================== */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/jobs")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#dfe7e2] text-xs sm:text-sm font-bold text-[#123c2c] hover:border-[#19714e]/40 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={16} className="text-[#19714e]" />
            <span>Back to Jobs</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#dff8eb] text-[#19714e] border border-[#19714e]/20 flex items-center gap-1.5 shadow-2xs">
              <Sparkles size={13} />
              <span>{selectedCategory} Interview Prep</span>
            </span>
          </div>
        </div>

        {/* ====================================================
            JOB OVERVIEW HEADER HERO BANNER
        ==================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden"
        >
          {/* Top subtle decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#123c2c] via-[#19714e] to-[#b9ef84]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              {/* Company Logo Avatar */}
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] border border-white/20 font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-md font-['Space_Grotesk'] select-none">
                {companyName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#19714e] flex items-center gap-1">
                    <Building2 size={13} />
                    <span>{companyName}</span>
                  </span>
                  {job?.work_mode && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#f7faf8] border border-[#dfe7e2] text-[#68756f]">
                      {job.work_mode}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Space_Grotesk'] text-[#12221d] leading-tight">
                  {jobTitle}
                </h1>

                <div className="flex items-center gap-3 text-xs text-[#68756f] flex-wrap pt-0.5">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={13} className="text-[#19714e]" />
                    {jobLocation}
                  </span>
                  {job?.experience_min !== undefined && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={13} className="text-[#19714e]" />
                      {job.experience_min}–{job.experience_max || job.experience_min + 2} yrs exp
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => loadInterviewQuestions(selectedCategory)}
                disabled={loading}
                className="px-4 py-2.5 rounded-2xl bg-[#f7faf8] hover:bg-[#dff8eb] border border-[#dfe7e2] hover:border-[#19714e]/30 text-xs font-bold text-[#123c2c] transition-all flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                title="Regenerate questions with AI"
              >
                <RefreshCw size={14} className={`text-[#19714e] ${loading ? "animate-spin" : ""}`} />
                <span>Regenerate</span>
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* ====================================================
            SEARCH QUESTIONS INPUT
        ==================================================== */}
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68756f]"
          />
          <input
            type="text"
            placeholder="Search questions, intents, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-16 py-3 text-xs sm:text-sm bg-white border border-[#dfe7e2] hover:border-[#19714e]/40 focus:border-[#19714e] focus:ring-2 focus:ring-[#19714e]/10 rounded-2xl shadow-2xs focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#68756f] hover:text-[#12221d] px-2.5 py-1 rounded-lg bg-[#f7faf8] border border-[#dfe7e2] cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* ====================================================
            QUESTIONS LIST SECTION
        ==================================================== */}
        <section className="space-y-5">
          {/* Loading Skeletons */}
          {loading && <InterviewQuestionSkeleton count={3} />}

          {/* Error Banner */}
          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center max-w-xl mx-auto space-y-3 shadow-xs"
            >
              <AlertCircle size={32} className="mx-auto text-rose-500" />
              <h3 className="font-bold text-sm text-rose-900">Failed to Generate Questions</h3>
              <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={() => loadInterviewQuestions(selectedCategory)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredQuestions.length === 0 && (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-[#dfe7e2] p-8 space-y-3">
              <BookOpenCheck size={36} className="mx-auto text-[#68756f]/60" />
              <h3 className="font-bold text-base text-[#12221d]">No questions match your criteria</h3>
              <p className="text-xs text-[#68756f] max-w-md mx-auto">
                {searchQuery
                  ? `No questions found matching "${searchQuery}". Try clearing search or selecting a different category.`
                  : "Try generating questions for a different category or difficulty."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-xl bg-[#f7faf8] border border-[#dfe7e2] text-xs font-bold text-[#19714e] hover:bg-[#dff8eb] transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Questions Cards */}
          {!loading &&
            !error &&
            filteredQuestions.map((q, idx) => {
              const isExpanded = expandedAnswers[idx] ?? true;
              const isPracticing = practiceOpen[idx] ?? false;
              const criteriaList = Array.isArray(q.evaluation_criteria)
                ? q.evaluation_criteria
                : [];
              const diffStyle = getDifficultyBadge(q.difficulty);

              return (
                <motion.article
                  key={idx}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white border border-[#dfe7e2] hover:border-[#19714e]/40 rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Bar: Question Index Badge, Type, Difficulty & Copy */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-[#123c2c] text-[#b9ef84] font-['Space_Grotesk'] shadow-2xs">
                        Q{idx + 1}
                      </span>

                      {q.question_type && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#dff8eb] text-[#19714e] border border-[#19714e]/20">
                          {q.question_type}
                        </span>
                      )}

                      {q.difficulty && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${diffStyle}`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Copy Question Button */}
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleCopy(q.question, `q-${idx}`)}
                        className="p-2 rounded-xl bg-[#f7faf8] hover:bg-[#dff8eb] border border-[#dfe7e2] text-[#68756f] hover:text-[#19714e] transition-colors cursor-pointer"
                        title="Copy question text"
                      >
                        {copiedId === `q-${idx}` ? (
                          <Check size={14} className="text-[#19714e]" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#12221d] font-['Space_Grotesk'] leading-snug">
                      {q.question}
                    </h2>
                  </div>

                  {/* Interviewer Intent Box ("Why they ask this") */}
                  {q.intent && (
                    <div className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] space-y-1.5">
                      <p className="text-[11px] uppercase tracking-wider font-extrabold text-[#19714e] flex items-center gap-1.5">
                        <Lightbulb size={14} className="text-[#19714e]" />
                        <span>Why Interviewers Ask This (Intent)</span>
                      </p>
                      <p className="text-xs text-[#68756f] leading-relaxed">
                        {q.intent}
                      </p>
                    </div>
                  )}

                  {/* Recommended Sample Answer Box */}
                  {q.sample_answer && (
                    <div className="rounded-2xl border border-[#19714e]/20 bg-[#fbfdfc] overflow-hidden">
                      {/* Answer Header Bar */}
                      <div
                        onClick={() => toggleAnswer(idx)}
                        className="p-3.5 sm:px-4 bg-[#dff8eb]/50 hover:bg-[#dff8eb]/70 transition-colors flex items-center justify-between cursor-pointer select-none"
                      >
                        <span className="text-xs font-bold text-[#123c2c] flex items-center gap-2">
                          <MessageSquareQuote size={15} className="text-[#19714e]" />
                          <span>Recommended Sample Answer & Framework</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(q.sample_answer, `ans-${idx}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#19714e]/20 text-[11px] font-bold text-[#19714e] hover:bg-[#19714e] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === `ans-${idx}` ? (
                              <>
                                <Check size={12} />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy Answer</span>
                              </>
                            )}
                          </motion.button>

                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Answer Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 sm:p-5 text-xs sm:text-sm text-[#12221d] leading-relaxed border-t border-[#19714e]/10 bg-white"
                          >
                            <p className="whitespace-pre-wrap font-sans">
                              {q.sample_answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Recruiter Evaluation Criteria Checklist */}
                  {criteriaList.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] uppercase tracking-wider font-extrabold text-[#68756f] flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#19714e]" />
                        <span>Key Evaluation Criteria (What Recruiters Look For)</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {criteriaList.map((criterion, cIdx) => {
                          const isChecked = checkedCriteria[`${idx}-${cIdx}`] ?? false;
                          return (
                            <div
                              key={cIdx}
                              onClick={() => handleToggleCriterion(idx, cIdx)}
                              className={`
                                p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer select-none
                                ${
                                  isChecked
                                    ? "bg-[#dff8eb]/60 border-[#19714e]/30 text-[#123c2c] line-through opacity-80"
                                    : "bg-[#f7faf8] border-[#dfe7e2] text-[#12221d] hover:bg-white hover:border-[#19714e]/20"
                                }
                              `}
                            >
                              <div
                                className={`
                                  w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors
                                  ${
                                    isChecked
                                      ? "bg-[#19714e] border-[#19714e] text-white"
                                      : "border-[#dfe7e2] bg-white"
                                  }
                                `}
                              >
                                {isChecked && <Check size={11} strokeWidth={3} />}
                              </div>
                              <span className="leading-snug flex-1">{criterion}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Practice Sandbox Toggle & Area */}
                  <div className="pt-2 border-t border-[#dfe7e2]/70">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => togglePractice(idx)}
                        className="text-xs font-bold text-[#19714e] hover:text-[#123c2c] flex items-center gap-1.5 cursor-pointer py-1"
                      >
                        <PenTool size={13} />
                        <span>{isPracticing ? "Hide Answer Sandbox" : "Practice Your Own Answer"}</span>
                      </button>

                      {practiceAnswers[idx] && (
                        <span className="text-[10px] font-bold text-[#68756f] bg-[#f7faf8] px-2 py-0.5 rounded-md border border-[#dfe7e2]">
                          Draft saved
                        </span>
                      )}
                    </div>

                    {isPracticing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        <textarea
                          rows={4}
                          value={practiceAnswers[idx] || ""}
                          onChange={(e) => handlePracticeChange(idx, e.target.value)}
                          placeholder="Draft your key talking points or response here (using the STAR method: Situation, Task, Action, Result)..."
                          className="w-full p-3.5 text-xs bg-[#f7faf8] border border-[#dfe7e2] rounded-2xl focus:outline-none focus:border-[#19714e] focus:ring-2 focus:ring-[#19714e]/20 transition-all font-sans"
                        />
                        <div className="flex items-center justify-between text-[11px] text-[#68756f]">
                          <span>Tip: Practice speaking your answer out loud after drafting!</span>
                          <span>
                            {(practiceAnswers[idx] || "").trim().split(/\s+/).filter(Boolean).length} words
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.article>
              );
            })}
        </section>
      </main>
    </div>
  );
}
