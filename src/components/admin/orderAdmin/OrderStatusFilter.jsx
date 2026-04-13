import React from "react";

const OrderStatusFilter = ({
	statusFilter,
	onFilterChange,
	statusCounts,
	totalCount,
}) => {
	return (
		<div className="w-full sm:w-auto flex flex-wrap gap-2">
			<span className="text-sm font-medium text-gray-700 self-center mr-2">
				Trạng thái:
			</span>
			<button
				onClick={() => onFilterChange("All")}
				className={`px-3 py-1 rounded-md text-sm ${
					statusFilter === "All"
						? "bg-orange-500 text-white"
						: "bg-gray-100 text-gray-700 hover:bg-gray-200"
				}`}
			>
				Tất cả ({totalCount})
			</button>
			<button
				onClick={() => onFilterChange("DELIVERED")}
				className={`px-3 py-1 rounded-md text-sm ${
					statusFilter === "DELIVERED"
						? "bg-green-600 text-white"
						: "bg-green-100 text-green-800 hover:bg-green-200"
				}`}
			>
				Đã giao ({statusCounts["DELIVERED"] || 0})
			</button>
			<button
				onClick={() => onFilterChange("SHIPPED")}
				className={`px-3 py-1 rounded-md text-sm ${
					statusFilter === "SHIPPED"
						? "bg-blue-600 text-white"
						: "bg-blue-100 text-blue-800 hover:bg-blue-200"
				}`}
			>
				Đang giao ({statusCounts["SHIPPED"] || 0})
			</button>
			<button
				onClick={() => onFilterChange("PENDING")}
				className={`px-3 py-1 rounded-md text-sm ${
					statusFilter === "PENDING"
						? "bg-yellow-500 text-white"
						: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
				}`}
			>
				Chờ xử lý ({statusCounts["PENDING"] || 0})
			</button>
			<button
				onClick={() => onFilterChange("CANCELLED")}
				className={`px-3 py-1 rounded-md text-sm ${
					statusFilter === "CANCELLED"
						? "bg-red-600 text-white"
						: "bg-red-100 text-red-800 hover:bg-red-200"
				}`}
			>
				Đã hủy ({statusCounts["CANCELLED"] || 0})
			</button>
		</div>
	);
};

export default OrderStatusFilter;
