import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Plus,
  Image as ImageIcon,
  Zap,
  ChevronRight,
  X,
  Globe,
  Code2,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react";

import AppHeader from "../../components/common/AppHeader";
import Feed from "../../components/common/Feed";
import JobDetailModal from "../ForYou/JobDetailModal";
import CreatePostModal from "../../components/common/CreatePostModal";
import Copilot from "../../components/common/Copilot";
import ResumeAnalysisSection from "../../components/common/ResumeAnalysisSection";
import PostCard from "../../components/common/PostCard";
import UserProfileModal from "../../components/common/UserProfileModal";
import UserRowSkeleton from "../../components/common/UserRowSkeleton";
import Skeleton from "../../components/ui/Skeleton";

import socialService from "../../services/socialService";
import jobService from "../../services/jobService";
import saveJobService from "../../services/savejobs";

import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";

export default function HomePage() {

  // ============================================================
  // USERS
  // ============================================================

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] =
    useState(true);
  const [currentIndex, setCurrentIndex] =
    useState(0);
  const USERS_PER_PAGE = 5;

  // ============================================================
  // FOLLOW STATE
  // ============================================================

  const [followingUsers, setFollowingUsers] =
    useState({});

  const [followLoading, setFollowLoading] =
    useState({});

  // ============================================================
  // AUTH
  // ============================================================

  const { user } = useAuth();

  // ============================================================
  // GET CURRENT USER ID FROM JWT
  // ============================================================

  const getCurrentUserId = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          const id = userObj?.id || userObj?.userId;
          if (id) return id;
        } catch (e) {}
      }

      const token = localStorage.getItem("token");
      if (!token || typeof token !== "string" || !token.includes(".") || token === "null" || token === "undefined") {
        return null;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.userId || payload?.id || (payload?.sub && !isNaN(payload?.sub) ? payload?.sub : null) || null;
    } catch (error) {
      console.error("Could not get current user ID:", error);
      return null;
    }
  };

  const currentUserId =
    getCurrentUserId();

  // ============================================================
  // FETCH ALL USERS
  // ============================================================

  useEffect(() => {

    const loadUsers = async () => {

      try {

        setLoadingUsers(true);

        const data =
          await socialService.getAllUsers();

        console.log(
          "ALL USERS:",
          data
        );

        setUsers(
          Array.isArray(data)
            ? data
            : data?.content || []
        );

      } catch (error) {

        console.error(
          "GET ALL USERS ERROR:",
          error
        );

      } finally {

        setLoadingUsers(false);

      }
    };

    loadUsers();

  }, []);

  // ============================================================
  // CHECK FOLLOWING STATUS
  // ============================================================

  useEffect(() => {

    if (
      !users.length ||
      !currentUserId
    ) {
      return;
    }

    const checkFollowingStatus =
      async () => {

        try {

          const statusEntries =
            await Promise.all(

              users

                .filter(
                  (person) =>
                    person.id !==
                    currentUserId
                )

                .map(
                  async (person) => {

                    try {

                      const response =
                        await socialService.getFollowingStatus(
                          person.id
                        );

                      const following =
                        typeof response ===
                        "boolean"
                          ? response
                          : response?.following ??
                            response?.isFollowing ??
                            false;

                      return [
                        person.id,
                        following,
                      ];

                    } catch (error) {

                      console.error(
                        `Following status failed for ${person.id}:`,
                        error
                      );

                      return [
                        person.id,
                        false,
                      ];
                    }
                  }
                )
            );

          setFollowingUsers(
            Object.fromEntries(
              statusEntries
            )
          );

        } catch (error) {

          console.error(
            "CHECK FOLLOWING STATUS ERROR:",
            error
          );

        }
      };

    checkFollowingStatus();

  }, [users, currentUserId]);

  // ============================================================
  // FOLLOW / UNFOLLOW
  // ============================================================

  const handleFollowToggle =
    async (userId) => {

      if (!userId) {
        return;
      }

      if (
        userId === currentUserId
      ) {
        return;
      }

      const currentlyFollowing =
        followingUsers[userId] === true;

      try {

        setFollowLoading(
          (previous) => ({
            ...previous,
            [userId]: true,
          })
        );

        if (currentlyFollowing) {

          // ----------------------------------------------------
          // UNFOLLOW
          // ----------------------------------------------------

          await socialService.unfollowUser(
            userId
          );

          setFollowingUsers(
            (previous) => ({
              ...previous,
              [userId]: false,
            })
          );

        } else {

          // ----------------------------------------------------
          // FOLLOW
          // ----------------------------------------------------

          await socialService.followUser(
            userId
          );

          setFollowingUsers(
            (previous) => ({
              ...previous,
              [userId]: true,
            })
          );
        }

      } catch (error) {

        console.error(
          "FOLLOW TOGGLE ERROR:",
          error
        );

      } finally {

        setFollowLoading(
          (previous) => ({
            ...previous,
            [userId]: false,
          })
        );
      }
    };

  // ============================================================
  // APP / RESUME DATA
  // ============================================================

  const {
    resumeId,
    resumeData,
    fetchResumeData,
  } = useApp();

  // ============================================================
  // FETCH PARSED RESUME
  // ============================================================

  useEffect(() => {

    if (resumeId) {

      fetchResumeData();

    } else {

      const storedResumeId =
        localStorage.getItem(
          "resume_id"
        );

      if (storedResumeId) {
        fetchResumeData();
      }
    }

  }, [resumeId]);

  // ============================================================
  // PROFILE POPUP
  // ============================================================

  const [showProfile, setShowProfile] =
    useState(false);

  const [profileInitialTab, setProfileInitialTab] = useState("posts");
  const [selectedOtherUserId, setSelectedOtherUserId] = useState(null);
  const [selectedOtherUserInitial, setSelectedOtherUserInitial] = useState(null);
  const [isOtherProfileOpen, setIsOtherProfileOpen] = useState(false);

  // ============================================================
  // USER STATS & MY POSTS
  // ============================================================

  const [userStats, setUserStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
  });

  const [myPostsList, setMyPostsList] = useState([]);
  const [loadingUserStats, setLoadingUserStats] = useState(false);

  const loadUserStatsAndPosts = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoadingUserStats(true);
      const [followersRes, followingRes, userPostsRes] = await Promise.allSettled([
        socialService.getFollowersCount(currentUserId),
        socialService.getFollowingCount(currentUserId),
        socialService.getUserPosts(currentUserId, 0, 50),
      ]);

      const followers =
        followersRes.status === "fulfilled"
          ? Number(
              followersRes.value?.count ??
                followersRes.value?.followersCount ??
                followersRes.value ??
                0
            )
          : 0;

      const following =
        followingRes.status === "fulfilled"
          ? Number(
              followingRes.value?.count ??
                followingRes.value?.followingCount ??
                followingRes.value ??
                0
            )
          : 0;

      const postsData =
        userPostsRes.status === "fulfilled"
          ? userPostsRes.value?.content || userPostsRes.value || []
          : [];

      const postsArray = Array.isArray(postsData) ? postsData : [];

      setMyPostsList(postsArray);
      setUserStats({
        followersCount: followers,
        followingCount: following,
        postsCount: postsArray.length,
      });
    } catch (err) {
      console.warn("Could not load user profile stats:", err);
    } finally {
      setLoadingUserStats(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      loadUserStatsAndPosts();
    }
  }, [currentUserId, loadUserStatsAndPosts]);

  const handleMyPostDeleted = (deletedPostId) => {
    setMyPostsList((prev) =>
      prev.filter((p) => String(p.id || p._id) !== String(deletedPostId))
    );
    setUserStats((prev) => ({
      ...prev,
      postsCount: Math.max(0, prev.postsCount - 1),
    }));
  };

  // ============================================================
  // CREATE POST
  // ============================================================

  const [
    isCreatePostOpen,
    setIsCreatePostOpen,
  ] = useState(false);

  const [newPost, setNewPost] =
    useState(null);

  // ============================================================
  // SKILLCART COPILOT
  // ============================================================

  const [
    isCopilotOpen,
    setIsCopilotOpen,
  ] = useState(false);

  // ============================================================
  // JOB SIDEBAR
  // ============================================================

  const [
    featuredJobs,
    setFeaturedJobs,
  ] = useState([]);

  const [
    loadingJobs,
    setLoadingJobs,
  ] = useState(true);

  const [selectedJob, setSelectedJob] =
    useState(null);

  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      const saved = localStorage.getItem("skillcart_saved_jobs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const jobs = await saveJobService.getSavedJobs();
        if (Array.isArray(jobs)) {
          setSavedJobs(jobs);
        }
      } catch (err) {
        console.warn("HomePage failed to fetch saved jobs:", err);
      }
    };
    fetchSaved();
  }, []);

  // ============================================================
  // FETCH JOBS
  // ============================================================

  useEffect(() => {

    let isMounted = true;

    const fetchTopJobs =
      async () => {

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
            "Could not fetch top jobs:",
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
  // ============================================================

  const handlePostCreated =
    (createdPost) => {

      console.log(
        "HOME PAGE - CREATED POST:",
        createdPost
      );

      setIsCreatePostOpen(false);

      if (createdPost) {
        setNewPost(createdPost);
      }
    };

  // ============================================================
  // CLOSE CREATE POST
  // ============================================================

  const handleCloseCreatePost =
    () => {

      setIsCreatePostOpen(false);

    };

  // ============================================================
  // USERNAME
  // ============================================================

  const getUsernameFromToken = () => {

    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          const name = userObj?.username || userObj?.name;
          if (name) return name;
        } catch (e) {}
      }

      const token = localStorage.getItem("token");
      if (!token || typeof token !== "string" || !token.includes(".") || token === "null" || token === "undefined") {
        return "User";
      }

      const payload = JSON.parse(atob(token.split(".")[1]));

      return (
        payload?.username ||
        payload?.name ||
        payload?.sub ||
        "User"
      );
    } catch (error) {
      console.error("Could not read username from token:", error);
      return "User";
    }
  };

  const username =
    user?.username ||
    getUsernameFromToken();

  const avatarText =
    username
      .charAt(0)
      .toUpperCase();

  // ============================================================
  // PARSED RESUME DATA
  // ============================================================

  const parsedName =
    resumeData?.name ||
    username;

  const contact =
    resumeData?.contact || {};

  const linkedin =
    contact?.linkedin || "";

  const portfolio =
    contact?.portfolio || "";

  // ============================================================
  // MAKE URL COMPLETE
  // ============================================================

  const makeFullUrl = (url) => {

    if (!url) {
      return "";
    }

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    return `https://${url}`;
  };

  const linkedinUrl =
    makeFullUrl(linkedin);

  const portfolioUrl =
    makeFullUrl(portfolio);

  // ============================================================
  // EXTRACT ALL SKILLS
  // ============================================================

  const parsedSkills =
    Array.isArray(
      resumeData?.skills
    )
      ? resumeData.skills.flatMap(
          (category) =>
            Array.isArray(
              category?.skills
            )
              ? category.skills
              : []
        )
      : [];

  // ============================================================
  // OTHER USERS / PEOPLE TO FOLLOW
  // ============================================================

  const usersToFollow =
    users.filter(
      (person) =>
        person.id !==
        currentUserId
    );
  const otherUsers = usersToFollow;

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
          MAIN
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
            THREE COLUMN
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

            {/* ==================================================
                PROFILE CARD
            ================================================== */}

            <div
              className="
                bg-white
                border
                border-[#dfe7e2]
                rounded-3xl
                overflow-hidden
                shadow-xs
              "
            >

              {/* COVER */}

              <div
                className="
                  h-20
                  bg-gradient-to-r
                  from-[#123c2c]
                  via-[#19714e]
                  to-teal-600
                  relative
                "
              />

              {/* PROFILE */}

              <div
                className="
                  px-5
                  pb-5
                  relative
                "
              >

                {/* AVATAR */}

                <button
                  type="button"
                  onClick={() =>
                    setShowProfile(
                      (previous) =>
                        !previous
                    )
                  }
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
                    cursor-pointer
                    hover:scale-105
                    transition-transform
                  "
                  title="View profile"
                >
                  {avatarText}
                </button>


                {/* USERNAME */}

                <button
                  type="button"
                  onClick={() =>
                    setShowProfile(
                      (previous) =>
                        !previous
                    )
                  }
                  className="
                    mt-2.5
                    text-left
                    flex
                    items-center
                    justify-between
                    w-full
                    group
                    cursor-pointer
                  "
                >

                  <span
                    className="
                      font-bold
                      text-base
                      text-[#12221d]
                      font-['Space_Grotesk']
                      group-hover:text-[#19714e]
                      transition-colors
                    "
                  >
                    {username}
                  </span>

                  <span
                    className="
                      text-[10px]
                      text-[#19714e]
                      font-semibold
                      bg-[#dff8eb]
                      px-2
                      py-0.5
                      rounded-full
                    "
                  >
                    View profile
                  </span>

                </button>

                {/* QUICK STATS ROW */}
                <div className="mt-3.5 grid grid-cols-3 gap-2 text-center p-2 bg-[#f7faf8] rounded-2xl border border-[#dfe7e2]">
                  <div
                    className="cursor-pointer hover:bg-white p-1 rounded-xl transition-colors"
                    onClick={() => {
                      setProfileInitialTab("posts");
                      setShowProfile(true);
                    }}
                  >
                    {loadingUserStats && userStats.postsCount === 0 ? (
                      <Skeleton variant="text" className="h-4 w-6 mx-auto mb-1" />
                    ) : (
                      <p className="text-xs font-extrabold text-[#123c2c]">{userStats.postsCount}</p>
                    )}
                    <p className="text-[9px] font-semibold text-[#68756f] uppercase">Posts</p>
                  </div>
                  <div
                    className="cursor-pointer hover:bg-white p-1 rounded-xl transition-colors"
                    onClick={() => {
                      setProfileInitialTab("followers");
                      setShowProfile(true);
                    }}
                  >
                    {loadingUserStats && userStats.followersCount === 0 ? (
                      <Skeleton variant="text" className="h-4 w-6 mx-auto mb-1" />
                    ) : (
                      <p className="text-xs font-extrabold text-[#123c2c]">{userStats.followersCount}</p>
                    )}
                    <p className="text-[9px] font-semibold text-[#68756f] uppercase">Followers</p>
                  </div>
                  <div
                    className="cursor-pointer hover:bg-white p-1 rounded-xl transition-colors"
                    onClick={() => {
                      setProfileInitialTab("following");
                      setShowProfile(true);
                    }}
                  >
                    {loadingUserStats && userStats.followingCount === 0 ? (
                      <Skeleton variant="text" className="h-4 w-6 mx-auto mb-1" />
                    ) : (
                      <p className="text-xs font-extrabold text-[#123c2c]">{userStats.followingCount}</p>
                    )}
                    <p className="text-[9px] font-semibold text-[#68756f] uppercase">Following</p>
                  </div>
                </div>


                {/* PROFILE DETAILS */}

                {showProfile && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    className="
                      mt-4
                      pt-4
                      border-t
                      border-[#dfe7e2]
                    "
                  >

                    {/* CLOSE */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        mb-4
                      "
                    >

                      <h3
                        className="
                          font-bold
                          text-sm
                        "
                      >
                        Profile
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          setShowProfile(
                            false
                          )
                        }
                        className="
                          p-1.5
                          rounded-lg
                          hover:bg-[#f7faf8]
                          text-[#68756f]
                        "
                      >
                        <X size={15} />
                      </button>

                    </div>


                    {/* NAME */}

                    <div className="mb-4">

                      <p
                        className="
                          text-[10px]
                          uppercase
                          tracking-wider
                          font-bold
                          text-[#68756f]
                          mb-1
                        "
                      >
                        Name
                      </p>

                      <p
                        className="
                          text-sm
                          font-bold
                          text-[#12221d]
                        "
                      >
                        {parsedName}
                      </p>

                    </div>


                    {/* LINKEDIN */}

                    {linkedinUrl && (

                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          flex
                          items-center
                          gap-2
                          p-2.5
                          rounded-xl
                          bg-[#f7faf8]
                          border
                          border-[#dfe7e2]
                          hover:bg-[#dff8eb]
                          hover:border-[#19714e]/30
                          transition-all
                          mb-2
                        "
                      >

                        <ExternalLink
                          size={16}
                          className="text-[#19714e]"
                        />

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >

                          <p
                            className="
                              text-[10px]
                              font-bold
                              text-[#68756f]
                            "
                          >
                            LinkedIn
                          </p>

                          <p
                            className="
                              text-xs
                              font-semibold
                              text-[#19714e]
                              truncate
                            "
                          >
                            {linkedin}
                          </p>

                        </div>

                      </a>

                    )}


                    {/* PORTFOLIO */}

                    {portfolioUrl && (

                      <a
                        href={portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          flex
                          items-center
                          gap-2
                          p-2.5
                          rounded-xl
                          bg-[#f7faf8]
                          border
                          border-[#dfe7e2]
                          hover:bg-[#dff8eb]
                          hover:border-[#19714e]/30
                          transition-all
                          mb-4
                        "
                      >

                        <Globe
                          size={16}
                          className="text-[#19714e]"
                        />

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >

                          <p
                            className="
                              text-[10px]
                              font-bold
                              text-[#68756f]
                            "
                          >
                            Portfolio
                          </p>

                          <p
                            className="
                              text-xs
                              font-semibold
                              text-[#19714e]
                              truncate
                            "
                          >
                            {portfolio}
                          </p>

                        </div>

                      </a>

                    )}


                    {/* SKILLS */}

                    {parsedSkills.length >
                      0 && (

                      <div>

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            mb-2
                          "
                        >

                          <Code2
                            size={14}
                            className="text-[#19714e]"
                          />

                          <span
                            className="
                              text-[10px]
                              uppercase
                              tracking-wider
                              font-bold
                              text-[#68756f]
                            "
                          >
                            Skills
                          </span>

                        </div>


                        <div
                          className="
                            flex
                            flex-wrap
                            gap-1.5
                          "
                        >

                          {parsedSkills.map(
                            (
                              skill,
                              index
                            ) => (

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

                    )}


                    {/* NO RESUME DATA */}

                    {!resumeData && (

                      <p
                        className="
                          text-xs
                          text-[#68756f]
                          py-2
                        "
                      >
                        Resume information
                        is not available
                        yet.
                      </p>

                    )}

                  </motion.div>

                )}

              </div>

            </div>


            {/* ==================================================
                SKILLCART COPILOT
            ================================================== */}

            <motion.div
              whileHover={{
                y: -2,
              }}
              className="
                bg-white
                border
                border-[#dfe7e2]
                rounded-3xl
                p-5
                shadow-xs
                overflow-hidden
                relative
              "
            >

              {/* DECORATIVE GLOW */}

              <div
                className="
                  absolute
                  -right-10
                  -top-10
                  w-28
                  h-28
                  rounded-full
                  bg-[#dff8eb]
                  blur-2xl
                  opacity-70
                "
              />


              {/* HEADER */}

              <div
                className="
                  relative
                  flex
                  items-start
                  gap-3
                "
              >

                {/* ICON */}

                <div
                  className="
                    w-11
                    h-11
                    rounded-2xl
                    bg-gradient-to-br
                    from-[#123c2c]
                    to-[#19714e]
                    text-[#b9ef84]
                    flex
                    items-center
                    justify-center
                    shrink-0
                    shadow-sm
                  "
                >

                  <Sparkles
                    size={20}
                  />

                </div>


                {/* TEXT */}

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.16em]
                      font-bold
                      text-[#19714e]
                    "
                  >
                    AI Career Assistant
                  </p>

                  <h4
                    className="
                      text-base
                      font-bold
                      text-[#10231b]
                      mt-0.5
                    "
                  >
                    SkillCart Copilot
                  </h4>

                  <p
                    className="
                      text-xs
                      leading-5
                      text-[#68756f]
                      mt-1
                    "
                  >
                    Get personalized help
                    with your resume,
                    skills and career.
                  </p>

                </div>

              </div>


              {/* OPEN COPILOT */}

              <button
                type="button"
                onClick={() =>
                  setIsCopilotOpen(true)
                }
                className="
                  relative
                  w-full
                  mt-4
                  py-3
                  px-4
                  rounded-2xl
                  bg-[#123c2c]
                  hover:bg-[#19714e]
                  text-white
                  text-xs
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  shadow-sm
                  hover:shadow-md
                "
              >

                <Sparkles
                  size={15}
                  className="text-[#b9ef84]"
                />

                Open Copilot

                <ChevronRight
                  size={15}
                />

              </button>

            </motion.div>

            {/* ==================================================
                RESUME ANALYSIS SECTION
            ================================================== */}
            <ResumeAnalysisSection />

          </aside>


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

            {/* ==================================================
                CREATE POST
            ================================================== */}

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
                setIsCreatePostOpen(
                  true
                )
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

                {/* AVATAR */}

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
                  "
                >
                  {username
                    .charAt(0)
                    .toUpperCase()}
                </div>


                {/* INPUT LOOK */}

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
                  Start a post, share photos
                  or job referrals...
                </div>

              </div>


              {/* ACTIONS */}

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

                    setIsCreatePostOpen(
                      true
                    );

                  }}
                  className="
                    p-2.5
                    rounded-2xl
                    bg-[#f7faf8]
                    group-hover:bg-[#dff8eb]
                    text-[#19714e]
                    border
                    border-[#dfe7e2]
                  "
                >
                  <ImageIcon
                    size={16}
                  />
                </button>


                <button
                  type="button"
                  onClick={(event) => {

                    event.stopPropagation();

                    setIsCreatePostOpen(
                      true
                    );

                  }}
                  className="
                    px-4
                    py-2
                    rounded-2xl
                    bg-[#123c2c]
                    text-white
                    text-xs
                    font-bold
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

                  Create Post

                </button>

              </div>

            </motion.div>


            {/* ==================================================
                COMMUNITY FEED
            ================================================== */}

            <Feed
              newPost={newPost}
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

            {/* ==================================================
                PEOPLE TO FOLLOW
            ================================================== */}

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
                  pb-2.5
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
                  "
                >
                  People to Follow
                </h4>

              </div>


              {/* LOADING */}
              {loadingUsers && (
                <div className="py-2">
                  <UserRowSkeleton count={4} compact={true} />
                </div>
              )}


              {/* NO USERS */}

              {!loadingUsers &&
                usersToFollow.length ===
                  0 && (

                  <div
                    className="
                      py-5
                      text-center
                      text-xs
                      text-[#68756f]
                    "
                  >
                    No other users found.
                  </div>

                )}


              {/* USERS */}

              {!loadingUsers &&
                usersToFollow
                  .slice(
                    currentIndex,
                    currentIndex + USERS_PER_PAGE
                  )
                  .map((person) => {

                    const personName =
                      person.username ||
                      "User";

                    const isFollowing =
                      followingUsers[
                        person.id
                      ] === true;

                    const isLoading =
                      followLoading[
                        person.id
                      ] === true;

                    return (

                      <div
                        key={person.id}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          p-2.5
                          rounded-2xl
                          bg-[#f7faf8]
                          border
                          border-[#dfe7e2]
                        "
                      >

                        {/* USER */}

                        <div
                          onClick={() => {
                            setSelectedOtherUserId(person.id);
                            setSelectedOtherUserInitial(person);
                            setIsOtherProfileOpen(true);
                          }}
                          title={`View ${personName}'s profile`}
                          className="
                            flex
                            items-center
                            gap-2.5
                            min-w-0
                            cursor-pointer
                            group
                          "
                        >

                          <div
                            className="
                              w-9
                              h-9
                              rounded-xl
                              bg-gradient-to-br
                              from-[#123c2c]
                              to-[#19714e]
                              text-[#b9ef84]
                              flex
                              items-center
                              justify-center
                              font-bold
                              text-xs
                              shrink-0
                              group-hover:scale-105
                              transition-transform
                              select-none
                            "
                          >
                            {personName
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>


                          <div
                            className="
                              min-w-0
                            "
                          >

                            <p
                              className="
                                text-xs
                                font-bold
                                text-[#12221d]
                                truncate
                                group-hover:text-[#19714e]
                                transition-colors
                              "
                            >
                              {
                                personName
                              }
                            </p>

                            <p
                              className="
                                text-[10px]
                                text-[#68756f]
                                truncate
                              "
                            >
                              {
                                person.email
                              }
                            </p>

                          </div>

                        </div>


                        {/* FOLLOW BUTTON */}

                        <button
                          type="button"
                          disabled={
                            isLoading
                          }
                          onClick={() =>
                            handleFollowToggle(
                              person.id
                            )
                          }
                          className={`
                            shrink-0
                            px-3
                            py-1.5
                            rounded-xl
                            text-[10px]
                            font-bold
                            transition-all
                            disabled:opacity-50
                            disabled:cursor-not-allowed

                            ${
                              isFollowing
                                ? "bg-[#dff8eb] text-[#19714e] border border-[#19714e]/30 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                : "bg-[#123c2c] text-white hover:bg-[#19714e]"
                            }
                          `}
                        >

                          {isLoading
                            ? "..."
                            : isFollowing
                            ? "Following"
                            : "Follow"}

                        </button>

                      </div>

                    );
                  })}


              {/* NEXT BUTTON */}

              {!loadingUsers &&
                usersToFollow.length >
                  0 && (

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        currentIndex +
                          USERS_PER_PAGE <
                        usersToFollow.length
                      ) {
                        setCurrentIndex(
                          currentIndex +
                            USERS_PER_PAGE
                        );
                      } else {
                        setCurrentIndex(0);
                      }
                    }}
                    className="
                      w-full
                      py-2
                      px-3
                      rounded-xl
                      text-xs
                      font-bold
                      text-[#19714e]
                      bg-[#dff8eb]/60
                      hover:bg-[#dff8eb]
                      border
                      border-[#19714e]/20
                      transition-all
                      text-center
                    "
                  >
                    Next
                  </button>

                )}

            </div>


            {/* ==================================================
                LIVE JOB REFERRALS
            ================================================== */}

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
                  "
                >

                  <Zap
                    size={16}
                    className="
                      text-[#19714e]
                      animate-pulse
                    "
                  />

                  Live Job Referrals

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

                  <ChevronRight
                    size={12}
                  />

                </Link>

              </div>


              {/* LOADING JOBS */}

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


              {/* JOBS */}

              {!loadingJobs &&
                featuredJobs.length >
                  0 && (

                  <div
                    className="
                      space-y-2.5
                    "
                  >

                    {featuredJobs.map(
                      (job) => (

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
                            setSelectedJob(
                              job
                            )
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
                                  line-clamp-1
                                "
                              >
                                {
                                  job.job_title
                                }
                              </h5>

                              <p
                                className="
                                  text-[11px]
                                  text-[#68756f]
                                  font-semibold
                                  truncate
                                "
                              >
                                {
                                  job.company_name
                                }
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
                              {
                                job.work_mode ||
                                "Remote"
                              }
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
                                  ).toFixed(
                                    1
                                  )
                                : "0"}

                              L - ₹

                              {job.salary_max
                                ? (
                                    job.salary_max /
                                    100000
                                  ).toFixed(
                                    1
                                  )
                                : "0"}

                              L / yr

                            </span>


                            <span
                              className="
                                text-[10px]
                                font-semibold
                                text-[#12221d]
                              "
                            >
                              Apply →
                            </span>

                          </div>

                        </motion.div>

                      )
                    )}

                  </div>

                )}


              {/* NO JOBS */}

              {!loadingJobs &&
                featuredJobs.length ===
                  0 && (

                  <div
                    className="
                      py-6
                      text-center
                      text-xs
                      text-[#68756f]
                    "
                  >
                    No live opportunities
                    found.
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
        "
      >

        <Plus
          size={18}
          className="text-[#b9ef84]"
        />

        <span
          className="
            text-xs
            font-bold
          "
        >
          Create Post
        </span>

      </motion.button>

      {/* ======================================================
          CREATE POST MODAL
      ====================================================== */}

      {isCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() =>
            setIsCreatePostOpen(false)
          }
          onPostCreated={(post) => {
            setNewPost(post);
            if (post) {
              setMyPostsList((prev) => [post, ...prev]);
              setUserStats((prev) => ({
                ...prev,
                postsCount: prev.postsCount + 1,
              }));
            }
          }}
        />
      )}

      {/* ======================================================
          CURRENT USER FULL PROFILE MODAL (WITH POSTS & FOLLOWERS)
      ====================================================== */}
      {showProfile && currentUserId && (
        <UserProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          userId={currentUserId}
          initialUser={{ username, name: parsedName }}
          initialTab={profileInitialTab}
        />
      )}


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
              String(savedJob.id ?? savedJob._id ?? savedJob.job_id) ===
              String(selectedJob.id ?? selectedJob._id ?? selectedJob.job_id)
          )}

          onToggleSave={
            async (jobToSave) => {
              if (!jobToSave) return;
              const jobId =
                jobToSave.id ??
                jobToSave._id ??
                jobToSave.job_id;

              if (jobId === undefined || jobId === null || jobId === "") return;

              const isAlreadySaved = savedJobs.some(
                (savedJob) =>
                  String(savedJob.id ?? savedJob._id ?? savedJob.job_id) === String(jobId)
              );

              try {
                if (isAlreadySaved) {
                  setSavedJobs((previousJobs) => {
                    const updated = previousJobs.filter(
                      (savedJob) =>
                        String(savedJob.id ?? savedJob._id ?? savedJob.job_id) !== String(jobId)
                    );
                    try {
                      localStorage.setItem("skillcart_saved_jobs", JSON.stringify(updated));
                    } catch (e) {}
                    return updated;
                  });
                  saveJobService.unsaveJob(jobId).catch((err) => console.warn("HomePage unsaveJob:", err));
                } else {
                  setSavedJobs((previousJobs) => {
                    const updated = [...previousJobs, jobToSave];
                    try {
                      localStorage.setItem("skillcart_saved_jobs", JSON.stringify(updated));
                    } catch (e) {}
                    return updated;
                  });
                  saveJobService.saveJob(jobId, jobToSave).catch((err) => console.warn("HomePage saveJob:", err));
                }
              } catch (err) {
                console.error("Failed to toggle save on HomePage:", err);
              }
            }
          }
        />

      )}


      {/* ======================================================
          SKILLCART COPILOT
      ====================================================== */}

      <Copilot
        isOpen={
          isCopilotOpen
        }
        onClose={() =>
          setIsCopilotOpen(false)
        }
      />

      {/* ======================================================
          OTHER USER PROFILE MODAL
      ====================================================== */}
      {isOtherProfileOpen && selectedOtherUserId && (
        <UserProfileModal
          isOpen={isOtherProfileOpen}
          onClose={() => {
            setIsOtherProfileOpen(false);
            setSelectedOtherUserId(null);
            setSelectedOtherUserInitial(null);
          }}
          userId={selectedOtherUserId}
          initialUser={selectedOtherUserInitial}
          onFollowToggle={(userId, newFollowingState) => {
            setFollowingUsers((prev) => ({
              ...prev,
              [userId]: newFollowingState,
            }));
          }}
        />
      )}

    </div>
  );
}