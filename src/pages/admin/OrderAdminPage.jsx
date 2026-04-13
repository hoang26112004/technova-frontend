import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  getOrderStatusCounts,
  sortOrders,
  exportOrdersToExcel,
} from "@/components/admin/orderAdmin/orderExcel";
import LayoutAdmin from "./LayoutAdmin";
import OrderFilters from "@/components/admin/orderAdmin/OrderFilters";
import OrderList from "@/components/admin/orderAdmin/OrderList";
import OrderViewModal from "@/components/admin/orderAdmin/OrderViewModal";
import HeaderAdmin from "@/components/admin/HeaderAdmin";
import orderApi from "@/utils/api/orderApi";

const placeholderItem = {
  image: "/vite.svg",
  description: "",
  size: "N/A",
};

const ADMIN_ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const mapOrderToAdmin = (order) => {
  const items =
    order?.items?.map((item) => ({
      id: item.variantId,
      name: `Variant ${item.variantId}`,
      price: `$${Number(item.price || 0).toFixed(2)}`,
      quantity: item.quantity,
      subtotal: `$${Number(item.price || 0) * item.quantity}`,
      ...placeholderItem,
    })) || [];

  const rawStatus = order?.status || "PENDING";
  return {
    // Display ID in UI should be the human-friendly reference if available.
    id: order?.reference || String(order?.id || ""),
    reference: order?.reference || null,
    orderUuid: order?.id || null,
    orderDate: order?.createdDate || new Date().toISOString(),
    sellerName: "TechNova",
    storeName: "TechNova Official",
    sellerContact: "N/A",
    status: rawStatus,
    shippingMethod: "Standard Delivery",
    shippingFee: "Free",
    estimatedDelivery: "N/A",
    recipient: "N/A",
    recipientPhone: "N/A",
    deliveryAddress: "N/A",
    paymentMethod: order?.paymentMethod || "N/A",
    paymentStatus: rawStatus === "PAID" ? "Paid" : "Pending",
    subtotal: `$${Number(order?.totalAmount || 0).toFixed(2)}`,
    discount: null,
    tax: null,
    totalAmount: `$${Number(order?.totalAmount || 0).toFixed(2)}`,
    items,
  };
};

const OrderAdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "orderDate",
    direction: "desc",
  });
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;
    orderApi
      .adminGetAll({ page: 0, size: 50 })
      .then((res) => {
        const items = res?.data?.data?.content || [];
        if (isMounted) setOrders(items.map(mapOrderToAdmin));
      })
      .catch((error) => {
        console.error("Load orders error:", error);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const statusCounts = useMemo(() => getOrderStatusCounts(orders), [orders]);

  const filteredOrders = orders.filter(
    (order) =>
      (String(order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.sellerName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "All" || order.status === statusFilter)
  );

  const sortedOrders = sortOrders(filteredOrders, sortConfig);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleChangeStatus = async (orderUuid, nextStatus) => {
    if (!orderUuid) {
      throw new Error("Missing order id");
    }
    if (!ADMIN_ORDER_STATUSES.includes(nextStatus)) {
      throw new Error("Invalid status");
    }

    await orderApi.changeStatus(orderUuid, nextStatus);

    // Update local state immediately; keep other fields as-is.
    setOrders((prev) =>
      prev.map((o) =>
        o.orderUuid === orderUuid
          ? {
              ...o,
              status: nextStatus,
              paymentStatus: nextStatus === "PAID" ? "Paid" : o.paymentStatus,
            }
          : o
      )
    );
    setSelectedOrder((prev) =>
      prev && prev.orderUuid === orderUuid
        ? { ...prev, status: nextStatus }
        : prev
    );
  };

  const handleExportExcel = () => {
    exportOrdersToExcel(filteredOrders);
  };

  return (
    <LayoutAdmin>
      <div className="flex-1 overflow-auto relative z-10">
        <HeaderAdmin title={"Orders"} />
        <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <OrderFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onExportExcel={handleExportExcel}
              statusCounts={statusCounts}
              totalCount={orders.length}
            />

            <OrderList
              orders={sortedOrders}
              currentPage={currentPage}
              ordersPerPage={ordersPerPage}
              totalOrders={sortedOrders.length}
              onPageChange={setCurrentPage}
              onOrdersPerPageChange={setOrdersPerPage}
              onViewOrder={handleViewOrder}
              onSort={handleSort}
              sortConfig={sortConfig}
            />
            {showModal && selectedOrder && (
              <OrderViewModal
                order={selectedOrder}
                statusOptions={ADMIN_ORDER_STATUSES}
                onChangeStatus={handleChangeStatus}
                onClose={() => setShowModal(false)}
              />
            )}
          </motion.div>
        </main>
      </div>
    </LayoutAdmin>
  );
};

export default OrderAdminPage;
