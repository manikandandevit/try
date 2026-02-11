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
import { useState, useMemo } from "react";

/* -------------------- BAR DATA (Jan–Dec) -------------------- */
const monthlyData = [
  { month: "Jan", value: 320 },
  { month: "Feb", value: 450 },
  { month: "Mar", value: 280 },
  { month: "Apr", value: 700 },
  { month: "May", value: 600 },
  { month: "Jun", value: 820 },
  { month: "Jul", value: 500 },
  { month: "Aug", value: 900 },
  { month: "Sep", value: 750 },
  { month: "Oct", value: 650 },
  { month: "Nov", value: 880 },
  { month: "Dec", value: 950 },
];

/* -------------------- PIE DATA (3 COLORS) -------------------- */
const pieData = [
  { name: "Available", value: 540, color: "#165DFF" },
  { name: "Assigned", value: 320, color: "#14C9C9" },
  { name: "Maintenance", value: 140, color: "#F7BA1E" },
];

const DashboardCharts = () => {
  const [year, setYear] = useState("2025");

  /* -------------------- Dynamic Y Axis -------------------- */
  const maxValue = Math.max(...monthlyData.map((d) => d.value));
  const roundedMax = Math.ceil(maxValue / 200) * 200;

  const totalPie = pieData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
      
      {/* LEFT SIDE (WIDER) */}
      <div className="lg:col-span-2 bg-white border border-lineColor rounded-xl p-5">

        {/* Header with Year Filter */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-medium text-gray-800">
              Quotation Overview
            </h3>
            {/* <p className="text-sm text-gray-500 mt-1">
              Monthly asset performance
            </p> */}
          </div>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-borderColor rounded-md px-3 py-1 text-sm focus:outline-none"
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {/* Vertical Bar Chart */}
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
                { length: roundedMax / 200 + 1 },
                (_, i) => i * 200
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
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RIGHT SIDE (SMALLER) */}
      <div className="bg-white border border-lineColor rounded-xl p-5 flex flex-col justify-between">

        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Asset Status
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Distribution summary
          </p>
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
