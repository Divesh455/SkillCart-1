import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Sparkles,
  FileText,
  Check,
  Plus,
  Image as ImageIcon,
  Zap,
  Target,
  ShieldCheck,
  ChevronRight,
  Download,
} from "lucide-react";

import AppHeader from "../../components/common/AppHeader";
import Feed from "../../components/common/Feed";
import JobDetailModal from "../ForYou/JobDetailModal";
import CreatePostModal from "../../components/common/CreatePostModal";

import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";

import resumeService from "../../services/resumeService";
import jobService from "../../services/jobService";


export default function HomePage() {

  // ============================================================
  // AUTHENTICATED USER
  // ============================================================

  const { user } = useAuth();

  const {
    targetJobTitle,
    extractedSkills,
    downloadUrl,
  } = useApp();


  // ============================================================
  // CREATE POST MODAL
  // ============================================================

  const [isCreatePostOpen, setIsCreatePostOpen] =
    useState(false);


  // ============================================================
  // FEED REFRESH
  //
  // Whenever this value changes, Feed gets remounted.
  // This allows the newly created post to appear immediately.
  // ============================================================

  const [feedRefreshKey, setFeedRefreshKey] =
    useState(0);


  // ============================================================
  // JOB SIDEBAR
  // ============================================================

  const [featuredJobs, setFeaturedJobs] =
    useState([]);

  const [loadingJobs, setLoadingJobs] =
    useState(true);

  const [selectedJob, setSelectedJob] =
    useState(null);

  const [savedJobs, setSavedJobs] =
    useState([]);


  // ============================================================
  // DAILY GOALS
  //
  // Keeping this local for now because there is currently
  // no Daily Goals API in the Social backend.
  // ============================================================

  const [goals, setGoals] = useState([
    {
      id: 1,
      text: "Tailor resume for target roles",
      done: true,
    },
    {
      id: 2,
      text: "Review 3 AI Job Matches",
      done: true,
    },
    {
      id: 3,
      text: "Apply to 1 referral opportunity",
      done: false,
    },
  ]);


  // ============================================================
  // TOGGLE DAILY GOAL
  // ============================================================

  const toggleGoal = (id) => {

    setGoals((previousGoals) =>
      previousGoals.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              done: !goal.done,
            }
          : goal
      )
    );

  };


  // ============================================================
  // USER SKILLS
  //
  // Use extracted skills when available.
  // The fallback is only UI fallback until profile/skills API
  // is connected.
  // ============================================================

  const userSkills =
    extractedSkills?.length > 0
      ? extractedSkills.slice(0, 5)
      : [
          "React",
          "TypeScript",
          "Node.js",
          "System Design",
          "GraphQL",
        ];


  // ============================================================
  // FETCH FEATURED JOBS
  // ============================================================

  useEffect(() => {

    let isMounted = true;

    const fetchTopJobs = async () => {

      try {

        setLoadingJobs(true);

        const response =
          await jobService.getJobs({
            limit: 3,
            offset: 0,
          });

        if (
          isMounted &&
          response?.items
        ) {

          setFeaturedJobs(
            response.items.slice(0, 3)
          );

        }

      } catch (error) {

        console.warn(
          "Could not fetch top jobs for sidebar:",
          error
        );

      } finally {

        if (isMounted) {
          setLoadingJobs(false);
        }

      }

    };


    fetchTopJobs();


    return () => {
      isMounted = false;
    };

  }, []);


  // ============================================================
  // POST CREATED
  //
  // CreatePostModal calls this after the backend successfully
  // creates the post.
  //
  // Incrementing feedRefreshKey forces Feed to mount again,
  // causing it to fetch the latest posts.
  // ============================================================

  const handlePostCreated = () => {

    setIsCreatePostOpen(false);

    setFeedRefreshKey(
      (previousKey) => previousKey + 1
    );

  };


  // ============================================================
  // CLOSE CREATE POST MODAL
  // ============================================================

  const handleCloseCreatePost = () => {

    setIsCreatePostOpen(false);

  };


  // ============================================================
  // COMPLETED GOALS
  // ============================================================

  const completedGoalsCount =
    goals.filter(
      (goal) => goal.done
    ).length;


  // ============================================================
  // USER AVATAR
  // ============================================================

  const username =
    user?.username ||
    "Career Seeker";

  const avatarText =
    username
      .substring(0, 2)
      .toUpperCase();


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#f7faf8]
        text-[#12221d]
        font-sans
        flex
        flex-col
        selection:bg-[#dff8eb]
        selection:text-[#19714e]
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppHeader />


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className="
          flex-1
          max-w-7xl
          w-full
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-6
          space-y-6
        "
      >

        {/* ====================================================
            THREE COLUMN LAYOUT
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-12
            gap-6
            items-start
          "
        >


          {/* ==================================================
              LEFT SIDEBAR
          ================================================== */}

          <motion.aside
            initial={{
              opacity: 0,
              x: -16,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.35,
              delay: 0.1,
            }}
            className="
              hidden
              lg:block
              lg:col-span-3
              space-y-5
              lg:sticky
              lg:top-20
              lg:max-h-[calc(100vh-6rem)]
              lg:overflow-y-auto
              scrollbar-none
            "
          >

            {/* ================================================
                PROFILE CARD
            ================================================= */}

            <div
              className="
                bg-white
                border
                border-[#dfe7e2]
                rounded-3xl
                overflow-hidden
                shadow-xs
                hover:shadow-xl
                hover:border-[#19714e]/40
                transition-all
              "
            >

              {/* Banner */}

              <div
                className="
                  h-20
                  bg-gradient-to-r
                  from-[#123c2c]
                  via-[#19714e]
                  to-teal-600
                  relative
                  overflow-hidden
                "
              >

                <div
                  className="
                    absolute
                    right-2
                    top-2
                    text-[#b9ef84]/40
                    text-xs
                    font-mono
                    font-bold
                  "
                >
                  PRO
                </div>

              </div>


              <div
                className="
                  px-5
                  pb-5
                  pt-0
                  relative
                "
              >

                {/* Avatar */}

                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-gradient-to-br
                    from-[#123c2c]
                    to-[#19714e]
                    text-[#b9ef84]
                    border-4
                    border-white
                    font-bold
                    text-xl
                    flex
                    items-center
                    justify-center
                    -mt-8
                    shadow-md
                    font-['Space_Grotesk']
                  "
                >
                  {avatarText}
                </div>


                {/* Username */}

                <h3
                  className="
                    font-bold
                    text-base
                    text-[#12221d]
                    font-['Space_Grotesk']
                    mt-2.5
                    flex
                    items-center
                    gap-1.5
                  "
                >

                  <span>
                    {username}
                  </span>

                  <ShieldCheck
                    size={16}
                    className="text-[#19714e]"
                  />

                </h3>


                {/* Target Job */}

                <p
                  className="
                    text-xs
                    text-[#19714e]
                    font-bold
                    mt-0.5
                    flex
                    items-center
                    gap-1
                  "
                >

                  <Sparkles size={12} />

                  <span>
                    {targetJobTitle ||
                      "Software Engineer"}
                  </span>

                </p>


                {/* ATS SCORE */}

                <div
                  className="
                    mt-4
                    p-3
                    rounded-2xl
                    bg-[#f7faf8]
                    border
                    border-[#dfe7e2]
                    space-y-2
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      text-xs
                      font-bold
                    "
                  >

                    <span className="text-[#68756f]">
                      ATS Match Score
                    </span>

                    <span className="text-[#19714e]">
                      88%
                    </span>

                  </div>


                  <div
                    className="
                      w-full
                      h-2
                      bg-[#dfe7e2]
                      rounded-full
                      overflow-hidden
                    "
                  >

                    <div
                      className="
                        h-full
                        bg-gradient-to-r
                        from-[#123c2c]
                        to-[#19714e]
                        rounded-full
                        w-[88%]
                      "
                    />

                  </div>

                </div>


                {/* SKILLS */}

                <div
                  className="
                    mt-3.5
                    pt-3.5
                    border-t
                    border-[#dfe7e2]/70
                  "
                >

                  <span
                    className="
                      text-[11px]
                      font-bold
                      text-[#68756f]
                      uppercase
                      tracking-wider
                      block
                      mb-2
                    "
                  >
                    Top Verified Skills
                  </span>


                  <div
                    className="
                      flex
                      flex-wrap
                      gap-1.5
                    "
                  >

                    {userSkills.map(
                      (skill, index) => (

                        <span
                          key={`${skill}-${index}`}
                          className="
                            text-[10px]
                            font-semibold
                            bg-[#dff8eb]
                            text-[#19714e]
                            border
                            border-[#19714e]/20
                            px-2.5
                            py-1
                            rounded-xl
                          "
                        >
                          {skill}
                        </span>

                      )
                    )}

                  </div>

                </div>


                {/* PROFILE ACTIONS */}

                <div
                  className="
                    mt-4
                    flex
                    flex-col
                    gap-2
                  "
                >

                  {downloadUrl && (

                    <motion.button
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.96,
                      }}
                      type="button"
                      onClick={() =>
                        resumeService.downloadResume(
                          downloadUrl
                        )
                      }
                      className="
                        w-full
                        py-2.5
                        px-3
                        rounded-2xl
                        bg-[#19714e]
                        hover:bg-[#123c2c]
                        text-white
                        text-xs
                        font-bold
                        flex
                        items-center
                        justify-center
                        gap-1.5
                        transition-all
                        shadow-md
                      "
                    >

                      <Download size={14} />

                      <span>
                        Download Resume
                      </span>

                    </motion.button>

                  )}


                  <Link
                    to="/resume"
                    className="
                      w-full
                      py-2.5
                      px-3
                      rounded-2xl
                      bg-[#f7faf8]
                      hover:bg-[#dff8eb]
                      text-[#19714e]
                      text-xs
                      font-bold
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      transition-all
                      border
                      border-[#dfe7e2]
                    "
                  >

                    <FileText size={14} />

                    <span>
                      Update Resume
                    </span>

                  </Link>

                </div>

              </div>

            </div>


            {/* ================================================
                DAILY GOALS
            ================================================= */}

            <div
              className="
                bg-white
                border
                border-[#dfe7e2]
                rounded-3xl
                p-5
                shadow-xs
                space-y-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-[#dfe7e2]/70
                  pb-2.5
                "
              >

                <h4
                  className="
                    font-bold
                    text-xs
                    uppercase
                    tracking-wider
                    text-[#12221d]
                    flex
                    items-center
                    gap-1.5
                    font-['Space_Grotesk']
                  "
                >

                  <Target
                    size={15}
                    className="text-[#19714e]"
                  />

                  <span>
                    Daily Goals
                  </span>

                </h4>


                <span
                  className="
                    text-[11px]
                    font-bold
                    text-[#19714e]
                    bg-[#dff8eb]
                    px-2
                    py-0.5
                    rounded-full
                  "
                >
                  {completedGoalsCount}/
                  {goals.length} Done
                </span>

              </div>


              <div className="space-y-2">

                {goals.map((goal) => (

                  <div
                    key={goal.id}
                    onClick={() =>
                      toggleGoal(goal.id)
                    }
                    className={`
                      flex
                      items-center
                      gap-2.5
                      p-2.5
                      rounded-2xl
                      border
                      transition-all
                      cursor-pointer
                      text-xs

                      ${
                        goal.done
                          ? "bg-[#dff8eb]/50 border-[#19714e]/30 text-[#123c2c] font-semibold"
                          : "bg-[#f7faf8] border-[#dfe7e2] text-[#68756f] hover:bg-white"
                      }
                    `}
                  >

                    <div
                      className={`
                        w-4
                        h-4
                        rounded-md
                        flex
                        items-center
                        justify-center
                        shrink-0
                        border

                        ${
                          goal.done
                            ? "bg-[#19714e] border-[#19714e] text-white"
                            : "border-[#68756f]/50"
                        }
                      `}
                    >

                      {goal.done && (
                        <Check
                          size={12}
                          strokeWidth={3}
                        />
                      )}

                    </div>


                    <span
                      className={
                        goal.done
                          ? "line-through text-[#68756f]"
                          : "font-medium"
                      }
                    >
                      {goal.text}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </motion.aside>


          {/* ==================================================
              CENTER COLUMN
          ================================================== */}

          <section
            className="
              col-span-12
              lg:col-span-6
              space-y-5
              pb-16
              sm:pb-0
            "
          >

            {/* ================================================
                CREATE POST TRIGGER
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              onClick={() =>
                setIsCreatePostOpen(true)
              }
              className="
                bg-white
                border
                border-[#dfe7e2]
                rounded-3xl
                p-3.5
                sm:p-4
                shadow-2xs
                hover:shadow-md
                hover:border-[#19714e]/50
                cursor-pointer
                transition-all
                flex
                items-center
                justify-between
                gap-3
                group
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                  flex-1
                  min-w-0
                "
              >

                {/* Avatar */}

                <div
                  className="
                    w-9
                    h-9
                    sm:w-10
                    sm:h-10
                    rounded-2xl
                    bg-gradient-to-br
                    from-[#123c2c]
                    to-[#19714e]
                    text-[#b9ef84]
                    font-bold
                    text-xs
                    flex
                    items-center
                    justify-center
                    shrink-0
                    shadow-xs
                    font-['Space_Grotesk']
                  "
                >
                  {user?.username
                    ? user.username
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </div>


                {/* Input trigger */}

                <div
                  className="
                    flex-1
                    min-w-0
                    py-2
                    px-4
                    bg-[#f7faf8]
                    group-hover:bg-[#dff8eb]/40
                    border
                    border-[#dfe7e2]
                    rounded-2xl
                    text-xs
                    sm:text-sm
                    text-[#68756f]
                    transition-colors
                    truncate
                  "
                >
                  Start a post, share photos or job referrals...
                </div>

              </div>


              {/* Actions */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  shrink-0
                "
              >

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsCreatePostOpen(true);
                  }}
                  className="
                    p-2.5
                    rounded-2xl
                    bg-[#f7faf8]
                    group-hover:bg-[#dff8eb]
                    text-[#19714e]
                    border
                    border-[#dfe7e2]
                    transition-colors
                  "
                  title="Add Photos"
                >
                  <ImageIcon size={16} />
                </button>


                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsCreatePostOpen(true);
                  }}
                  className="
                    px-4
                    py-2
                    rounded-2xl
                    bg-[#123c2c]
                    text-white
                    text-xs
                    font-bold
                    shadow-sm
                    group-hover:bg-[#19714e]
                    transition-colors
                    hidden
                    xs:inline-flex
                    items-center
                    gap-1.5
                  "
                >

                  <Plus
                    size={15}
                    className="text-[#b9ef84]"
                  />

                  <span>
                    Create Post
                  </span>

                </button>

              </div>

            </motion.div>


            {/* ================================================
                DYNAMIC SOCIAL FEED
            ================================================= */}

            <Feed
              key={feedRefreshKey}
            />

          </section>


          {/* ==================================================
              RIGHT SIDEBAR
          ================================================== */}

          <aside
            className="
              hidden
              lg:block
              lg:col-span-3
              space-y-5
              lg:sticky
              lg:top-20
              lg:max-h-[calc(100vh-6rem)]
              lg:overflow-y-auto
              scrollbar-none
            "
          >

            {/* ================================================
                LIVE JOB REFERRALS
            ================================================= */}

            <div
              className="
                bg-white
                border
                border-[#dfe7e2]
                rounded-3xl
                p-5
                shadow-xs
                space-y-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  pb-2
                  border-b
                  border-[#dfe7e2]/70
                "
              >

                <h4
                  className="
                    font-bold
                    text-xs
                    uppercase
                    tracking-wider
                    text-[#12221d]
                    flex
                    items-center
                    gap-1.5
                    font-['Space_Grotesk']
                  "
                >

                  <Zap
                    size={16}
                    className="
                      text-[#19714e]
                      animate-pulse
                    "
                  />

                  <span>
                    Live Job Referrals
                  </span>

                </h4>


                <Link
                  to="/jobs"
                  className="
                    text-[11px]
                    font-bold
                    text-[#19714e]
                    hover:underline
                    flex
                    items-center
                    gap-0.5
                  "
                >

                  View All

                  <ChevronRight size={12} />

                </Link>

              </div>


              {/* Loading */}

              {loadingJobs && (

                <div
                  className="
                    py-6
                    text-center
                    text-xs
                    text-[#68756f]
                    animate-pulse
                  "
                >
                  Syncing live opportunities...
                </div>

              )}


              {/* Jobs */}

              {!loadingJobs &&
                featuredJobs.length > 0 && (

                  <div className="space-y-2.5">

                    {featuredJobs.map((job) => (

                      <motion.div
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                        }}
                        key={
                          job.id ||
                          job._id
                        }
                        onClick={() =>
                          setSelectedJob(job)
                        }
                        className="
                          p-3
                          rounded-2xl
                          bg-[#f7faf8]
                          border
                          border-[#dfe7e2]/80
                          hover:bg-white
                          hover:border-[#19714e]/50
                          transition-all
                          cursor-pointer
                          shadow-2xs
                          space-y-2
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-2
                          "
                        >

                          <div>

                            <h5
                              className="
                                font-bold
                                text-xs
                                text-[#12221d]
                                hover:text-[#19714e]
                                line-clamp-1
                              "
                            >
                              {job.job_title}
                            </h5>

                            <p
                              className="
                                text-[11px]
                                text-[#68756f]
                                font-semibold
                                truncate
                              "
                            >
                              {job.company_name}
                            </p>

                          </div>


                          <span
                            className="
                              text-[10px]
                              font-bold
                              text-teal-700
                              bg-teal-50
                              border
                              border-teal-200
                              px-2
                              py-0.5
                              rounded-md
                              shrink-0
                            "
                          >
                            {job.work_mode ||
                              "Remote"}
                          </span>

                        </div>


                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            text-[11px]
                            font-bold
                            text-[#19714e]
                            pt-1
                            border-t
                            border-[#dfe7e2]/50
                          "
                        >

                          <span>
                            ₹
                            {job.salary_min
                              ? (
                                  job.salary_min /
                                  100000
                                ).toFixed(1)
                              : "0"}
                            L - ₹
                            {job.salary_max
                              ? (
                                  job.salary_max /
                                  100000
                                ).toFixed(1)
                              : "0"}
                            L / yr
                          </span>


                          <span
                            className="
                              text-[10px]
                              font-semibold
                              text-[#12221d]
                              hover:underline
                            "
                          >
                            Apply →
                          </span>

                        </div>

                      </motion.div>

                    ))}

                  </div>

                )}


              {/* No jobs */}

              {!loadingJobs &&
                featuredJobs.length === 0 && (

                  <div
                    className="
                      py-6
                      text-center
                      text-xs
                      text-[#68756f]
                    "
                  >
                    No live opportunities found.
                  </div>

                )}

            </div>

          </aside>

        </div>

      </main>


      {/* ======================================================
          MOBILE CREATE POST BUTTON
      ====================================================== */}

      <motion.button
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.92,
        }}
        onClick={() =>
          setIsCreatePostOpen(true)
        }
        className="
          lg:hidden
          fixed
          bottom-18
          right-4
          z-40
          bg-gradient-to-r
          from-[#123c2c]
          to-[#19714e]
          text-white
          px-4
          py-3
          rounded-full
          shadow-2xl
          flex
          items-center
          gap-2
          border
          border-[#b9ef84]/40
          backdrop-blur-md
        "
        title="Create Post"
      >

        <Plus
          size={18}
          className="text-[#b9ef84]"
        />

        <span
          className="
            text-xs
            font-bold
            font-['Space_Grotesk']
            tracking-wide
          "
        >
          Create Post
        </span>

      </motion.button>


      {/* ======================================================
          CREATE POST MODAL
      ====================================================== */}

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={handleCloseCreatePost}
        onPostCreated={handlePostCreated}
      />


      {/* ======================================================
          JOB DETAIL MODAL
      ====================================================== */}

      {selectedJob && (

        <JobDetailModal
          job={selectedJob}
          onClose={() =>
            setSelectedJob(null)
          }
          isSaved={savedJobs.some(
            (savedJob) =>
              (savedJob.id ||
                savedJob._id) ===
              (
                selectedJob.id ||
                selectedJob._id
              )
          )}
          onToggleSave={(jobToSave) => {

            const jobId =
              jobToSave.id ||
              jobToSave._id;

            setSavedJobs((previousJobs) => {

              const alreadySaved =
                previousJobs.some(
                  (savedJob) =>
                    (
                      savedJob.id ||
                      savedJob._id
                    ) === jobId
                );

              if (alreadySaved) {

                return previousJobs.filter(
                  (savedJob) =>
                    (
                      savedJob.id ||
                      savedJob._id
                    ) !== jobId
                );

              }

              return [
                ...previousJobs,
                jobToSave,
              ];

            });

          }}
        />

      )}

    </div>
  );
}