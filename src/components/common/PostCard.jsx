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

import {
  useEffect,
  useState,
} from "react";

import socialService from "../../services/socialService";
import UserHeader from "./UserHeader";
import UserProfileModal from "./UserProfileModal";

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

    if (
      followLoading ||
      !post?.userId ||
      isMyPost
    ) {
      return;
    }

    try {

      setFollowLoading(true);
      setFollowError("");

      if (isFollowing) {

        await socialService.unfollowUser(
          post.userId
        );

        setIsFollowing(false);

        console.log(
          "UNFOLLOW SUCCESS:",
          post.userId
        );

      } else {

        await socialService.followUser(
          post.userId
        );

        setIsFollowing(true);

        console.log(
          "FOLLOW SUCCESS:",
          post.userId
        );
      }

    } catch (error) {

      console.error(
        "FOLLOW / UNFOLLOW ERROR:",
        error
      );

      setFollowError(
        error?.message ||
          "Unable to update follow status."
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
      <article
        className="
          bg-white
          border
          border-[#dfe7e2]
          rounded-3xl
          overflow-hidden
          shadow-xs
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
          <div className="px-5 pb-5">

            <img
              src={post.imageUrl}
              alt="Post"
              className="
                w-full
                max-h-[500px]
                object-cover
                rounded-2xl
              "
              onError={(event) => {

                event.currentTarget.style.display =
                  "none";

              }}
            />

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

          <span>
            {likeCount}{" "}
            {likeCount === 1
              ? "like"
              : "likes"}
          </span>

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

          {/* LIKE */}

          <button
            type="button"
            disabled={likeLoading}
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
              transition-all
              disabled:opacity-50

              ${
                liked
                  ? "bg-red-50 text-red-600"
                  : "text-[#68756f] hover:bg-[#f7faf8]"
              }
            `}
          >

            {likeLoading ? (

              <Loader2
                size={16}
                className="animate-spin"
              />

            ) : (

              <Heart
                size={16}
                fill={
                  liked
                    ? "currentColor"
                    : "none"
                }
              />

            )}

            {liked
              ? "Liked"
              : "Like"}

          </button>

          {/* COMMENT */}

          <button
            type="button"
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

              ${
                showComments
                  ? "bg-[#f7faf8] text-[#19714e]"
                  : "text-[#68756f] hover:bg-[#f7faf8]"
              }
            `}
          >

            <MessageCircle
              size={16}
            />

            Comment

          </button>

        </div>

        {/* ====================================================
            COMMENTS
        ==================================================== */}

        {showComments && (

          <div
            className="
              border-t
              border-[#dfe7e2]
              bg-[#fbfcfb]
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

                <div
                  className="
                    py-6
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-xs
                    text-[#68756f]
                  "
                >

                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Loading comments...

                </div>

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
                      <div
                        key={comment.id || comment._id || Math.random()}
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
                      </div>
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

              <button
                type="submit"
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

              </button>

            </form>

          </div>
        )}

      </article>

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