import {
  Heart,
  MessageCircle,
  Send,
  RefreshCw,
  Loader2,
} from "lucide-react";

import {
  useState,
} from "react";

import socialService from "../../services/socialService";

export default function PostCard({
  post,
}) {
  // =====================================
  // LIKE STATE
  // =====================================

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

  // =====================================
  // COMMENT STATE
  // =====================================

  const [showComments, setShowComments] =
    useState(false);

  const [comments, setComments] =
    useState([]);

  const [commentCount, setCommentCount] =
    useState(
      Number(post?.commentCount || 0)
    );

  const [commentsLoading, setCommentsLoading] =
    useState(false);

  const [commentError, setCommentError] =
    useState("");

  const [commentText, setCommentText] =
    useState("");

  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  // =====================================
  // LIKE / UNLIKE
  // =====================================

  const handleLike = async () => {
    if (
      likeLoading ||
      !post?.id
    ) {
      return;
    }

    try {
      setLikeLoading(true);

      if (liked) {
        await socialService.unlikePost(
          post.id
        );

        setLiked(false);

        setLikeCount(
          (count) =>
            Math.max(
              0,
              count - 1
            )
        );
      } else {
        await socialService.likePost(
          post.id
        );

        setLiked(true);

        setLikeCount(
          (count) =>
            count + 1
        );
      }
    } catch (error) {
      console.error(
        "LIKE ERROR:",
        error
      );
    } finally {
      setLikeLoading(false);
    }
  };

  // =====================================
  // LOAD COMMENTS
  // =====================================

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

      console.log(
        "COMMENTS RESPONSE:",
        response
      );

      const commentList =
        response?.content || [];

      setComments(
        Array.isArray(commentList)
          ? commentList
          : []
      );

      // Use backend total if available
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

  // =====================================
  // TOGGLE COMMENTS
  // =====================================

  const handleCommentToggle = async () => {
    const nextState =
      !showComments;

    setShowComments(
      nextState
    );

    if (
      nextState &&
      comments.length === 0
    ) {
      await loadComments();
    }
  };

  // =====================================
  // ADD COMMENT
  // =====================================

  const handleAddComment = async (
    e
  ) => {
    e.preventDefault();

    const trimmedComment =
      commentText.trim();

    if (
      !trimmedComment ||
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
          trimmedComment
        );

      console.log(
        "COMMENT CREATED:",
        newComment
      );

      // Add new comment immediately
      if (newComment) {
        setComments(
          (currentComments) => [
            ...currentComments,
            newComment,
          ]
        );
      } else {
        // Fallback: reload comments
        await loadComments();
      }

      setCommentCount(
        (count) => count + 1
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

  // =====================================
  // DATE
  // =====================================

  const formattedDate =
    post?.createdAt
      ? new Date(
          post.createdAt
        ).toLocaleString()
      : "";

  // =====================================
  // COMMENT DATE
  // =====================================

  const formatCommentDate = (
    createdAt
  ) => {
    if (!createdAt) {
      return "";
    }

    return new Date(
      createdAt
    ).toLocaleString();
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <article className="bg-white border border-[#dfe7e2] rounded-3xl overflow-hidden shadow-xs">

      {/* =================================
          POST HEADER
      ================================= */}

      <div className="p-5 flex items-center gap-3">

        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] flex items-center justify-center font-bold">
          U
        </div>

        <div>
          <p className="text-sm font-bold">
            SkillCart User
          </p>

          <p className="text-[11px] text-[#68756f]">
            {formattedDate}
          </p>
        </div>

      </div>

      {/* =================================
          POST CONTENT
      ================================= */}

      {post?.content && (
        <div className="px-5 pb-5">
          <p className="text-sm leading-6 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      )}

      {/* =================================
          POST IMAGE
      ================================= */}

      {post?.imageUrl && (
        <div className="px-5 pb-5">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full max-h-[500px] object-cover rounded-2xl"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        </div>
      )}

      {/* =================================
          COUNTS
      ================================= */}

      <div className="px-5 py-3 border-t border-[#dfe7e2] flex justify-between text-xs text-[#68756f]">

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

      {/* =================================
          ACTIONS
      ================================= */}

      <div className="px-5 py-3 border-t border-[#dfe7e2] flex gap-2">

        {/* LIKE */}

        <button
          type="button"
          disabled={likeLoading}
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold ${
            liked
              ? "bg-red-50 text-red-600"
              : "hover:bg-[#f7faf8] text-[#68756f]"
          }`}
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
            handleCommentToggle
          }
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold ${
            showComments
              ? "bg-[#f7faf8] text-[#19714e]"
              : "text-[#68756f] hover:bg-[#f7faf8]"
          }`}
        >
          <MessageCircle
            size={16}
          />

          Comment
        </button>

      </div>

      {/* =================================
          COMMENTS SECTION
      ================================= */}

      {showComments && (
        <div className="border-t border-[#dfe7e2] bg-[#fbfcfb]">

          {/* COMMENTS HEADER */}

          <div className="px-5 pt-4 pb-3 flex items-center justify-between">

            <div>
              <p className="text-sm font-bold text-[#12221d]">
                Comments
              </p>

              <p className="text-[11px] text-[#68756f]">
                {commentCount}{" "}
                {commentCount === 1
                  ? "comment"
                  : "comments"}
              </p>
            </div>

            <button
              type="button"
              onClick={loadComments}
              disabled={
                commentsLoading
              }
              className="p-2 rounded-xl border border-[#dfe7e2] bg-white hover:bg-[#f7faf8] text-[#68756f]"
              title="Refresh comments"
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
            <div className="mx-5 mb-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {commentError}
            </div>
          )}

          {/* COMMENTS LIST */}

          <div className="px-5 space-y-3 max-h-[350px] overflow-y-auto">

            {commentsLoading &&
            comments.length === 0 ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#68756f]">
                <Loader2
                  size={15}
                  className="animate-spin"
                />
                Loading comments...
              </div>
            ) : comments.length ===
              0 ? (
              <div className="py-6 text-center">
                <MessageCircle
                  size={22}
                  className="mx-auto text-[#68756f]"
                />

                <p className="text-xs font-semibold text-[#68756f] mt-2">
                  No comments yet
                </p>

                <p className="text-[11px] text-[#68756f] mt-1">
                  Be the first to comment.
                </p>
              </div>
            ) : (
              comments.map(
                (comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3"
                  >

                    {/* COMMENT AVATAR */}

                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] flex items-center justify-center text-[10px] font-bold shrink-0">
                      U
                    </div>

                    {/* COMMENT BODY */}

                    <div className="flex-1 min-w-0">

                      <div className="bg-white border border-[#dfe7e2] rounded-2xl px-3.5 py-2.5">

                        <p className="text-xs font-bold text-[#12221d]">
                          SkillCart User
                        </p>

                        <p className="text-xs text-[#12221d] leading-5 mt-1 whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>

                      </div>

                      <p className="text-[10px] text-[#68756f] mt-1 ml-1">
                        {formatCommentDate(
                          comment.createdAt
                        )}
                      </p>

                    </div>

                  </div>
                )
              )
            )}

          </div>

          {/* =================================
              ADD COMMENT
          ================================= */}

          <form
            onSubmit={
              handleAddComment
            }
            className="p-5 mt-2 border-t border-[#dfe7e2] flex gap-2"
          >

            <input
              type="text"
              value={commentText}
              onChange={(e) =>
                setCommentText(
                  e.target.value
                )
              }
              placeholder="Write a comment..."
              disabled={
                commentSubmitting
              }
              maxLength={1000}
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-white border border-[#dfe7e2] text-xs text-[#12221d] placeholder-[#68756f]/60 outline-none focus:border-[#19714e] focus:ring-2 focus:ring-[#19714e]/20"
            />

            <button
              type="submit"
              disabled={
                commentSubmitting ||
                !commentText.trim()
              }
              className="w-10 h-10 rounded-xl bg-[#123c2c] hover:bg-[#19714e] text-white flex items-center justify-center shrink-0 disabled:opacity-50"
              title="Post comment"
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
  );
}