import React from "react";
import { motion } from "framer-motion";
import Skeleton from "../ui/Skeleton";

/**
 * JobCardSkeleton Component
 * Renders a pixel-matched skeleton loader card corresponding to JobCard.jsx.
 */
export default function JobCardSkeleton({ count = 1 }) {
  const cards = Array.from({ length: count });

  return (
    <>
      {cards.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-white border border-[#dfe7e2] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            {/* Top Header: Company Avatar, Title, Status & Bookmark */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 flex-1">
                {/* Company Logo Badge Skeleton */}
                <Skeleton variant="rectangular" className="w-11 h-11 rounded-xl shrink-0" />

                <div className="flex-1 space-y-2">
                  {/* Job Title Skeleton */}
                  <Skeleton variant="text" className="h-5 w-3/4" />
                  
                  {/* Company Name & Dept Skeleton */}
                  <div className="flex items-center gap-2">
                    <Skeleton variant="text" className="h-3.5 w-24" />
                    <Skeleton variant="text" className="h-3.5 w-16" />
                  </div>
                </div>
              </div>

              {/* Bookmark Action Skeleton */}
              <Skeleton variant="rectangular" className="w-9 h-9 rounded-xl shrink-0" />
            </div>

            {/* Badges Row Skeleton */}
            <div className="flex flex-wrap items-center gap-1.5 my-3">
              <Skeleton variant="pill" className="h-6 w-16" />
              <Skeleton variant="pill" className="h-6 w-20" />
              <Skeleton variant="pill" className="h-6 w-24" />
            </div>

            {/* Job Details Meta Grid Skeleton */}
            <div className="grid grid-cols-2 gap-2.5 my-4 pt-3 border-t border-[#dfe7e2]/60">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="w-3.5 h-3.5 shrink-0" />
                <Skeleton variant="text" className="h-3.5 w-28" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="w-3.5 h-3.5 shrink-0" />
                <Skeleton variant="text" className="h-3.5 w-24" />
              </div>

              <div className="flex items-center gap-2 col-span-2 mt-1">
                <Skeleton variant="circular" className="w-3.5 h-3.5 shrink-0" />
                <Skeleton variant="text" className="h-4 w-36" />
              </div>
            </div>
          </div>

          {/* Footer Actions Skeleton */}
          <div className="pt-3 border-t border-[#dfe7e2]/70 flex items-center justify-between gap-2">
            <Skeleton variant="text" className="h-3.5 w-28" />
            <Skeleton variant="pill" className="h-8 w-20" />
          </div>
        </motion.div>
      ))}
    </>
  );
}
