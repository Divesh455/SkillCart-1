import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pagination({
  offset = 0,
  limit = 20,
  currentCount = 0,
  totalCount = 0,
  onPageChange,
}) {
  // =========================================================
  // CURRENT PAGE
  // =========================================================

  const currentPage =
    Math.floor(offset / limit) + 1;

  // =========================================================
  // ITEM RANGE
  // =========================================================

  const startItem =
    currentCount > 0
      ? offset + 1
      : 0;

  const endItem =
    currentCount > 0
      ? offset + currentCount
      : 0;

  // =========================================================
  // PREVIOUS
  // =========================================================

  const hasPrevious =
    offset > 0;

  // =========================================================
  // NEXT
  // =========================================================

  /*
   * If API gives total:
   *
   * total = 150
   * offset = 140
   * currentCount = 10
   *
   * 140 + 10 >= 150
   * therefore no next page.
   *
   * If total is unavailable (0), we use:
   * currentCount === limit
   *
   * to determine if another page may exist.
   */

  const hasNext =
    currentCount === limit &&
    (
      totalCount <= 0 ||
      offset + currentCount < totalCount
    );

  // =========================================================
  // PREVIOUS HANDLER
  // =========================================================

  const handlePrevious = () => {
    if (!hasPrevious) {
      return;
    }

    const newOffset =
      Math.max(
        0,
        offset - limit
      );

    onPageChange(newOffset);
  };

  // =========================================================
  // NEXT HANDLER
  // =========================================================

  const handleNext = () => {
    if (!hasNext) {
      return;
    }

    const newOffset =
      offset + limit;

    onPageChange(newOffset);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-[#dfe7e2] font-sans">

      {/* =====================================================
          RANGE INFORMATION
      ====================================================== */}

      <div className="text-xs text-[#68756f] font-mono">

        {currentCount > 0 ? (
          <span>
            Showing{" "}

            <strong className="text-[#12221d]">
              {startItem}–{endItem}
            </strong>

            {" "}jobs

            {totalCount > 0 && (
              <>
                {" "}of{" "}

                <strong className="text-[#12221d]">
                  {totalCount}
                </strong>
              </>
            )}

            {" "}

            (Page {currentPage})
          </span>
        ) : (
          <span>
            No jobs to display
          </span>
        )}

      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="flex items-center gap-2">

        {/* ===================================================
            PREVIOUS
        ==================================================== */}

        <button
          type="button"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          aria-label="Previous page"
          className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-[#dfe7e2] text-[#12221d] hover:bg-[#f7faf8] hover:border-[#19714e]/40 text-xs font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <ChevronLeft
            size={16}
          />

          <span>
            Previous
          </span>
        </button>

        {/* ===================================================
            CURRENT PAGE
        ==================================================== */}

        <span
          aria-current="page"
          className="px-3.5 py-1.5 bg-[#123c2c] text-white text-xs font-bold font-mono rounded-xl shadow-xs"
        >
          {currentPage}
        </span>

        {/* ===================================================
            NEXT
        ==================================================== */}

        <button
          type="button"
          onClick={handleNext}
          disabled={!hasNext}
          aria-label="Next page"
          className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-[#dfe7e2] text-[#12221d] hover:bg-[#f7faf8] hover:border-[#19714e]/40 text-xs font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <span>
            Next
          </span>

          <ChevronRight
            size={16}
          />
        </button>

      </div>

    </div>
  );
}