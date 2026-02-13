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

/* -------------------- PIE DATA FALLBACK -------------------- */
const pieDataFallback = [
  { name: "Draft", value: 0, color: "#9CA3AF" },
  { name: "Submitted", value: 0, color: "#165DFF" },
  { name: "Awarded", value: 0, color: "#10B981" },
];

const DashboardCharts = () => {
  const currentYear = new Date().getFullYear();

  /* -------------------- BAR FILTER -------------------- */
  const [filterType, setFilterType] = useState("year");
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
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      const res = await getDashboardStatsApi(year, month);

      if (res.success && res.data) {
        const { monthly_sends } = res.data;

        /* ===== YEAR ===== */
        if (filterType === "year") {
          const barData =
            monthly_sends?.map((d) => ({
              label:
                d.month?.charAt(0) +
                (d.month?.slice(1)?.toLowerCase() || ""),
              value: d.total ?? 0,
            })) || [];

          setMonthlyData(barData);
        }

        /* ===== WEEK ===== */
        if (filterType === "week") {
          const start = new Date(selectedDate);
          start.setDate(start.getDate() - start.getDay());

          const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return {
              label: d.toLocaleDateString("en-US", {
                weekday: "short",
              }),
              value: 0, // Replace with real API week data
            };
          });

          setMonthlyData(weekDays);
        }

        /* ===== MONTH ===== */
        if (filterType === "month") {
          const y = selectedDate.getFullYear();
          const m = selectedDate.getMonth();
          const lastDay = new Date(y, m + 1, 0).getDate();
          const totalWeeks = Math.ceil(lastDay / 7);

          const weeks = [];
          for (let i = 1; i <= totalWeeks; i++) {
            weeks.push({
              label: `Week ${i}`,
              value: 0, // Replace with real API week grouping
            });
          }

          setMonthlyData(weeks);
        }
      }
    } catch {
      setMonthlyData([]);
    } finally {
      setLoadingBar(false);
    }
  }, [filterType, selectedDate]);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
      {/* ================= BAR CHART ================= */}
      <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">
            Quotations Overview
          </h3>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value)
              }
              className="border border-borderColor rounded-md px-3 py-2 text-sm"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>

            <DatePicker
              selected={selectedDate}
              onChange={(date) =>
                setSelectedDate(date)
              }
              showMonthYearPicker={
                filterType === "month"
              }
              showYearPicker={
                filterType === "year"
              }
              className="border border-borderColor rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {loadingBar ? (
          <div className="h-72 flex items-center justify-center">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid
                horizontal
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="6 6"
              />
              <XAxis dataKey="label" />
              <YAxis
                domain={[0, roundedMax]}
                ticks={dynamicTicks}
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
      <div className="bg-white shadow rounded-xl p-5">
        <h3 className="text-lg font-medium mb-4">
          Quotation Status
        </h3>

        <div className="flex gap-2 mb-4">
          <select
            value={pieMonth}
            onChange={(e) =>
              setPieMonth(e.target.value)
            }
            className="border border-borderColor rounded-md px-3 py-2 text-sm flex-1"
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
            className="border border-borderColor rounded-md px-3 py-2 text-sm flex-1"
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
          <div className="h-60 flex items-center justify-center">
            Loading...
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
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
            <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
              {pieData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-gray-600">
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
