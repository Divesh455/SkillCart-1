import {
  Heart,
  MessageCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import socialService from "../../services/socialService";


export default function PostCard({
  post,
}) {

  const [liked, setLiked] =
    useState(
      Boolean(post.likedByMe)
    );

  const [likeCount, setLikeCount] =
    useState(
      post.likeCount || 0
    );

  const [likeLoading, setLikeLoading] =
    useState(false);


  // =====================================
  // LIKE / UNLIKE
  // =====================================

  const handleLike = async () => {

    if (likeLoading) {
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
  // DATE
  // =====================================

  const formattedDate =
    post.createdAt
      ? new Date(
          post.createdAt
        ).toLocaleString()
      : "";


  return (
    <article className="bg-white border border-[#dfe7e2] rounded-3xl overflow-hidden shadow-xs">


      {/* ================================
          POST HEADER
      ================================= */}

      <div className="p-5 flex items-center gap-3">

        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] flex items-center justify-center font-bold">

          U

        </div>


        <div>

          <p className="text-sm font-bold">
            User
          </p>

          <p className="text-[11px] text-[#68756f]">
            {formattedDate}
          </p>

        </div>

      </div>


      {/* ================================
          POST CONTENT
      ================================= */}

      {post.content && (

        <div className="px-5 pb-5">

          <p className="text-sm leading-6 whitespace-pre-wrap">
            {post.content}
          </p>

        </div>

      )}


      {/* ================================
          POST IMAGE
      ================================= */}

      {post.imageUrl && (

        <div className="px-5 pb-5">

          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full max-h-[500px] object-cover rounded-2xl"
          />

        </div>

      )}


      {/* ================================
          COUNTS
      ================================= */}

      <div className="px-5 py-3 border-t border-[#dfe7e2] flex justify-between text-xs text-[#68756f]">

        <span>
          {likeCount} likes
        </span>

        <span>
          {post.commentCount || 0} comments
        </span>

      </div>


      {/* ================================
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

          <Heart
            size={16}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />

          {liked
            ? "Liked"
            : "Like"}

        </button>


        {/* COMMENT */}

        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold text-[#68756f] hover:bg-[#f7faf8]"
        >

          <MessageCircle
            size={16}
          />

          Comment

        </button>

      </div>

    </article>
  );
}