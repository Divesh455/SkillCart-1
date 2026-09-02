import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, Loader2, Globe, Users } from "lucide-react";
import socialService from "../../services/socialService";
import PostCard from "./PostCard";

function getUserIdFromToken() {
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
    if (
      !token ||
      typeof token !== "string" ||
      !token.includes(".") ||
      token === "null" ||
      token === "undefined"
    ) {
      return null;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload?.userId ||
      payload?.id ||
      (payload?.sub && !isNaN(payload?.sub) ? payload?.sub : payload?.sub) ||
      null
    );
  } catch (error) {
    console.error("JWT DECODE ERROR:", error);
    return null;
  }
}

export default function Feed({ newPost }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const feedType = searchParams.get("feed");
  const activeTab = feedType === "following" ? "following" : "all";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleTabChange = (newTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newTab === "all") {
        next.delete("feed");
      } else {
        next.set("feed", newTab);
      }
      return next;
    });
  };

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserIdFromToken();

      let targetResponse = null;

      if (activeTab === "following") {
        // ONLY posts from followed users via /api/social/posts/my
        try {
          targetResponse = await socialService.getMyFollowingPosts(0, 50);
        } catch (err) {
          console.warn("getMyFollowingPosts API error:", err);
          targetResponse = [];
        }

        const fetchedPosts = Array.isArray(targetResponse?.content)
          ? targetResponse.content
          : Array.isArray(targetResponse)
          ? targetResponse
          : targetResponse?.items || targetResponse?.data || [];

        const uniquePosts = Array.from(
          new Map(fetchedPosts.map((post) => [post.id || post._id, post])).values()
        );

        uniquePosts.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateB - dateA;
        });

        setPosts(uniquePosts);
      } else {
        // All public posts
        try {
          targetResponse = await socialService.getAllPosts(0, 50);
        } catch (err) {
          console.warn("ALL POSTS FEED FAILED:", err);
        }

        let ownPostsResponse = null;
        if (userId) {
          try {
            ownPostsResponse = await socialService.getUserPosts(userId, 0, 50);
          } catch (err) {
            console.warn("MY POSTS ERROR:", err);
          }
        }

        const fetchedPosts = Array.isArray(targetResponse?.content)
          ? targetResponse.content
          : Array.isArray(targetResponse)
          ? targetResponse
          : targetResponse?.items || targetResponse?.data || [];

        const ownPosts = Array.isArray(ownPostsResponse?.content)
          ? ownPostsResponse.content
          : Array.isArray(ownPostsResponse)
          ? ownPostsResponse
          : [];

        const allCombined = [...fetchedPosts, ...ownPosts];

        const uniquePosts = Array.from(
          new Map(allCombined.map((post) => [post.id || post._id, post])).values()
        );

        uniquePosts.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateB - dateA;
        });

        setPosts(uniquePosts);
      }
    } catch (err) {
      console.error("SOCIAL FEED ERROR:", err);
      if (activeTab !== "following") {
        setError(err?.message || "Unable to load social feed.");
      } else {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (!newPost) return;
    setPosts((currentPosts) => {
      const alreadyExists = currentPosts.some(
        (post) => String(post.id || post._id) === String(newPost.id || newPost._id)
      );
      if (alreadyExists) return currentPosts;
      const updated = [newPost, ...currentPosts];
      updated.sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0).getTime() -
          new Date(a.createdAt || a.created_at || 0).getTime()
      );
      return updated;
    });
  }, [newPost]);

  return (
    <section className="space-y-5">
      {/* TABS HEADER: All Posts vs Following */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white border border-[#dfe7e2] rounded-3xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 bg-[#f7faf8] border border-[#dfe7e2] p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "all"
                ? "bg-[#123c2c] text-white shadow-xs"
                : "text-[#68756f] hover:text-[#12221d] hover:bg-white"
            }`}
          >
            <Globe size={15} />
            <span>Gigs</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("following")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "following"
                ? "bg-[#123c2c] text-white shadow-xs"
                : "text-[#68756f] hover:text-[#12221d] hover:bg-white"
            }`}
          >
            <Users size={15} />
            <span>Circle</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#68756f] font-semibold hidden sm:inline-block">
            {activeTab === "following"
              ? "Posts from people you follow"
              : "All community posts"}
          </span>
          <button
            type="button"
            onClick={loadFeed}
            disabled={loading}
            className="p-2 rounded-xl bg-[#f7faf8] border border-[#dfe7e2] hover:bg-white text-[#19714e] disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
            title="Refresh feed"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-[#19714e]" />
            ) : (
              <RefreshCw size={16} className="text-[#19714e]" />
            )}
          </button>
        </div>
      </div>

      {/* LOADING SKELETON */}
      {loading && posts.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white border border-[#dfe7e2] rounded-3xl p-5 animate-pulse"
            >
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#dfe7e2]" />
                <div className="flex-1">
                  <div className="h-3 bg-[#dfe7e2] rounded w-1/3" />
                  <div className="h-3 bg-[#dfe7e2] rounded w-1/4 mt-2" />
                </div>
              </div>
              <div className="h-16 bg-[#dfe7e2] rounded-2xl mt-5" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR INITIAL */}
      {!loading && error && posts.length === 0 && activeTab !== "following" && (
        <div className="bg-white border border-red-200 rounded-3xl p-8 text-center">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          <button
            type="button"
            onClick={loadFeed}
            className="mt-4 px-5 py-2.5 rounded-2xl bg-[#123c2c] text-white text-xs font-bold"
          >
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY FEED */}
      {!loading && posts.length === 0 && (activeTab === "following" || !error) && (
        <div className="bg-white border border-[#dfe7e2] rounded-3xl p-10 text-center space-y-2">
          <p className="text-base font-bold font-['Space_Grotesk'] text-[#12221d]">
            {activeTab === "following"
              ? "You are not follow any one"
              : "No posts yet"}
          </p>
          <p className="text-xs text-[#68756f]">
            {activeTab === "following"
              ? "Follow other users from the People to Follow section to see their posts here."
              : "Be the first to share a post with the community!"}
          </p>
          <button
            type="button"
            onClick={loadFeed}
            className="mt-4 p-2.5 rounded-xl border border-[#dfe7e2] hover:bg-[#f7faf8] transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className="text-[#19714e]" />
          </button>
        </div>
      )}

      {/* POSTS LIST */}
      {posts.map((post) => (
        <PostCard
          key={post.id || post._id}
          post={post}
          onPostDeleted={(deletedPostId) => {
            setPosts((currentPosts) =>
              currentPosts.filter(
                (item) => String(item.id || item._id) !== String(deletedPostId)
              )
            );
          }}
        />
      ))}

      {/* ERROR IN BACKGROUND */}
      {error && posts.length > 0 && (
        <div className="text-center text-xs text-red-500 font-semibold">
          {error}
        </div>
      )}
    </section>
  );
}