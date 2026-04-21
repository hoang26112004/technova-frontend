import { Eye } from "lucide-react";
import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";

const OrderListItem = ({ order, onView }) => {
	const itemsCount = order.items.length;
	const formatShippingFee = (fee) => {
		if (!fee || fee === "N/A") return "-";
		return fee === "Free" ? "Miễn phí" : fee;
	};

	const formattedDate = new Date(order.orderDate).toLocaleDateString(
		"vi-VN",
		{
			year: "numeric",
			month: "short",
			day: "numeric",
		}
	);

	return (
		<tr className="hover:bg-gray-50">
			<td className="px-4 py-4 whitespace-nowrap">
				<div className="font-medium text-gray-900">{order.id}</div>
			</td>
			<td className="px-4 py-4">
				<div className="text-sm text-gray-900">
					{itemsCount} sản phẩm
				</div>
				<div className="text-xs text-gray-500">
					{order.items
						.slice(0, 2)
						.map((item) => item.name)
						.join(", ")}
					{itemsCount > 2 ? `, +${itemsCount - 2} thêm` : ""}
				</div>
			</td>
			<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
				{formattedDate}
			</td>
			<td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
				{order.totalAmount}
			</td>
			<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
				{formatShippingFee(order.shippingFee)}
			</td>
			<td className="px-4 py-4 whitespace-nowrap">
				<OrderStatusBadge status={order.status} />
			</td>
			<td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
				<button
					onClick={() => onView(order)}
					className="cursor-pointer text-blue-600 hover:text-blue-900"
					title="Xem chi tiết"
				>
					<Eye className="h-4 w-4" />
				</button>
			</td>
		</tr>
	);
};

export default OrderListItem;

