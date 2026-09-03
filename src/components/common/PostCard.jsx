import {
  Heart,
  MessageCircle,
  Send,
  RefreshCw,
  Loader2,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socialService from "../../services/socialService";
import UserHeader from "./UserHeader";
import UserProfileModal from "./UserProfileModal";
import CommentSkeleton from "./CommentSkeleton";

// ============================================================
// GET CURRENT USER ID FROM JWT
// ============================================================

function getCurrentUserInfo() {
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

    const userId =
      payload?.userId ||
      payload?.id ||
      savedUser?.id ||
      savedUser?.userId ||
      (payload?.sub && !isNaN(payload?.sub) ? payload?.sub : null);

    const username =
      savedUser?.username ||
      savedUser?.name ||
      payload?.username ||
      payload?.name ||
      payload?.sub ||
      "You";

    return { userId, username };
  } catch (error) {
    return { userId: null, username: "You" };
  }
}

export default function PostCard({
  post,
  onPostDeleted,
}) {

  // ============================================================
  // CURRENT USER
  // ============================================================

  const { userId: currentUserId, username: currentUsername } =
    getCurrentUserInfo();

  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await socialService.getAllUsers();
        if (Array.isArray(users)) {
          setAllUsers(users);
        }
      } catch (e) {
        console.warn("Failed to fetch users list:", e);
      }
    };

    fetchUsers();
  }, []);

  const [postUser, setPostUser] =
    useState(null);

  const [activeProfileUserId, setActiveProfileUserId] = useState(null);
  const [activeProfileInitialUser, setActiveProfileInitialUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const postAuthorId = post?.userId || post?.user_id || post?.authorId;

  const handleOpenProfile = (targetUser, explicitUserId = null) => {
    const targetId =
      explicitUserId ||
      targetUser?.id ||
      targetUser?.userId ||
      targetUser?.user_id ||
      targetUser?.authorId ||
      postAuthorId;

    if (!targetId) return;

    setActiveProfileUserId(String(targetId));
    setActiveProfileInitialUser(targetUser || null);
    setIsProfileModalOpen(true);
  };

  const handleModalFollowToggle = (userId, newFollowingState) => {
    if (String(userId) === String(postAuthorId)) {
      setIsFollowing(newFollowingState);
    }
  };

  const isMyPost = Boolean(
    post?.isMyPost ||
    (currentUserId &&
      postAuthorId &&
      String(currentUserId) === String(postAuthorId))
  );

  useEffect(() => {
    if (isMyPost) {
      setPostUser({
        username: "You",
        id: currentUserId,
      });
      return;
    }

    if (!postAuthorId) {
      return;
    }

    if (post?.user?.username || post?.authorName || post?.username) {
      setPostUser({
        username: post?.user?.username || post?.authorName || post?.username,
        id: postAuthorId,
      });
      return;
    }

    if (Array.isArray(allUsers) && allUsers.length > 0) {
      const foundUser = allUsers.find(
        (user) => String(user.id) === String(postAuthorId)
      );
      if (foundUser) {
        setPostUser(foundUser);
        return;
      }
    }

    const loadPostUser = async () => {
      try {
        const users = await socialService.getAllUsers();
        const foundUser = Array.isArray(users)
          ? users.find(
              (user) => String(user.id) === String(postAuthorId)
            )
          : null;

        setPostUser(foundUser || null);
      } catch (error) {
        console.error("FAILED TO LOAD POST USER:", error);
        setPostUser(null);
      }
    };

    loadPostUser();
  }, [postAuthorId, post?.user, post?.authorName, post?.username, isMyPost, currentUserId, allUsers]);

  // ============================================================
  // FOLLOW
  // ============================================================

  const [isFollowing, setIsFollowing] =
    useState(false);

  const [followLoading, setFollowLoading] =
    useState(false);

  const [followError, setFollowError] =
    useState("");

  // ============================================================
  // CHECK FOLLOWING STATUS
  // ============================================================

  useEffect(() => {

    if (
      !post?.userId ||
      !currentUserId ||
      isMyPost
    ) {
      return;
    }

    const checkFollowingStatus =
      async () => {

        try {

          const response =
            await socialService.getFollowingStatus(
              post.userId
            );

          console.log(
            "FOLLOWING STATUS:",
            post.userId,
            response
          );

          const following =
            typeof response ===
            "boolean"
              ? response
              : response?.following ??
                response?.isFollowing ??
                response?.followingStatus ??
                response?.data?.following ??
                response?.data?.isFollowing ??
                false;

          setIsFollowing(
            Boolean(following)
          );

        } catch (error) {

          console.error(
            "FOLLOWING STATUS ERROR:",
            error
          );

        }
      };

    checkFollowingStatus();

  }, [
    post?.userId,
    currentUserId,
    isMyPost,
  ]);

  // ============================================================
  // FOLLOW / UNFOLLOW
  // ============================================================

  const handleFollow = async () => {
    if (followLoading || !post?.userId || isMyPost) {
      return;
    }

    const previousFollowing = isFollowing;
    const nextFollowing = !previousFollowing;

    try {
      setFollowLoading(true);
      setFollowError("");
      setIsFollowing(nextFollowing);

      if (previousFollowing) {
        await socialService.unfollowUser(post.userId);
        console.log("UNFOLLOW SUCCESS:", post.userId);
      } else {
        await socialService.followUser(post.userId);
        console.log("FOLLOW SUCCESS:", post.userId);
      }
    } catch (error) {
      console.error("FOLLOW / UNFOLLOW ERROR:", error);
      setIsFollowing(previousFollowing);
      setFollowError(
        error?.message || "Unable to update follow status."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  // ============================================================
  // LIKE
  // ============================================================

  const [liked, setLiked] =
    useState(
      Boolean(post?.likedByMe)
    );

  const [likeCount, setLikeCount] =
    useState(
      Number(post?.likeCount || 0)
    );

  const [likeLoading, setLikeLoading] =
    useState(false);

  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showImageHeartPop, setShowImageHeartPop] = useState(false);

  // ============================================================
  // COMMENTS
  // ============================================================

  const [showComments, setShowComments] =
    useState(false);

  const [comments, setComments] =
    useState([]);

  const [commentCount, setCommentCount] =
    useState(
      Number(
        post?.commentCount || 0
      )
    );

  const [commentsLoading, setCommentsLoading] =
    useState(false);

  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  const [commentText, setCommentText] =
    useState("");

  const [commentError, setCommentError] =
    useState("");

  // ============================================================
  // DELETE
  // ============================================================

  const [showMenu, setShowMenu] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  // ============================================================
  // LIKE / UNLIKE
  // ============================================================

  const handleLike = async () => {
    if (likeLoading || !post?.id) {
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;

    try {
      setLikeLoading(true);

      if (liked) {
        // Optimistically update UI so unliking happens immediately on click
        setLiked(false);
        setLikeCount((count) => Math.max(0, count - 1));

        try {
          await socialService.unlikePost(post.id);
        } catch (err) {
          console.warn("Unlike request warning:", err);
          try {
            await socialApi.post(`/api/social/posts/${post.id}/unlike`);
          } catch (e) {}
        }
      } else {
        // Trigger rich micro-interaction animation
        setIsLikeAnimating(true);
        setShowHeartBurst(true);
        setTimeout(() => {
          setIsLikeAnimating(false);
          setShowHeartBurst(false);
        }, 800);

        // Optimistically update UI so liking happens immediately on click
        setLiked(true);
        setLikeCount((count) => count + 1);

        try {
          await socialService.likePost(post.id);
        } catch (err) {
          console.warn("Like request warning:", err);
        }
      }
    } catch (error) {
      console.error("LIKE / UNLIKE ERROR:", error);
      setLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDoubleTapImage = () => {
    if (!liked) {
      handleLike();
    }
    setShowImageHeartPop(true);
    setTimeout(() => {
      setShowImageHeartPop(false);
    }, 900);
  };

  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;

    try {
      setDeletingCommentId(commentId);

      setComments((current) =>
        current.filter(
          (c) => String(c.id || c._id) !== String(commentId)
        )
      );

      setCommentCount((count) => Math.max(0, count - 1));

      await socialService.deleteComment(commentId).catch((err) => {
        console.warn("Failed to delete comment on backend:", err);
      });
    } catch (err) {
      console.error("DELETE COMMENT ERROR:", err);
    } finally {
      setDeletingCommentId(null);
    }
  };


  // ============================================================
  // LOAD COMMENTS
  // ============================================================

  const loadComments = async () => {

    if (!post?.id) {
      return;
    }

    try {

      setCommentsLoading(true);
      setCommentError("");

      const response =
        await socialService.getComments(
          post.id,
          0,
          20
        );

      const commentList =
        Array.isArray(
          response?.content
        )
          ? response.content
          : [];

      setComments(
        commentList
      );

      if (
        typeof response?.totalElements ===
        "number"
      ) {

        setCommentCount(
          response.totalElements
        );
      }

    } catch (error) {

      console.error(
        "GET COMMENTS ERROR:",
        error
      );

      setCommentError(
        error?.message ||
          "Unable to load comments."
      );

    } finally {

      setCommentsLoading(false);

    }
  };

  // ============================================================
  // COMMENT BUTTON
  // ============================================================

  const handleCommentClick =
    async () => {

      const nextState =
        !showComments;

      setShowComments(
        nextState
      );

      if (nextState) {
        await loadComments();
      }
    };

  // ============================================================
  // ADD COMMENT
  // ============================================================

  const handleAddComment =
    async (event) => {

      event.preventDefault();

      const text =
        commentText.trim();

      if (
        !text ||
        !post?.id ||
        commentSubmitting
      ) {
        return;
      }

      try {

        setCommentSubmitting(
          true
        );

        setCommentError("");

        const newComment =
          await socialService.addComment(
            post.id,
            text
          );

        const formattedComment = {
          ...(newComment || {}),
          id: newComment?.id || Date.now(),
          content: text,
          userId: currentUserId,
          user_id: currentUserId,
          isMyComment: true,
          createdAt: newComment?.createdAt || new Date().toISOString(),
        };

        setComments(
          (current) => [
            ...current,
            formattedComment,
          ]
        );

        setCommentCount(
          (count) =>
            count + 1
        );

        setCommentText("");

      } catch (error) {

        console.error(
          "ADD COMMENT ERROR:",
          error
        );

        setCommentError(
          error?.message ||
            "Failed to add comment."
        );

      } finally {

        setCommentSubmitting(
          false
        );

      }
    };

  // ============================================================
  // DELETE POST
  // ============================================================

  const handleDeletePost =
    async () => {

      if (
        deleteLoading ||
        !post?.id
      ) {
        return;
      }

      try {

        setDeleteLoading(true);
        setDeleteError("");

        console.log(
          "DELETE POST:",
          post.id
        );

        await socialService.deletePost(
          post.id
        );

        console.log(
          "POST DELETED:",
          post.id
        );

        if (onPostDeleted) {

          onPostDeleted(
            post.id
          );
        }

        setShowDeleteConfirm(
          false
        );

        setShowMenu(false);

      } catch (error) {

        console.error(
          "DELETE POST ERROR:",
          error
        );

        setDeleteError(
          error?.message ||
            "Failed to delete post."
        );

      } finally {

        setDeleteLoading(
          false
        );

      }
    };

  // ============================================================
  // COMMENT DATE
  // ============================================================

  const formatCommentDate =
    (date) => {

      if (!date) {
        return "";
      }

      return new Date(
        date
      ).toLocaleString();
    };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        className="
          bg-white
          border
          border-[#dfe7e2]
          hover:border-[#19714e]/30
          rounded-3xl
          overflow-hidden
          shadow-xs
          hover:shadow-md
          transition-all
          duration-300
          relative
        "
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            p-5
            flex
            items-center
            gap-3
          "
        >

          {/* ==================================================
              USER HEADER
          ================================================== */}

          <UserHeader
            user={postUser}
            createdAt={post?.createdAt}
            showFollow={!isMyPost}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onFollow={handleFollow}
            isMyPost={isMyPost}
            onOpenProfile={handleOpenProfile}
          />

          {/* ==================================================
              FOLLOW ERROR
          ================================================== */}

          {followError && (
            <p
              className="
                absolute
                right-5
                top-[72px]
                text-[9px]
                text-red-500
                max-w-[150px]
                text-right
              "
            >
              {followError}
            </p>
          )}

          {/* ==================================================
              POST MENU
          ================================================== */}

          {isMyPost && (
            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setShowMenu(
                    (value) =>
                      !value
                  )
                }
                className="
                  p-2
                  rounded-xl
                  hover:bg-[#f7faf8]
                  text-[#68756f]
                "
              >
                <MoreVertical
                  size={18}
                />
              </button>

              {showMenu && (
                <div
                  className="
                    absolute
                    right-0
                    top-10
                    z-20
                    w-36
                    bg-white
                    border
                    border-[#dfe7e2]
                    rounded-xl
                    shadow-lg
                    p-1
                  "
                >

                  <button
                    type="button"
                    onClick={() => {

                      setShowMenu(
                        false
                      );

                      setShowDeleteConfirm(
                        true
                      );

                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2.5
                      rounded-lg
                      text-xs
                      font-semibold
                      text-red-600
                      hover:bg-red-50
                    "
                  >

                    <Trash2
                      size={14}
                    />

                    Delete Post

                  </button>

                </div>
              )}

            </div>
          )}

        </div>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        {post?.content && (
          <div className="px-5 pb-5">

            <p
              className="
                text-sm
                leading-6
                whitespace-pre-wrap
              "
            >
              {post.content}
            </p>

          </div>
        )}

        {/* ====================================================
            IMAGE
        ==================================================== */}

        {post?.imageUrl && (
          <div
            className="px-5 pb-5 relative select-none cursor-pointer overflow-hidden rounded-2xl group"
            onDoubleClick={handleDoubleTapImage}
            title="Double-click to like"
          >
            <img
              src={post.imageUrl}
              alt="Post"
              className="
                w-full
                max-h-[500px]
                object-cover
                rounded-2xl
                transition-transform
                duration-300
                group-hover:scale-[1.01]
              "
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            {/* BIG CENTER HEART BURST POP ON DOUBLE TAP */}
            <AnimatePresence>
              {showImageHeartPop && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{
                      scale: [0, 1.4, 1.15, 1],
                      opacity: [0, 1, 0.95, 0],
                      rotate: [-20, 0, 10, 0],
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.85, ease: "easeOut" }}
                    className="p-5 rounded-full bg-black/40 backdrop-blur-xs text-white shadow-2xl"
                  >
                    <Heart size={68} fill="#ef4444" className="text-red-500 drop-shadow-lg" />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ====================================================
            COUNTS
        ==================================================== */}

        <div
          className="
            px-5
            py-3
            border-t
            border-[#dfe7e2]
            flex
            justify-between
            text-xs
            text-[#68756f]
          "
        >

          <motion.span
            key={likeCount}
            initial={{ scale: 0.85, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {likeCount}{" "}
            {likeCount === 1
              ? "like"
              : "likes"}
          </motion.span>

          <span>
            {commentCount}{" "}
            {commentCount === 1
              ? "comment"
              : "comments"}
          </span>

        </div>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div
          className="
            px-5
            py-3
            border-t
            border-[#dfe7e2]
            flex
            gap-2
          "
        >

          {/* LIKE BUTTON WITH FRAMER MOTION ANIMATION */}

          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`
              flex-1
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              rounded-2xl
              text-xs
              font-bold
              transition-colors
              relative
              overflow-visible
              cursor-pointer
              select-none

              ${
                liked
                  ? "bg-red-50 text-red-600 shadow-2xs"
                  : "text-[#68756f] hover:bg-[#f7faf8] hover:text-[#12221d]"
              }
            `}
          >
            {/* FLOATING PARTICLES BURST EFFECT ON LIKE */}
            <AnimatePresence>
              {showHeartBurst && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Outer Ripple Wave */}
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0.9 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="absolute w-8 h-8 rounded-full border-2 border-red-500"
                  />
                  {/* 5 Flying Heart Particles */}
                  {[
                    { x: -18, y: -22, size: 10, color: "text-red-500", delay: 0 },
                    { x: 18, y: -24, size: 9, color: "text-rose-500", delay: 0.04 },
                    { x: -22, y: 12, size: 8, color: "text-pink-500", delay: 0.08 },
                    { x: 22, y: 10, size: 10, color: "text-red-400", delay: 0.06 },
                    { x: 0, y: -28, size: 12, color: "text-red-600", delay: 0.02 },
                  ].map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                      animate={{
                        scale: [0, 1.3, 0.9, 0],
                        x: p.x,
                        y: p.y,
                        opacity: [1, 1, 0.8, 0],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.65, delay: p.delay, ease: "easeOut" }}
                      className={`absolute ${p.color}`}
                    >
                      <Heart size={p.size} fill="currentColor" />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            <motion.div
              animate={
                isLikeAnimating
                  ? {
                      scale: [1, 1.45, 0.88, 1.2, 1],
                      rotate: [0, -18, 18, -6, 0],
                    }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center justify-center"
            >
              <Heart
                size={16}
                className={`transition-colors duration-200 ${
                  liked ? "text-red-600 fill-red-600 drop-shadow-xs" : "text-current"
                }`}
                fill={
                  liked
                    ? "currentColor"
                    : "none"
                }
              />
            </motion.div>

            <motion.span
              animate={isLikeAnimating ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {liked
                ? "Liked"
                : "Like"}
            </motion.span>

          </motion.button>

          {/* COMMENT BUTTON */}

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={
              handleCommentClick
            }
            className={`
              flex-1
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              rounded-2xl
              text-xs
              font-bold
              transition-colors
              cursor-pointer
              select-none

              ${
                showComments
                  ? "bg-[#f7faf8] text-[#19714e]"
                  : "text-[#68756f] hover:bg-[#f7faf8] hover:text-[#12221d]"
              }
            `}
          >

            <MessageCircle
              size={16}
            />

            Comment

          </motion.button>

        </div>

        {/* ====================================================
            COMMENTS (ANIMATED ACCORDION)
        ==================================================== */}

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="
                border-t
                border-[#dfe7e2]
                bg-[#fbfcfb]
                overflow-hidden
              "
            >

            {/* COMMENTS HEADER */}

            <div
              className="
                px-5
                pt-4
                pb-3
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p className="text-sm font-bold">
                  Comments
                </p>

                <p
                  className="
                    text-[11px]
                    text-[#68756f]
                  "
                >
                  {commentCount}{" "}
                  {commentCount === 1
                    ? "comment"
                    : "comments"}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  loadComments
                }
                disabled={
                  commentsLoading
                }
                className="
                  p-2
                  rounded-xl
                  border
                  border-[#dfe7e2]
                  bg-white
                  text-[#68756f]
                "
              >

                {commentsLoading ? (

                  <Loader2
                    size={14}
                    className="animate-spin"
                  />

                ) : (

                  <RefreshCw
                    size={14}
                  />

                )}

              </button>

            </div>

            {/* COMMENT ERROR */}

            {commentError && (

              <div
                className="
                  mx-5
                  mb-3
                  px-3
                  py-2.5
                  rounded-xl
                  bg-red-50
                  border
                  border-red-200
                  text-red-600
                  text-xs
                  font-semibold
                "
              >
                {commentError}
              </div>

            )}

            {/* COMMENTS LIST */}

            <div
              className="
                px-5
                space-y-3
                max-h-[350px]
                overflow-y-auto
              "
            >

              {commentsLoading &&
              comments.length === 0 ? (
                <CommentSkeleton count={2} />
              ) : comments.length === 0 ? (

                <div
                  className="
                    py-6
                    text-center
                  "
                >

                  <MessageCircle
                    size={22}
                    className="
                      mx-auto
                      text-[#68756f]
                    "
                  />

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-[#68756f]
                      mt-2
                    "
                  >
                    No comments yet
                  </p>

                </div>

              ) : (

                comments.map(
                  (comment) => {
                    const commentUserId =
                      comment?.userId ||
                      comment?.user_id ||
                      comment?.authorId ||
                      comment?.user?.id;

                    const isMyComment = Boolean(
                      comment?.isMyComment ||
                      comment?.isMine ||
                      (currentUserId &&
                        commentUserId &&
                        String(currentUserId) === String(commentUserId))
                    );

                    let authorName = "SkillCart User";
                    let authorInitial = "U";

                    if (isMyComment) {
                      authorName = "You";
                      authorInitial = "Y";
                    } else {
                      const directName =
                        comment?.username ||
                        comment?.authorName ||
                        comment?.author ||
                        comment?.user?.username ||
                        comment?.user?.name ||
                        comment?.user?.fullName ||
                        comment?.name;

                      if (directName) {
                        authorName = directName;
                        authorInitial = directName.trim().charAt(0).toUpperCase();
                      } else if (commentUserId && Array.isArray(allUsers)) {
                        const foundUser = allUsers.find(
                          (u) => String(u.id) === String(commentUserId)
                        );
                        if (foundUser?.username || foundUser?.name) {
                          authorName = foundUser.username || foundUser.name;
                          authorInitial = authorName.trim().charAt(0).toUpperCase();
                        }
                      }
                    }

                    return (
                      <motion.div
                        key={comment.id || comment._id || Math.random()}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        className="
                          flex
                          gap-3
                        "
                      >
                        <div
                          onClick={() =>
                            commentUserId &&
                            handleOpenProfile(
                              { username: authorName, id: commentUserId },
                              commentUserId
                            )
                          }
                          title={commentUserId ? `View ${authorName}'s profile` : undefined}
                          className={`
                            w-8
                            h-8
                            rounded-xl
                            bg-gradient-to-br
                            from-[#123c2c]
                            to-[#19714e]
                            text-[#b9ef84]
                            flex
                            items-center
                            justify-center
                            text-[10px]
                            font-bold
                            shrink-0
                            select-none
                            ${
                              commentUserId
                                ? "cursor-pointer hover:scale-105 transition-transform"
                                : ""
                            }
                          `}
                        >
                          {authorInitial}
                        </div>

                        <div
                          className="
                            flex-1
                            min-w-0
                          "
                        >
                          <div
                            className="
                              bg-white
                              border
                              border-[#dfe7e2]
                              rounded-2xl
                              px-3.5
                              py-2.5
                            "
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p
                                onClick={() =>
                                  commentUserId &&
                                  handleOpenProfile(
                                    { username: authorName, id: commentUserId },
                                    commentUserId
                                  )
                                }
                                title={commentUserId ? `View ${authorName}'s profile` : undefined}
                                className={`
                                  text-xs
                                  font-bold
                                  text-[#12221d]
                                  ${
                                    commentUserId
                                      ? "cursor-pointer hover:text-[#19714e] transition-colors"
                                      : ""
                                  }
                                `}
                              >
                                {authorName}
                              </p>

                              {isMyComment && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteComment(comment.id || comment._id)
                                  }
                                  disabled={
                                    deletingCommentId ===
                                    (comment.id || comment._id)
                                  }
                                  title="Delete your comment"
                                  className="
                                    text-red-500
                                    hover:text-red-700
                                    hover:bg-red-50
                                    p-1
                                    rounded-lg
                                    transition-colors
                                    cursor-pointer
                                    disabled:opacity-50
                                    shrink-0
                                  "
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            <p
                              className="
                                text-xs
                                text-[#12221d]
                                leading-5
                                mt-1
                                whitespace-pre-wrap
                                break-words
                              "
                            >
                              {comment.content}
                            </p>
                          </div>

                          <p
                            className="
                              text-[10px]
                              text-[#68756f]
                              mt-1
                              ml-1
                            "
                          >
                            {formatCommentDate(
                              comment.createdAt || comment.created_at
                            )}
                          </p>
                        </div>
                      </motion.div>
                    );
                  }
                )

              )}

            </div>

            {/* ADD COMMENT */}

            <form
              onSubmit={
                handleAddComment
              }
              className="
                p-5
                mt-2
                border-t
                border-[#dfe7e2]
                flex
                gap-2
              "
            >

              <input
                type="text"
                value={commentText}
                onChange={(event) =>
                  setCommentText(
                    event.target.value
                  )
                }
                placeholder="Write a comment..."
                disabled={
                  commentSubmitting
                }
                maxLength={1000}
                className="
                  flex-1
                  min-w-0
                  px-3.5
                  py-2.5
                  rounded-xl
                  bg-white
                  border
                  border-[#dfe7e2]
                  text-xs
                  outline-none
                  focus:border-[#19714e]
                  focus:ring-2
                  focus:ring-[#19714e]/20
                "
              />

              <motion.button
                type="submit"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.04 }}
                disabled={
                  commentSubmitting ||
                  !commentText.trim()
                }
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-[#123c2c]
                  hover:bg-[#19714e]
                  text-white
                  flex
                  items-center
                  justify-center
                  shrink-0
                  disabled:opacity-50
                  cursor-pointer
                  transition-colors
                  shadow-xs
                "
              >

                {commentSubmitting ? (

                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                ) : (

                  <Send
                    size={15}
                  />

                )}

              </motion.button>

            </form>

          </motion.div>
        )}
      </AnimatePresence>

    </motion.article>

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {showDeleteConfirm && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/40
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              w-full
              max-w-sm
              bg-white
              rounded-2xl
              p-5
              shadow-2xl
            "
          >

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
                  text-sm
                  font-bold
                  text-[#12221d]
                "
              >
                Delete Post
              </h3>

              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(
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
                <X size={16} />
              </button>

            </div>

            <p
              className="
                text-xs
                leading-5
                text-[#68756f]
              "
            >
              Are you sure you want to
              delete this post? This
              action cannot be undone.
            </p>

            {deleteError && (

              <div
                className="
                  mt-3
                  px-3
                  py-2.5
                  rounded-xl
                  bg-red-50
                  border
                  border-red-200
                  text-red-600
                  text-xs
                  font-semibold
                "
              >
                {deleteError}
              </div>

            )}

            <div
              className="
                mt-5
                flex
                gap-2
              "
            >

              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
                disabled={
                  deleteLoading
                }
                className="
                  flex-1
                  py-2.5
                  rounded-xl
                  border
                  border-[#dfe7e2]
                  text-xs
                  font-bold
                  text-[#68756f]
                  hover:bg-[#f7faf8]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeletePost
                }
                disabled={
                  deleteLoading
                }
                className="
                  flex-1
                  py-2.5
                  rounded-xl
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  text-xs
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-50
                "
              >

                {deleteLoading ? (

                  <>
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />

                    Deleting...
                  </>

                ) : (

                  <>
                    <Trash2
                      size={14}
                    />

                    Delete
                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ======================================================
          USER PROFILE MODAL
      ====================================================== */}
      {isProfileModalOpen && activeProfileUserId && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setActiveProfileUserId(null);
            setActiveProfileInitialUser(null);
          }}
          userId={activeProfileUserId}
          initialUser={activeProfileInitialUser}
          onFollowToggle={handleModalFollowToggle}
        />
      )}

    </>
  );
}