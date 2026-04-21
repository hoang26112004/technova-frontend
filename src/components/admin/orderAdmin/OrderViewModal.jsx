import { MapPin, Package, Truck, User, X } from "lucide-react";
import React from "react";

import { useEffect, useState } from "react";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderItemsGallery from "./OrderItemsGallery";

const OrderViewModal = ({ order, onClose, statusOptions = [], onChangeStatus }) => {
	const [activeTab, setActiveTab] = useState("details"); // 'details' or 'items'
	const [nextStatus, setNextStatus] = useState(order?.status || "PENDING");
	const [updating, setUpdating] = useState(false);
	const [updateError, setUpdateError] = useState("");

	useEffect(() => {
		setNextStatus(order?.status || "PENDING");
		setUpdateError("");
	}, [order?.status, order?.orderUuid, order?.id]);

	if (!order) return null;

	const paymentLabel =
		order.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán";

	const formatNA = (value) => {
		if (!value || value === "N/A") return "-";
		return value;
	};

	const formatShippingMethod = (value) => {
		const v = formatNA(value);
		if (v === "Standard Delivery") return "Giao hàng tiêu chuẩn";
		return v;
	};

	const formatShippingFee = (value) => {
		const v = formatNA(value);
		if (v === "Free") return "Miễn phí";
		return v;
	};

	const formatPaymentMethod = (value) => {
		const v = formatNA(value);
		if (v === "Credit Card") return "Thẻ tín dụng";
		return v;
	};

	return (
		<div className="fixed inset-0 bg-[#0000009e] bg-opacity-50 flex items-center justify-center z-50 p-4 ">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
				<div className="flex justify-between items-center p-4 border-b">
					<h3 className="text-lg font-semibold">
						Đơn hàng #{order.id}
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="flex border-b">
					<button
						className={`px-4 py-2 font-medium ${
							activeTab === "details"
								? "text-orange-600 border-b-2 border-orange-500"
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setActiveTab("details")}
					>
						Chi tiết đơn hàng
					</button>
					<button
						className={`px-4 py-2 font-medium ${
							activeTab === "items"
								? "text-orange-600 border-b-2 border-orange-500"
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setActiveTab("items")}
					>
						Sản phẩm có trong đơn hàng ({order.items.length})
					</button>
				</div>

				<div className="overflow-y-auto flex-1">
					{activeTab === "details" ? (
						<div className="p-6">
							<div className="mb-6">
								<h4 className="text-lg font-medium mb-4">
									Tổng quan đơn hàng
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="bg-gray-50 p-4 rounded-lg">
										<div className="flex items-start">
											<div className="bg-orange-100 p-2 rounded-lg mr-3">
												<Package className="h-5 w-5 text-orange-600" />
											</div>
											<div>
												<div className="text-sm font-medium">
													Thông tin đơn hàng
												</div>
												<div className="mt-2 space-y-2 text-sm">
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Mã đơn hàng:
														</div>
														<div>{order.id}</div>
													</div>
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Ngày đặt:
														</div>
														<div>
															{new Date(
																order.orderDate
															).toLocaleDateString(
																"vi-VN",
																{
																	year: "numeric",
																	month: "long",
																	day: "numeric",
																	hour: "2-digit",
																	minute: "2-digit",
																}
															)}
														</div>
													</div>
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Trạng thái:
														</div>
														<div>
															<OrderStatusBadge
																status={
																	order.status
																}
															/>
														</div>
													</div>
													{typeof onChangeStatus === "function" ? (
														<div className="mt-3">
															<div className="text-xs text-gray-500 mb-1">
																Cập nhật trạng thái
															</div>
															<div className="flex flex-wrap items-center gap-2">
																<select
																	value={nextStatus}
																	onChange={(e) => setNextStatus(e.target.value)}
																	className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
																>
																	{(statusOptions?.length
																		? statusOptions
																		: [
																				"PENDING",
																				"CONFIRMED",
																				"PAID",
																				"SHIPPED",
																				"DELIVERED",
																				"CANCELLED",
																		  ]
																	).map((s) => (
																		<option key={s} value={s}>
																			{s}
																		</option>
																	))}
																</select>
																<button
																	type="button"
																	onClick={async () => {
																		if (updating) return;
																		setUpdateError("");
																		setUpdating(true);
																		try {
																			await onChangeStatus(order.orderUuid, nextStatus);
																		} catch (e) {
																			setUpdateError(
																				e?.message || "Cập nhật trạng thái thất bại."
																			);
																		} finally {
																			setUpdating(false);
																		}
																	}}
																	disabled={
																		updating ||
																		!order.orderUuid ||
																		nextStatus === order.status
																	}
																	className={`px-3 py-2 rounded-lg text-sm text-white ${
																		updating || nextStatus === order.status
																			? "bg-gray-400"
																			: "bg-orange-600 hover:bg-orange-700"
																	}`}
																>
																	{updating ? "Đang cập nhật..." : "Cập nhật"}
																</button>
															</div>
															{updateError ? (
																<div className="mt-2 text-xs text-red-600">
																	{updateError}
																</div>
															) : null}
														</div>
													) : null}
												</div>
											</div>
										</div>
									</div>

									<div className="bg-gray-50 p-4 rounded-lg">
										<div className="flex items-start">
											<div className="bg-blue-100 p-2 rounded-lg mr-3">
												<User className="h-5 w-5 text-blue-600" />
											</div>
											<div>
												<div className="text-sm font-medium">
													Thông tin người bán
												</div>
												<div className="mt-2 space-y-2 text-sm">
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Tên người bán:{" "}
														</div>
														<div>
															{order.sellerName}
														</div>
													</div>
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Tên cửa hàng:
														</div>
														<div>
															{order.storeName ||
																"N/A"}
														</div>
													</div>
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Liên hệ:
														</div>
														<div>
															{order.sellerContact ||
																"N/A"}
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="bg-gray-50 p-4 rounded-lg">
										<div className="flex items-start">
											<div className="bg-green-100 p-2 rounded-lg mr-3">
												<Truck className="h-5 w-5 text-green-600" />
											</div>
											<div>
												<div className="text-sm font-medium">
													Thông tin vận chuyển
												</div>
												<div className="mt-2 space-y-2 text-sm">
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Phương thức vận
															chuyển:
														</div>
															<div>
															{formatShippingMethod(order.shippingMethod)}
														</div>
													</div>
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Phí vận chuyển:
														</div>
														<div>
															{formatShippingFee(order.shippingFee)}
														</div>
													</div>
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Ngày giao hàng:
														</div>
														<div>
															{formatNA(order.estimatedDelivery)}
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="bg-gray-50 p-4 rounded-lg">
										<div className="flex items-start">
											<div className="bg-purple-100 p-2 rounded-lg mr-3">
												<MapPin className="h-5 w-5 text-purple-600" />
											</div>
											<div>
												<div className="text-sm font-medium">
													Địa chỉ nhận đơn
												</div>
												<div className="mt-2 space-y-2 text-sm">
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Người nhận:
														</div>
														<div>
															{formatNA(order.recipient)}
														</div>
													</div>
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Số điện thoại:
														</div>
														<div>
															{formatNA(order.recipientPhone)}
														</div>
													</div>
													<div className="grid grid-cols-2 gap-2">
														<div className="text-gray-500">
															Địa chỉ:
														</div>
														<div>
															{formatNA(order.deliveryAddress)}
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="mb-6">
								<h4 className="text-lg font-medium mb-4">
									Thông tin thanh toán
								</h4>
								<div className="bg-gray-50 p-4 rounded-lg">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<div className="text-sm text-gray-500 mb-1">
												Phương thức thanht toán
											</div>
											<div>
												{formatPaymentMethod(order.paymentMethod)}
											</div>
										</div>
										<div>
											<div className="text-sm text-gray-500 mb-1">
												Trạng thái thanh toán
											</div>
											<div
												className={`px-2 py-1 text-xs inline-block rounded-full ${
													order.paymentStatus ===
													"Paid"
														? "bg-green-100 text-green-800"
														: "bg-yellow-100 text-yellow-800"
												}`}
											>
												{paymentLabel}
											</div>
										</div>
									</div>
								</div>
							</div>

							<div>
								<h4 className="text-lg font-medium mb-4">
									Tổng tiền đơn hàng
								</h4>
								<div className="bg-gray-50 p-4 rounded-lg">
									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-gray-600">
												Tổng tiền:
											</span>
											<span>
												$
												{order.subtotal ||
													order.items
														.reduce(
															(sum, item) =>
																sum +
																parseFloat(
																	item.price.replace(
																		"$",
																		""
																	)
																) *
																	item.quantity,
															0
														)
														.toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">
												Phí vận chuyển:
											</span>
											<span>
												{formatShippingFee(order.shippingFee)}
											</span>
										</div>
										{order.discount && (
											<div className="flex justify-between">
												<span className="text-gray-600">
													Giảm giá:
												</span>
												<span className="text-green-600">
													-{order.discount}
												</span>
											</div>
										)}
										{order.tax && (
											<div className="flex justify-between">
												<span className="text-gray-600">
													Thuế:
												</span>
												<span>{order.tax}</span>
											</div>
										)}
										<div className="border-t pt-2 mt-2 flex justify-between font-semibold">
											<span>Thành tiền:</span>
											<span>{order.totalAmount}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						<OrderItemsGallery
							items={order.items}
							onClose={() => setActiveTab("details")}
						/>
					)}
				</div>

				{/* Footer Actions */}
				<div className="p-4 border-t flex justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300"
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	);
};

export default OrderViewModal;
