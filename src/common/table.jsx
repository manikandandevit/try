import DataTable from "react-data-table-component";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import CustomPagination from "./customPagination";

/* ------------------------------------------
   MOBILE CARD RENDERER
------------------------------------------ */
const MobileCardList = ({ columns, data, loading }) => {
  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500 text-sm">
        No records found
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {data.map((row, rowIndex) => (
        <div
          key={row.id || rowIndex}
          className="border border-borderColor rounded-xl p-4 bg-white shadow-sm"
        >
          {columns.map((col, colIndex) => {
            if (col.omit) return null;

            const value =
              typeof col.cell === "function"
                ? col.cell(row, rowIndex)
                : typeof col.selector === "function"
                  ? col.selector(row, rowIndex)
                  : row[col.selector];

            return (
              <div
                key={colIndex}
                className="flex justify-between gap-4 py-1"
              >
                <span className="text-sm text-gray-500 font-medium">
                  {col.name}
                </span>
                <span className="text-sm font-semibold text-gray-900 text-right">
                  {value ?? "-"}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const CommonTable = ({
  columns,
  data = [],
  loading = false,

  searchValue,
  onSearch,
  searchPlaceholder = "Search",

  rightActions,

  paginationServer = false,
  paginationTotalRows = 0,
  paginationPerPage = 10,
  onChangePage,
  onChangeRowsPerPage,
  noPagination = false,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const resize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const isMobile = windowWidth < 768;

  /* ------------------------------------------
     MOBILE PAGINATION (CLIENT SIDE)
  ------------------------------------------ */
  const paginatedMobileData = useMemo(() => {
    if (paginationServer) return data;

    const start = (currentPage - 1) * paginationPerPage;
    const end = start + paginationPerPage;
    return data.slice(start, end);
  }, [data, currentPage, paginationPerPage, paginationServer]);

  const totalRows = paginationServer ? paginationTotalRows : data.length;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    onChangePage?.(page);
  };

  const handleRowsChange = (newPerPage, page) => {
    setCurrentPage(page);
    onChangeRowsPerPage?.(newPerPage, page);
  };

  /* ---------- TABLE STYLES ---------- */
  const customStyles = {
    table: {
      style: {
        backgroundColor: "#ffffff",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e5e7eb",
      },
    },
    headCells: {
      style: {
        fontSize: "15px",
        fontWeight: "500",
        color: "#667085",
        whiteSpace: "nowrap",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#101828",
        paddingTop: "12px",
        paddingBottom: "12px",
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-lineColor flex flex-col h-full">
      {/* ---------- TOP BAR ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-lineColor">
        {onSearch && (
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lightGrey"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full border border-lineColor rounded-full pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          {rightActions}
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="flex-1 overflow-auto">
        {isMobile ? (
          <>
            <MobileCardList
              columns={columns}
              data={paginatedMobileData}
              loading={loading}
            />

            {!noPagination && (
              <div className="border-t border-borderColor">
                <CustomPagination
                  currentPage={currentPage}
                  rowsPerPage={paginationPerPage}
                  rowCount={totalRows}
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handleRowsChange}
                />
              </div>
            )}
          </>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            progressPending={loading}
            highlightOnHover
            responsive
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="py-10 text-gray-500 text-sm">
                No records found
              </div>
            }
            progressComponent={
              <div className="py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
              </div>
            }
            pagination={!noPagination}
            paginationServer={paginationServer}
            paginationTotalRows={paginationTotalRows}
            paginationPerPage={paginationPerPage}
            onChangePage={onChangePage}
            onChangeRowsPerPage={onChangeRowsPerPage}
            paginationComponent={CustomPagination}
          />
        )}
      </div>
    </div>
  );
};

export default CommonTable;
