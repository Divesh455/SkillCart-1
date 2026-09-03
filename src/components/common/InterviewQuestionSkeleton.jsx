import { motion } from "framer-motion";
import Skeleton from "../ui/Skeleton";

/**
 * InterviewQuestionSkeleton Component
 * Renders structured skeleton cards while AI generates interview questions.
 */
export default function InterviewQuestionSkeleton({ count = 3 }) {
  const cards = Array.from({ length: count });

  return (
    <div className="space-y-5">
      {cards.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.08 }}
          className="bg-white border border-[#dfe7e2] rounded-3xl p-5 sm:p-7 shadow-xs space-y-4"
        >
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton variant="pill" className="h-6 w-12 rounded-lg" />
              <Skeleton variant="pill" className="h-6 w-20 rounded-lg" />
              <Skeleton variant="pill" className="h-6 w-16 rounded-lg" />
            </div>
            <Skeleton variant="circular" className="w-8 h-8 rounded-xl" />
          </div>

          {/* Question Text Skeleton */}
          <div className="space-y-2 pt-1">
            <Skeleton variant="text" className="h-5 w-11/12" />
            <Skeleton variant="text" className="h-5 w-4/5" />
          </div>

          {/* Intent Box Skeleton */}
          <div className="p-4 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2]/70 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton variant="circular" className="w-4 h-4" />
              <Skeleton variant="text" className="h-4 w-36" />
            </div>
            <Skeleton variant="text" className="h-3.5 w-full" />
            <Skeleton variant="text" className="h-3.5 w-5/6" />
          </div>

          {/* Answer Box Skeleton */}
          <div className="p-4 rounded-2xl bg-[#f0f8f4]/60 border border-[#19714e]/15 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-4 w-44" />
              <Skeleton variant="pill" className="h-6 w-20 rounded-lg" />
            </div>
            <Skeleton variant="text" className="h-3.5 w-full" />
            <Skeleton variant="text" className="h-3.5 w-11/12" />
            <Skeleton variant="text" className="h-3.5 w-3/4" />
          </div>

          {/* Criteria Checklist Skeleton */}
          <div className="pt-2 space-y-2">
            <Skeleton variant="text" className="h-4 w-40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Skeleton variant="rectangular" className="h-10 rounded-xl" />
              <Skeleton variant="rectangular" className="h-10 rounded-xl" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
