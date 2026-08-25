import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Heart,
  Send,
  Check,
} from "lucide-react";

/**
 * Color map for hashtags / category pills
 */
function getTagStyle(tag = "") {
  const tagLower = tag.toLowerCase();
  if (tagLower.includes("hiring") || tagLower.includes("job")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (tagLower.includes("update") || tagLower.includes("career")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  }
  if (tagLower.includes("tip") || tagLower.includes("tech")) {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([
    { id: 1, author: "Sarah Lin", text: "Great insights! Simplifying forms really boosts conversion.", time: "1h ago" },
    { id: 2, author: "Alex Morgan", text: "Totally agree on focusing on user clarity over complex layouts.", time: "30m ago" },
  ]);
  const [newComment, setNewComment] = useState("");
  const [copiedShare, setCopiedShare] = useState(false);

  const handleLikeToggle = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleBookmarkToggle = () => {
    setBookmarked(!bookmarked);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentsList((prev) => [
      ...prev,
      { id: Date.now(), author: "You", text: newComment.trim(), time: "Just now" },
    ]);
    setNewComment("");
  };

  const handleShare = () => {
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.003, transition: { duration: 0.2 } }}
      className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:shadow-[#123c2c]/5 hover:border-[#19714e]/40 transition-all"
    >
      {/* Post Header: Avatar, Author Info, Time & Actions */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3.5">
          {/* User Avatar */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 3 }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md border border-white/20 ${
              post.author.avatarBg || "bg-gradient-to-br from-[#123c2c] to-[#19714e]"
            }`}
          >
            {post.author.initials || "U"}
          </motion.div>

          {/* Author Meta */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#12221d] hover:text-[#19714e] cursor-pointer transition-colors font-['Space_Grotesk']">
                {post.author.name}
              </span>
              <span className="text-xs text-[#68756f]">{post.author.handle}</span>
              <span className="text-xs text-[#68756f]/40">•</span>
              <span className="text-xs text-[#68756f] font-mono">{post.timestamp}</span>
            </div>
            <span className="text-xs text-[#68756f] line-clamp-1 mt-0.5 font-medium">
              {post.author.role}
            </span>
          </div>
        </div>

        {/* More Options */}
        <button className="text-[#68756f] hover:text-[#12221d] p-2 rounded-xl hover:bg-[#f7faf8] transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Post Content */}
      <div className="text-xs sm:text-sm text-[#12221d] leading-relaxed whitespace-pre-line mb-4 font-normal">
        {post.content}
      </div>

      {/* Optional Hashtags / Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => {
            const tagStyle = getTagStyle(tag);
            return (
              <motion.span
                whileHover={{ scale: 1.08 }}
                key={tag}
                className={`text-[11px] font-bold px-3 py-1 rounded-xl border transition-all cursor-pointer ${tagStyle}`}
              >
                #{tag}
              </motion.span>
            );
          })}
        </div>
      )}

      {/* Optional Image Attachment */}
      {post.image && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-[#dfe7e2] bg-[#f7faf8] max-h-96 shadow-inner">
          <img
            src={post.image}
            alt="Post media attachment"
            className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Interactions Bar (Like, Comment, Share, Bookmark) */}
      <div className="pt-3.5 border-t border-[#dfe7e2]/70 flex items-center justify-between text-xs text-[#68756f]">
        
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Like Button with Animated Heart Spring */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all duration-200 ${
              liked
                ? "bg-rose-50 text-rose-600 border-rose-200 font-bold shadow-xs"
                : "bg-[#f7faf8] border-[#dfe7e2] hover:bg-white hover:text-[#12221d]"
            }`}
          >
            <motion.div animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}>
              <Heart
                size={15}
                className={liked ? "fill-rose-500 text-rose-500" : ""}
              />
            </motion.div>
            <span>{likesCount}</span>
            <span className="hidden sm:inline">Likes</span>
          </motion.button>

          {/* Comment Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all duration-200 ${
              showComments
                ? "bg-[#dff8eb] text-[#19714e] border-[#19714e]/30 font-bold"
                : "bg-[#f7faf8] border-[#dfe7e2] hover:bg-white hover:text-[#19714e]"
            }`}
          >
            <MessageSquare size={15} />
            <span>{commentsList.length}</span>
            <span className="hidden sm:inline">Comments</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-1">
          {/* Share */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className={`p-2 rounded-xl transition-colors ${
              copiedShare ? "bg-[#dff8eb] text-[#19714e]" : "text-[#68756f] hover:bg-[#f7faf8] hover:text-[#12221d]"
            }`}
            title="Share post"
          >
            {copiedShare ? <Check size={16} /> : <Share2 size={16} />}
          </motion.button>

          {/* Bookmark */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-xl transition-all ${
              bookmarked
                ? "text-[#19714e] bg-[#dff8eb]"
                : "text-[#68756f] hover:bg-[#f7faf8] hover:text-[#12221d]"
            }`}
            title="Save post"
          >
            <Bookmark size={16} className={bookmarked ? "fill-[#19714e]" : ""} />
          </motion.button>
        </div>

      </div>

      {/* ── EXPANDABLE COMMENTS DRAWER WITH FRAMER MOTION ── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden pt-4 mt-4 border-t border-[#dfe7e2]/70 space-y-3"
          >
            <span className="text-xs font-bold text-[#12221d] block">
              Comments ({commentsList.length})
            </span>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 py-2 px-3 text-xs bg-[#f7faf8] border border-[#dfe7e2] rounded-xl outline-none focus:border-[#19714e] focus:bg-white transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 rounded-xl bg-[#123c2c] text-white text-xs font-bold disabled:opacity-40"
              >
                <Send size={13} />
              </motion.button>
            </form>

            {/* Comments List */}
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none pt-1">
              {commentsList.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-[#f7faf8] border border-[#dfe7e2]/60 text-xs space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-[#12221d]">
                    <span>{c.author}</span>
                    <span className="text-[10px] text-[#68756f] font-mono">{c.time}</span>
                  </div>
                  <p className="text-[#52615a]">{c.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.article>
  );
}
