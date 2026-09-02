import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Type,
  Layout,
  Search,
  ArrowLeft,
  ChevronRight,
  Target,
  X,
} from "lucide-react";
import resumeService, {
  extractRidFromResponse,
} from "../../services/resumeService";

// -----------------------------------------------------------------------------
// Score Card
// -----------------------------------------------------------------------------
function ScoreCard({ title, score, icon }) {
  const safeScore =
    typeof score === "number" ? score : Number(score) || 0;

  return (
    <div className="bg-white border border-[#dfe7e2] rounded-2xl p-4 shadow-xs">
      <div className="flex items-center gap-2 text-[#68756f]">
        <span className="text-[#19714e]">{icon}</span>
        <span className="text-xs font-semibold">{title}</span>
      </div>

      <div className="text-xl font-bold text-[#12221d] mt-2 font-['Space_Grotesk']">
        {safeScore}
      </div>

      <div className="mt-2 h-1.5 bg-[#dfe7e2] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#19714e] rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(Math.max(safeScore, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Analysis Section Helper
// -----------------------------------------------------------------------------
function AnalysisGroupSection({ title, icon, children }) {
  return (
    <div className="bg-white border border-[#dfe7e2] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#19714e]">{icon}</span>
        <h3 className="text-base font-bold text-[#12221d] font-['Space_Grotesk']">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// List Section
// -----------------------------------------------------------------------------
function ListSection({ title, items = [] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#68756f] mb-2">
        {title}
      </h4>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-2 p-2.5 rounded-xl bg-[#f7faf8] border border-[#dfe7e2]/60"
          >
            <span className="text-[#19714e] font-bold shrink-0">•</span>
            <p className="text-xs text-[#52615a] leading-5">
              {typeof item === "string" ? item : JSON.stringify(item)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Suggestion Group
// -----------------------------------------------------------------------------
function SuggestionGroup({ title, items = [] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-xs font-bold text-[#12221d] mb-3">{title}</h4>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-[#f7faf8] border border-[#dfe7e2]"
          >
            <h5 className="text-xs font-bold text-[#12221d]">
              {item?.issue || "Resume Improvement"}
            </h5>

            {item?.why_it_matters && (
              <div className="mt-2">
                <p className="text-[10px] font-bold text-[#68756f] uppercase tracking-wider">
                  Why it matters
                </p>
                <p className="text-xs text-[#52615a] leading-5 mt-0.5">
                  {item.why_it_matters}
                </p>
              </div>
            )}

            {item?.recommended_fix && (
              <div className="mt-2">
                <p className="text-[10px] font-bold text-[#19714e] uppercase tracking-wider">
                  Recommended Fix
                </p>
                <p className="text-xs text-[#52615a] leading-5 mt-0.5">
                  {item.recommended_fix}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Full Resume Analysis Modal / Detailed View
// -----------------------------------------------------------------------------
export function ResumeAnalysisModal({ result, onClose }) {
  if (!result) return null;

  const scores = result.scores || {};
  const overallScore =
    typeof result.overall_score === "number"
      ? result.overall_score
      : Number(result.overall_score) || 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#10231b]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#f7faf8] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#dfe7e2] shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#dfe7e2] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#dff8eb] text-[#19714e] flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#12221d] font-['Space_Grotesk']">
                Detailed Resume Analysis
              </h2>
              <p className="text-xs text-[#68756f]">
                AI-powered feedback & ATS optimization suggestions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#dfe7e2] text-[#68756f] hover:text-[#12221d] flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Score + Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#123c2c] text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Overall Score
              </p>
              <div className="flex items-end gap-2 mt-3">
                <span className="text-5xl font-bold font-['Space_Grotesk']">
                  {overallScore}
                </span>
                <span className="text-base opacity-60 mb-1">/100</span>
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(Math.max(overallScore, 0), 100)}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-[11px] opacity-70 mt-4">
              Based on grammar, structure, formatting, content & ATS match.
            </p>
          </div>

          <div className="md:col-span-2 bg-white border border-[#dfe7e2] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[#19714e]" />
              <h3 className="text-sm font-bold text-[#12221d]">
                Executive Summary
              </h3>
            </div>
            <p className="text-xs leading-6 text-[#52615a]">
              {result.summary || "No summary provided by analysis service."}
            </p>
          </div>
        </div>

        {/* Detailed Scores */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#68756f] mb-3">
            Detailed Scores
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <ScoreCard title="Grammar" score={scores.grammar} icon={<Type size={16} />} />
            <ScoreCard title="Structure" score={scores.structure} icon={<Layout size={16} />} />
            <ScoreCard title="Formatting" score={scores.formatting} icon={<FileText size={16} />} />
            <ScoreCard title="Content" score={scores.content} icon={<Target size={16} />} />
            <ScoreCard title="ATS" score={scores.ats} icon={<Search size={16} />} />
          </div>
        </div>

        {/* Strengths & Areas to Improve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-[#dfe7e2] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-[#19714e]" />
              <h3 className="text-sm font-bold text-[#12221d]">Strengths</h3>
            </div>
            <div className="space-y-2">
              {(result.strengths || []).length > 0 ? (
                result.strengths.map((item, index) => (
                  <div key={index} className="flex gap-2 p-2.5 rounded-xl bg-[#dff8eb]/50">
                    <CheckCircle2 size={15} className="text-[#19714e] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#52615a] leading-5">{item}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#68756f]">No strengths identified.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#dfe7e2] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-600" />
              <h3 className="text-sm font-bold text-[#12221d]">Areas to Improve</h3>
            </div>
            <div className="space-y-2">
              {(result.weaknesses || []).length > 0 ? (
                result.weaknesses.map((item, index) => (
                  <div key={index} className="flex gap-2 p-2.5 rounded-xl bg-amber-50">
                    <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-[#52615a] leading-5">{item}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#68756f]">No weak areas flagged.</p>
              )}
            </div>
          </div>
        </div>

        {/* Deep Breakdown Sections */}
        <div className="space-y-5">
          <AnalysisGroupSection title="Grammar Analysis" icon={<Type size={17} />}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-[#12221d]">
                {result.grammar_analysis?.total_errors || 0}
              </span>
              <span className="text-xs text-[#68756f]">grammar errors found</span>
            </div>
            {(result.grammar_analysis?.errors || []).length === 0 ? (
              <div className="p-3 rounded-xl bg-[#dff8eb] text-xs text-[#19714e] font-semibold">
                No grammar errors detected.
              </div>
            ) : (
              <div className="space-y-2">
                {result.grammar_analysis.errors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-xl text-xs text-red-700">
                    {typeof error === "string" ? error : JSON.stringify(error)}
                  </div>
                ))}
              </div>
            )}
          </AnalysisGroupSection>

          <AnalysisGroupSection title="Structure Analysis" icon={<Layout size={17} />}>
            <ListSection title="Missing Sections" items={result.structure_analysis?.missing_sections} />
            <ListSection title="Duplicate Sections" items={result.structure_analysis?.duplicate_sections} />
            <ListSection title="Empty Sections" items={result.structure_analysis?.empty_sections} />
            <ListSection title="Incorrect Order" items={result.structure_analysis?.incorrect_order} />
            <ListSection title="Recommendations" items={result.structure_analysis?.recommendations} />
          </AnalysisGroupSection>

          <AnalysisGroupSection title="ATS & Formatting" icon={<Search size={17} />}>
            <div className="mb-3">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                result.ats_analysis?.ats_friendly ? "bg-[#dff8eb] text-[#19714e]" : "bg-amber-100 text-amber-800"
              }`}>
                {result.ats_analysis?.ats_friendly ? "ATS Friendly Structure" : "Needs ATS Improvement"}
              </span>
            </div>
            <ListSection title="ATS Issues" items={result.ats_analysis?.issues} />
            <ListSection title="Formatting Issues" items={result.formatting_analysis?.issues} />
            <ListSection title="Formatting Recommendations" items={result.formatting_analysis?.recommendations} />
          </AnalysisGroupSection>

          {/* AI Recommendations */}
          <div className="bg-white border border-[#dfe7e2] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-[#19714e]" />
              <h3 className="text-sm font-bold text-[#12221d]">AI Recommendations</h3>
            </div>
            <SuggestionGroup title="High Priority" items={result.suggestions?.high_priority} />
            <SuggestionGroup title="Medium Priority" items={result.suggestions?.medium_priority} />
            <SuggestionGroup title="Low Priority" items={result.suggestions?.low_priority} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-bold transition-all"
          >
            Close Analysis
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN RESUME ANALYSIS WIDGET / SECTION
// -----------------------------------------------------------------------------
export default function ResumeAnalysisSection() {
  const [analyzeFile, setAnalyzeFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showFullModal, setShowFullModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Resume file size must be smaller than 10MB.");
      return;
    }

    setErrorMessage("");
    setAnalyzeFile(file);
    setAnalysisResult(null);
  };

  const handleAnalyzeResume = async () => {
    if (!analyzeFile) {
      setErrorMessage("Please select a resume file first.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMessage("");
      setAnalysisResult(null);

      const result = await resumeService.analyzeResume(analyzeFile);

      if (!result?.success && !result?.data) {
        throw new Error(result?.message || "Resume analysis failed.");
      }

      setAnalysisResult(result);

      // Save extracted res_id to localStorage if present
      const extractedRid = extractRidFromResponse(result);
      if (extractedRid) {
        localStorage.setItem("res_id", extractedRid);
        localStorage.setItem("resume_id", extractedRid);
      }
    } catch (err) {
      console.error("Resume Analysis Error:", err);
      setErrorMessage(
        err.message || "Unable to analyze your resume. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalyzeFile(null);
    setIsAnalyzing(false);
    setErrorMessage("");
    setAnalysisResult(null);
    setShowFullModal(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white border border-[#dfe7e2] rounded-3xl p-5 shadow-xs overflow-hidden relative mt-4"
      >
        {/* Decorative Glow */}
        <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-[#dff8eb] blur-2xl opacity-70 pointer-events-none" />

        {/* Widget Header */}
        <div className="relative flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#19714e]">
              AI Resume Review
            </p>
            <h4 className="text-base font-bold text-[#10231b] mt-0.5">
              Resume Analysis
            </h4>
            <p className="text-xs leading-5 text-[#68756f] mt-1">
              Upload your resume for instant ATS scoring, grammar & skill gap analysis.
            </p>
          </div>
        </div>

        {/* State 1: File Upload / Selection */}
        {!analysisResult && !isAnalyzing && (
          <div className="relative mt-4 space-y-3">
            {!analyzeFile ? (
              <label className="border-2 border-dashed border-[#dfe7e2] hover:border-[#19714e] rounded-2xl p-5 text-center cursor-pointer bg-[#f7faf8]/50 hover:bg-[#dff8eb]/20 transition-all block">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-10 h-10 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center mx-auto mb-2">
                  <UploadCloud size={20} />
                </div>
                <h5 className="text-xs font-bold text-[#12221d]">
                  Click or drag resume file
                </h5>
                <p className="text-[11px] text-[#68756f] mt-0.5">
                  PDF, DOC, or DOCX up to 10MB
                </p>
              </label>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#dff8eb] text-[#19714e] flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#12221d] truncate">
                      {analyzeFile.name}
                    </p>
                    <p className="text-[10px] text-[#68756f] mt-0.5">
                      {(analyzeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove file"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeResume}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Sparkles size={14} className="text-[#b9ef84]" />
                  Start Resume Analysis
                </button>
              </div>
            )}
          </div>
        )}

        {/* State 2: Analyzing / Loading */}
        {isAnalyzing && (
          <div className="mt-4 py-6 text-center bg-[#f7faf8] rounded-2xl border border-[#dfe7e2]">
            <div className="w-12 h-12 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center mx-auto mb-3">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-[#12221d]">
              Analyzing your resume...
            </h4>
            <p className="text-[11px] text-[#68756f] mt-1 px-4 leading-4">
              Reviewing structure, content, formatting, and ATS compatibility.
            </p>
            <div className="flex justify-center mt-3">
              <Loader2 size={18} className="animate-spin text-[#19714e]" />
            </div>
          </div>
        )}

        {/* State 3: Analysis Complete / Summary Card */}
        {analysisResult?.data && !isAnalyzing && (
          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#19714e] uppercase tracking-wider">
                  Analysis Complete
                </span>
                <span className="text-xs font-bold text-[#12221d] bg-[#dff8eb] px-2.5 py-1 rounded-full">
                  Score: {analysisResult.data.overall_score ?? analysisResult.data.ats_score ?? 80}/100
                </span>
              </div>

              {analysisResult.data.summary && (
                <p className="text-xs text-[#52615a] line-clamp-3 leading-5">
                  {analysisResult.data.summary}
                </p>
              )}

              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFullModal(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Sparkles size={13} className="text-[#b9ef84]" />
                  View Full Report
                  <ChevronRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2.5 px-3 rounded-xl bg-white border border-[#dfe7e2] hover:bg-[#f7faf8] text-[#52615a] text-xs font-semibold transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message display */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}
      </motion.div>

      {/* Full Analysis Modal */}
      <AnimatePresence>
        {showFullModal && analysisResult?.data && (
          <ResumeAnalysisModal
            result={analysisResult.data}
            onClose={() => setShowFullModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
