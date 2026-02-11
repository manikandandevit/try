import { ChevronLeft, ChevronRight } from "lucide-react";

const CustomPagination = ({
  rowsPerPage,
  rowCount,
  currentPage,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const totalPages = Math.max(1, Math.ceil(rowCount / rowsPerPage));

  // ✅ keep page always valid
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  // ✅ range calculation
  const start =
    rowCount === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;

  const end =
    rowCount === 0
      ? 0
      : Math.min(safePage * rowsPerPage, rowCount);

  /* -------- PAGE NUMBERS LOGIC -------- */
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;

    pages.push(1);

    const startPage = Math.max(2, safePage - delta);
    const endPage = Math.min(totalPages - 1, safePage + delta);

    if (startPage > 2) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  // ✅ arrow states
  const disableLeft = safePage === 1;
  const disableRight = safePage === totalPages;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-lineColor">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          {start}-{end} of {rowCount}
        </span>

        <div className="flex items-center gap-2">
          <span>Show</span>

          <select
            value={rowsPerPage}
            onChange={(e) =>
              onChangeRowsPerPage(Number(e.target.value), 1)
            }
            className="border border-lineColor rounded-md px-2 py-1 focus:outline-none"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <span>Results</span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2">
        {/* LEFT ARROW */}
        <button
          onClick={() => onChangePage(safePage - 1)}
          disabled={disableLeft}
          className="w-8 h-7 flex items-center justify-center border border-borderColor rounded-md disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>

        {/* PAGE NUMBERS */}
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={index}
              className="w-8 h-7 flex items-center justify-center text-sm text-gray-500"
            >
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onChangePage(page)}
              className={`w-8 h-7 flex items-center justify-center rounded-md text-sm font-medium
                ${
                  page === safePage
                    ? "bg-primary text-white"
                    : "border border-borderColor"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        {/* RIGHT ARROW */}
        <button
          onClick={() => onChangePage(safePage + 1)}
          disabled={disableRight}
          className="w-8 h-7 flex items-center justify-center border border-borderColor rounded-md disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;
