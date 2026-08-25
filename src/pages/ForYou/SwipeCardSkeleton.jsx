import React from "react";
import { motion } from "framer-motion";
import Skeleton from "../../components/ui/Skeleton";
import { Sparkles, Radar } from "lucide-react";

/**
 * SwipeCardSkeleton Component
 * Renders an animated Tinder-style swipe card stack skeleton for For You matches.
 */
export default function SwipeCardSkeleton() {
  return (
    <div className="relative w-full h-[530px] sm:h-[570px] flex flex-col items-center justify-center">
      
      {/* Radar scanning indicator overlay */}
      <div className="absolute -top-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg">
        <Radar size={16} className="text-[#b9ef84] animate-radar-sweep" />
        <span className="text-[#b9ef84] font-mono">Radar Scanning Matches...</span>
      </div>

      {/* Stacked Skeleton Cards */}
      {[0, 1, 2].map((stackIndex) => {
        const scale = 1 - stackIndex * 0.04;
        const yOffset = stackIndex * 12;
        const zIndex = 10 - stackIndex;

        return (
          <motion.div
            key={stackIndex}
            initial={{ opacity: 0, scale: scale * 0.95, y: yOffset + 20 }}
            animate={{ opacity: 1, scale, y: yOffset }}
            transition={{ duration: 0.4, delay: stackIndex * 0.1 }}
            style={{ zIndex }}
            className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-[#dfe7e2] shadow-2xl shadow-[#123c2c]/15 overflow-hidden flex flex-col justify-between"
          >
            {/* Card Content Skeleton */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                {/* Match percentage badge skeleton & work mode */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Skeleton variant="pill" className="h-6 w-32 bg-[#dff8eb]" />
                  <Skeleton variant="pill" className="h-6 w-20" />
                </div>

                {/* Company name & Job Title Skeleton */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="circular" className="w-4 h-4" />
                    <Skeleton variant="text" className="h-4 w-28" />
                  </div>
                  <Skeleton variant="text" className="h-8 w-4/5 rounded-xl" />
                  <Skeleton variant="text" className="h-8 w-2/3 rounded-xl" />
                </div>

                {/* Badges Skeleton */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Skeleton variant="pill" className="h-7 w-28" />
                  <Skeleton variant="pill" className="h-7 w-24" />
                  <Skeleton variant="pill" className="h-7 w-32" />
                </div>

                {/* Requirements Skeleton lines */}
                <div className="space-y-3 pt-4 border-t border-[#dfe7e2]/80">
                  <div className="flex items-center justify-between">
                    <Skeleton variant="text" className="h-3.5 w-24" />
                    <Skeleton variant="text" className="h-3.5 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton variant="text" className="h-3.5 w-24" />
                    <Skeleton variant="text" className="h-3.5 w-28" />
                  </div>
                </div>
              </div>

              {/* Callout Skeleton */}
              <div className="pt-4 flex items-center justify-between border-t border-[#dfe7e2]/60">
                <Skeleton variant="text" className="h-4 w-40" />
                <Skeleton variant="circular" className="w-4 h-4" />
              </div>
            </div>

            {/* Bottom Action buttons skeleton (only visible on front card) */}
            {stackIndex === 0 && (
              <div className="p-4 sm:p-5 bg-[#f7faf8] border-t border-[#dfe7e2] flex items-center justify-around gap-4 z-20">
                <Skeleton variant="rectangular" className="w-13 h-13 rounded-2xl" />
                <Skeleton variant="rectangular" className="w-11 h-11 rounded-xl" />
                <Skeleton variant="rectangular" className="w-13 h-13 rounded-2xl" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
