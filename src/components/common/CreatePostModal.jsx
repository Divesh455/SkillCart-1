import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image as ImageIcon,
  Briefcase,
  Send,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("CareerUpdate");
  const [imagePreview, setImagePreview] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !imagePreview) return;

    setIsPublishing(true);

    setTimeout(() => {
      const newPost = {
        id: "post_user_" + Date.now(),
        author: {
          name: user?.username || "Developer",
          handle: `@${(user?.username || "user").toLowerCase().replace(/\s+/g, "")}`,
          role: "Software Engineer",
          initials: (user?.username || "US").substring(0, 2).toUpperCase(),
          avatarBg: "bg-[#123c2c]",
        },
        timestamp: "Just now",
        content: content.trim(),
        image: imagePreview,
        likesCount: 0,
        commentsCount: 0,
        tags: [selectedTag],
      };

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      setIsPublishing(false);
      setContent("");
      setImagePreview(null);
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#0e1d18]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-[#dfe7e2] shadow-2xl overflow-hidden relative flex flex-col my-auto max-h-[90vh]"
        >
          {/* Top Accent Gradient Bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#123c2c] via-[#19714e] to-[#b9ef84] w-full shrink-0" />

          {/* Modal Header */}
          <div className="p-3.5 sm:p-5 border-b border-[#dfe7e2] flex items-center justify-between bg-[#f7faf8] shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#123c2c] to-[#19714e] text-[#b9ef84] font-bold text-xs flex items-center justify-center shadow-xs font-['Space_Grotesk'] shrink-0">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : "US"}
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#12221d] font-['Space_Grotesk'] leading-tight">
                  Create Community Post
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#68756f]">Share updates, photos, or job referrals</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#dfe7e2] text-[#68756f] hover:text-[#12221d] flex items-center justify-center shadow-2xs transition-colors shrink-0"
            >
              <X size={15} />
            </motion.button>
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
            {/* Post Content Textarea */}
            <textarea
              rows={3}
              placeholder="What's on your mind? Share a job opening, career update, or ask a question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs sm:text-sm text-[#12221d] placeholder-[#68756f]/60 bg-[#f7faf8] border border-[#dfe7e2] rounded-xl sm:rounded-2xl p-3 sm:p-4 outline-none resize-none focus:border-[#19714e] focus:bg-white focus:ring-2 focus:ring-[#19714e]/20 transition-all leading-relaxed"
            />

            {/* Attached Photo Preview Container */}
            {imagePreview && (
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-[#dfe7e2] bg-[#f7faf8] max-h-52 sm:max-h-64 shadow-inner group">
                <img
                  src={imagePreview}
                  alt="Post attachment preview"
                  className="w-full h-full object-cover max-h-52 sm:max-h-64"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#12221d]/80 text-white hover:bg-rose-600 transition-colors shadow-md backdrop-blur-sm"
                  title="Remove Image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* Tag Selection Chips */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
              <span className="text-[11px] font-bold text-[#68756f] shrink-0">Tag:</span>
              {[
                { id: "JobHiring", label: "Job Referral" },
                { id: "CareerUpdate", label: "Career Update" },
                { id: "TechTips", label: "Tech Tip" },
              ].map((tag) => (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold rounded-xl transition-all shrink-0 border ${
                    selectedTag === tag.id
                      ? "bg-[#19714e] text-white border-[#19714e] shadow-xs"
                      : "bg-[#f7faf8] text-[#68756f] border-[#dfe7e2] hover:bg-white"
                  }`}
                >
                  #{tag.label}
                </button>
              ))}
            </div>

            {/* Media Upload & Action Footer */}
            <div className="pt-3 border-t border-[#dfe7e2] flex items-center justify-between gap-2 shrink-0">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Upload Photo Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#f7faf8] border border-[#dfe7e2] text-xs font-bold text-[#19714e] hover:bg-[#dff8eb] transition-colors shadow-2xs"
                >
                  <ImageIcon size={15} />
                  <span className="text-[11px] sm:text-xs">{imagePreview ? "Change Photo" : "Add Photo"}</span>
                </motion.button>

                {/* Job Referral Tag Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setSelectedTag("JobHiring")}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#f7faf8] border border-[#dfe7e2] text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-2xs hidden xs:inline-flex"
                >
                  <Briefcase size={14} />
                  <span className="text-[11px] sm:text-xs">Referral</span>
                </motion.button>
              </div>

              {/* Publish Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isPublishing || (!content.trim() && !imagePreview)}
                className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 bg-[#123c2c] hover:bg-[#19714e] text-white font-bold rounded-xl text-xs shadow-md shadow-[#123c2c]/15 transition-all disabled:opacity-50"
              >
                <span>{isPublishing ? "Publishing..." : "Publish Post"}</span>
                <Send size={13} />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
