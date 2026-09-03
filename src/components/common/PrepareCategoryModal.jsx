import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BrainCircuit,
  Wrench,
  Users2,
  Sparkles,
  Code2,
  Building,
  ArrowRight,
  Briefcase,
} from "lucide-react";

export const PREPARE_CATEGORIES = [
  {
    id: "Technical",
    label: "Technical",
    icon: Wrench,
    badge: "Most Popular",
    color: "from-blue-600 to-indigo-700",
    bgLight: "bg-blue-50",
    textCol: "text-blue-700",
    borderCol: "border-blue-200",
    description: "Role-specific technical skills, system design, architectural concepts & core domain questions.",
  },
  {
    id: "HR",
    label: "HR",
    icon: Users2,
    badge: "Essential",
    color: "from-emerald-600 to-teal-700",
    bgLight: "bg-emerald-50",
    textCol: "text-emerald-700",
    borderCol: "border-emerald-200",
    description: "Culture fit, salary expectations, motivation, career aspirations & communication.",
  },
  {
    id: "Behavioral",
    label: "Behavioral",
    icon: Sparkles,
    badge: "STAR Method",
    color: "from-purple-600 to-pink-700",
    bgLight: "bg-purple-50",
    textCol: "text-purple-700",
    borderCol: "border-purple-200",
    description: "Past experience, conflict resolution, leadership scenarios, adaptability & resilience.",
  },
  {
    id: "Coding",
    label: "Coding",
    icon: Code2,
    badge: "Hands-on",
    color: "from-amber-600 to-orange-700",
    bgLight: "bg-amber-50",
    textCol: "text-amber-700",
    borderCol: "border-amber-200",
    description: "Algorithm challenges, data structures, debugging logic & clean code practices.",
  },
  {
    id: "Company",
    label: "Company",
    icon: Building,
    badge: "Domain Fit",
    color: "from-[#123c2c] to-[#19714e]",
    bgLight: "bg-[#dff8eb]",
    textCol: "text-[#19714e]",
    borderCol: "border-[#19714e]/30",
    description: "Company mission, product understanding, industry analysis & mutual value alignment.",
  },
];

export default function PrepareCategoryModal({
  isOpen,
  onClose,
  job,
  onSelectCategory,
}) {
  if (!isOpen) return null;

  const jobTitle = job?.job_title || job?.title || "Role";
  const companyName = job?.company_name || job?.company || "Target Company";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#dfe7e2] overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Top Decorative Gradient Accent */}
          <div className="h-1.5 bg-gradient-to-r from-[#123c2c] via-[#19714e] to-[#b9ef84]" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-[#dfe7e2] flex items-start justify-between gap-4 bg-[#fbfdfc]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#dff8eb] text-[#19714e]">
                  <BrainCircuit size={18} />
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-[#12221d]">
                  Select Interview Category
                </h3>
              </div>
              <p className="text-xs text-[#68756f] leading-relaxed">
                Choose a category to generate tailored AI interview questions for{" "}
                <span className="font-semibold text-[#12221d]">{jobTitle}</span> at{" "}
                <span className="font-semibold text-[#19714e]">{companyName}</span>.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-xl text-[#68756f] hover:text-[#12221d] hover:bg-[#f7faf8] transition-colors shrink-0 cursor-pointer"
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* Category Selection List */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
            {PREPARE_CATEGORIES.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  whileHover={{ scale: 1.015, x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectCategory(cat.id)}
                  className="w-full text-left p-3.5 sm:p-4 rounded-2xl border border-[#dfe7e2] hover:border-[#19714e]/50 hover:bg-[#fbfdfc] transition-all flex items-center justify-between gap-3.5 group cursor-pointer shadow-2xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Category Icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={20} />
                    </div>

                    {/* Category Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#12221d] font-['Space_Grotesk'] group-hover:text-[#19714e] transition-colors">
                          {cat.label}
                        </span>
                        {cat.badge && (
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${cat.bgLight} ${cat.textCol} ${cat.borderCol}`}
                          >
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#68756f] mt-0.5 line-clamp-1 group-hover:text-[#12221d] transition-colors">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Action Icon */}
                  <div className="w-8 h-8 rounded-xl bg-[#f7faf8] group-hover:bg-[#123c2c] text-[#68756f] group-hover:text-white flex items-center justify-center shrink-0 transition-all border border-[#dfe7e2] group-hover:border-[#123c2c]">
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-[#f7faf8] border-t border-[#dfe7e2] flex items-center justify-between text-xs text-[#68756f]">
            <span>✨ Powered by SkillCart AI & Gemini</span>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-[#68756f] hover:text-[#12221d] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
