import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  CartesianGrid,
  Cell,
} from "recharts";
import { useState, useEffect, useCallback } from "react";
import { getDashboardStatsApi } from "../../API/customerApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Hook to get window width
const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowWidth;
};

/* -------------------- PIE DATA FALLBACK -------------------- */
const pieDataFallback = [
  { name: "Draft", value: 0, color: "#9CA3AF" },
  { name: "Submitted", value: 0, color: "#165DFF" },
  { name: "Awarded", value: 0, color: "#10B981" },
];

const DashboardCharts = () => {
  const currentYear = new Date().getFullYear();
  const windowWidth = useWindowWidth();

  /* -------------------- BAR FILTER -------------------- */
  const [filterType, setFilterType] = useState("week");
  const [selectedDate, setSelectedDate] = useState(new Date());

  /* -------------------- PIE FILTER -------------------- */
  const [pieYear, setPieYear] = useState(String(currentYear));
  const [pieMonth, setPieMonth] = useState(
    String(new Date().getMonth() + 1)
  );

  const [loadingBar, setLoadingBar] = useState(true);
  const [loadingPie, setLoadingPie] = useState(true);

  const [monthlyData, setMonthlyData] = useState([]);
  const [pieData, setPieData] = useState(pieDataFallback);

  /* =========================================================
     ================= BAR CHART FETCH ========================
     ========================================================= */
  const fetchBarStats = useCallback(async () => {
    setLoadingBar(true);
    try {
      /* ===== WEEK ===== */
      if (filterType === "week") {
        // Format date as YYYY-MM-DD for API
        const weekDateStr = selectedDate.toISOString().split('T')[0];
        
        // Fetch data with week_date parameter
        const year = selectedDate.getFullYear();
        const res = await getDashboardStatsApi(year, null, weekDateStr);

        if (res.success && res.data) {
          const { week_data } = res.data;
          
          if (week_data && week_data.length > 0) {
            // Use week_data from API
            const weekDays = week_data.map((d) => ({
              label: d.day,
              value: d.total ?? 0,
            }));
            setMonthlyData(weekDays);
          } else {
            // Fallback: Create week days structure
            const selected = new Date(selectedDate);
            const dayOfWeek = selected.getDay();
            const start = new Date(selected);
            start.setDate(selected.getDate() - dayOfWeek);
            
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
              const d = new Date(start);
              d.setDate(start.getDate() + i);
              const dayName = d.toLocaleDateString("en-US", {
                weekday: "short",
              });
              weekDays.push({
                label: dayName,
                value: 0,
              });
            }
            setMonthlyData(weekDays);
          }
        } else {
          setMonthlyData([]);
        }
      }

      /* ===== MONTH ===== */
      if (filterType === "month") {
        // Show weeks within the selected month
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth(); // 0-11
        
        // Calculate first and last day of the month
        const firstDay = new Date(year, month, 1);
        firstDay.setHours(0, 0, 0, 0);
        const lastDay = new Date(year, month + 1, 0); // Last day of month
        lastDay.setHours(23, 59, 59, 999);
        
        // Find the first Sunday of the month (or before if month doesn't start on Sunday)
        const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
        const weekStart = new Date(firstDay);
        if (firstDayOfWeek !== 0) {
          // Go back to the previous Sunday
          weekStart.setDate(firstDay.getDate() - firstDayOfWeek);
        }
        weekStart.setHours(0, 0, 0, 0);
        
        // Calculate all weeks in the month
        const weeks = [];
        let currentWeekStart = new Date(weekStart);
        let weekNumber = 1;
        
        while (currentWeekStart <= lastDay) {
          const weekEnd = new Date(currentWeekStart);
          weekEnd.setDate(currentWeekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          
          // Only include weeks that overlap with the selected month
          if (weekEnd >= firstDay && currentWeekStart <= lastDay) {
            // Format week date for API (use the Sunday of this week)
            const weekDateStr = currentWeekStart.toISOString().split('T')[0];
            
            // Fetch week data
            const res = await getDashboardStatsApi(year, null, weekDateStr);
            
            if (res.success && res.data && res.data.week_data) {
              // Only count quotations from days within the selected month
              let weekTotal = 0;
              res.data.week_data.forEach((dayData) => {
                const dayDate = new Date(dayData.date);
                if (dayDate >= firstDay && dayDate <= lastDay) {
                  weekTotal += dayData.total ?? 0;
                }
              });
              
              weeks.push({
                label: `Week ${weekNumber}`,
                value: weekTotal,
              });
            } else {
              weeks.push({
                label: `Week ${weekNumber}`,
                value: 0,
              });
            }
            weekNumber++;
          }
          
          // Move to next week (next Sunday)
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        
        setMonthlyData(weeks);
      }

      /* ===== YEAR ===== */
      if (filterType === "year") {
        // Show months within the selected year
        const year = selectedDate.getFullYear();
        const res = await getDashboardStatsApi(year, null);

        if (res.success && res.data) {
          const { monthly_sends } = res.data;
          const barData =
            monthly_sends?.map((d) => ({
              label:
                d.month?.charAt(0) +
                (d.month?.slice(1)?.toLowerCase() || ""),
              value: d.total ?? 0,
            })) || [];

          setMonthlyData(barData);
        } else {
          setMonthlyData([]);
        }
      }
    } catch {
      setMonthlyData([]);
    } finally {
      setLoadingBar(false);
    }
  }, [filterType, selectedDate, currentYear]);

  /* =========================================================
     ================= PIE CHART FETCH ========================
     ========================================================= */
  const fetchPieStats = useCallback(async () => {
    setLoadingPie(true);
    try {
      const res = await getDashboardStatsApi(pieYear, pieMonth);

      if (res.success && res.data) {
        const { status_breakdown } = res.data;

        if (status_breakdown) {
          setPieData([
            {
              name: "Draft",
              value: status_breakdown.draft ?? 0,
              color: "#9CA3AF",
            },
            {
              name: "Submitted",
              value: status_breakdown.submitted ?? 0,
              color: "#165DFF",
            },
            {
              name: "Awarded",
              value: status_breakdown.awarded ?? 0,
              color: "#10B981",
            },
          ]);
        } else {
          setPieData(pieDataFallback);
        }
      }
    } catch {
      setPieData(pieDataFallback);
    } finally {
      setLoadingPie(false);
    }
  }, [pieYear, pieMonth]);

  useEffect(() => {
    fetchBarStats();
  }, [fetchBarStats]);

  useEffect(() => {
    fetchPieStats();
  }, [fetchPieStats]);

  /* -------------------- Dynamic Y Axis -------------------- */
  const maxValue =
    monthlyData.length > 0
      ? Math.max(...monthlyData.map((d) => d.value))
      : 0;

  // Always keep minimum 100
  const roundedMax =
    maxValue > 0
      ? Math.ceil(maxValue / 5) * 5
      : 100;

  // Create only 5 steps above 0
  const step = roundedMax / 5;

  const dynamicTicks = [
    0,
    step,
    step * 2,
    step * 3,
    step * 4,
    roundedMax,
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
      {/* ================= BAR CHART ================= */}
      <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-medium">
            Quotations Overview
          </h3>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                // Reset date based on filter type
                if (e.target.value === "year") {
                  setSelectedDate(new Date(currentYear, 0, 1));
                } else if (e.target.value === "month") {
                  setSelectedDate(new Date(currentYear, new Date().getMonth(), 1));
                } else {
                  setSelectedDate(new Date());
                }
              }}
              className="border border-borderColor rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none min-w-[100px]"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>

            {filterType === "week" && (
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                className="border border-borderColor rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none min-w-[140px]"
              />
            )}

            {filterType === "month" && (
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showMonthYearPicker
                dateFormat="MMM yyyy"
                className="border border-borderColor rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none min-w-[140px]"
              />
            )}

            {filterType === "year" && (
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showYearPicker
                dateFormat="yyyy"
                className="border border-borderColor rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none min-w-[100px]"
              />
            )}
          </div>
        </div>

        {loadingBar ? (
          <div className="h-48 sm:h-64 md:h-72 flex items-center justify-center">
            <div className="text-sm sm:text-base text-gray-500">Loading...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={windowWidth < 640 ? 250 : windowWidth < 768 ? 280 : 300}>
            <BarChart data={monthlyData}>
              <CartesianGrid
                horizontal
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="6 6"
              />
              <XAxis dataKey="label" tick={{ fontSize: windowWidth < 640 ? 10 : 12 }} />
              <YAxis
                domain={[0, roundedMax]}
                ticks={dynamicTicks}
                tick={{ fontSize: windowWidth < 640 ? 10 : 12 }}
              />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#00085E"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ================= PIE CHART ================= */}
      <div className="bg-white shadow rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
          Quotation Status
        </h3>

        <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
          <select
            value={pieMonth}
            onChange={(e) =>
              setPieMonth(e.target.value)
            }
            className="border border-borderColor rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex-1"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("en", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          <select
            value={pieYear}
            onChange={(e) =>
              setPieYear(e.target.value)
            }
            className="border border-borderColor rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex-1"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>
        </div>

        {loadingPie ? (
          <div className="h-48 sm:h-60 flex items-center justify-center">
            <div className="text-sm sm:text-base text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={windowWidth < 640 ? 200 : 240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={windowWidth < 640 ? 70 : 90}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* ================= LEGEND ================= */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4 text-xs sm:text-sm">
              {pieData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center sm:justify-between"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-gray-600 text-xs sm:text-sm truncate">
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
