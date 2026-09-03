import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import {
  X,
  User,
  Users,
  FileText,
  UserCheck,
  UserPlus,
  Loader2,
  AlertCircle,
  Search,
  ArrowLeft,
  UserMinus,
  Globe,
  Code2,
  ExternalLink,
} from "lucide-react";
import socialService from "../../services/socialService";
import resumeService from "../../services/resumeService";
import PostCard from "./PostCard";
import Skeleton from "../ui/Skeleton";
import PostCardSkeleton from "./PostCardSkeleton";
import UserRowSkeleton from "./UserRowSkeleton";

// ============================================================
// HELPER: GET CURRENT USER ID
// ============================================================

function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    let payload = null;
    if (token && typeof token === "string" && token.includes(".")) {
      try {
        payload = JSON.parse(atob(token.split(".")[1]));
      } catch (e) {}
    }

    let savedUser = null;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        savedUser = JSON.parse(userStr);
      } catch (e) {}
    }

    return (
      payload?.userId ||
      payload?.id ||
      savedUser?.id ||
      savedUser?.userId ||
      (payload?.sub && !isNaN(payload?.sub) ? payload?.sub : null)
    );
  } catch {
    return null;
  }
}

export default function UserProfileModal({
  isOpen,
  onClose,
  userId: initialUserId,
  initialUser = null,
  initialTab = "posts",
  onFollowToggle = null,
}) {
  const currentUserId = getCurrentUserId();

  // Support navigating to another user's profile within the modal
  const [activeUserId, setActiveUserId] = useState(initialUserId);
  const [userHistory, setUserHistory] = useState([]);

  useEffect(() => {
    setActiveUserId(initialUserId);
    setUserHistory([]);
  }, [initialUserId]);

  const isMyProfile = Boolean(
    currentUserId && activeUserId && String(currentUserId) === String(activeUserId)
  );

  const [activeTab, setActiveTab] = useState(initialTab || "posts");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // FOLLOWERS LIST STATE
  // ============================================================
  const [followers, setFollowers] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState(null);
  const [followerFilter, setFollowerFilter] = useState("");

  // ============================================================
  // FOLLOWING LIST STATE
  // ============================================================
  const [following, setFollowing] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingError, setFollowingError] = useState(null);
  const [followingFilter, setFollowingFilter] = useState("");

  const [followingStates, setFollowingStates] = useState({});
  const [subFollowLoading, setSubFollowLoading] = useState({});

  // ============================================================
  // CURRENT USER RESUME DATA (from /api/v1/resume/{res_id})
  // ============================================================
  const [resumeData, setResumeData] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  // ============================================================
  // LOAD CURRENT USER RESUME VIA https://skillcart-ai.onrender.com/api/v1/resume/{res_id}
  // ============================================================

  const loadCurrentResume = useCallback(async () => {
    if (!isMyProfile) {
      setResumeData(null);
      return;
    }

    const resId =
      localStorage.getItem("res_id") ||
      localStorage.getItem("resume_id") ||
      null;

    if (!resId) return;

    try {
      setResumeLoading(true);
      const response = await resumeService.getParsedResume(resId);
      console.log("RESUME API DATA FOR CURRENT USER:", response);
      const parsed = response?.data || response;
      setResumeData(parsed);
    } catch (err) {
      console.warn("Failed to fetch current user resume data:", err);
    } finally {
      setResumeLoading(false);
    }
  }, [isMyProfile]);

  // ============================================================
  // LOAD USER PROFILE VIA /api/social/profiles/{userId}
  // ============================================================

  const loadUserProfile = useCallback(async () => {
    if (!activeUserId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await socialService.getProfile(activeUserId);
      console.log("USER PROFILE API RESPONSE:", data);

      if (data) {
        setProfile({
          userId: data.userId || activeUserId,
          username: data.username || initialUser?.username || "SkillCart User",
          postsCount: Number(data.postsCount ?? 0),
          followersCount: Number(data.followersCount ?? 0),
          followingCount: Number(data.followingCount ?? 0),
          followingByMe: Boolean(data.followingByMe),
          email: data.email || initialUser?.email || null,
        });
      } else {
        throw new Error("Empty profile data received");
      }
    } catch (err) {
      console.warn("Failed to fetch user profile via profile endpoint:", err);
      setProfile((prev) => prev || {
        userId: activeUserId,
        username: initialUser?.username || initialUser?.name || "SkillCart User",
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        followingByMe: false,
        email: initialUser?.email || null,
      });
      setError("Could not load full profile information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeUserId, initialUser]);

  // ============================================================
  // LOAD USER POSTS (page=0, size=10)
  // ============================================================

  const loadUserPosts = useCallback(async () => {
    if (!activeUserId) return;

    try {
      setPostsLoading(true);
      setPage(0);
      const res = await socialService.getUserPosts(activeUserId, 0, 10);
      const postsData = Array.isArray(res)
        ? res
        : res?.content || res?.posts || [];
      setPosts(postsData);
      setHasMore(postsData.length >= 10);
    } catch (err) {
      console.warn("Failed to load user posts:", err);
      setPosts([]);
      setHasMore(false);
    } finally {
      setPostsLoading(false);
    }
  }, [activeUserId]);

  // ============================================================
  // LOAD FOLLOWERS LIST VIA /api/social/users/{userId}/followers
  // ============================================================

  const loadFollowers = useCallback(async () => {
    if (!activeUserId) return;

    try {
      setFollowersLoading(true);
      setFollowersError(null);
      const res = await socialService.getFollowers(activeUserId);
      console.log("FOLLOWERS LIST API RESPONSE:", res);

      const list = Array.isArray(res)
        ? res
        : res?.content || res?.users || res?.followers || res?.items || [];

      setFollowers(list);

      const initialMap = {};
      list.forEach((item) => {
        const id = item.id || item.userId;
        if (id) {
          initialMap[id] = Boolean(item.followingByMe || item.isFollowing);
        }
      });
      setFollowingStates((prev) => ({ ...prev, ...initialMap }));
    } catch (err) {
      console.warn("Failed to load followers:", err);
      setFollowersError("Could not load followers list. Please try again.");
      setFollowers([]);
    } finally {
      setFollowersLoading(false);
    }
  }, [activeUserId]);

  // ============================================================
  // LOAD FOLLOWING LIST VIA /api/social/users/{userId}/following
  // ============================================================

  const loadFollowing = useCallback(async () => {
    if (!activeUserId) return;

    try {
      setFollowingLoading(true);
      setFollowingError(null);
      const res = await socialService.getFollowing(activeUserId);
      console.log("FOLLOWING LIST API RESPONSE:", res);

      const list = Array.isArray(res)
        ? res
        : res?.content || res?.users || res?.following || res?.items || [];

      setFollowing(list);

      // If we are viewing the current user's following list, all these people are followed by me
      const initialMap = {};
      list.forEach((item) => {
        const id = item.id || item.userId;
        if (id) {
          initialMap[id] = isMyProfile ? true : Boolean(item.followingByMe || (item.isFollowing ?? true));
        }
      });
      setFollowingStates((prev) => ({ ...prev, ...initialMap }));
    } catch (err) {
      console.warn("Failed to load following list:", err);
      setFollowingError("Could not load following list. Please try again.");
      setFollowing([]);
    } finally {
      setFollowingLoading(false);
    }
  }, [activeUserId, isMyProfile]);

  // ============================================================
  // LOAD MORE USER POSTS
  // ============================================================

  const handleLoadMorePosts = async () => {
    if (!activeUserId || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await socialService.getUserPosts(activeUserId, nextPage, 10);
      const newPostsData = Array.isArray(res)
        ? res
        : res?.content || res?.posts || [];

      if (newPostsData.length > 0) {
        setPosts((prev) => [...prev, ...newPostsData]);
        setPage(nextPage);
        setHasMore(newPostsData.length >= 10);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn("Failed to load more posts:", err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Trigger loading whenever modal opens or activeUserId changes
  useEffect(() => {
    if (isOpen && activeUserId) {
      loadUserProfile();
      loadUserPosts();
      loadFollowers();
      loadFollowing();
      if (isMyProfile) {
        loadCurrentResume();
      } else {
        setResumeData(null);
      }
    } else {
      setProfile(null);
      setPosts([]);
      setFollowers([]);
      setFollowing([]);
      setResumeData(null);
      setPage(0);
      setHasMore(false);
      setError(null);
      setFollowersError(null);
      setFollowingError(null);
    }
  }, [isOpen, activeUserId, isMyProfile, loadUserProfile, loadUserPosts, loadFollowers, loadFollowing, loadCurrentResume]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ============================================================
  // ESCAPE KEY HANDLER
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ============================================================
  // HANDLE MAIN USER FOLLOW / UNFOLLOW
  // ============================================================

  const handleFollowToggle = async () => {
    if (!activeUserId || isMyProfile || followLoading) return;

    const isCurrentlyFollowing = profile?.followingByMe;
    const nextFollowingState = !isCurrentlyFollowing;

    try {
      setFollowLoading(true);

      setProfile((prev) => ({
        ...prev,
        followingByMe: nextFollowingState,
        followersCount: Math.max(
          0,
          (prev?.followersCount ?? 0) + (nextFollowingState ? 1 : -1)
        ),
      }));

      if (isCurrentlyFollowing) {
        await socialService.unfollowUser(activeUserId);
      } else {
        await socialService.followUser(activeUserId);
      }

      if (typeof onFollowToggle === "function") {
        onFollowToggle(activeUserId, nextFollowingState);
      }
    } catch (err) {
      console.error("Failed to toggle follow status:", err);
      setProfile((prev) => ({
        ...prev,
        followingByMe: isCurrentlyFollowing,
        followersCount: Math.max(
          0,
          (prev?.followersCount ?? 0) + (isCurrentlyFollowing ? 0 : -1)
        ),
      }));
    } finally {
      setFollowLoading(false);
    }
  };

  // ============================================================
  // HANDLE INDIVIDUAL ROW FOLLOW / UNFOLLOW
  // ============================================================

  const handleRowFollowToggle = async (targetId) => {
    if (!targetId || String(targetId) === String(currentUserId)) return;

    const currentlyFollowing = followingStates[targetId] === true;
    const nextState = !currentlyFollowing;

    try {
      setSubFollowLoading((prev) => ({ ...prev, [targetId]: true }));
      setFollowingStates((prev) => ({ ...prev, [targetId]: nextState }));

      // If we are on our own profile's "following" tab, update our following count
      if (isMyProfile && activeTab === "following") {
        setProfile((prev) => ({
          ...prev,
          followingCount: Math.max(
            0,
            (prev?.followingCount ?? 0) + (nextState ? 1 : -1)
          ),
        }));
      }

      if (currentlyFollowing) {
        await socialService.unfollowUser(targetId);
      } else {
        await socialService.followUser(targetId);
      }

      if (typeof onFollowToggle === "function") {
        onFollowToggle(targetId, nextState);
      }
    } catch (err) {
      console.error("Row follow toggle error:", err);
      setFollowingStates((prev) => ({ ...prev, [targetId]: currentlyFollowing }));
    } finally {
      setSubFollowLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) =>
      prev.filter((p) => String(p.id || p._id) !== String(deletedPostId))
    );
    setProfile((prev) => ({
      ...prev,
      postsCount: Math.max(0, (prev?.postsCount ?? 1) - 1),
    }));
  };

  const handleNavigateToUser = (targetUser) => {
    const targetId = targetUser?.id || targetUser?.userId || targetUser?._id;
    if (!targetId || String(targetId) === String(activeUserId)) return;

    setUserHistory((prev) => [...prev, activeUserId]);
    setActiveUserId(String(targetId));
    setActiveTab("posts");
  };

  const handleGoBackUser = () => {
    if (userHistory.length === 0) return;
    const previousId = userHistory[userHistory.length - 1];
    setUserHistory((prev) => prev.slice(0, -1));
    setActiveUserId(previousId);
    setActiveTab("posts");
  };

  if (!isOpen) return null;

  const displayUsername =
    profile?.username || initialUser?.username || initialUser?.name || "SkillCart User";
  const avatarLetter = displayUsername.charAt(0).toUpperCase();

  const makeFullUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const contact = resumeData?.contact || {};
  const linkedin = contact?.linkedin || resumeData?.linkedin || "";
  const github = contact?.github || resumeData?.github || "";
  const portfolio =
    contact?.portfolio ||
    contact?.website ||
    resumeData?.portfolio ||
    resumeData?.website ||
    "";

  const linkedinUrl = makeFullUrl(linkedin);
  const githubUrl = makeFullUrl(github);
  const portfolioUrl = makeFullUrl(portfolio);

  let parsedSkills = [];
  if (Array.isArray(resumeData?.skills)) {
    parsedSkills = resumeData.skills.flatMap((item) => {
      if (typeof item === "string") return [item];
      if (item && Array.isArray(item.skills)) return item.skills;
      if (item && typeof item === "object") {
        return Object.values(item).filter((v) => typeof v === "string");
      }
      return [];
    });
  }

  const filteredFollowers = followers.filter((f) => {
    if (!followerFilter.trim()) return true;
    const query = followerFilter.toLowerCase();
    const name = (f.username || f.name || f.authorName || f.fullName || "").toLowerCase();
    const email = (f.email || "").toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const filteredFollowing = following.filter((f) => {
    if (!followingFilter.trim()) return true;
    const query = followingFilter.toLowerCase();
    const name = (f.username || f.name || f.authorName || f.fullName || "").toLowerCase();
    const email = (f.email || "").toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* BACKDROP CLICK */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
          aria-label="Close modal overlay"
        />

        {/* MODAL CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 18 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-[#dfe7e2] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 scrollbar-thin flex flex-col"
        >
          {/* ==================================================
              COVER BANNER
          ================================================== */}
          <div className="h-32 sm:h-36 bg-gradient-to-r from-[#123c2c] via-[#19714e] to-emerald-600 relative shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,239,132,0.25),transparent_60%)]" />

            {/* Back Navigation if viewing nested profile */}
            {userHistory.length > 0 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleGoBackUser}
                className="absolute top-4 left-4 h-9 px-3.5 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md z-20 text-xs font-bold"
                title="Back to previous profile"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </motion.button>
            )}

            {/* Close Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md z-20"
              title="Close profile"
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* ==================================================
              PROFILE HEADER INFO & ACTIONS
          ================================================== */}
          <div className="px-5 sm:px-7 pb-6 relative flex-1">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-5">
              {/* AVATAR */}
              <motion.div
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-3xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] border-4 border-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-xl font-['Space_Grotesk'] shrink-0 select-none">
                  {avatarLetter}
                </div>
                <div className="absolute -inset-0.5 rounded-3xl bg-[#b9ef84]/20 -z-10 blur-sm" />
              </motion.div>

              {/* ACTION BUTTONS (FOLLOW / FOLLOWING) */}
              <div className="flex items-center gap-2.5 sm:mb-1">
                {isMyProfile ? (
                  <span className="px-4 py-2 rounded-2xl bg-[#dff8eb] text-[#19714e] font-bold text-xs border border-[#19714e]/20 flex items-center gap-1.5">
                    <User size={14} />
                    Your Profile
                  </span>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={handleFollowToggle}
                    className={`
                      px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer
                      ${
                        profile?.followingByMe
                          ? "border border-[#19714e] text-[#19714e] bg-[#f0f8f4] hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          : "bg-[#123c2c] text-white hover:bg-[#19714e] hover:shadow-md"
                      }
                    `}
                  >
                    <motion.span
                      key={profile?.followingByMe ? "following" : "follow"}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center gap-2"
                    >
                      {profile?.followingByMe ? (
                        <>
                          <UserCheck size={15} />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={15} />
                          <span>Follow</span>
                        </>
                      )}
                    </motion.span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* USERNAME & NAME */}
            <div className="space-y-1 mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#12221d] font-['Space_Grotesk'] flex items-center gap-2 truncate">
                <span>{displayUsername}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#dff8eb] text-[#19714e]">
                  Member
                </span>
              </h2>
              <p className="text-xs font-medium text-[#68756f]">
                @{displayUsername.toLowerCase().replace(/\s+/g, "_")}
              </p>
            </div>

            {/* ==================================================
                CURRENT USER ONLY: RESUME DETAILS (LinkedIn, GitHub, Portfolio, Skills)
                Fetched from https://skillcart-ai.onrender.com/api/v1/resume/{res_id}
            ================================================== */}
            {isMyProfile && (
              <div className="my-4 space-y-3">
                {/* SOCIAL & PORTFOLIO BADGES */}
                {(linkedinUrl || githubUrl || portfolioUrl) && (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {linkedinUrl && (
                      <motion.a
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077b5]/10 text-[#0077b5] text-xs font-bold hover:bg-[#0077b5] hover:text-white transition-all shadow-2xs group"
                      >
                        <FaLinkedin size={14} />
                        <span>LinkedIn</span>
                        <ExternalLink size={11} className="opacity-70 group-hover:opacity-100" />
                      </motion.a>
                    )}

                    {githubUrl && (
                      <motion.a
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24292e]/10 text-[#24292e] text-xs font-bold hover:bg-[#24292e] hover:text-white transition-all shadow-2xs group"
                      >
                        <FaGithub size={14} />
                        <span>GitHub</span>
                        <ExternalLink size={11} className="opacity-70 group-hover:opacity-100" />
                      </motion.a>
                    )}

                    {portfolioUrl && (
                      <motion.a
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        href={portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#19714e]/10 text-[#19714e] text-xs font-bold hover:bg-[#19714e] hover:text-white transition-all shadow-2xs group"
                      >
                        <Globe size={14} />
                        <span>Portfolio</span>
                        <ExternalLink size={11} className="opacity-70 group-hover:opacity-100" />
                      </motion.a>
                    )}
                  </div>
                )}

                {/* SKILLS SECTION */}
                {parsedSkills.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-[#68756f] mb-2 flex items-center gap-1.5">
                      <Code2 size={14} className="text-[#19714e]" />
                      <span>Your Skills</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#dff8eb] text-[#19714e] font-bold">
                        {parsedSkills.length}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedSkills.map((skill, idx) => (
                        <motion.span
                          key={`${skill}-${idx}`}
                          whileHover={{ scale: 1.06, y: -1 }}
                          transition={{ duration: 0.15 }}
                          className="text-[11px] font-semibold bg-white text-[#123c2c] border border-[#dfe7e2] px-2.5 py-1 rounded-xl shadow-2xs hover:border-[#19714e]/40 transition-colors select-none"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* RESUME SKELETON WHILE LOADING */}
                {resumeLoading && !resumeData && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <Skeleton variant="pill" className="h-7 w-24" />
                      <Skeleton variant="pill" className="h-7 w-24" />
                    </div>
                    <Skeleton variant="rectangular" className="h-16 w-full rounded-2xl" />
                  </div>
                )}
              </div>
            )}

            {/* ERROR BANNER */}
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-amber-600" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    loadUserProfile();
                    loadUserPosts();
                    loadFollowers();
                    loadFollowing();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-200/60 hover:bg-amber-200 font-bold text-[11px] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ==================================================
                STATS METRIC CARDS (Interactive tabs for Posts, Followers, Following)
            ================================================== */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-5">
              {/* POSTS COUNT */}
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab("posts")}
                className={`
                  p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer select-none
                  ${
                    activeTab === "posts"
                      ? "bg-[#dff8eb] border-[#19714e]/40 shadow-xs ring-2 ring-[#19714e]/20"
                      : "bg-[#f7faf8] border-[#dfe7e2] hover:bg-[#dff8eb]/30"
                  }
                `}
              >
                <div className="text-xl sm:text-2xl font-extrabold text-[#123c2c] font-['Space_Grotesk'] flex items-center justify-center min-h-[32px]">
                  {loading ? (
                    <Skeleton variant="text" className="h-6 w-10 mx-auto" />
                  ) : (
                    profile?.postsCount ?? posts.length ?? 0
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#68756f] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                  <FileText size={12} className="text-[#19714e]" />
                  Posts
                </p>
              </motion.div>

              {/* FOLLOWERS COUNT */}
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveTab("followers");
                  loadFollowers();
                }}
                className={`
                  p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer select-none
                  ${
                    activeTab === "followers"
                      ? "bg-[#dff8eb] border-[#19714e]/40 shadow-xs ring-2 ring-[#19714e]/20"
                      : "bg-[#f7faf8] border-[#dfe7e2] hover:bg-[#dff8eb]/30"
                  }
                `}
              >
                <div className="text-xl sm:text-2xl font-extrabold text-[#123c2c] font-['Space_Grotesk'] flex items-center justify-center min-h-[32px]">
                  {loading ? (
                    <Skeleton variant="text" className="h-6 w-10 mx-auto" />
                  ) : (
                    profile?.followersCount ?? followers.length ?? 0
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#68756f] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                  <Users size={12} className="text-[#19714e]" />
                  Followers
                </p>
              </motion.div>

              {/* FOLLOWING COUNT */}
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveTab("following");
                  loadFollowing();
                }}
                className={`
                  p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer select-none
                  ${
                    activeTab === "following"
                      ? "bg-[#dff8eb] border-[#19714e]/40 shadow-xs ring-2 ring-[#19714e]/20"
                      : "bg-[#f7faf8] border-[#dfe7e2] hover:bg-[#dff8eb]/30"
                  }
                `}
              >
                <div className="text-xl sm:text-2xl font-extrabold text-[#123c2c] font-['Space_Grotesk'] flex items-center justify-center min-h-[32px]">
                  {loading ? (
                    <Skeleton variant="text" className="h-6 w-10 mx-auto" />
                  ) : (
                    profile?.followingCount ?? following.length ?? 0
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#68756f] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                  <UserCheck size={12} className="text-[#19714e]" />
                  Following
                </p>
              </motion.div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 border-b border-[#dfe7e2] pb-3 mb-4 overflow-x-auto scrollbar-none">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTab("posts")}
                className={`
                  flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0
                  ${
                    activeTab === "posts"
                      ? "bg-[#123c2c] text-white shadow-xs"
                      : "text-[#68756f] hover:text-[#12221d] hover:bg-[#f7faf8]"
                  }
                `}
              >
                <FileText size={14} />
                <span>Posts</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "posts" ? "bg-[#b9ef84] text-[#123c2c]" : "bg-[#dfe7e2] text-[#68756f]"
                }`}>
                  {posts.length}
                </span>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  setActiveTab("followers");
                  loadFollowers();
                }}
                className={`
                  flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0
                  ${
                    activeTab === "followers"
                      ? "bg-[#123c2c] text-white shadow-xs"
                      : "text-[#68756f] hover:text-[#12221d] hover:bg-[#f7faf8]"
                  }
                `}
              >
                <Users size={14} />
                <span>Followers</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "followers" ? "bg-[#b9ef84] text-[#123c2c]" : "bg-[#dfe7e2] text-[#68756f]"
                }`}>
                  {profile?.followersCount ?? followers.length}
                </span>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  setActiveTab("following");
                  loadFollowing();
                }}
                className={`
                  flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0
                  ${
                    activeTab === "following"
                      ? "bg-[#123c2c] text-white shadow-xs"
                      : "text-[#68756f] hover:text-[#12221d] hover:bg-[#f7faf8]"
                  }
                `}
              >
                <UserCheck size={14} />
                <span>Following</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "following" ? "bg-[#b9ef84] text-[#123c2c]" : "bg-[#dfe7e2] text-[#68756f]"
                }`}>
                  {profile?.followingCount ?? following.length}
                </span>
              </motion.button>
            </div>

            {/* ==================================================
                TAB CONTENT 1: POSTS LIST
            ================================================== */}
            {activeTab === "posts" && (
              <div className="space-y-4">
                {postsLoading && posts.length === 0 ? (
                  <PostCardSkeleton count={2} />
                ) : posts.length === 0 ? (
                  <div className="py-10 text-center bg-[#f7faf8] rounded-2xl border border-dashed border-[#dfe7e2] p-6">
                    <FileText size={28} className="mx-auto text-[#68756f]/60 mb-2" />
                    <p className="text-sm font-bold text-[#12221d]">No posts yet</p>
                    <p className="text-xs text-[#68756f] mt-1">
                      When @{displayUsername} shares insights or updates, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id || post._id || Math.random()}
                        post={{
                          ...post,
                          isMyPost: Boolean(
                            currentUserId &&
                            (post.userId || post.user_id) &&
                            String(currentUserId) === String(post.userId || post.user_id)
                          ),
                          authorName: post.authorName || displayUsername,
                        }}
                        onPostDeleted={handlePostDeleted}
                      />
                    ))}

                    {/* LOAD MORE POSTS BUTTON */}
                    {hasMore && (
                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          disabled={loadingMore}
                          onClick={handleLoadMorePosts}
                          className="
                            px-5
                            py-2.5
                            rounded-2xl
                            bg-[#f7faf8]
                            hover:bg-[#dff8eb]
                            border
                            border-[#dfe7e2]
                            hover:border-[#19714e]/30
                            text-xs
                            font-bold
                            text-[#123c2c]
                            transition-all
                            cursor-pointer
                            inline-flex
                            items-center
                            gap-2
                            disabled:opacity-50
                            shadow-2xs
                          "
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 size={14} className="animate-spin text-[#19714e]" />
                              <span>Loading more posts...</span>
                            </>
                          ) : (
                            <span>Load More Posts</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==================================================
                TAB CONTENT 2: FOLLOWERS LIST (GET /api/social/users/{userId}/followers)
            ================================================== */}
            {activeTab === "followers" && (
              <div className="space-y-3">
                {/* Search / Filter followers */}
                {followers.length > 4 && (
                  <div className="relative mb-3">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68756f]"
                    />
                    <input
                      type="text"
                      placeholder="Search followers..."
                      value={followerFilter}
                      onChange={(e) => setFollowerFilter(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-[#f7faf8] border border-[#dfe7e2] rounded-xl focus:outline-none focus:border-[#19714e] transition-colors"
                    />
                  </div>
                )}

                {/* Error Banner */}
                {followersError && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0 text-amber-600" />
                      <span>{followersError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={loadFollowers}
                      className="px-2.5 py-1 rounded-xl bg-amber-200/60 hover:bg-amber-200 font-bold text-[11px]"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {followersLoading && followers.length === 0 ? (
                  <UserRowSkeleton count={4} />
                ) : filteredFollowers.length === 0 ? (
                  <div className="py-10 text-center bg-[#f7faf8] rounded-2xl border border-dashed border-[#dfe7e2] p-6">
                    <Users size={28} className="mx-auto text-[#68756f]/60 mb-2" />
                    <p className="text-sm font-bold text-[#12221d]">
                      {followerFilter ? "No matching followers" : "No followers yet"}
                    </p>
                    <p className="text-xs text-[#68756f] mt-1">
                      {followerFilter
                        ? `No followers found matching "${followerFilter}".`
                        : `When other people follow @${displayUsername}, they will appear here.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFollowers.map((follower) => {
                      const fId = follower.id || follower.userId || follower._id;
                      const fName =
                        follower.username ||
                        follower.name ||
                        follower.authorName ||
                        follower.fullName ||
                        (follower.email ? follower.email.split("@")[0] : "User");
                      const fLetter = fName.charAt(0).toUpperCase();
                      const isMe =
                        currentUserId &&
                        fId &&
                        String(currentUserId) === String(fId);

                      const isFollowingThisPerson = followingStates[fId] === true;
                      const isSubLoading = subFollowLoading[fId] === true;

                      return (
                        <motion.div
                          key={fId || Math.random()}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -1, scale: 1.008 }}
                          transition={{ duration: 0.18 }}
                          className="
                            flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] hover:bg-white hover:border-[#19714e]/30 transition-all shadow-2xs group
                          "
                        >
                          {/* Follower Identity (Clickable to view their profile) */}
                          <div
                            onClick={() => handleNavigateToUser(follower)}
                            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                            title={`View ${fName}'s profile`}
                          >
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform select-none shadow-xs">
                              {fLetter}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#12221d] truncate group-hover:text-[#19714e] transition-colors">
                                {fName}
                              </p>
                              {follower.email && (
                                <p className="text-[10px] text-[#68756f] truncate">
                                  {follower.email}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Button (Follow / Following) */}
                          {!isMe && fId && (
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.9 }}
                              whileHover={{ scale: 1.04 }}
                              onClick={() => handleRowFollowToggle(fId)}
                              className={`
                                shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer
                                ${
                                  isFollowingThisPerson
                                    ? "bg-[#dff8eb] text-[#19714e] border border-[#19714e]/30 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                    : "bg-[#123c2c] text-white hover:bg-[#19714e]"
                                }
                              `}
                            >
                              <motion.span
                                key={isFollowingThisPerson ? "following" : "follow"}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.18 }}
                                className="inline-block"
                              >
                                {isFollowingThisPerson
                                  ? "Following"
                                  : "Follow"}
                              </motion.span>
                            </motion.button>
                          )}
                          {isMe && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#dff8eb] text-[#19714e]">
                              You
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==================================================
                TAB CONTENT 3: FOLLOWING LIST (GET /api/social/users/{userId}/following)
            ================================================== */}
            {activeTab === "following" && (
              <div className="space-y-3">
                {/* Search / Filter following */}
                {following.length > 4 && (
                  <div className="relative mb-3">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68756f]"
                    />
                    <input
                      type="text"
                      placeholder="Search people followed..."
                      value={followingFilter}
                      onChange={(e) => setFollowingFilter(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-[#f7faf8] border border-[#dfe7e2] rounded-xl focus:outline-none focus:border-[#19714e] transition-colors"
                    />
                  </div>
                )}

                {/* Error Banner */}
                {followingError && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0 text-amber-600" />
                      <span>{followingError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={loadFollowing}
                      className="px-2.5 py-1 rounded-xl bg-amber-200/60 hover:bg-amber-200 font-bold text-[11px]"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {followingLoading && following.length === 0 ? (
                  <UserRowSkeleton count={4} />
                ) : filteredFollowing.length === 0 ? (
                  <div className="py-10 text-center bg-[#f7faf8] rounded-2xl border border-dashed border-[#dfe7e2] p-6">
                    <UserCheck size={28} className="mx-auto text-[#68756f]/60 mb-2" />
                    <p className="text-sm font-bold text-[#12221d]">
                      {followingFilter ? "No matching users" : "Not following anyone yet"}
                    </p>
                    <p className="text-xs text-[#68756f] mt-1">
                      {followingFilter
                        ? `No users found matching "${followingFilter}".`
                        : `@${displayUsername} is not following any accounts yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFollowing.map((person) => {
                      const fId = person.id || person.userId || person._id;
                      const fName =
                        person.username ||
                        person.name ||
                        person.authorName ||
                        person.fullName ||
                        (person.email ? person.email.split("@")[0] : "User");
                      const fLetter = fName.charAt(0).toUpperCase();
                      const isMe =
                        currentUserId &&
                        fId &&
                        String(currentUserId) === String(fId);

                      const isFollowingThisPerson = followingStates[fId] === true;
                      const isSubLoading = subFollowLoading[fId] === true;

                      return (
                        <motion.div
                          key={fId || Math.random()}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -1, scale: 1.008 }}
                          transition={{ duration: 0.18 }}
                          className="
                            flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] hover:bg-white hover:border-[#19714e]/30 transition-all shadow-2xs group
                          "
                        >
                          {/* Following Identity (Clickable to view their profile) */}
                          <div
                            onClick={() => handleNavigateToUser(person)}
                            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                            title={`View ${fName}'s profile`}
                          >
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform select-none shadow-xs">
                              {fLetter}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#12221d] truncate group-hover:text-[#19714e] transition-colors">
                                {fName}
                              </p>
                              {person.email && (
                                <p className="text-[10px] text-[#68756f] truncate">
                                  {person.email}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Button (Following / Follow) */}
                          {!isMe && fId && (
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.9 }}
                              whileHover={{ scale: 1.04 }}
                              onClick={() => handleRowFollowToggle(fId)}
                              className={`
                                shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer
                                ${
                                  isFollowingThisPerson
                                    ? "bg-[#dff8eb] text-[#19714e] border border-[#19714e]/30 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                    : "bg-[#123c2c] text-white hover:bg-[#19714e]"
                                }
                              `}
                            >
                              <motion.span
                                key={isFollowingThisPerson ? "following" : "follow"}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.18 }}
                                className="inline-block"
                              >
                                {isFollowingThisPerson
                                  ? "Following"
                                  : "Follow"}
                              </motion.span>
                            </motion.button>
                          )}
                          {isMe && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#dff8eb] text-[#19714e]">
                              You
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
