import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SaleOverviewChart = ({ data = [] }) => {
  return (
    <motion.div
      className=" bg-[#FFFDD0] bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-lg font-medium mb-4 text-black">Sale Overview</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey={"name"} stroke="#000000"/>
            <YAxis stroke="#000000" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color:"#000000" }}
            />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{
                  fill: "#6366f1",
                  strokeWidth: 2,
                  r: 6,
                }}
                activeDot={{ r: 8, strokeWidth: 2 }}
              />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SaleOverviewChart;
