export const formatOrderStatusVi = (status) => {
  const raw = String(status || "").trim();
  if (!raw) return "-";

  const key = raw.toUpperCase();
  const map = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    PAID: "Đã thanh toán",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
    CANCELED: "Đã hủy",
    RETURNED: "Đã trả",
    REFUNDED: "Đã hoàn tiền",
  };

  return map[key] || raw;
};

