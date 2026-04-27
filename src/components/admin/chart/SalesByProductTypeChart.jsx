import React, { useMemo } from "react";
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

const normalizeTopN = (data, limit = 8) => {
  const arr = Array.isArray(data) ? data.slice() : [];
  arr.sort((a, b) => Number(b?.sales || 0) - Number(a?.sales || 0));
  if (arr.length <= limit) return arr;
  const keep = limit - 1;
  const top = arr.slice(0, keep);
  const restTotal = arr
    .slice(keep)
    .reduce((sum, x) => sum + Number(x?.sales || 0), 0);
  return [...top, { name: "Khác", sales: restTotal }];
};

const SalesByProductTypeChart = ({ data = [] }) => {
  const chartData = useMemo(() => normalizeTopN(data, 8), [data]);

  return (
    <motion.div
      className="bg-[#FFFDD0] bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <h2 className="text-lg font-medium mb-4 text-black">
        Doanh số theo loại sản phẩm
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 10, top: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis
              type="number"
              stroke="#000000"
              allowDecimals={false}
              tickFormatter={formatCompactNumber}
            />
            <YAxis
              type="category"
              dataKey={"name"}
              stroke="#000000"
              width={120}
              tickMargin={8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderColor: "#4b5563",
              }}
              itemStyle={{ color: "#000000" }}
              formatter={(value) => formatCurrency(value)}
            />
            <Bar dataKey="sales" fill="#6366F1" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesByProductTypeChart;

