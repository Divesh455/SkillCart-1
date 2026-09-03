import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Users,
  FileText,
  UserCheck,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import socialService from "../../services/socialService";
import PostCard from "./PostCard";

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
  userId,
  initialUser = null,
  onFollowToggle = null,
}) {
  const currentUserId = getCurrentUserId();
  const isMyProfile = Boolean(
    currentUserId && userId && String(currentUserId) === String(userId)
  );

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
  // LOAD USER PROFILE VIA /api/social/profiles/{userId}
  // ============================================================

  const loadUserProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Call GET https://skillcart-socials.onrender.com/api/social/profiles/{userId}
      const data = await socialService.getProfile(userId);
      console.log("USER PROFILE API RESPONSE:", data);

      if (data) {
        setProfile({
          userId: data.userId || userId,
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
      // Graceful fallback with initial data if available
      setProfile((prev) => prev || {
        userId,
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
  }, [userId, initialUser]);

  // ============================================================
  // LOAD USER POSTS (page=0, size=10)
  // ============================================================

  const loadUserPosts = useCallback(async () => {
    if (!userId) return;

    try {
      setPostsLoading(true);
      setPage(0);
      const res = await socialService.getUserPosts(userId, 0, 10);
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
  }, [userId]);

  // ============================================================
  // LOAD MORE USER POSTS
  // ============================================================

  const handleLoadMorePosts = async () => {
    if (!userId || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await socialService.getUserPosts(userId, nextPage, 10);
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

  // Trigger loading whenever modal opens with a valid userId
  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile();
      loadUserPosts();
    } else {
      // Reset state when closed
      setProfile(null);
      setPosts([]);
      setPage(0);
      setHasMore(false);
      setError(null);
    }
  }, [isOpen, userId, loadUserProfile, loadUserPosts]);

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
  // HANDLE FOLLOW / UNFOLLOW
  // ============================================================

  const handleFollowToggle = async () => {
    if (!userId || isMyProfile || followLoading) return;

    const isCurrentlyFollowing = profile?.followingByMe;
    const nextFollowingState = !isCurrentlyFollowing;

    try {
      setFollowLoading(true);

      // Optimistic UI update
      setProfile((prev) => ({
        ...prev,
        followingByMe: nextFollowingState,
        followersCount: Math.max(
          0,
          (prev?.followersCount ?? 0) + (nextFollowingState ? 1 : -1)
        ),
      }));

      if (isCurrentlyFollowing) {
        await socialService.unfollowUser(userId);
      } else {
        await socialService.followUser(userId);
      }

      // Notify parent components to synchronize state across the app
      if (typeof onFollowToggle === "function") {
        onFollowToggle(userId, nextFollowingState);
      }
    } catch (err) {
      console.error("Failed to toggle follow status:", err);
      // Revert optimistic update on error
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

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) =>
      prev.filter((p) => String(p.id || p._id) !== String(deletedPostId))
    );
    setProfile((prev) => ({
      ...prev,
      postsCount: Math.max(0, (prev?.postsCount ?? 1) - 1),
    }));
  };

  if (!isOpen) return null;

  const displayUsername =
    profile?.username || initialUser?.username || initialUser?.name || "SkillCart User";
  const avatarLetter = displayUsername.charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* BACKDROP CLICK */}
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-label="Close modal overlay"
        />

        {/* MODAL CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-[#dfe7e2] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 scrollbar-thin flex flex-col"
        >
          {/* ==================================================
              COVER BANNER
          ================================================== */}
          <div className="h-32 sm:h-36 bg-gradient-to-r from-[#123c2c] via-[#19714e] to-emerald-600 relative shrink-0 overflow-hidden">
            {/* Ambient pattern glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,239,132,0.25),transparent_60%)]" />
            
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer shadow-md z-20"
              title="Close profile"
            >
              <X size={18} />
            </button>
          </div>

          {/* ==================================================
              PROFILE HEADER INFO & ACTIONS
          ================================================== */}
          <div className="px-5 sm:px-7 pb-6 relative flex-1">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-5">
              {/* AVATAR */}
              <div className="relative">
                <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-3xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] border-4 border-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-xl font-['Space_Grotesk'] shrink-0 select-none">
                  {avatarLetter}
                </div>
                {/* Glow ring */}
                <div className="absolute -inset-0.5 rounded-3xl bg-[#b9ef84]/20 -z-10 blur-sm" />
              </div>

              {/* ACTION BUTTONS (FOLLOW / FOLLOWING) */}
              <div className="flex items-center gap-2.5 sm:mb-1">
                {isMyProfile ? (
                  <span className="px-4 py-2 rounded-2xl bg-[#dff8eb] text-[#19714e] font-bold text-xs border border-[#19714e]/20 flex items-center gap-1.5">
                    <User size={14} />
                    Your Profile
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={loading || followLoading}
                    onClick={handleFollowToggle}
                    className={`
                      px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        profile?.followingByMe
                          ? "border border-[#19714e] text-[#19714e] bg-[#f0f8f4] hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          : "bg-[#123c2c] text-white hover:bg-[#19714e] hover:shadow-md"
                      }
                    `}
                  >
                    {followLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : profile?.followingByMe ? (
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
                  </button>
                )}
              </div>
            </div>

            {/* USERNAME & NAME */}
            <div className="space-y-1 mb-5">
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
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-200/60 hover:bg-amber-200 font-bold text-[11px] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ==================================================
                STATS METRIC CARDS (Posts, Followers, Following)
            ================================================== */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-5">
              {/* POSTS COUNT */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] text-center hover:bg-[#dff8eb]/30 transition-colors">
                <p className="text-xl sm:text-2xl font-extrabold text-[#123c2c] font-['Space_Grotesk']">
                  {loading ? (
                    <span className="inline-block w-6 h-5 bg-[#dfe7e2] animate-pulse rounded" />
                  ) : (
                    profile?.postsCount ?? posts.length ?? 0
                  )}
                </p>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#68756f] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                  <FileText size={12} className="text-[#19714e]" />
                  Posts
                </p>
              </div>

              {/* FOLLOWERS COUNT */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] text-center hover:bg-[#dff8eb]/30 transition-colors">
                <p className="text-xl sm:text-2xl font-extrabold text-[#123c2c] font-['Space_Grotesk']">
                  {loading ? (
                    <span className="inline-block w-6 h-5 bg-[#dfe7e2] animate-pulse rounded" />
                  ) : (
                    profile?.followersCount ?? 0
                  )}
                </p>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#68756f] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                  <Users size={12} className="text-[#19714e]" />
                  Followers
                </p>
              </div>

              {/* FOLLOWING COUNT */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] text-center hover:bg-[#dff8eb]/30 transition-colors">
                <p className="text-xl sm:text-2xl font-extrabold text-[#123c2c] font-['Space_Grotesk']">
                  {loading ? (
                    <span className="inline-block w-6 h-5 bg-[#dfe7e2] animate-pulse rounded" />
                  ) : (
                    profile?.followingCount ?? 0
                  )}
                </p>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#68756f] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                  <UserCheck size={12} className="text-[#19714e]" />
                  Following
                </p>
              </div>
            </div>

            {/* ==================================================
                USER'S POSTS SECTION
            ================================================== */}
            <div className="border-t border-[#dfe7e2] pt-5 mt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#12221d] flex items-center gap-2 font-['Space_Grotesk']">
                  <span>Posts by {displayUsername}</span>
                  <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#123c2c] text-[#b9ef84] font-bold">
                    {posts.length}
                  </span>
                </h3>

                {postsLoading && (
                  <span className="text-xs text-[#68756f] flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin text-[#19714e]" />
                    <span>Loading posts...</span>
                  </span>
                )}
              </div>

              {/* POSTS LIST */}
              {postsLoading && posts.length === 0 ? (
                <div className="py-12 text-center bg-[#f7faf8] rounded-2xl border border-dashed border-[#dfe7e2] p-4 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={24} className="animate-spin text-[#19714e]" />
                  <p className="text-xs font-semibold text-[#68756f]">
                    Loading user's posts...
                  </p>
                </div>
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
