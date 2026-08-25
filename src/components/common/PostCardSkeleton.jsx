import React from "react";
import { motion } from "framer-motion";
import Skeleton from "../ui/Skeleton";

/**
 * PostCardSkeleton Component
 * Renders skeleton items matching PostCard.jsx layout.
 */
export default function PostCardSkeleton({ count = 2 }) {
  const cards = Array.from({ length: count });

  return (
    <>
      {cards.map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className="bg-white border border-[#dfe7e2] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
        >
          {/* Post Header Skeleton */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="w-10 h-10 shrink-0" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton variant="text" className="h-4 w-28" />
                  <Skeleton variant="text" className="h-3.5 w-16" />
                </div>
                <Skeleton variant="text" className="h-3 w-36" />
              </div>
            </div>
            <Skeleton variant="circular" className="w-6 h-6" />
          </div>

          {/* Post Content Skeleton */}
          <div className="space-y-2 mb-4">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-5/6" />
            <Skeleton variant="text" className="h-4 w-2/3" />
          </div>

          {/* Tags Skeleton */}
          <div className="flex gap-1.5 mb-4">
            <Skeleton variant="pill" className="h-5 w-20" />
            <Skeleton variant="pill" className="h-5 w-16" />
          </div>

          {/* Interactions Bar Skeleton */}
          <div className="pt-3 border-t border-[#dfe7e2]/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="pill" className="h-7 w-20" />
              <Skeleton variant="pill" className="h-7 w-24" />
            </div>
            <Skeleton variant="circular" className="w-7 h-7" />
          </div>
        </motion.div>
      ))}
    </>
  );
}
