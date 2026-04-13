/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/commons/layout/Layout";
import { useNavigate } from "react-router-dom";
import orderApi from "@/utils/api/orderApi";
import { Pagination } from "antd";

import "./MyOrders.scss";

const formatMoney = (value) => {
  const num = typeof value === "number" ? value : Number(value || 0);
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  } catch {
    return `${num} đ`;
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value.replace("T", " ");
  return String(value);
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);

  const statusOptions = useMemo(
    () => [
      { value: "", label: "Tất cả trạng thái" },
      { value: "PENDING", label: "Chờ xử lý" },
      { value: "CONFIRMED", label: "Đã xác nhận" },
      { value: "PAID", label: "Đã thanh toán" },
      { value: "SHIPPED", label: "Đang giao" },
      { value: "DELIVERED", label: "Đã giao" },
      { value: "CANCELLED", label: "Đã hủy" },
    ],
    []
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/auth");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoading(true);
    setError("");
    orderApi
      .getMyOrders({
        page,
        size,
        ...(status ? { status } : {}),
      })
      .then((res) => {
        if (!isMounted) return;
        setData(res?.data?.data || null);
      })
      .catch((err) => {
        const code = err?.response?.status;
        if (code === 401 || code === 403) {
          navigate("/auth");
          return;
        }
        const message =
          err?.response?.data?.data?.message ||
          err?.response?.data?.message ||
          "Không lấy được danh sách đơn hàng.";
        if (isMounted) setError(message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate, page, size, status]);

  const orders = data?.content || [];
  const total = Number(data?.totalElements ?? 0);
  const currentPage = Number(data?.page ?? page) + 1;
  const pageSize = Number(data?.size ?? size);

  return (
    <Layout>
      <div className="my-orders">
        <div className="my-orders__container">
          <div className="my-orders__header">
            <div>
              <h1>Đơn hàng của tôi</h1>
              <p>
                Đây là danh sách đơn hàng của tài khoản đang đăng nhập. Nếu bạn chỉ có mã
                đơn, bạn có thể{" "}
                <span
                  className="my-orders__link"
                  onClick={() => navigate("/order-tracking")}
                >
                  tra cứu theo mã đơn
                </span>
                .
              </p>
            </div>

            <div className="my-orders__filters">
              <select
                className="my-orders__select"
                value={status}
                onChange={(e) => {
                  setPage(0);
                  setStatus(e.target.value);
                }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value || "ALL"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <div className="my-orders__notice my-orders__notice--error">{error}</div> : null}

          <div className="my-orders__list">
            {loading ? (
              <div className="my-orders__notice">Đang tải...</div>
            ) : orders.length ? (
              orders.map((o) => (
                <div key={o.id || o.reference} className="my-orders__card">
                  <div className="my-orders__row">
                    <div className="my-orders__label">Mã đơn</div>
                    <div className="my-orders__value">{o.reference || "-"}</div>
                  </div>
                  <div className="my-orders__row">
                    <div className="my-orders__label">Trạng thái</div>
                    <div className="my-orders__value">{String(o.status || "-")}</div>
                  </div>
                  <div className="my-orders__row">
                    <div className="my-orders__label">Tổng tiền</div>
                    <div className="my-orders__value">{formatMoney(o.totalAmount)}</div>
                  </div>
                  <div className="my-orders__row">
                    <div className="my-orders__label">Ngày tạo</div>
                    <div className="my-orders__value">{formatDateTime(o.createdDate)}</div>
                  </div>
                  <div className="my-orders__row">
                    <div className="my-orders__label">Số sản phẩm</div>
                    <div className="my-orders__value">
                      {Array.isArray(o.items) ? o.items.length : 0}
                    </div>
                  </div>

                  <div className="my-orders__actions">
                    <button
                      className="my-orders__btn"
                      onClick={() =>
                        navigate(`/order-tracking?reference=${encodeURIComponent(o.reference || "")}`)
                      }
                      disabled={!o.reference}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="my-orders__notice">Bạn chưa có đơn hàng nào.</div>
            )}
          </div>

          <div className="my-orders__pager">
            <Pagination
              align="center"
              current={currentPage}
              pageSize={pageSize}
              total={total}
              showSizeChanger={false}
              disabled={loading}
              onChange={(nextPage) => setPage(Math.max(0, Number(nextPage) - 1))}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyOrders;
