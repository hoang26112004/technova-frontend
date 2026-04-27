import React from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCompactNumber = (value) => {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  if (!Number.isFinite(n)) return "";
  if (abs >= 1_000_000_000)
    return `${(n / 1_000_000_000).toFixed(abs >= 10_000_000_000 ? 0 : 1)}B`;
  if (abs >= 1_000_000)
    return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000)
    return `${(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return String(Math.round(n));
};

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));

const WeeklySalesChart = ({ data = [], month, onMonthChange, loading = false }) => {
  return (
    <motion.div
      className=" bg-[#FFFDD0] bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <h2 className="text-lg font-medium mb-4 text-black">Doanh số theo tuần</h2>
      {typeof onMonthChange === "function" ? (
        <div className="flex justify-end mb-3">
          <select
            value={month ?? ""}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            disabled={loading}
            className="border border-gray-300 rounded-lg px-2 py-1 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            aria-label="Chọn tháng"
          >
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis
              dataKey={"name"}
              stroke="#000000"
              interval={0}
              tickMargin={10}
              angle={-30}
              textAnchor="end"
              height={56}
            />
            <YAxis
              stroke="#000000"
              width={56}
              tickMargin={8}
              allowDecimals={false}
              tickFormatter={formatCompactNumber}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#000000" }}
              formatter={(value) => formatCurrency(value)}
            />
            <Bar dataKey="sales" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default WeeklySalesChart;
