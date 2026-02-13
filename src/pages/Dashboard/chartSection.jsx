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
  { name: "Email", value: 0, color: "#165DFF" },
  { name: "WhatsApp", value: 0, color: "#14C9C9" },
];

const DashboardCharts = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pieData, setPieData] = useState(pieDataFallback);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardStatsApi(year);
      if (res.success && res.data) {
        const { monthly_sends, send_breakdown } = res.data;
        if (monthly_sends && monthly_sends.length) {
          const barData = monthly_sends.map((d) => ({
            month: d.month?.charAt(0) + (d.month?.slice(1)?.toLowerCase() || ""),
            value: d.total ?? 0,
          }));
          setMonthlyData(barData);
        } else {
          setMonthlyData([]);
        }
        if (send_breakdown) {
          setPieData([
            { name: "Email", value: send_breakdown.email?.count ?? 0, color: "#165DFF" },
            { name: "WhatsApp", value: send_breakdown.whatsapp?.count ?? 0, color: "#14C9C9" },
          ]);
        }
      }
    } catch {
      setMonthlyData([]);
      setPieData(pieDataFallback);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* -------------------- Dynamic Y Axis -------------------- */
  const maxValue = monthlyData.length ? Math.max(...monthlyData.map((d) => d.value)) : 100;
  const roundedMax = Math.max(100, Math.ceil(maxValue / 200) * 200);

  const totalPie = pieData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
      
      {/* LEFT SIDE (WIDER) */}
      <div className="lg:col-span-2 bg-white border border-lineColor rounded-xl p-5">

        {/* Header with Year Filter */}
        <div className="flex justify-between items-center mb-8">
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
            className="border border-borderColor rounded-md px-3 py-1 text-sm focus:outline-none"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>

        {/* Vertical Bar Chart - Monthly Total Quotations */}
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
        ) : (
        <ResponsiveContainer width="100%" height={300}>
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
              tick={{ fontSize: 13 }}
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
              tick={{ fontSize: 13 }}
            />

            <Tooltip />

            <Bar
              dataKey="value"
              fill="#00085E"
              radius={[0, 0, 0, 0]}
              barSize={25}
              name="Quotations"
            />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* RIGHT SIDE (SMALLER) */}
      <div className="bg-white border border-lineColor rounded-xl p-5 flex flex-col justify-between">

        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Status Overview
          </h3>
          {/* <p className="text-sm text-gray-500 mt-1 mb-4">
            Email vs WhatsApp
          </p> */}
        </div>

        {/* Full Pie Chart */}
        <div className="relative flex justify-center">
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
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Total */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">
              {totalPie}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 mt-4 text-sm">
          {pieData.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="font-medium text-gray-800">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
