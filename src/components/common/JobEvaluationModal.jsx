import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function JobEvaluationModal({
  result,
  onClose,
}) {
  if (!result) {
    return null;
  }

  const data =
    result?.data ?? result;

  const score =
    data?.overall_score ??
    data?.match_score ??
    data?.score;

  const summary =
    data?.summary ??
    data?.overall_summary ??
    data?.recommendation ??
    "";

  const matchedSkills =
    data?.matched_skills ??
    data?.matching_skills ??
    [];

  const missingSkills =
    data?.missing_skills ??
    data?.skills_to_improve ??
    [];

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/60
        backdrop-blur-sm
        p-4
      "
      onClick={onClose}
    >

      <div
        className="
          w-full
          max-w-2xl
          max-h-[90vh]
          overflow-y-auto
          bg-white
          rounded-3xl
          shadow-2xl
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="
          flex
          items-center
          justify-between
          p-6
          border-b
          border-[#dfe7e2]
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-11
              h-11
              rounded-xl
              bg-[#dff8eb]
              text-[#19714e]
              flex
              items-center
              justify-center
            ">
              <Sparkles size={21} />
            </div>

            <div>
              <h2 className="
                text-lg
                font-bold
                text-[#12221d]
              ">
                Resume–Job Fit Analysis
              </h2>

              <p className="
                text-xs
                text-[#68756f]
              ">
                AI-powered compatibility analysis
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              p-2
              rounded-xl
              hover:bg-[#f7faf8]
            "
          >
            <X size={19} />
          </button>

        </div>


        {/* CONTENT */}

        <div className="p-6">

          {/* SCORE */}

          {score !== undefined &&
            score !== null && (

            <div className="
              flex
              items-center
              gap-5
              mb-7
            ">

              <div className="
                w-24
                h-24
                rounded-full
                bg-[#dff8eb]
                border-8
                border-[#19714e]/20
                flex
                items-center
                justify-center
              ">

                <span className="
                  text-2xl
                  font-bold
                  text-[#123c2c]
                ">
                  {Math.round(
                    Number(score)
                  )}
                </span>

              </div>

              <div>

                <h3 className="
                  text-lg
                  font-bold
                  text-[#12221d]
                ">
                  Job Fit Score
                </h3>

                <p className="
                  text-xs
                  text-[#68756f]
                  mt-1
                ">
                  Resume compatibility with this job.
                </p>

              </div>

            </div>
          )}


          {/* SUMMARY */}

          {summary && (
            <div className="mb-7">

              <h3 className="
                text-sm
                font-bold
                text-[#12221d]
                mb-2
              ">
                Summary
              </h3>

              <p className="
                text-sm
                text-[#52615a]
                leading-6
              ">
                {summary}
              </p>

            </div>
          )}


          {/* MATCHED SKILLS */}

          {Array.isArray(
            matchedSkills
          ) &&
            matchedSkills.length > 0 && (

            <div className="mb-7">

              <h3 className="
                text-sm
                font-bold
                text-[#12221d]
                mb-3
                flex
                items-center
                gap-2
              ">

                <CheckCircle2
                  size={16}
                  className="text-[#19714e]"
                />

                Matching Skills

              </h3>

              <div className="
                flex
                flex-wrap
                gap-2
              ">

                {matchedSkills.map(
                  (skill, index) => (

                  <span
                    key={index}
                    className="
                      px-3
                      py-1.5
                      rounded-lg
                      bg-[#dff8eb]
                      text-[#19714e]
                      text-xs
                      font-semibold
                    "
                  >
                    {typeof skill ===
                    "string"
                      ? skill
                      : skill?.name ??
                        skill?.skill ??
                        ""}
                  </span>

                ))}

              </div>

            </div>
          )}


          {/* MISSING SKILLS */}

          {Array.isArray(
            missingSkills
          ) &&
            missingSkills.length > 0 && (

            <div>

              <h3 className="
                text-sm
                font-bold
                text-[#12221d]
                mb-3
                flex
                items-center
                gap-2
              ">

                <AlertCircle
                  size={16}
                  className="text-amber-500"
                />

                Skills to Improve

              </h3>

              <div className="
                flex
                flex-wrap
                gap-2
              ">

                {missingSkills.map(
                  (skill, index) => (

                  <span
                    key={index}
                    className="
                      px-3
                      py-1.5
                      rounded-lg
                      bg-amber-50
                      text-amber-700
                      text-xs
                      font-semibold
                      border
                      border-amber-200
                    "
                  >
                    {typeof skill ===
                    "string"
                      ? skill
                      : skill?.name ??
                        skill?.skill ??
                        ""}
                  </span>

                ))}

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}