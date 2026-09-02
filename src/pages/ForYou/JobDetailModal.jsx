import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Globe,
  Award,
  Briefcase,
  CheckSquare,
  ShieldCheck,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";

import jobService from "../../services/jobService";
import EvaluateFitButton from "../../components/common/EvaluateFitButton";
import JobEvaluationModal from "../../components/common/JobEvaluationModal";

/**
 * Convert any API value into a safe React string.
 */
function ensureString(value, fallback = "") {
  if (
    value === null ||
    value === undefined
  ) {
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
    if (value.name) {
      return String(value.name);
    }

    if (value.title) {
      return String(value.title);
    }

    if (value.label) {
      return String(value.label);
    }

    if (value.value) {
      return String(value.value);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

/**
 * Convert API arrays / strings / objects into
 * a clean array of strings.
 */
function normalizeList(value) {
  if (!value) {
    return [];
  }

  let array = [];

  if (Array.isArray(value)) {
    array = value;
  } else if (typeof value === "string") {
    array = value
      .split(",")
      .map((item) => item.trim());
  } else if (typeof value === "object") {
    array = Object.values(value);
  }

  return array
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (
        item &&
        typeof item === "object"
      ) {
        return (
          item.name ||
          item.skill ||
          item.title ||
          item.label ||
          item.value ||
          ""
        );
      }

      return String(item || "");
    })
    .map((item) => String(item).trim())
    .filter(Boolean);
}

/**
 * Format salary using API values.
 */
function formatSalary(
  salaryMin,
  salaryMax,
  currency,
  salary
) {
  if (
    salaryMin !== null &&
    salaryMin !== undefined ||
    salaryMax !== null &&
    salaryMax !== undefined
  ) {
    const currencyCode =
      String(currency || "INR").toUpperCase();

    if (currencyCode === "INR") {
      const min =
        salaryMin !== null &&
        salaryMin !== undefined
          ? Number(salaryMin) / 100000
          : null;

      const max =
        salaryMax !== null &&
        salaryMax !== undefined
          ? Number(salaryMax) / 100000
          : null;

      if (min !== null && max !== null) {
        return `₹${min.toFixed(1)}L - ₹${max.toFixed(1)}L / yr`;
      }

      if (min !== null) {
        return `₹${min.toFixed(1)}L / yr`;
      }

      if (max !== null) {
        return `₹${max.toFixed(1)}L / yr`;
      }
    }

    const symbol =
      currencyCode === "USD"
        ? "$"
        : currencyCode === "EUR"
        ? "€"
        : currencyCode === "GBP"
        ? "£"
        : currencyCode;

    if (
      salaryMin !== null &&
      salaryMin !== undefined &&
      salaryMax !== null &&
      salaryMax !== undefined
    ) {
      return `${symbol}${Number(
        salaryMin
      ).toLocaleString()} - ${symbol}${Number(
        salaryMax
      ).toLocaleString()} / yr`;
    }

    if (
      salaryMin !== null &&
      salaryMin !== undefined
    ) {
      return `${symbol}${Number(
        salaryMin
      ).toLocaleString()} / yr`;
    }

    if (
      salaryMax !== null &&
      salaryMax !== undefined
    ) {
      return `${symbol}${Number(
        salaryMax
      ).toLocaleString()} / yr`;
    }
  }

  return ensureString(salary);
}

export default function JobDetailModal({
  job,
  onClose,
  isSaved,
  onToggleSave,
}) {
  const [fetchedJob, setFetchedJob] =
    useState(null);

  const [isLoadingDetails, setIsLoadingDetails] =
    useState(false);

  const [detailError, setDetailError] =
    useState(null);

  const [imgError, setImgError] =
    useState(false);

  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);

  /**
   * Get ID from the selected job.
   */
  const jobId =
    job?.id ??
    job?._id ??
    job?.job_id;

  /**
   * Fetch complete job information.
   */
  useEffect(() => {
    let mounted = true;

    if (
      jobId === null ||
      jobId === undefined ||
      jobId === ""
    ) {
      return;
    }

    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      setDetailError(null);
      setFetchedJob(null);

      try {
        const detail =
          await jobService.getJobById(
            jobId
          );

        if (
          mounted &&
          detail &&
          typeof detail === "object"
        ) {
          setFetchedJob(detail);
        }
      } catch (error) {
        console.error(
          `Failed to fetch job ${jobId}:`,
          error
        );

        if (mounted) {
          setDetailError(
            error?.message ||
              "Unable to load complete job details."
          );
        }
      } finally {
        if (mounted) {
          setIsLoadingDetails(false);
        }
      }
    };

    fetchDetails();

    return () => {
      mounted = false;
    };
  }, [jobId]);

  if (!job) {
    return null;
  }

  /**
   * While details are loading, use the job
   * already received from /jobs.
   *
   * Once /jobs/:id responds, fetchedJob
   * becomes the source of truth.
   */
  const activeJob =
    fetchedJob || job;

  // =========================================================
  // COMPANY
  // =========================================================

  const company =
    activeJob?.company &&
    typeof activeJob.company === "object"
      ? activeJob.company
      : {};

  const companyName = ensureString(
    company.company_name ??
      company.name ??
      activeJob.company_name ??
      activeJob.company ??
      activeJob.employer
  );

  const companyLogoUrl =
    company.logo_url ??
    activeJob.logo_url ??
    "";

  const companyWebsite =
    company.website ??
    company.website_url ??
    activeJob.website ??
    "";

  const companyLinkedin =
    company.linkedin_url ??
    activeJob.linkedin_url ??
    "";

  const companyIndustry =
    company.industry ??
    activeJob.industry ??
    "";

  const companySize =
    company.company_size ??
    activeJob.company_size ??
    "";

  const companyHeadquarters =
    company.headquarters ??
    activeJob.headquarters ??
    "";

  const companyDescription =
    company.description ??
    activeJob.company_description ??
    "";

  // =========================================================
  // JOB BASIC INFORMATION
  // =========================================================

  const jobTitle = ensureString(
    activeJob.job_title ??
      activeJob.title ??
      activeJob.role,
    "Job Position"
  );

  const department = ensureString(
    activeJob.department
  );

  const projectRole = ensureString(
    activeJob.project_role
  );

  const projectRoleDescription =
    ensureString(
      activeJob.project_role_description
    );

  const summary = ensureString(
    activeJob.summary ??
      activeJob.description ??
      activeJob.details ??
      activeJob.job_description
  );

  // =========================================================
  // JOB SPECIFICATIONS
  // =========================================================

  const workMode = ensureString(
    activeJob.work_mode ??
      activeJob.work_type ??
      activeJob.remote_type
  );

  const employmentType = ensureString(
    activeJob.employment_type ??
      activeJob.job_type
  );

  const location = ensureString(
    activeJob.location ??
      companyHeadquarters
  );

  const openings =
    activeJob.openings ??
    null;

  const status = ensureString(
    activeJob.status
  );

  // =========================================================
  // DATES
  // =========================================================

  const postedDate = ensureString(
    activeJob.posted_date ??
      activeJob.created_at
  );

  const deadline = ensureString(
    activeJob.application_deadline
  );

  // =========================================================
  // EXPERIENCE
  // =========================================================

  let experience = "";

  if (
    activeJob.experience_min !== null &&
    activeJob.experience_min !== undefined &&
    activeJob.experience_max !== null &&
    activeJob.experience_max !== undefined
  ) {
    experience = `${activeJob.experience_min}–${activeJob.experience_max} yrs`;
  } else if (activeJob.experience) {
    experience = ensureString(
      activeJob.experience
    );
  }

  // =========================================================
  // SALARY
  // =========================================================

  const salary = formatSalary(
    activeJob.salary_min,
    activeJob.salary_max,
    activeJob.currency,
    activeJob.salary
  );

  // =========================================================
  // LISTS
  // =========================================================

  const responsibilities =
    normalizeList(
      activeJob.responsibilities ??
        activeJob.job_responsibilities
    );

  const requiredSkills =
    normalizeList(
      activeJob.required_skills ??
        activeJob.skills ??
        activeJob.technical_skills
    );

  const preferredSkills =
    normalizeList(
      activeJob.preferred_skills
    );

  const professionalSkills =
    normalizeList(
      activeJob.professional_skills
    );

  const benefits =
    normalizeList(
      activeJob.benefits ??
        activeJob.perks
    );

  // =========================================================
  // OTHER INFORMATION
  // =========================================================

  const education = ensureString(
    activeJob.education ??
      activeJob.education_qualification
  );

  const additionalInformation =
    ensureString(
      activeJob.additional_information ??
        activeJob.selection_process ??
        activeJob.notes
    );

  // =========================================================
  // APPLY
  // =========================================================

  const handleApply = () => {
    /**
     * This is only UI behavior.
     *
     * Replace this later with your real
     * application API endpoint.
     */
    alert(
      `Application submitted for ${jobTitle}${
        companyName
          ? ` at ${companyName}`
          : ""
      }`
    );
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-50 bg-[#0e1d18]/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden font-sans"
    >
      <motion.div
        initial={{
          y: 30,
          opacity: 0,
          scale: 0.98,
        }}
        animate={{
          y: 0,
          opacity: 1,
          scale: 1,
        }}
        exit={{
          y: 30,
          opacity: 0,
          scale: 0.98,
        }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        className="w-full max-w-4xl h-full sm:h-[92vh] bg-[#f7faf8] text-[#12221d] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-[#dfe7e2]"
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <header className="shrink-0 bg-[#f7faf8]/95 backdrop-blur-md border-b border-[#dfe7e2] px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between z-20">

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-[#dfe7e2] text-xs font-semibold text-[#12221d] hover:bg-[#dff8eb] hover:text-[#19714e] transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">

            {isLoadingDetails && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#19714e]/10 text-[#19714e] text-xs font-semibold">
                <Loader2
                  size={13}
                  className="animate-spin"
                />
                <span>
                  Loading details...
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                onToggleSave(activeJob)
              }
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSaved
                  ? "bg-[#19714e] text-white border-[#19714e]"
                  : "bg-white text-[#52615a] border-[#dfe7e2] hover:text-[#12221d]"
              }`}
            >
              <Bookmark
                size={15}
                className={
                  isSaved
                    ? "fill-white"
                    : ""
                }
              />

              <span>
                {isSaved
                  ? "Saved"
                  : "Save Job"}
              </span>
            </button>

          </div>
        </header>

        {/* =================================================
            BODY
        ================================================== */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6">

          {/* =================================================
              DETAIL ERROR
          ================================================== */}

          {detailError && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">

              <AlertCircle
                size={18}
                className="shrink-0 mt-0.5"
              />

              <div>
                <p className="text-xs font-bold">
                  Could not load complete details
                </p>

                <p className="text-xs mt-1">
                  {detailError}
                </p>

                <p className="text-[11px] mt-2 opacity-80">
                  Showing the information already
                  available from the jobs listing.
                </p>
              </div>

            </div>
          )}

          {/* =================================================
              CARD 1 — JOB HEADER
          ================================================== */}

          <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-8 shadow-xs space-y-5">

            <div className="flex items-start justify-between gap-4 flex-wrap">

              <div className="flex items-start gap-3.5 sm:gap-4">

                {companyLogoUrl &&
                !imgError ? (
                  <img
                    src={companyLogoUrl}
                    alt={
                      companyName ||
                      jobTitle
                    }
                    onError={() =>
                      setImgError(true)
                    }
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-contain bg-[#f7faf8] border border-[#dfe7e2] p-1.5 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] font-bold text-lg flex items-center justify-center shrink-0">
                    {companyName
                      ? companyName
                          .charAt(0)
                          .toUpperCase()
                      : jobTitle
                          .charAt(0)
                          .toUpperCase()}
                  </div>
                )}

                <div>

                  <div className="flex items-center gap-2 flex-wrap mb-1">

                    {department && (
                      <span className="text-[11px] font-bold text-[#19714e] bg-[#dff8eb] px-3 py-0.5 rounded-full">
                        {department}
                      </span>
                    )}

                    {employmentType && (
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                        {employmentType}
                      </span>
                    )}

                    {status && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                        {status}
                      </span>
                    )}

                  </div>

                  <h1 className="text-xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#12221d] tracking-tight leading-tight">
                    {jobTitle}
                  </h1>

                  {(companyName ||
                    location) && (
                    <p className="text-xs sm:text-sm font-semibold text-[#68756f] mt-1 flex items-center gap-2 flex-wrap">

                      {companyName && (
                        <>
                          <Building2
                            size={15}
                            className="text-[#19714e]"
                          />

                          <span className="text-[#12221d] font-bold">
                            {companyName}
                          </span>
                        </>
                      )}

                      {companyIndustry && (
                        <>
                          <span>•</span>
                          <span>
                            {companyIndustry}
                          </span>
                        </>
                      )}

                      {location && (
                        <>
                          <span>•</span>
                          <span>
                            {location}
                          </span>
                        </>
                      )}

                    </p>
                  )}

                </div>
              </div>

              {/* Company links */}

              <div className="flex items-center gap-2">

                {companyWebsite && (
                  <a
                    href={companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#f7faf8] border border-[#dfe7e2] text-[#19714e] hover:bg-[#dff8eb]"
                  >
                    <Globe size={16} />
                  </a>
                )}

                {companyLinkedin && (
                  <a
                    href={companyLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#f7faf8] border border-[#dfe7e2] text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink
                      size={16}
                    />
                  </a>
                )}

              </div>
            </div>

            {/* =================================================
                METRICS
            ================================================== */}

            {(salary ||
              workMode ||
              experience ||
              openings !== null) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#dfe7e2]">

                {salary && (
                  <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">
                    <span className="text-[11px] text-[#68756f] block">
                      Salary
                    </span>

                    <span className="text-xs font-bold text-[#19714e] mt-0.5 block">
                      {salary}
                    </span>
                  </div>
                )}

                {workMode && (
                  <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">
                    <span className="text-[11px] text-[#68756f] block">
                      Work Mode
                    </span>

                    <span className="text-xs font-bold text-[#12221d] mt-0.5 block">
                      {workMode}
                    </span>
                  </div>
                )}

                {experience && (
                  <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">
                    <span className="text-[11px] text-[#68756f] block">
                      Experience
                    </span>

                    <span className="text-xs font-bold text-[#12221d] mt-0.5 block">
                      {experience}
                    </span>
                  </div>
                )}

                {openings !== null && (
                  <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">
                    <span className="text-[11px] text-[#68756f] block">
                      Openings
                    </span>

                    <span className="text-xs font-bold text-[#12221d] mt-0.5 block">
                      {openings}
                    </span>
                  </div>
                )}

              </div>
            )}

            {/* =================================================
                DATES
            ================================================== */}

            {(postedDate ||
              deadline) && (
              <div className="flex items-center gap-4 text-xs text-[#68756f] pt-2 border-t border-[#dfe7e2] flex-wrap">

                {postedDate && (
                  <div className="flex items-center gap-1.5">

                    <Calendar
                      size={14}
                      className="text-[#19714e]"
                    />

                    <span>
                      Posted:{" "}
                      <strong className="text-[#12221d]">
                        {postedDate}
                      </strong>
                    </span>

                  </div>
                )}

                {deadline && (
                  <div className="flex items-center gap-1.5">

                    <Clock
                      size={14}
                      className="text-amber-600"
                    />

                    <span>
                      Deadline:{" "}
                      <strong className="text-[#12221d]">
                        {deadline}
                      </strong>
                    </span>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* =================================================
              SUMMARY
          ================================================== */}

          {(summary ||
            projectRole ||
            projectRoleDescription) && (
            <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-8 shadow-xs space-y-3">

              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Sparkles
                  size={18}
                  className="text-[#19714e]"
                />

                Role Summary & Overview
              </h3>

              {summary && (
                <p className="text-xs sm:text-sm text-[#52615a] leading-relaxed whitespace-pre-line">
                  {summary}
                </p>
              )}

              {projectRoleDescription && (
                <div className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] text-xs text-[#52615a]">

                  {projectRole && (
                    <span className="font-bold text-[#12221d] block mb-1">
                      Project Role:{" "}
                      {projectRole}
                    </span>
                  )}

                  <p className="leading-relaxed">
                    {projectRoleDescription}
                  </p>

                </div>
              )}

            </div>
          )}

          {/* =================================================
              RESPONSIBILITIES
          ================================================== */}

          {responsibilities.length >
            0 && (
            <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-8 shadow-xs space-y-4">

              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">

                <CheckSquare
                  size={18}
                  className="text-[#19714e]"
                />

                Key Responsibilities
              </h3>

              <div className="space-y-2.5">

                {responsibilities.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]"
                    >

                      <CheckCircle2
                        size={16}
                        className="text-[#19714e] shrink-0 mt-0.5"
                      />

                      <span className="text-xs text-[#12221d] leading-relaxed font-medium">
                        {item}
                      </span>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

          {/* =================================================
              SKILLS
          ================================================== */}

          {(requiredSkills.length >
            0 ||
            preferredSkills.length >
              0 ||
            professionalSkills.length >
              0) && (
            <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-8 shadow-xs space-y-5">

              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">

                <Award
                  size={18}
                  className="text-[#19714e]"
                />

                Skills & Requirements
              </h3>

              {requiredSkills.length >
                0 && (
                <div className="space-y-2">

                  <span className="text-[11px] font-bold text-[#68756f] uppercase tracking-wider">
                    Required Skills
                  </span>

                  <div className="flex flex-wrap gap-2">

                    {requiredSkills.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#dff8eb] text-[#19714e] text-xs font-bold border border-[#19714e]/20"
                        >
                          <ShieldCheck
                            size={14}
                          />

                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

              {preferredSkills.length >
                0 && (
                <div className="space-y-2 pt-2 border-t border-[#dfe7e2]">

                  <span className="text-[11px] font-bold text-[#68756f] uppercase tracking-wider">
                    Preferred Skills
                  </span>

                  <div className="flex flex-wrap gap-2">

                    {preferredSkills.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200"
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

              {professionalSkills.length >
                0 && (
                <div className="space-y-2 pt-2 border-t border-[#dfe7e2]">

                  <span className="text-[11px] font-bold text-[#68756f] uppercase tracking-wider">
                    Professional Skills
                  </span>

                  <div className="flex flex-wrap gap-2">

                    {professionalSkills.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200"
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

          {/* =================================================
              COMPANY / EDUCATION / BENEFITS
          ================================================== */}

          {(companyDescription ||
            companySize ||
            education ||
            additionalInformation ||
            benefits.length > 0) && (
            <div className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-8 shadow-xs space-y-5">

              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">

                <Briefcase
                  size={18}
                  className="text-[#19714e]"
                />

                Company & Additional Information
              </h3>

              {companyDescription && (
                <div className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">

                  <span className="font-bold text-[#12221d] block text-xs mb-1">
                    About{" "}
                    {companyName ||
                      "Company"}
                  </span>

                  <p className="text-xs text-[#52615a] leading-relaxed">
                    {companyDescription}
                  </p>

                </div>
              )}

              {companySize && (
                <div className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">

                  <span className="font-bold text-[#12221d] block text-xs mb-1">
                    Company Size
                  </span>

                  <p className="text-xs text-[#52615a]">
                    {companySize}
                  </p>

                </div>
              )}

              {education && (
                <div className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">

                  <span className="font-bold text-[#12221d] block text-xs mb-1">
                    Education Requirements
                  </span>

                  <p className="text-xs text-[#52615a] leading-relaxed">
                    {education}
                  </p>

                </div>
              )}

              {additionalInformation && (
                <div className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">

                  <span className="font-bold text-[#12221d] block text-xs mb-1">
                    Additional Information
                  </span>

                  <p className="text-xs text-[#52615a] leading-relaxed">
                    {additionalInformation}
                  </p>

                </div>
              )}

              {benefits.length >
                0 && (
                <div className="space-y-2 pt-2 border-t border-[#dfe7e2]">

                  <span className="text-[11px] font-bold text-[#68756f] uppercase tracking-wider">
                    Benefits
                  </span>

                  <div className="flex flex-wrap gap-2">

                    {benefits.map(
                      (benefit, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200"
                        >
                          {benefit}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <footer className="shrink-0 bg-white border-t border-[#dfe7e2] p-4 sm:px-8 sm:py-5 flex items-center justify-between gap-4 z-20">

          <div className="min-w-0">

            <span className="text-[11px] font-medium text-[#68756f] block">
              Selected Role
            </span>

            <span className="text-xs sm:text-sm font-bold text-[#12221d] truncate block max-w-xs sm:max-w-sm">
              {jobTitle}
            </span>

          </div>

          <div className="flex items-center gap-2.5">
            <EvaluateFitButton
              job={fetchedJob || job}
              onStartEvaluate={() => {
                setIsEvaluationModalOpen(true);
                setIsEvaluating(true);
                setEvaluationError(null);
                setEvaluationResult(null);
              }}
              onResult={(res) => {
                setEvaluationResult(res);
                setIsEvaluating(false);
              }}
              onError={(err) => {
                setEvaluationError(err?.message || "Evaluation failed.");
                setIsEvaluating(false);
              }}
              className="h-10 sm:h-12 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-[#dff8eb] hover:bg-[#c9f2df] text-[#123c2c] text-xs sm:text-sm font-semibold border border-[#19714e]/20 flex items-center gap-1.5 transition-all cursor-pointer"
            />

            <button
              type="button"
              onClick={handleApply}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#123c2c] hover:bg-[#19714e] text-white font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Apply Now
            </button>
          </div>

        </footer>

      </motion.div>

      {/* EVALUATION MODAL */}
      {isEvaluationModalOpen && (
        <JobEvaluationModal
          isLoading={isEvaluating}
          result={evaluationResult}
          error={evaluationError}
          job={fetchedJob || job}
          onClose={() => {
            setIsEvaluationModalOpen(false);
            setIsEvaluating(false);
            setEvaluationResult(null);
            setEvaluationError(null);
          }}
        />
      )}
    </motion.div>
  );
}