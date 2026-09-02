import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Briefcase,
  Target,
  GraduationCap,
  Award,
  CheckCircle2,
  Loader2,
  Download,
  AlertTriangle,
  Type,
  Layout,
  Search,
  ArrowLeft,
} from "lucide-react";

import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import resumeService, {
  extractRidFromResponse,
} from "../../services/resumeService";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";

// -----------------------------------------------------------------------------
// Animation Variants
// -----------------------------------------------------------------------------

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// -----------------------------------------------------------------------------
// Score Card
// -----------------------------------------------------------------------------

function ScoreCard({ title, score, icon }) {
  const safeScore =
    typeof score === "number" ? score : Number(score) || 0;

  return (
    <div className="bg-white border border-[#dfe7e2] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[#68756f]">
        <span className="text-[#19714e]">{icon}</span>

        <span className="text-xs font-semibold">
          {title}
        </span>
      </div>

      <div className="text-2xl font-bold text-[#12221d] mt-3 font-['Space_Grotesk']">
        {safeScore}
      </div>

      <div className="mt-3 h-1.5 bg-[#dfe7e2] rounded-full overflow-hidden">
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
// Analysis Section
// -----------------------------------------------------------------------------

function AnalysisSection({ title, icon, children }) {
  return (
    <div className="bg-white border border-[#dfe7e2] rounded-3xl p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[#19714e]">
          {icon}
        </span>

        <h3 className="text-xl font-bold text-[#12221d] font-['Space_Grotesk']">
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
    <div className="mb-6 last:mb-0">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[#68756f] mb-3">
        {title}
      </h4>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 p-3 rounded-xl bg-[#f7faf8] border border-[#dfe7e2]/60"
          >
            <span className="text-[#19714e] font-bold shrink-0">
              •
            </span>

            <p className="text-xs text-[#52615a] leading-5">
              {typeof item === "string"
                ? item
                : JSON.stringify(item)}
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
    <div className="mb-8 last:mb-0">
      <h4 className="text-sm font-bold text-[#12221d] mb-4">
        {title}
      </h4>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]"
          >
            <h5 className="text-sm font-bold text-[#12221d]">
              {item?.issue || "Resume Improvement"}
            </h5>

            {item?.why_it_matters && (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-[#68756f] uppercase tracking-wider">
                  Why it matters
                </p>

                <p className="text-xs text-[#52615a] leading-5 mt-1">
                  {item.why_it_matters}
                </p>
              </div>
            )}

            {item?.recommended_fix && (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-[#19714e] uppercase tracking-wider">
                  Recommended Fix
                </p>

                <p className="text-xs text-[#52615a] leading-5 mt-1">
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
// Resume Analysis Result
// -----------------------------------------------------------------------------

function ResumeAnalysisResult({ result, onBack }) {
  if (!result) {
    return null;
  }

  const scores = result.scores || {};

  const overallScore =
    typeof result.overall_score === "number"
      ? result.overall_score
      : Number(result.overall_score) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles
              size={18}
              className="text-[#19714e]"
            />

            <span className="text-xs font-bold uppercase tracking-wider text-[#19714e]">
              AI Resume Analysis
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] text-[#12221d] tracking-tight">
            Resume Analysis
          </h2>

          <p className="text-sm text-[#68756f] mt-2">
            Detailed feedback generated by AI from your uploaded resume.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-[#dfe7e2] text-xs font-semibold text-[#52615a] hover:bg-[#f7faf8] flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft size={15} />
          Analyze Another
        </button>
      </div>

      {/* Score + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="bg-[#123c2c] text-white rounded-3xl p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
            Overall Score
          </p>

          <div className="flex items-end gap-2 mt-4">
            <span className="text-6xl font-bold font-['Space_Grotesk']">
              {overallScore}
            </span>

            <span className="text-lg opacity-60 mb-2">
              /100
            </span>
          </div>

          <div className="mt-5 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(
                  Math.max(overallScore, 0),
                  100
                )}%`,
              }}
            />
          </div>

          <p className="text-xs opacity-70 mt-4">
            Based on grammar, structure, formatting, content and ATS.
          </p>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2 bg-white border border-[#dfe7e2] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText
              size={18}
              className="text-[#19714e]"
            />

            <h3 className="text-sm font-bold text-[#12221d]">
              Executive Summary
            </h3>
          </div>

          <p className="text-sm leading-7 text-[#52615a]">
            {result.summary ||
              "No summary was provided by the analysis service."}
          </p>
        </div>
      </div>

      {/* Individual Scores */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#68756f] mb-4">
          Detailed Scores
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ScoreCard
            title="Grammar"
            score={scores.grammar}
            icon={<Type size={17} />}
          />

          <ScoreCard
            title="Structure"
            score={scores.structure}
            icon={<Layout size={17} />}
          />

          <ScoreCard
            title="Formatting"
            score={scores.formatting}
            icon={<FileText size={17} />}
          />

          <ScoreCard
            title="Content"
            score={scores.content}
            icon={<Target size={17} />}
          />

          <ScoreCard
            title="ATS"
            score={scores.ats}
            icon={<Search size={17} />}
          />
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white border border-[#dfe7e2] rounded-3xl p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2
              size={19}
              className="text-[#19714e]"
            />

            <h3 className="text-lg font-bold text-[#12221d]">
              Strengths
            </h3>
          </div>

          <div className="space-y-3">
            {(result.strengths || []).length > 0 ? (
              result.strengths.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-xl bg-[#dff8eb]/50"
                >
                  <CheckCircle2
                    size={16}
                    className="text-[#19714e] mt-0.5 shrink-0"
                  />

                  <p className="text-xs text-[#52615a] leading-5">
                    {item}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#68756f]">
                No strengths were returned.
              </p>
            )}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="bg-white border border-[#dfe7e2] rounded-3xl p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle
              size={19}
              className="text-amber-600"
            />

            <h3 className="text-lg font-bold text-[#12221d]">
              Areas to Improve
            </h3>
          </div>

          <div className="space-y-3">
            {(result.weaknesses || []).length > 0 ? (
              result.weaknesses.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-xl bg-amber-50"
                >
                  <AlertTriangle
                    size={16}
                    className="text-amber-600 mt-0.5 shrink-0"
                  />

                  <p className="text-xs text-[#52615a] leading-5">
                    {item}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#68756f]">
                No weaknesses were returned.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Grammar Analysis */}
      <AnalysisSection
        title="Grammar Analysis"
        icon={<Type size={18} />}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="text-3xl font-bold text-[#12221d] font-['Space_Grotesk']">
            {result.grammar_analysis?.total_errors || 0}
          </div>

          <span className="text-xs text-[#68756f]">
            grammar errors found
          </span>
        </div>

        {(result.grammar_analysis?.errors || []).length === 0 ? (
          <div className="p-4 rounded-xl bg-[#dff8eb] text-xs text-[#19714e] font-semibold">
            No grammar errors detected.
          </div>
        ) : (
          <div className="space-y-2">
            {result.grammar_analysis.errors.map(
              (error, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 rounded-xl text-xs text-red-700"
                >
                  {typeof error === "string"
                    ? error
                    : JSON.stringify(error)}
                </div>
              )
            )}
          </div>
        )}
      </AnalysisSection>

      {/* Structure Analysis */}
      <AnalysisSection
        title="Structure Analysis"
        icon={<Layout size={18} />}
      >
        <ListSection
          title="Missing Sections"
          items={
            result.structure_analysis?.missing_sections
          }
        />

        <ListSection
          title="Duplicate Sections"
          items={
            result.structure_analysis?.duplicate_sections
          }
        />

        <ListSection
          title="Empty Sections"
          items={
            result.structure_analysis?.empty_sections
          }
        />

        <ListSection
          title="Incorrect Order"
          items={
            result.structure_analysis?.incorrect_order
          }
        />

        <ListSection
          title="Recommendations"
          items={
            result.structure_analysis?.recommendations
          }
        />

        {!result.structure_analysis?.missing_sections?.length &&
          !result.structure_analysis?.duplicate_sections?.length &&
          !result.structure_analysis?.empty_sections?.length &&
          !result.structure_analysis?.incorrect_order?.length &&
          !result.structure_analysis?.recommendations?.length && (
            <div className="p-4 rounded-xl bg-[#dff8eb] text-xs text-[#19714e] font-semibold">
              No major structure issues were detected.
            </div>
          )}
      </AnalysisSection>

      {/* Formatting Analysis */}
      <AnalysisSection
        title="Formatting Analysis"
        icon={<FileText size={18} />}
      >
        <ListSection
          title="Issues"
          items={result.formatting_analysis?.issues}
        />

        <ListSection
          title="Recommendations"
          items={
            result.formatting_analysis?.recommendations
          }
        />

        {!result.formatting_analysis?.issues?.length &&
          !result.formatting_analysis?.recommendations?.length && (
            <div className="p-4 rounded-xl bg-[#dff8eb] text-xs text-[#19714e] font-semibold">
              No major formatting issues were detected.
            </div>
          )}
      </AnalysisSection>

      {/* Content Analysis */}
      <AnalysisSection
        title="Content Analysis"
        icon={<Target size={18} />}
      >
        <ListSection
          title="Weak Statements"
          items={
            result.content_analysis?.weak_statements
          }
        />

        <ListSection
          title="Missing Information"
          items={
            result.content_analysis?.missing_information
          }
        />

        {(result.content_analysis?.improved_versions || [])
          .length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#19714e] mb-3">
                Improved Versions
              </h4>

              <div className="space-y-3">
                {result.content_analysis.improved_versions.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-[#dff8eb]/50 border border-[#19714e]/10 text-xs text-[#52615a] leading-6"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {!result.content_analysis?.weak_statements?.length &&
          !result.content_analysis?.missing_information?.length &&
          !result.content_analysis?.improved_versions?.length && (
            <div className="p-4 rounded-xl bg-[#dff8eb] text-xs text-[#19714e] font-semibold">
              No major content issues were detected.
            </div>
          )}
      </AnalysisSection>

      {/* ATS Analysis */}
      <AnalysisSection
        title="ATS Analysis"
        icon={<Search size={18} />}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`px-4 py-2 rounded-xl text-xs font-bold ${result.ats_analysis?.ats_friendly
                ? "bg-[#dff8eb] text-[#19714e]"
                : "bg-red-50 text-red-600"
              }`}
          >
            {result.ats_analysis?.ats_friendly
              ? "ATS Friendly"
              : "Needs ATS Improvement"}
          </div>
        </div>

        <ListSection
          title="ATS Issues"
          items={result.ats_analysis?.issues}
        />

        {!result.ats_analysis?.issues?.length && (
          <div className="p-4 rounded-xl bg-[#dff8eb] text-xs text-[#19714e] font-semibold">
            No major ATS issues were detected.
          </div>
        )}
      </AnalysisSection>

      {/* AI Suggestions */}
      <div className="bg-white border border-[#dfe7e2] rounded-3xl p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-7">
          <Sparkles
            size={20}
            className="text-[#19714e]"
          />

          <div>
            <h3 className="text-xl font-bold text-[#12221d] font-['Space_Grotesk']">
              AI Recommendations
            </h3>

            <p className="text-xs text-[#68756f] mt-1">
              Prioritized suggestions to improve your resume.
            </p>
          </div>
        </div>

        <SuggestionGroup
          title="High Priority"
          items={result.suggestions?.high_priority}
        />

        <SuggestionGroup
          title="Medium Priority"
          items={result.suggestions?.medium_priority}
        />

        <SuggestionGroup
          title="Low Priority"
          items={result.suggestions?.low_priority}
        />

        {!result.suggestions?.high_priority?.length &&
          !result.suggestions?.medium_priority?.length &&
          !result.suggestions?.low_priority?.length && (
            <div className="p-4 rounded-xl bg-[#dff8eb] text-xs text-[#19714e] font-semibold">
              No additional recommendations were returned.
            </div>
          )}
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Main Resume Page
// -----------------------------------------------------------------------------

export default function ResumePage() {
  const navigate = useNavigate();

  const {
    setResumeState,
    downloadUrl: contextDownloadUrl,
  } = useApp();

  const { completeResume, setResumeId } = useAuth();

  const fileInputRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Main Modes
  // ---------------------------------------------------------------------------

  const [mode, setMode] = useState("select");

  // select
  // upload
  // upload_success
  // create
  // created_success
  // analyze
  // analyze_success

  // ---------------------------------------------------------------------------
  // Existing Upload State
  // ---------------------------------------------------------------------------

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [downloadUrl, setDownloadUrl] = useState("");
  const [generatedResume, setGeneratedResume] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  const activeDownloadUrl =
    downloadUrl || contextDownloadUrl;

  // ---------------------------------------------------------------------------
  // Analyze Resume State
  // ---------------------------------------------------------------------------

  const [analyzeFile, setAnalyzeFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // ---------------------------------------------------------------------------
  // CREATE RESUME FORM STATE
  // ---------------------------------------------------------------------------

  const [formData, setFormData] = useState({
    name: "",

    contact: {
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },

    education: [
      {
        institution: "",
        degree: "",
        major: "",
        start_date: "",
        end_date: "",
        gpa: "",
      },
    ],

    experience: [
      {
        company: "",
        role: "",
        start_date: "",
        end_date: "",
        highlights: [""],
      },
    ],

    projects: [
      {
        name: "",
        description: "",
        highlights: [""],
        url: "",
      },
    ],

    skills: [
      {
        category: "Languages & Frameworks",
        skills: "",
      },
      {
        category: "Tools & Libraries",
        skills: "",
      },
    ],

    certifications: [
      {
        name: "",
        issuer: "",
        issue_date: "",
        url: "",
      },
    ],
  });

  // ---------------------------------------------------------------------------
  // EXISTING RESUME UPLOAD
  // ---------------------------------------------------------------------------

  const handleFileSelect = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setUploadProgress(0);
    setIsProcessing(true);
    setErrorMessage("");

    let progress = 0;

    const interval = setInterval(() => {
      progress += 25;

      if (progress <= 90) {
        setUploadProgress(progress);
      }
    }, 200);

    try {
      const apiResult =
        await resumeService.uploadResume(file);

      clearInterval(interval);

      setUploadProgress(100);

      const extractedUrl =
        apiResult?.data?.download_url ||
        apiResult?.download_url ||
        apiResult?.downloadUrl ||
        "";

      if (extractedUrl) {
        setDownloadUrl(extractedUrl);
      }

      const parsedResume =
        apiResult?.data?.resume ||
        apiResult?.data?.parsed_data ||
        apiResult?.resume ||
        apiResult?.parsed_data ||
        null;

      if (parsedResume) {
        setGeneratedResume(parsedResume);
      }

      setIsProcessing(false);

      setMode("upload_success");

      const extractedRid =
        extractRidFromResponse(apiResult) ||
        apiResult?.data?.res_id ||
        apiResult?.data?.resumeId ||
        apiResult?.res_id ||
        apiResult?.resumeId ||
        apiResult?.id;

      const newId = extractedRid || "res_" + Date.now();

      if (setResumeId) {
        setResumeId(String(newId));
      }

      setResumeState({
        id: String(newId),

        fileName: file.name,

        apiResponse: apiResult,

        download_url: extractedUrl,
      });

      setIsProcessing(false);

      completeResume();

      navigate("/home");
    } catch (err) {
      console.warn(
        "Resume upload API endpoint error, using fallback state:",
        err
      );

      clearInterval(interval);

      setUploadProgress(100);

      const fallbackId = "res_" + Date.now();

      if (setResumeId) {
        setResumeId(fallbackId);
      }

      setResumeState({
        id: fallbackId,
        fileName: file.name,
      });

      setIsProcessing(false);

      completeResume();

      navigate("/home");
    }
  };

  // ---------------------------------------------------------------------------
  // Drop Upload
  // ---------------------------------------------------------------------------

  const handleDrop = (e) => {
    e.preventDefault();

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files[0]
    ) {
      handleFileSelect(
        e.dataTransfer.files[0]
      );
    }
  };

  // ---------------------------------------------------------------------------
  // ANALYZE RESUME
  // ---------------------------------------------------------------------------

  const handleAnalyzeResume = async () => {
    if (!analyzeFile) {
      setErrorMessage(
        "Please select a resume first."
      );
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMessage("");
      setAnalysisResult(null);

      const result =
        await resumeService.analyzeResume(
          analyzeFile
        );

      console.log(
        "Resume Analysis Result:",
        result
      );

      if (!result?.success) {
        throw new Error(
          result?.message ||
          "Resume analysis failed."
        );
      }

      setAnalysisResult(result);

      setMode("analyze_success");
    } catch (err) {
      console.error(
        "Resume analysis error:",
        err
      );

      setErrorMessage(
        err.message ||
        "Unable to analyze your resume. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CREATE RESUME FORM HANDLERS
  // ---------------------------------------------------------------------------

  const handleContactChange = (
    field,
    val
  ) => {
    setFormData((prev) => ({
      ...prev,

      contact: {
        ...prev.contact,
        [field]: val,
      },
    }));
  };

  const addDynamicItem = (
    sectionKey,
    newItem
  ) => {
    setFormData((prev) => ({
      ...prev,

      [sectionKey]: [
        ...prev[sectionKey],
        newItem,
      ],
    }));
  };

  const removeDynamicItem = (
    sectionKey,
    index
  ) => {
    setFormData((prev) => ({
      ...prev,

      [sectionKey]: prev[
        sectionKey
      ].filter((_, i) => i !== index),
    }));
  };

  const updateDynamicItem = (
    sectionKey,
    index,
    field,
    val
  ) => {
    setFormData((prev) => {
      const list = [
        ...prev[sectionKey],
      ];

      list[index] = {
        ...list[index],
        [field]: val,
      };

      return {
        ...prev,
        [sectionKey]: list,
      };
    });
  };

  const handleHighlightChange = (
    sectionKey,
    itemIndex,
    hIndex,
    val
  ) => {
    setFormData((prev) => {
      const list = [
        ...prev[sectionKey],
      ];

      const highlights = [
        ...(list[itemIndex]
          .highlights || [""]),
      ];

      highlights[hIndex] = val;

      list[itemIndex] = {
        ...list[itemIndex],
        highlights,
      };

      return {
        ...prev,
        [sectionKey]: list,
      };
    });
  };

  const addHighlight = (
    sectionKey,
    itemIndex
  ) => {
    setFormData((prev) => {
      const list = [
        ...prev[sectionKey],
      ];

      const highlights = [
        ...(list[itemIndex]
          .highlights || [""]),
        "",
      ];

      list[itemIndex] = {
        ...list[itemIndex],
        highlights,
      };

      return {
        ...prev,
        [sectionKey]: list,
      };
    });
  };

  const removeHighlight = (
    sectionKey,
    itemIndex,
    hIndex
  ) => {
    setFormData((prev) => {
      const list = [
        ...prev[sectionKey],
      ];

      const highlights =
        list[itemIndex].highlights.filter(
          (_, i) => i !== hIndex
        );

      list[itemIndex] = {
        ...list[itemIndex],
        highlights,
      };

      return {
        ...prev,
        [sectionKey]: list,
      };
    });
  };

  // ---------------------------------------------------------------------------
  // CREATE RESUME SUBMIT
  // ---------------------------------------------------------------------------

  const handleFormSubmit = async (
    e
  ) => {
    e.preventDefault();

    setIsProcessing(true);
    setErrorMessage("");

    const payload = {
      name: formData.name || "",

      contact: {
        email:
          formData.contact?.email || "",

        phone:
          formData.contact?.phone || "",

        location:
          formData.contact?.location || "",

        linkedin:
          formData.contact?.linkedin || "",

        github:
          formData.contact?.github || "",

        portfolio:
          formData.contact?.portfolio || "",
      },

      education: (
        formData.education || []
      ).map((edu) => ({
        institution:
          edu.institution || "",

        degree:
          edu.degree || "",

        major:
          edu.major || "",

        start_date:
          edu.start_date || "",

        end_date:
          edu.end_date || "",

        gpa:
          edu.gpa || "",
      })),

      experience: (
        formData.experience || []
      ).map((exp) => ({
        company:
          exp.company || "",

        role:
          exp.role || "",

        start_date:
          exp.start_date || "",

        end_date:
          exp.end_date || "",

        highlights:
          Array.isArray(
            exp.highlights
          )
            ? exp.highlights.filter(Boolean)
            : [],
      })),

      projects: (
        formData.projects || []
      ).map((proj) => ({
        name:
          proj.name || "",

        description:
          proj.description || "",

        highlights:
          Array.isArray(
            proj.highlights
          )
            ? proj.highlights.filter(Boolean)
            : [],

        url:
          proj.url || "",
      })),

      skills: (
        formData.skills || []
      ).map((s) => ({
        category:
          s.category || "",

        skills:
          Array.isArray(s.skills)
            ? s.skills
            : typeof s.skills ===
              "string"
              ? s.skills
                .split(",")
                .map((item) =>
                  item.trim()
                )
                .filter(Boolean)
              : [],
      })),

      certifications: (
        formData.certifications || []
      ).map((cert) => ({
        name:
          cert.name || "",

        issuer:
          cert.issuer || "",

        issue_date:
          cert.issue_date || "",

        url:
          cert.url || "",
      })),
    };

    try {
      const apiResult =
        await resumeService.generateResume(
          payload
        );

      const extractedUrl =
        apiResult?.data?.download_url ||
        apiResult?.download_url ||
        apiResult?.downloadUrl ||
        "";

      if (extractedUrl) {
        setDownloadUrl(extractedUrl);
      }

      const parsedResume =
        apiResult?.data?.resume ||
        apiResult?.data?.parsed_data ||
        apiResult?.resume ||
        apiResult?.parsed_data ||
        payload;

      setGeneratedResume(
        parsedResume
      );

      const extractedRid =
        extractRidFromResponse(apiResult) ||
        apiResult?.data?.res_id ||
        apiResult?.data?.resumeId ||
        apiResult?.res_id ||
        apiResult?.resumeId ||
        apiResult?.id;

      const newId = extractedRid || "res_" + Date.now();

      if (setResumeId) {
        setResumeId(String(newId));
      }

      setResumeState({
        id: String(newId),

        formData: payload,

        apiResponse: apiResult,

        download_url:
          extractedUrl,
      });

      setIsProcessing(false);

      completeResume();

      navigate("/home");
    } catch (err) {
      console.error(
        "Resume generation API error:",
        err
      );

      setErrorMessage(
        err.message ||
        "Unable to generate your resume. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleProceedToHome = () => {
    completeResume();
    navigate("/home");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#12221d] font-sans selection:bg-[#dff8eb] selection:text-[#19714e] pb-24">

      {/* --------------------------------------------------------------------- */}
      {/* NAVBAR */}
      {/* --------------------------------------------------------------------- */}

      <header className="sticky top-0 z-30 bg-[#f7faf8]/90 backdrop-blur-md border-b border-[#dfe7e2]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="text-xs font-semibold text-[#52615a] hover:text-[#19714e] transition-colors"
            >
              Dashboard
            </Link>

            <Link
              to="/for-you"
              className="text-xs font-semibold text-[#52615a] hover:text-[#19714e] transition-colors"
            >
              Jobs For You
            </Link>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN */}
      {/* --------------------------------------------------------------------- */}

      <main className="max-w-7xl mx-auto px-5 sm:px-6 pt-8 sm:pt-10">

        {/* ------------------------------------------------------------------- */}
        {/* TOP HEADER */}
        {/* ------------------------------------------------------------------- */}

        {mode !== "analyze_success" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative text-center max-w-3xl mx-auto mb-10 sm:mb-14"
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#dff8eb]/50 blur-3xl rounded-full pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#dfe7e2] text-[#19714e] text-[11px] font-bold uppercase tracking-wider mb-5 shadow-sm">
                <Sparkles size={14} />
                Resume Center
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] text-[#12221d] tracking-tight leading-[1.05]">
                Build a Resume
                <span className="block text-[#19714e] mt-1">
                  That Gets Noticed
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#68756f] mt-5 leading-7 max-w-2xl mx-auto">
                Upload your existing resume or create a professional one
                from scratch. Build your career profile with SkillCart.
              </p>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* EXISTING GENERATED RESUME */}
        {/* ------------------------------------------------------------------- */}

        {activeDownloadUrl &&
          mode === "select" && (
            <div className="w-full max-w-5xl mx-auto mb-8 p-4.5 rounded-2xl bg-[#dff8eb] border border-[#19714e]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#19714e] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText size={20} />
                </div>

                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#12221d] block">
                    You have a generated resume ready for download
                  </span>

                  <span className="text-[11px] text-[#52615a] truncate block font-mono">
                    {activeDownloadUrl}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  resumeService.downloadResume(
                    activeDownloadUrl
                  )
                }
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#19714e] hover:bg-[#123c2c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
              >
                <Download size={15} />
                <span>
                  Download Resume
                </span>
              </button>
            </div>
          )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE: SELECT */}
        {/* ------------------------------------------------------------------- */}

        {mode === "select" && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="relative left-1/2 -translate-x-1/2 w-screen max-w-none px-5 sm:px-6"
          >
            <div className="max-w-5xl mx-auto">
              <motion.div
                variants={fadeIn}
                className="flex items-center justify-between mb-5"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#19714e]">
                    Choose how to begin
                  </p>
                  <p className="text-xs text-[#68756f] mt-1">
                    Start with an existing resume or build one from scratch.
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#68756f]">
                  <span className="w-2 h-2 rounded-full bg-[#19714e]" />
                  2 options
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* ============================================================= */}
                {/* UPLOAD RESUME */}
                {/* ============================================================= */}
                <motion.div
                  variants={fadeIn}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setMode("upload")}
                  className="group relative overflow-hidden bg-white border border-[#dfe7e2] hover:border-[#19714e]/60 rounded-[28px] p-7 sm:p-9 shadow-sm hover:shadow-xl hover:shadow-[#123c2c]/10 transition-all duration-300 cursor-pointer min-h-97.5 flex flex-col"
                >
                  <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-[#dff8eb]/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-2xl bg-[#dff8eb] text-[#19714e] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#19714e] group-hover:text-white transition-all duration-300">
                        <UploadCloud size={30} strokeWidth={1.8} />
                      </div>

                      <span className="text-xs font-bold text-[#dfe7e2] group-hover:text-[#b8d7ca] transition-colors">
                        01
                      </span>
                    </div>

                    <div className="mt-7">
                      <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-[#12221d] tracking-tight">
                        Upload Resume
                      </h3>

                      <p className="text-sm text-[#68756f] leading-6 mt-3 max-w-md">
                        Already have a resume? Upload your existing PDF or DOC
                        file and continue your career journey.
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#dff8eb] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} className="text-[#19714e]" />
                        </div>
                        <span className="text-xs font-medium text-[#52615a]">
                          PDF, DOC & DOCX supported
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#dff8eb] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} className="text-[#19714e]" />
                        </div>
                        <span className="text-xs font-medium text-[#52615a]">
                          Secure backend storage
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#dff8eb] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} className="text-[#19714e]" />
                        </div>
                        <span className="text-xs font-medium text-[#52615a]">
                          Fast resume processing
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-8">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode("upload");
                        }}
                        className="w-full py-3.5 px-5 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-[#123c2c]/10"
                      >
                        <UploadCloud size={17} />
                        <span>Upload Resume</span>
                        <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* ============================================================= */}
                {/* CREATE RESUME */}
                {/* ============================================================= */}
                <motion.div
                  variants={fadeIn}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setMode("create")}
                  className="group relative overflow-hidden bg-white border border-[#dfe7e2] hover:border-[#19714e]/60 rounded-[28px] p-7 sm:p-9 shadow-sm hover:shadow-xl hover:shadow-[#123c2c]/10 transition-all duration-300 cursor-pointer min-h-97.5 flex flex-col"
                >
                  <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-[#b9ef84]/25 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-2xl bg-[#eef9df] text-[#123c2c] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#123c2c] group-hover:text-white transition-all duration-300">
                        <FileText size={30} strokeWidth={1.8} />
                      </div>

                      <span className="text-xs font-bold text-[#dfe7e2] group-hover:text-[#b8d7ca] transition-colors">
                        02
                      </span>
                    </div>

                    <div className="mt-7">
                      <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-[#12221d] tracking-tight">
                        Create Resume
                      </h3>

                      <p className="text-sm text-[#68756f] leading-6 mt-3 max-w-md">
                        Don't have a resume yet? Build a professional resume
                        step-by-step with our guided builder.
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#eef9df] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} className="text-[#19714e]" />
                        </div>
                        <span className="text-xs font-medium text-[#52615a]">
                          Guided resume builder
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#eef9df] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} className="text-[#19714e]" />
                        </div>
                        <span className="text-xs font-medium text-[#52615a]">
                          Professional resume structure
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#eef9df] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} className="text-[#19714e]" />
                        </div>
                        <span className="text-xs font-medium text-[#52615a]">
                          Generate a ready-to-use PDF
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-8">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode("create");
                        }}
                        className="w-full py-3.5 px-5 rounded-xl bg-white border border-[#123c2c] text-[#123c2c] hover:bg-[#123c2c] hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300"
                      >
                        <FileText size={17} />
                        <span>Start Building</span>
                        <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Resume journey */}
              <motion.div
                variants={fadeIn}
                className="mt-8 flex items-center justify-center"
              >
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/70 border border-[#dfe7e2]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center text-[10px] font-bold">
                      1
                    </span>
                    <span className="text-[11px] font-semibold text-[#52615a]">
                      Choose
                    </span>
                  </div>

                  <ArrowRight size={13} className="text-[#b1bdb7]" />

                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center text-[10px] font-bold">
                      2
                    </span>
                    <span className="text-[11px] font-semibold text-[#52615a]">
                      Build
                    </span>
                  </div>

                  <ArrowRight size={13} className="text-[#b1bdb7]" />

                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <span className="text-[11px] font-semibold text-[#52615a]">
                      Apply
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE: UPLOAD */}
        {/* ------------------------------------------------------------------- */}

        {mode === "upload" && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="max-w-2xl mx-auto bg-white border border-[#dfe7e2] rounded-3xl p-8 sm:p-12 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#12221d]">
                Upload Your Resume
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMode("select")
                }
                className="text-xs font-semibold text-[#68756f] hover:text-[#12221d]"
              >
                Cancel
              </button>
            </div>

            {!isProcessing ? (
              <div
                onDragOver={(e) =>
                  e.preventDefault()
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="border-2 border-dashed border-[#dfe7e2] hover:border-[#19714e] rounded-2xl p-10 text-center cursor-pointer bg-[#f7faf8]/50 hover:bg-[#dff8eb]/20 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) =>
                    handleFileSelect(
                      e.target.files?.[0]
                    )
                  }
                />

                <div className="w-16 h-16 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} />
                </div>

                <h4 className="text-sm font-bold text-[#12221d] mb-1">
                  Click or drag file to this area to upload
                </h4>

                <p className="text-xs text-[#68756f] mb-4">
                  Supports PDF, DOC, DOCX up to 10MB
                </p>

                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#19714e] bg-[#dff8eb] px-4 py-2 rounded-xl">
                  Select File
                </span>
              </div>
            ) : (
              <div className="py-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center mx-auto animate-bounce">
                  <Sparkles size={32} />
                </div>

                <div>
                  <h4 className="text-base font-bold text-[#12221d]">
                    Sending{" "}
                    {selectedFile?.name ||
                      "Resume"}{" "}
                    to backend...
                  </h4>

                  <p className="text-xs text-[#68756f] mt-1">
                    Storing resume details securely
                  </p>
                </div>

                <div className="w-full bg-[#dfe7e2] h-2.5 rounded-full overflow-hidden max-w-md mx-auto">
                  <div
                    className="bg-[#19714e] h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-[#19714e]">
                  {uploadProgress}%
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE: UPLOAD SUCCESS */}
        {/* ------------------------------------------------------------------- */}

        {mode === "upload_success" && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="max-w-xl mx-auto bg-white border border-[#dfe7e2] rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-[#12221d]">
                Resume uploaded successfully
              </h2>

              <p className="text-xs text-[#68756f] max-w-sm mx-auto mt-2 leading-relaxed">
                Your resume file has been sent to the backend and stored successfully.
              </p>
            </div>

            {activeDownloadUrl && (
              <div className="p-4 rounded-2xl bg-[#dff8eb]/60 border border-[#19714e]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#19714e] text-white flex items-center justify-center shrink-0">
                    <Download size={20} />
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#12221d] block">
                      Resume File Link
                    </span>

                    <span className="text-[11px] text-[#52615a] truncate block font-mono">
                      {activeDownloadUrl}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    resumeService.downloadResume(
                      activeDownloadUrl
                    )
                  }
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#19714e] hover:bg-[#123c2c] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0"
                >
                  <Download size={14} />
                  <span>
                    Download
                  </span>
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {activeDownloadUrl && (
                <button
                  type="button"
                  onClick={() =>
                    resumeService.downloadResume(
                      activeDownloadUrl
                    )
                  }
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#19714e] hover:bg-[#123c2c] text-white font-bold text-xs shadow-md transition-all inline-flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>
                    Download Resume
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAnalyzeFile(
                    selectedFile
                  );
                  setAnalysisResult(null);
                  setErrorMessage("");
                  setMode("analyze");

                  if (selectedFile) {
                    // The uploaded file is reused for analysis.
                    // No resume ID is required.
                  }
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white font-bold text-xs shadow-md transition-all inline-flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>
                  Analyze My Resume
                </span>
              </button>

              <button
                type="button"
                onClick={handleProceedToHome}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#dfe7e2] hover:bg-[#f7faf8] text-[#12221d] font-bold text-xs transition-all inline-flex items-center justify-center gap-2"
              >
                <span>
                  Proceed to Home
                </span>

                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE: ANALYZE */}
        {/* ------------------------------------------------------------------- */}

        {mode === "analyze" && (
          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white border border-[#dfe7e2] rounded-3xl p-8 sm:p-10 shadow-sm">

              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles
                      size={18}
                      className="text-[#19714e]"
                    />

                    <span className="text-xs font-bold uppercase tracking-wider text-[#19714e]">
                      AI Resume Analysis
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-[#12221d]">
                    Analyze Your Resume
                  </h2>

                  <p className="text-xs text-[#68756f] mt-2">
                    Upload your resume and get detailed AI-powered feedback.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMode("select")
                  }
                  className="text-xs font-semibold text-[#68756f] hover:text-[#12221d]"
                >
                  Cancel
                </button>
              </div>

              {/* Upload */}
              {!analyzeFile &&
                !isAnalyzing && (
                  <label className="border-2 border-dashed border-[#dfe7e2] hover:border-[#19714e] rounded-2xl p-10 text-center cursor-pointer bg-[#f7faf8]/50 hover:bg-[#dff8eb]/20 transition-all block">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file =
                          e.target.files?.[0];

                        if (!file) return;

                        if (
                          file.size >
                          10 *
                          1024 *
                          1024
                        ) {
                          setErrorMessage(
                            "Resume must be smaller than 10MB."
                          );
                          return;
                        }

                        setErrorMessage("");
                        setAnalyzeFile(
                          file
                        );
                      }}
                    />

                    <div className="w-16 h-16 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center mx-auto mb-4">
                      <UploadCloud size={32} />
                    </div>

                    <h4 className="text-sm font-bold text-[#12221d] mb-1">
                      Upload your resume
                    </h4>

                    <p className="text-xs text-[#68756f] mb-4">
                      PDF, DOC, or DOCX up to 10MB
                    </p>

                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-[#123c2c] px-5 py-2.5 rounded-xl">
                      <UploadCloud size={15} />
                      Select Resume
                    </span>
                  </label>
                )}

              {/* Selected File */}
              {analyzeFile &&
                !isAnalyzing && (
                  <div className="space-y-5">
                    <div className="p-5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#dff8eb] text-[#19714e] flex items-center justify-center shrink-0">
                          <FileText size={24} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#12221d] truncate">
                            {analyzeFile.name}
                          </p>

                          <p className="text-[11px] text-[#68756f] mt-1">
                            {(
                              analyzeFile.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setAnalyzeFile(
                              null
                            )
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleAnalyzeResume
                      }
                      className="w-full py-3.5 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <Sparkles size={17} />

                      Analyze Resume
                    </button>
                  </div>
                )}

              {/* Loading */}
              {isAnalyzing && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center mx-auto mb-5">
                    <Sparkles
                      size={30}
                      className="animate-pulse"
                    />
                  </div>

                  <h3 className="text-base font-bold text-[#12221d]">
                    Analyzing your resume...
                  </h3>

                  <p className="text-xs text-[#68756f] mt-2 max-w-md mx-auto leading-5">
                    AI is reviewing your resume structure, content, grammar, formatting and ATS compatibility.
                  </p>

                  <div className="flex justify-center mt-6">
                    <Loader2
                      size={22}
                      className="animate-spin text-[#19714e]"
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {errorMessage && (
                <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE: ANALYZE SUCCESS */}
        {/* ------------------------------------------------------------------- */}

        {mode === "analyze_success" &&
          analysisResult?.data && (
            <ResumeAnalysisResult
              result={
                analysisResult.data
              }
              onBack={() => {
                setAnalysisResult(
                  null
                );
                setAnalyzeFile(null);
                setErrorMessage("");
                setMode("analyze");
              }}
            />
          )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE: CREATE */}
        {/* ------------------------------------------------------------------- */}

        {mode === "create" && (
          <motion.form
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            onSubmit={
              handleFormSubmit
            }
            className="bg-white border border-[#dfe7e2] rounded-3xl p-6 sm:p-10 shadow-sm space-y-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#dfe7e2] pb-6">
              <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#12221d]">
                  Create Resume
                </h2>

                <p className="text-xs text-[#68756f] mt-1">
                  Fill in your details below to save your resume to the backend.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMode("select")
                }
                className="text-xs font-semibold text-[#68756f] hover:text-[#12221d]"
              >
                Cancel
              </button>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />

                  <span>
                    {errorMessage}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setErrorMessage("")
                  }
                  className="text-red-600 hover:text-red-900 text-xs font-bold underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Basic Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-['Space_Grotesk'] text-[#12221d] uppercase tracking-wider">
                Full Name
              </h3>

              <Input
                label="Full Name"
                placeholder="Alex Morgan"
                value={
                  formData.name
                }
                onChange={(e) =>
                  setFormData(
                    (prev) => ({
                      ...prev,
                      name: e.target.value,
                    })
                  )
                }
                required
              />
            </div>

            {/* Contact */}
            <div className="space-y-4 pt-4 border-t border-[#dfe7e2]">
              <h3 className="text-sm font-bold font-['Space_Grotesk'] text-[#12221d] uppercase tracking-wider">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="alex@example.com"
                  value={
                    formData.contact
                      .email
                  }
                  onChange={(e) =>
                    handleContactChange(
                      "email",
                      e.target.value
                    )
                  }
                  required
                />

                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-1234"
                  value={
                    formData.contact
                      .phone
                  }
                  onChange={(e) =>
                    handleContactChange(
                      "phone",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Location"
                  placeholder="New York, NY"
                  value={
                    formData.contact
                      .location
                  }
                  onChange={(e) =>
                    handleContactChange(
                      "location",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="LinkedIn URL"
                  placeholder="linkedin.com/in/alex"
                  value={
                    formData.contact
                      .linkedin
                  }
                  onChange={(e) =>
                    handleContactChange(
                      "linkedin",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="GitHub URL"
                  placeholder="github.com/alex"
                  value={
                    formData.contact
                      .github
                  }
                  onChange={(e) =>
                    handleContactChange(
                      "github",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Portfolio URL"
                  placeholder="alexmorgan.dev"
                  value={
                    formData.contact
                      .portfolio
                  }
                  onChange={(e) =>
                    handleContactChange(
                      "portfolio",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Education */}
            <div className="space-y-6 pt-4 border-t border-[#dfe7e2]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-['Space_Grotesk'] text-[#12221d] uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap
                    size={18}
                    className="text-[#19714e]"
                  />
                  Education
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    addDynamicItem(
                      "education",
                      {
                        institution:
                          "",
                        degree: "",
                        major: "",
                        start_date:
                          "",
                        end_date:
                          "",
                        gpa: "",
                      }
                    )
                  }
                  className="text-xs font-semibold text-[#19714e] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Education
                </button>
              </div>

              {formData.education.map(
                (edu, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] relative space-y-4"
                  >
                    {formData
                      .education
                      .length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeDynamicItem(
                              "education",
                              idx
                            )
                          }
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Institution"
                        placeholder="University of California"
                        value={
                          edu.institution
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "education",
                            idx,
                            "institution",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Degree"
                        placeholder="B.S."
                        value={
                          edu.degree
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "education",
                            idx,
                            "degree",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Major"
                        placeholder="Computer Science"
                        value={
                          edu.major
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "education",
                            idx,
                            "major",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Start Date"
                        placeholder="2018"
                        value={
                          edu.start_date
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "education",
                            idx,
                            "start_date",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="End Date"
                        placeholder="2022"
                        value={
                          edu.end_date
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "education",
                            idx,
                            "end_date",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="GPA"
                        placeholder="3.8/4.0"
                        value={
                          edu.gpa
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "education",
                            idx,
                            "gpa",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Experience */}
            <div className="space-y-6 pt-4 border-t border-[#dfe7e2]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-['Space_Grotesk'] text-[#12221d] uppercase tracking-wider flex items-center gap-2">
                  <Briefcase
                    size={18}
                    className="text-[#19714e]"
                  />
                  Work Experience
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    addDynamicItem(
                      "experience",
                      {
                        company: "",
                        role: "",
                        start_date:
                          "",
                        end_date:
                          "",
                        highlights: [
                          "",
                        ],
                      }
                    )
                  }
                  className="text-xs font-semibold text-[#19714e] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Experience
                </button>
              </div>

              {formData.experience.map(
                (exp, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] relative space-y-4"
                  >
                    {formData
                      .experience
                      .length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeDynamicItem(
                              "experience",
                              idx
                            )
                          }
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Company"
                        placeholder="Acme Corp"
                        value={
                          exp.company
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "experience",
                            idx,
                            "company",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Role / Title"
                        placeholder="Frontend Developer"
                        value={
                          exp.role
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "experience",
                            idx,
                            "role",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Start Date"
                        placeholder="Jan 2022"
                        value={
                          exp.start_date
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "experience",
                            idx,
                            "start_date",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="End Date"
                        placeholder="Present"
                        value={
                          exp.end_date
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "experience",
                            idx,
                            "end_date",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#68756f] uppercase tracking-wider block">
                        Highlights & Bullet Points
                      </label>

                      {exp.highlights.map(
                        (
                          hl,
                          hIdx
                        ) => (
                          <div
                            key={
                              hIdx
                            }
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              placeholder="e.g. Led redesign of core dashboard"
                              value={hl}
                              onChange={(e) =>
                                handleHighlightChange(
                                  "experience",
                                  idx,
                                  hIdx,
                                  e.target.value
                                )
                              }
                              className="w-full py-2 px-3 text-xs bg-white border border-[#dfe7e2] rounded-xl outline-none focus:border-[#19714e]"
                            />

                            {exp
                              .highlights
                              .length >
                              1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeHighlight(
                                      "experience",
                                      idx,
                                      hIdx
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2
                                    size={
                                      14
                                    }
                                  />
                                </button>
                              )}
                          </div>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          addHighlight(
                            "experience",
                            idx
                          )
                        }
                        className="text-xs font-semibold text-[#19714e] hover:underline block pt-1"
                      >
                        + Add Bullet
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Projects */}
            <div className="space-y-6 pt-4 border-t border-[#dfe7e2]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-['Space_Grotesk'] text-[#12221d] uppercase tracking-wider flex items-center gap-2">
                  <FileText
                    size={18}
                    className="text-[#19714e]"
                  />
                  Projects
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    addDynamicItem(
                      "projects",
                      {
                        name: "",
                        description:
                          "",
                        highlights: [
                          "",
                        ],
                        url: "",
                      }
                    )
                  }
                  className="text-xs font-semibold text-[#19714e] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Project
                </button>
              </div>

              {formData.projects.map(
                (proj, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] relative space-y-4"
                  >
                    {formData
                      .projects
                      .length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeDynamicItem(
                              "projects",
                              idx
                            )
                          }
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Project Name"
                        placeholder="SkillCart Web App"
                        value={
                          proj.name
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "projects",
                            idx,
                            "name",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Project URL"
                        placeholder="https://github.com/user/project"
                        value={
                          proj.url
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "projects",
                            idx,
                            "url",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <Input
                      label="Description"
                      placeholder="AI powered job matching dashboard built with React and Tailwind"
                      value={
                        proj.description
                      }
                      onChange={(e) =>
                        updateDynamicItem(
                          "projects",
                          idx,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                )
              )}
            </div>

            {/* Skills */}
            <div className="space-y-6 pt-4 border-t border-[#dfe7e2]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-['Space_Grotesk'] text-[#12221d] uppercase tracking-wider flex items-center gap-2">
                  <Target
                    size={18}
                    className="text-[#19714e]"
                  />
                  Grouped Skills
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    addDynamicItem(
                      "skills",
                      {
                        category: "",
                        skills: "",
                      }
                    )
                  }
                  className="text-xs font-semibold text-[#19714e] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Skill Group
                </button>
              </div>

              {formData.skills.map(
                (sk, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] relative grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"
                  >
                    <Input
                      label="Category"
                      placeholder="e.g. Frontend"
                      value={
                        sk.category
                      }
                      onChange={(e) =>
                        updateDynamicItem(
                          "skills",
                          idx,
                          "category",
                          e.target.value
                        )
                      }
                    />

                    <div className="sm:col-span-2">
                      <Input
                        label="Skills (Comma-separated)"
                        placeholder="React, TypeScript, Tailwind CSS"
                        value={
                          sk.skills
                        }
                        onChange={(e) =>
                          updateDynamicItem(
                            "skills",
                            idx,
                            "skills",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Certifications */}
            <div className="space-y-6 pt-4 border-t border-[#dfe7e2]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-['Space_Grotesk'] text-[#12221d] uppercase tracking-wider flex items-center gap-2">
                  <Award
                    size={18}
                    className="text-[#19714e]"
                  />
                  Certifications
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    addDynamicItem(
                      "certifications",
                      {
                        name: "",
                        issuer: "",
                        issue_date:
                          "",
                        url: "",
                      }
                    )
                  }
                  className="text-xs font-semibold text-[#19714e] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Certification
                </button>
              </div>

              {formData.certifications.map(
                (cert, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] relative grid grid-cols-1 sm:grid-cols-4 gap-4"
                  >
                    <Input
                      label="Name"
                      placeholder="AWS Certified Developer"
                      value={
                        cert.name
                      }
                      onChange={(e) =>
                        updateDynamicItem(
                          "certifications",
                          idx,
                          "name",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Issuer"
                      placeholder="Amazon Web Services"
                      value={
                        cert.issuer
                      }
                      onChange={(e) =>
                        updateDynamicItem(
                          "certifications",
                          idx,
                          "issuer",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Issue Date"
                      placeholder="2023"
                      value={
                        cert.issue_date
                      }
                      onChange={(e) =>
                        updateDynamicItem(
                          "certifications",
                          idx,
                          "issue_date",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="URL"
                      placeholder="credential.link"
                      value={
                        cert.url
                      }
                      onChange={(e) =>
                        updateDynamicItem(
                          "certifications",
                          idx,
                          "url",
                          e.target.value
                        )
                      }
                    />
                  </div>
                )
              )}
            </div>

            {/* Submit */}
            <div className="sticky bottom-4 z-20 pt-6 bg-white border-t border-[#dfe7e2] flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setMode("select")
                }
                className="px-6 py-3 rounded-xl border border-[#dfe7e2] text-xs font-semibold text-[#68756f] hover:text-[#12221d]"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={
                  isProcessing
                }
                className="px-8 py-3.5 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#123c2c]/10 transition-all disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    <span>
                      Generating your resume...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Submit Resume
                    </span>

                    <ArrowRight
                      size={16}
                    />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE: CREATED SUCCESS */}
        {/* ------------------------------------------------------------------- */}

        {mode ===
          "created_success" && (
            <motion.div
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Success Banner */}
              <div className="bg-white border border-[#dfe7e2] rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#dff8eb] text-[#19714e] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#12221d]">
                    Resume Generated Successfully!
                  </h2>

                  <p className="text-xs sm:text-sm text-[#68756f] max-w-md mx-auto mt-2 leading-relaxed">
                    Your resume details have been processed and your PDF document is ready to download.
                  </p>
                </div>

                {activeDownloadUrl && (
                  <div className="p-4.5 rounded-2xl bg-[#dff8eb] border border-[#19714e]/30 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto text-left shadow-xs">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-[#19714e] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Download size={20} />
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#12221d] block">
                          PDF Resume Ready
                        </span>

                        <span className="text-[11px] text-[#52615a] truncate block font-mono">
                          {activeDownloadUrl}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        resumeService.downloadResume(
                          activeDownloadUrl
                        )
                      }
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#19714e] hover:bg-[#123c2c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
                    >
                      <Download size={15} />
                      <span>
                        Download PDF
                      </span>
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  {activeDownloadUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        resumeService.downloadResume(
                          activeDownloadUrl
                        )
                      }
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#19714e] hover:bg-[#123c2c] text-white font-bold text-xs shadow-md transition-all inline-flex items-center justify-center gap-2"
                    >
                      <Download size={18} />

                      <span>
                        Download Resume
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleProceedToHome
                    }
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-[#dfe7e2] hover:bg-[#f7faf8] text-[#12221d] font-bold text-xs shadow-xs transition-all inline-flex items-center justify-center gap-2"
                  >
                    <span>
                      Proceed to Dashboard
                    </span>

                    <ArrowRight
                      size={16}
                    />
                  </button>
                </div>
              </div>

              {/* Generated Resume Preview */}
              {generatedResume && (
                <div className="bg-white border border-[#dfe7e2] rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#dfe7e2] pb-6 gap-4">
                    <div>
                      <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-[#12221d]">
                        {generatedResume.name ||
                          formData.name ||
                          "Generated Resume"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#52615a] mt-2">
                        {(generatedResume.contact?.email ||
                          formData.contact.email) && (
                            <span>
                              {generatedResume.contact?.email ||
                                formData.contact.email}
                            </span>
                          )}

                        {(generatedResume.contact?.phone ||
                          formData.contact.phone) && (
                            <span>
                              •{" "}
                              {generatedResume.contact?.phone ||
                                formData.contact.phone}
                            </span>
                          )}

                        {(generatedResume.contact?.location ||
                          formData.contact.location) && (
                            <span>
                              •{" "}
                              {generatedResume.contact?.location ||
                                formData.contact.location}
                            </span>
                          )}
                      </div>
                    </div>

                    {activeDownloadUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          resumeService.downloadResume(
                            activeDownloadUrl
                          )
                        }
                        className="px-4 py-2.5 rounded-xl bg-[#dff8eb] text-[#19714e] hover:bg-[#19714e] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-[#19714e]/20 shrink-0"
                      >
                        <Download
                          size={15}
                        />

                        <span>
                          Download Resume
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Work Experience */}
                  {((generatedResume.experience &&
                    generatedResume.experience
                      .length > 0) ||
                    (formData.experience &&
                      formData.experience
                        .length > 0)) && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#19714e] font-['Space_Grotesk']">
                          Work Experience
                        </h4>

                        <div className="space-y-5">
                          {(
                            generatedResume.experience ||
                            formData.experience
                          ).map(
                            (exp, idx) => (
                              <div
                                key={idx}
                                className="space-y-1.5 bg-[#f7faf8] p-4 rounded-2xl border border-[#dfe7e2]/60"
                              >
                                <div className="flex items-center justify-between text-xs font-bold text-[#12221d]">
                                  <span>
                                    {exp.role ||
                                      "Role"}{" "}
                                    •{" "}
                                    {exp.company ||
                                      "Company"}
                                  </span>

                                  <span className="text-[#68756f] font-normal">
                                    {
                                      exp.start_date
                                    }{" "}
                                    -{" "}
                                    {
                                      exp.end_date
                                    }
                                  </span>
                                </div>

                                {exp.highlights &&
                                  exp
                                    .highlights
                                    .length >
                                  0 && (
                                    <ul className="list-disc list-inside text-xs text-[#52615a] space-y-1 pt-1">
                                      {exp.highlights
                                        .filter(
                                          Boolean
                                        )
                                        .map(
                                          (
                                            hl,
                                            hIdx
                                          ) => (
                                            <li
                                              key={
                                                hIdx
                                              }
                                            >
                                              {
                                                hl
                                              }
                                            </li>
                                          )
                                        )}
                                    </ul>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Education */}
                  {((generatedResume.education &&
                    generatedResume.education
                      .length > 0) ||
                    (formData.education &&
                      formData.education
                        .length > 0)) && (
                      <div className="space-y-4 pt-4 border-t border-[#dfe7e2]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#19714e] font-['Space_Grotesk']">
                          Education
                        </h4>

                        <div className="space-y-3">
                          {(
                            generatedResume.education ||
                            formData.education
                          ).map(
                            (edu, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs bg-[#f7faf8] p-4 rounded-2xl border border-[#dfe7e2]/60"
                              >
                                <div>
                                  <span className="font-bold text-[#12221d] block">
                                    {
                                      edu.institution
                                    }
                                  </span>

                                  <span className="text-[#52615a]">
                                    {
                                      edu.degree
                                    }{" "}
                                    in{" "}
                                    {
                                      edu.major
                                    }{" "}
                                    {edu.gpa
                                      ? `(GPA: ${edu.gpa})`
                                      : ""}
                                  </span>
                                </div>

                                <span className="text-[#68756f]">
                                  {
                                    edu.start_date
                                  }{" "}
                                  -{" "}
                                  {
                                    edu.end_date
                                  }
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Skills */}
                  {((generatedResume.skills &&
                    generatedResume.skills
                      .length > 0) ||
                    (formData.skills &&
                      formData.skills
                        .length > 0)) && (
                      <div className="space-y-4 pt-4 border-t border-[#dfe7e2]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#19714e] font-['Space_Grotesk']">
                          Skills
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {(
                            generatedResume.skills ||
                            formData.skills
                          )
                            .flatMap(
                              (s) =>
                                Array.isArray(
                                  s.skills
                                )
                                  ? s.skills
                                  : typeof s.skills ===
                                    "string"
                                    ? s.skills.split(
                                      ","
                                    )
                                    : [s]
                            )
                            .map(
                              (
                                skillItem,
                                idx
                              ) => (
                                <span
                                  key={
                                    idx
                                  }
                                  className="px-3 py-1 bg-[#f7faf8] border border-[#dfe7e2] text-[#12221d] font-medium text-xs rounded-lg"
                                >
                                  {typeof skillItem ===
                                    "string"
                                    ? skillItem.trim()
                                    : skillItem}
                                </span>
                              )
                            )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </motion.div>
          )}
      </main>
    </div>
  );
}