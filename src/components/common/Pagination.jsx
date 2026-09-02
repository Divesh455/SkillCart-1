import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  offset = 0,
  limit = 20,
  currentCount = 0,
  totalCount = 0,
  onPageChange,
}) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const hasPrevious = offset > 0;
  const hasNext = offset + limit < totalCount || currentCount === limit;

  const handlePrevious = () => {
    if (hasPrevious && onPageChange) {
      const newOffset = Math.max(0, offset - limit);
      onPageChange(newOffset);
    }
  };

  const handleNext = () => {
    if (hasNext && onPageChange) {
      const newOffset = offset + limit;
      onPageChange(newOffset);
    }
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-[#dfe7e2] rounded-3xl p-4 sm:p-5 shadow-xs mt-8">
      {/* Page Info */}
      <div className="text-xs text-[#68756f] font-medium">
        Showing <span className="font-bold text-[#12221d]">{offset + 1}</span>–
        <span className="font-bold text-[#12221d]">
          {offset + currentCount}
        </span>{" "}
        of <span className="font-bold text-[#12221d]">{totalCount || offset + currentCount}</span> jobs
      </div>

      {/* Previous & Next Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className="px-4 py-2.5 rounded-2xl bg-[#f7faf8] border border-[#dfe7e2] text-[#12221d] hover:bg-[#123c2c] hover:text-white hover:border-[#123c2c] disabled:opacity-40 disabled:hover:bg-[#f7faf8] disabled:hover:text-[#12221d] disabled:hover:border-[#dfe7e2] disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <span className="text-xs font-bold text-[#19714e] bg-[#dff8eb] px-3.5 py-2 rounded-xl border border-[#19714e]/20">
          Page {currentPage} {totalPages > 1 ? `of ${totalPages}` : ""}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={!hasNext}
          className="px-4 py-2.5 rounded-2xl bg-[#123c2c] text-white border border-[#123c2c] hover:bg-[#19714e] hover:border-[#19714e] disabled:opacity-40 disabled:hover:bg-[#123c2c] disabled:hover:text-white disabled:hover:border-[#123c2c] disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}