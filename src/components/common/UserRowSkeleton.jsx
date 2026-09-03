import Skeleton from "../ui/Skeleton";

/**
 * UserRowSkeleton
 * Used across Followers list, Following list, and People to Follow sidebar.
 */
export default function UserRowSkeleton({ count = 4, compact = false }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`flex items-center justify-between gap-3 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] ${
            compact ? "p-2.5" : "p-3"
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Skeleton
              variant="rectangular"
              className={`${compact ? "w-9 h-9 rounded-xl" : "w-10 h-10 rounded-2xl"} shrink-0`}
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton variant="text" className="h-3.5 w-24 max-w-[60%]" />
              <Skeleton variant="text" className="h-2.5 w-36 max-w-[80%]" />
            </div>
          </div>
          <Skeleton
            variant="rectangular"
            className={`${compact ? "w-14 h-6" : "w-16 h-7"} rounded-xl shrink-0`}
          />
        </div>
      ))}
    </div>
  );
}
