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

/* -------------------- PIE DATA FALLBACK (3 COLORS) -------------------- */
const pieDataFallback = [
  { name: "Draft", value: 0, color: "#9CA3AF" },
  { name: "Submitted", value: 0, color: "#165DFF" },
  { name: "Awarded", value: 0, color: "#10B981" },
];

const DashboardCharts = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pieData, setPieData] = useState(pieDataFallback);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardStatsApi(year, month);
      if (res.success && res.data) {
        const { monthly_sends, status_breakdown } = res.data;
        if (monthly_sends && monthly_sends.length) {
          const barData = monthly_sends.map((d) => ({
            month: d.month?.charAt(0) + (d.month?.slice(1)?.toLowerCase() || ""),
            value: d.total ?? 0,
          }));
          setMonthlyData(barData);
        } else {
          setMonthlyData([]);
        }
        if (status_breakdown) {
          setPieData([
            { name: "Draft", value: status_breakdown.draft ?? 0, color: "#9CA3AF" },
            { name: "Submitted", value: status_breakdown.submitted ?? 0, color: "#165DFF" },
            { name: "Awarded", value: status_breakdown.awarded ?? 0, color: "#10B981" },
          ]);
        } else {
          setPieData(pieDataFallback);
        }
      }
    } catch {
      setMonthlyData([]);
      setPieData(pieDataFallback);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* -------------------- Dynamic Y Axis -------------------- */
  const maxValue = monthlyData.length ? Math.max(...monthlyData.map((d) => d.value)) : 100;
  const roundedMax = Math.max(100, Math.ceil(maxValue / 200) * 200);

  const totalPie = pieData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 w-full">

      {/* LEFT SIDE (WIDER) */}
      <div className="lg:col-span-2 bg-white border border-lineColor rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">

        {/* Header with Year Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 md:mb-8">
          <div>
            <h3 className="text-lg font-medium text-gray-800">
              Quotations Overview
            </h3>
            {/* <p className="text-sm text-gray-500 mt-1">
              Customer quotations sent by month
            </p> */}
          </div>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-borderColor rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-auto"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>

        {/* Vertical Bar Chart - Monthly Total Quotations */}
        {loading ? (
          <div className="flex items-center justify-center h-62.5 sm:h-75 text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={windowWidth < 640 ? 250 : 300}>
            <BarChart data={monthlyData}>

              {/* Horizontal dotted lines */}
              <CartesianGrid
                horizontal
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="6 6"
              />

              {/* X Axis (Jan–Dec) */}
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: windowWidth < 640 ? 10 : 13 }}
              />

              {/* Y Axis (Dynamic) */}
              <YAxis
                domain={[0, roundedMax]}
                ticks={Array.from(
                  { length: Math.ceil(roundedMax / 200) + 1 },
                  (_, i) => Math.min(i * 200, roundedMax)
                )}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: windowWidth < 640 ? 10 : 13 }}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#00085E"
                radius={[0, 0, 0, 0]}
                barSize={windowWidth < 640 ? 20 : 25}
                name="Quotations"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* RIGHT SIDE (SMALLER) */}
      <div className="bg-white border border-lineColor rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 flex flex-col justify-between">

        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800">
            Quotation Status
          </h3>          

          {/* Month and Year Selectors */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-borderColor rounded-md px-2 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1"
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-borderColor rounded-md px-2 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Full Pie Chart */}
        <div className="relative flex justify-center">
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
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 mt-3 sm:mt-4 text-xs sm:text-sm">
          {pieData.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-gray-600 truncate">{item.name}</span>
              </div>             
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
