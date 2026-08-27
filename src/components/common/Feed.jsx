import {
  useEffect,
  useState,
} from "react";

import {
  RefreshCw,
  Loader2,
} from "lucide-react";

import socialService from "../../services/socialService";

import PostCard from "./PostCard";


// ============================================================
// GET USER ID FROM JWT
// ============================================================

function getUserIdFromToken() {
  try {
    const token =
      localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const payload =
      JSON.parse(
        atob(token.split(".")[1])
      );

    console.log(
      "JWT PAYLOAD:",
      payload
    );

    return (
      payload?.userId ||
      null
    );
  } catch (error) {
    console.error(
      "JWT DECODE ERROR:",
      error
    );

    return null;
  }
}


// ============================================================
// FEED COMPONENT
// ============================================================

export default function Feed({
  newPost,
}) {
  // ==========================================================
  // POSTS
  // ==========================================================

  const [posts, setPosts] =
    useState([]);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  // ==========================================================
  // ERROR
  // ==========================================================

  const [error, setError] =
    useState("");

  // ==========================================================
  // LOAD FEED
  // ==========================================================

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError("");

      // ======================================================
      // GET USER UUID FROM JWT
      // ======================================================

      const userId =
        getUserIdFromToken();

      console.log(
        "CURRENT USER ID:",
        userId
      );

      if (!userId) {
        throw new Error(
          "User ID not found in authentication token."
        );
      }

      // ======================================================
      // REQUEST 1
      //
      // POSTS FROM FOLLOWED USERS
      // ======================================================

      let feedResponse = null;

      try {
        feedResponse =
          await socialService.getFeed(
            0,
            20
          );

        console.log(
          "FOLLOWING FEED RESPONSE:",
          feedResponse
        );
      } catch (feedError) {
        console.warn(
          "FOLLOWING FEED FAILED:",
          feedError
        );

        // We don't stop here.
        //
        // Even if following feed fails,
        // we still want the user's own posts.
      }

      // ======================================================
      // REQUEST 2
      //
      // CURRENT USER'S OWN POSTS
      // ======================================================

      let ownPostsResponse = null;

      try {
        ownPostsResponse =
          await socialService.getUserPosts(
            userId,
            0,
            50
          );

        console.log(
          "MY POSTS RESPONSE:",
          ownPostsResponse
        );
      } catch (ownPostsError) {
        console.error(
          "MY POSTS ERROR:",
          ownPostsError
        );

        throw ownPostsError;
      }

      // ======================================================
      // EXTRACT FOLLOWING POSTS
      // ======================================================

      const followingPosts =
        Array.isArray(
          feedResponse?.content
        )
          ? feedResponse.content
          : [];

      // ======================================================
      // EXTRACT MY POSTS
      // ======================================================

      const ownPosts =
        Array.isArray(
          ownPostsResponse?.content
        )
          ? ownPostsResponse.content
          : [];

      console.log(
        "FOLLOWING POSTS:",
        followingPosts
      );

      console.log(
        "MY POSTS:",
        ownPosts
      );

      // ======================================================
      // MERGE POSTS
      // ======================================================

      const allPosts = [
        ...followingPosts,
        ...ownPosts,
      ];

      // ======================================================
      // REMOVE DUPLICATES
      //
      // A post could theoretically appear in both APIs.
      // We keep only one copy using post.id.
      // ======================================================

      const uniquePosts =
        Array.from(
          new Map(
            allPosts.map(
              (post) => [
                post.id,
                post,
              ]
            )
          ).values()
        );

      // ======================================================
      // SORT NEWEST FIRST
      // ======================================================

      uniquePosts.sort(
        (a, b) => {
          const dateA =
            new Date(
              a.createdAt || 0
            ).getTime();

          const dateB =
            new Date(
              b.createdAt || 0
            ).getTime();

          return dateB - dateA;
        }
      );

      console.log(
        "FINAL SOCIAL POSTS:",
        uniquePosts
      );

      // ======================================================
      // SET POSTS
      // ======================================================

      setPosts(
        uniquePosts
      );
    } catch (err) {
      console.error(
        "SOCIAL FEED ERROR:",
        err
      );

      setError(
        err?.message ||
        "Unable to load social feed."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // FIRST LOAD
  // ==========================================================

  useEffect(() => {
    loadFeed();
  }, []);

  // ==========================================================
  // NEW POST CREATED
  //
  // When CreatePostModal creates a post successfully,
  // HomePage sends that real backend response here.
  // ==========================================================

  useEffect(() => {
    if (!newPost) {
      return;
    }

    console.log(
      "NEW POST RECEIVED:",
      newPost
    );

    setPosts(
      (currentPosts) => {
        const alreadyExists =
          currentPosts.some(
            (post) =>
              post.id ===
              newPost.id
          );

        if (alreadyExists) {
          return currentPosts;
        }

        const updatedPosts = [
          newPost,
          ...currentPosts,
        ];

        // Keep newest first
        updatedPosts.sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ).getTime() -
            new Date(
              a.createdAt || 0
            ).getTime()
        );

        return updatedPosts;
      }
    );
  }, [newPost]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    posts.length === 0
  ) {
    return (
      <div className="space-y-4">

        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="
                bg-white
                border
                border-[#dfe7e2]
                rounded-3xl
                p-5
                animate-pulse
              "
            >

              <div className="flex gap-3">

                <div
                  className="
                    w-11
                    h-11
                    rounded-2xl
                    bg-[#dfe7e2]
                  "
                />

                <div className="flex-1">

                  <div
                    className="
                      h-3
                      bg-[#dfe7e2]
                      rounded
                      w-1/3
                    "
                  />

                  <div
                    className="
                      h-3
                      bg-[#dfe7e2]
                      rounded
                      w-1/4
                      mt-2
                    "
                  />

                </div>

              </div>

              <div
                className="
                  h-16
                  bg-[#dfe7e2]
                  rounded-2xl
                  mt-5
                "
              />

            </div>
          )
        )}

      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    posts.length === 0
  ) {
    return (
      <div
        className="
          bg-white
          border
          border-red-200
          rounded-3xl
          p-8
          text-center
        "
      >

        <p
          className="
            text-sm
            font-semibold
            text-red-500
          "
        >
          {error}
        </p>

        <button
          type="button"
          onClick={loadFeed}
          className="
            mt-4
            px-5
            py-2.5
            rounded-2xl
            bg-[#123c2c]
            text-white
            text-xs
            font-bold
          "
        >
          Try Again
        </button>

      </div>
    );
  }

  // ==========================================================
  // EMPTY FEED
  // ==========================================================

  if (
    posts.length === 0
  ) {
    return (
      <div
        className="
          bg-white
          border
          border-[#dfe7e2]
          rounded-3xl
          p-10
          text-center
        "
      >

        <p
          className="
            text-sm
            font-bold
          "
        >
          No posts yet
        </p>

        <p
          className="
            text-xs
            text-[#68756f]
            mt-2
          "
        >
          There are no posts in your feed.
        </p>

        <button
          type="button"
          onClick={loadFeed}
          className="
            mt-4
            p-2.5
            rounded-xl
            border
            border-[#dfe7e2]
          "
        >
          <RefreshCw
            size={16}
          />
        </button>

      </div>
    );
  }

  // ==========================================================
  // FEED
  // ==========================================================

  return (
    <section className="space-y-5">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h2
            className="
              text-lg
              font-bold
            "
          >
            Community Feed
          </h2>

          <p
            className="
              text-xs
              text-[#68756f]
            "
          >
            Latest posts from SkillCart
          </p>

        </div>

        <button
          type="button"
          onClick={loadFeed}
          disabled={loading}
          className="
            p-2.5
            rounded-xl
            bg-white
            border
            border-[#dfe7e2]
            hover:bg-[#f7faf8]
            disabled:opacity-50
          "
          title="Refresh feed"
        >

          {loading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <RefreshCw
              size={16}
            />
          )}

        </button>

      </div>

      {/* ====================================================
          POSTS
      ==================================================== */}

      {posts.map(
        (post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostDeleted={(deletedPostId) => {
              setPosts((currentPosts) =>
                currentPosts.filter(
                  (item) =>
                    item.id !== deletedPostId
                )
              );
            }}
          />
        )
      )}

      {/* ====================================================
          BACKGROUND ERROR
      ==================================================== */}

      {error && (
        <div
          className="
            text-center
            text-xs
            text-red-500
            font-semibold
          "
        >
          {error}
        </div>
      )}

    </section>
  );
}