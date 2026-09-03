import Skeleton from "../ui/Skeleton";

/**
 * CommentSkeleton
 * Used in PostCard.jsx when loading comments.
 */
export default function CommentSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3 py-1">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex gap-3">
          <Skeleton variant="rectangular" className="w-8 h-8 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 bg-white border border-[#dfe7e2] rounded-2xl px-3.5 py-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-3 w-24" />
              <Skeleton variant="text" className="h-2.5 w-12" />
            </div>
            <Skeleton variant="text" className="h-3 w-full" />
            <Skeleton variant="text" className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
