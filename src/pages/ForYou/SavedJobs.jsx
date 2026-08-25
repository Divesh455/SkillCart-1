import { motion } from "framer-motion";

import {
  ArrowLeft,
  Trash2,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  ChevronRight,
  BookmarkCheck,
} from "lucide-react";

import SavedJobSkeleton from "./SavedJobSkeleton";


export default function SavedJobs({
  savedJobs = [],
  isLoading = false,
  error = null,
  onSelectJob,
  onRemoveSaved,
  onBackToSwipe,
}) {

  // ----------------------------------------------------------
  // Get Job ID
  // ----------------------------------------------------------

  const getJobId = (job) => {
    return (
      job?.id ??
      job?._id ??
      job?.job_id
    );
  };


  // ----------------------------------------------------------
  // Get Job Title
  // ----------------------------------------------------------

  const getJobTitle = (job) => {
    return (
      job?.job_title ??
      job?.title ??
      job?.role ??
      ""
    );
  };


  // ----------------------------------------------------------
  // Get Company Name
  // ----------------------------------------------------------

  const getCompanyName = (job) => {
    if (
      job?.company &&
      typeof job.company === "object"
    ) {
      return (
        job.company?.company_name ??
        job.company?.name ??
        ""
      );
    }

    return (
      job?.company ??
      job?.company_name ??
      job?.employer ??
      ""
    );
  };


  // ----------------------------------------------------------
  // Get Location
  // ----------------------------------------------------------

  const getLocation = (job) => {
    return (
      job?.location ??
      job?.city ??
      ""
    );
  };


  // ----------------------------------------------------------
  // Get Work Mode
  // ----------------------------------------------------------

  const getWorkMode = (job) => {
    return (
      job?.work_mode ??
      job?.work_type ??
      ""
    );
  };


  // ----------------------------------------------------------
  // Get Salary
  // ----------------------------------------------------------

  const getSalary = (job) => {

    if (
      job?.salary_min !== undefined &&
      job?.salary_max !== undefined
    ) {
      const min =
        Number(
          job.salary_min
        ).toLocaleString("en-IN");

      const max =
        Number(
          job.salary_max
        ).toLocaleString("en-IN");

      return `${min} - ${max} ${
        job?.currency ?? "INR"
      }`;
    }

    return (
      job?.salary ??
      job?.salary_range ??
      job?.compensation ??
      ""
    );
  };


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 16,
      }}
      className="max-w-4xl mx-auto space-y-6"
    >

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex items-center justify-between flex-wrap gap-4 bg-white/90 backdrop-blur-md border border-[#dfe7e2] rounded-3xl p-6 shadow-sm">

        <div className="flex items-center gap-3">


          <div>

            <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#12221d] flex items-center gap-2">

              <BookmarkCheck
                size={22}
                className="text-[#19714e]"
              />

              <span>
                Saved Opportunities
              </span>

            </h2>

            <p className="text-xs text-[#68756f] mt-0.5">
              Review and manage your saved jobs.
            </p>

          </div>

        </div>


        {/* Saved count */}

        <span className="text-xs font-bold text-[#19714e] bg-[#dff8eb] px-3.5 py-1.5 rounded-full border border-[#19714e]/20">

          {savedJobs.length}{" "}

          {savedJobs.length === 1
            ? "Job Saved"
            : "Jobs Saved"}

        </span>

      </div>


      {/* ======================================================
          LOADING
      ======================================================= */}

      {isLoading && (
        <SavedJobSkeleton count={3} />
      )}


      {/* ======================================================
          EMPTY STATE
      ======================================================= */}

      {!isLoading &&
        savedJobs.length === 0 && (

          <div className="bg-white/90 backdrop-blur-md border border-[#dfe7e2] rounded-3xl p-12 text-center space-y-4 shadow-sm">

            <div className="w-16 h-16 rounded-full bg-[#f7faf8] border border-[#dfe7e2] text-[#68756f] flex items-center justify-center mx-auto">

              <BookmarkCheck
                size={32}
              />

            </div>


            <div>

              <h3 className="text-lg font-bold font-['Space_Grotesk'] text-[#12221d]">
                No Saved Jobs Yet
              </h3>

              <p className="text-xs text-[#68756f] mt-1 max-w-sm mx-auto">
                Save jobs from the For You section and they will appear here.
              </p>

            </div>


            <button
              type="button"
              onClick={onBackToSwipe}
              className="px-6 py-3 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-xs"
            >

              <span>
                Find Jobs
              </span>

              <ChevronRight size={16} />

            </button>

          </div>
        )}


      {/* ======================================================
          SAVED JOBS
      ======================================================= */}

      {!isLoading &&
        savedJobs.length > 0 && (

          <div className="space-y-4">

            {savedJobs.map(
              (job, index) => {

                const jobId =
                  getJobId(job);

                const jobTitle =
                  getJobTitle(job);

                const companyName =
                  getCompanyName(job);

                const location =
                  getLocation(job);

                const workMode =
                  getWorkMode(job);

                const salary =
                  getSalary(job);

                const department =
                  job?.department ??
                  "";


                return (
                  <motion.div
                    key={
                      jobId ??
                      `saved-job-${index}`
                    }
                    layout
                    initial={{
                      opacity: 0,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                    }}
                    className="bg-white border border-[#dfe7e2] hover:border-[#19714e] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group cursor-pointer"
                    onClick={() => {
                      onSelectJob?.(job);
                    }}
                  >

                    {/* =================================================
                        JOB INFORMATION
                    ================================================== */}

                    <div className="space-y-2 flex-1 min-w-0">

                      {/* Tags */}

                      <div className="flex items-center gap-2 flex-wrap">

                        {workMode && (
                          <span className="text-[11px] font-bold text-[#19714e] bg-[#dff8eb] px-2.5 py-0.5 rounded-md border border-[#19714e]/20">
                            {workMode}
                          </span>
                        )}


                        {department && (
                          <span className="text-xs font-semibold text-[#68756f] flex items-center gap-1">

                            <Briefcase
                              size={13}
                              className="text-[#19714e]"
                            />

                            {department}

                          </span>
                        )}


                        {companyName && (
                          <span className="text-xs font-semibold text-[#68756f] flex items-center gap-1">

                            <Building2
                              size={13}
                              className="text-[#19714e]"
                            />

                            {companyName}

                          </span>
                        )}

                      </div>


                      {/* Job title */}

                      <h3 className="text-lg font-bold font-['Space_Grotesk'] text-[#12221d] group-hover:text-[#19714e] transition-colors truncate">
                        {jobTitle}
                      </h3>


                      {/* Location + Salary */}

                      <div className="flex items-center gap-4 text-xs text-[#52615a] flex-wrap">

                        {location && (
                          <span className="flex items-center gap-1">

                            <MapPin
                              size={13}
                              className="text-[#19714e]"
                            />

                            {location}

                          </span>
                        )}


                        {salary && (
                          <span className="flex items-center gap-1 font-semibold text-[#19714e]">

                            <DollarSign
                              size={13}
                            />

                            {salary}

                          </span>
                        )}

                      </div>

                    </div>


                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">

                      {/* Remove */}

                      <button
                        type="button"
                        onClick={(event) => {

                          event.stopPropagation();

                          onRemoveSaved?.(
                            jobId
                          );

                        }}
                        title="Remove from saved jobs"
                        className="p-2.5 rounded-xl border border-[#dfe7e2] text-rose-500 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                      >

                        <Trash2
                          size={16}
                        />

                      </button>


                      {/* View Details */}

                      <button
                        type="button"
                        onClick={(event) => {

                          event.stopPropagation();

                          onSelectJob?.(
                            job
                          );

                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#123c2c] group-hover:bg-[#19714e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >

                        <span>
                          View Details
                        </span>

                        <ChevronRight
                          size={15}
                        />

                      </button>

                    </div>

                  </motion.div>
                );
              }
            )}

          </div>
        )}

    </motion.div>
  );
}