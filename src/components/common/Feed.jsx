import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Send, Sparkles, Filter } from "lucide-react";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { dummyPosts } from "../../data/dummyPosts";
import { useAuth } from "../../context/AuthContext";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(dummyPosts);
  const [newPostText, setNewPostText] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const handleFilterChange = (tag) => {
    if (tag === filterTag) return;
    setFilterTag(tag);
    setIsFilterLoading(true);
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 400);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const createdPost = {
      id: "post_user_" + Date.now(),
      author: {
        name: user?.username || "You",
        handle: `@${(user?.username || "you").toLowerCase().replace(/\s+/g, "")}`,
        role: "SkillCart Member",
        initials: (user?.username || "Y").substring(0, 2).toUpperCase(),
        avatarBg: "bg-[#123c2c]",
      },
      timestamp: "Just now",
      content: newPostText.trim(),
      image: null,
      likesCount: 0,
      commentsCount: 0,
      tags: ["CareerUpdate"],
    };

    setPosts([createdPost, ...posts]);
    setNewPostText("");
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      




      {/* ── Posts List with Staggered Framer Motion Animation ── */}
      <div className="flex flex-col gap-4">
        {isFilterLoading ? (
          <PostCardSkeleton count={3} />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="space-y-4"
          >
            {posts.map((post) => (
              <motion.div
                key={post.id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* End of Feed Banner */}
      <div className="py-6 text-center text-xs font-semibold text-[#68756f] border-t border-[#dfe7e2]/60 mt-2">
        🎉 You are all caught up for today!
      </div>

    </div>
  );
}
