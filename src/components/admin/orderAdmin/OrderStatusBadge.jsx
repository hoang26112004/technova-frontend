import React from "react";

const OrderStatusBadge = ({ status }) => {
	const meta = (() => {
		switch (status) {
			case "DELIVERED":
				return { label: "Đã giao", cls: "bg-green-100 text-green-800" };
			case "SHIPPED":
				return { label: "Đang giao", cls: "bg-blue-100 text-blue-800" };
			case "PAID":
				return { label: "Đã thanh toán", cls: "bg-emerald-100 text-emerald-800" };
			case "CONFIRMED":
				return { label: "Đã xác nhận", cls: "bg-purple-100 text-purple-800" };
			case "PENDING":
				return { label: "Chờ xử lý", cls: "bg-yellow-100 text-yellow-800" };
			case "CANCELLED":
				return { label: "Đã hủy", cls: "bg-red-100 text-red-800" };
			default:
				return { label: String(status || "-"), cls: "bg-gray-100 text-gray-800" };
		}
	})();

	return (
		<span
			className={`px-2 py-1 text-xs rounded-full ${meta.cls}`}
		>
			{meta.label}
		</span>
	);
};

export default OrderStatusBadge;
