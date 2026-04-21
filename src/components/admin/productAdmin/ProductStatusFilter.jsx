import React from "react";

const ProductStatusFilter = ({
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
				onClick={() => onFilterChange("Active")}
				className={`px-3 py-1 rounded-md text-sm ${
					statusFilter === "Active"
						? "bg-green-600 text-white"
						: "bg-green-100 text-green-800 hover:bg-green-200"
				}`}
			>
				Đang bán ({statusCounts["Active"]})
			</button>
			<button
				onClick={() => onFilterChange("Inactive")}
				className={`px-3 py-1 rounded-md text-sm ${
					statusFilter === "Inactive"
						? "bg-gray-700 text-white"
						: "bg-gray-100 text-gray-800 hover:bg-gray-200"
				}`}
			>
				Ngừng bán ({statusCounts["Inactive"]})
			</button>
			<button
				onClick={() => onFilterChange("Low Stock")}
				className={`px-3 py-1 rounded-md text-sm ${
					statusFilter === "Low Stock"
						? "bg-yellow-500 text-white"
						: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
				}`}
			>
				Sắp hết hàng ({statusCounts["Low Stock"]})
			</button>
			<button
				onClick={() => onFilterChange("Out of Stock")}
				className={`px-3 py-1 rounded-md text-sm ${
					statusFilter === "Out of Stock"
						? "bg-red-600 text-white"
						: "bg-red-100 text-red-800 hover:bg-red-200"
				}`}
			>
				Hết hàng ({statusCounts["Out of Stock"]})
			</button>
		</div>
	);
};

export default ProductStatusFilter;
