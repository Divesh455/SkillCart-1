import {
  useEffect,
  useState,
} from "react";

import {
  RefreshCw,
} from "lucide-react";

import socialService from "../../services/socialService";

import PostCard from "./PostCard";


export default function Feed() {

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================
  // GET FEED
  // =====================================

  const loadFeed = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await socialService.getFeed(
          0,
          10
        );

      console.log(
        "SOCIAL FEED RESPONSE:",
        response
      );

      /*
        Spring Page response normally looks like:

        {
          content: [],
          totalPages: 1,
          totalElements: 10,
          size: 10,
          number: 0
        }
      */

      const feedPosts =
        response?.content ||
        response?.items ||
        [];

      setPosts(
        Array.isArray(feedPosts)
          ? feedPosts
          : []
      );

    } catch (err) {

      console.error(
        "SOCIAL FEED ERROR:",
        err
      );

      setError(
        err.message ||
        "Unable to load social feed."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================
  // FIRST LOAD
  // =====================================

  useEffect(() => {

    loadFeed();

  }, []);


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (
      <div className="space-y-4">

        {[1, 2, 3].map(
          (item) => (

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

          )
        )}

      </div>
    );
  }


  // =====================================
  // ERROR
  // =====================================

  if (error) {

    return (
      <div className="bg-white border border-red-200 rounded-3xl p-8 text-center">

        <p className="text-sm font-semibold text-red-500">
          {error}
        </p>

        <button
          type="button"
          onClick={loadFeed}
          className="mt-4 px-5 py-2.5 rounded-2xl bg-[#123c2c] text-white text-xs font-bold"
        >
          Try Again
        </button>

      </div>
    );
  }


  // =====================================
  // EMPTY FEED
  // =====================================

  if (posts.length === 0) {

    return (
      <div className="bg-white border border-[#dfe7e2] rounded-3xl p-10 text-center">

        <p className="text-sm font-bold">
          No posts yet
        </p>

        <p className="text-xs text-[#68756f] mt-2">
          There are no posts in your feed.
        </p>

        <button
          type="button"
          onClick={loadFeed}
          className="mt-4 p-2.5 rounded-xl border border-[#dfe7e2]"
        >

          <RefreshCw size={16} />

        </button>

      </div>
    );
  }


  // =====================================
  // FEED
  // =====================================

  return (
    <section className="space-y-5">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-bold">
            Community Feed
          </h2>

          <p className="text-xs text-[#68756f]">
            Latest posts from SkillCart
          </p>

        </div>

        <button
          type="button"
          onClick={loadFeed}
          className="p-2.5 rounded-xl bg-white border border-[#dfe7e2] hover:bg-[#f7faf8]"
        >

          <RefreshCw size={16} />

        </button>

      </div>


      {posts.map(
        (post) => (

          <PostCard
            key={post.id}
            post={post}
          />

        )
      )}

    </section>
  );
}