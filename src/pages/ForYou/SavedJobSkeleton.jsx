import { motion } from "framer-motion";
import Skeleton from "../../components/ui/Skeleton";

export default function SavedJobSkeleton({
  count = 3,
}) {
  const items = Array.from({
    length: count,
  });

  return (
    <div className="space-y-4">
      {items.map((_, idx) => (
        <motion.div
          key={idx}
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: idx * 0.05,
          }}
          className="bg-white border border-[#dfe7e2] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-3 flex-1 w-full">

            <div className="flex items-center gap-2">
              <Skeleton
                variant="pill"
                className="h-5 w-16"
              />

              <Skeleton
                variant="text"
                className="h-4 w-28"
              />
            </div>

            <Skeleton
              variant="text"
              className="h-6 w-3/4 sm:w-1/2"
            />

            <div className="flex items-center gap-4">
              <Skeleton
                variant="text"
                className="h-4 w-24"
              />

              <Skeleton
                variant="text"
                className="h-4 w-28"
              />
            </div>

          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">

            <Skeleton
              variant="rectangular"
              className="w-9 h-9 rounded-xl"
            />

            <Skeleton
              variant="pill"
              className="h-10 w-28"
            />

          </div>
        </motion.div>
      ))}
    </div>
  );
}