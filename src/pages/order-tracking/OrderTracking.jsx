/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/commons/layout/Layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import orderApi from "@/utils/api/orderApi";

import "./OrderTracking.scss";

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

const OrderTracking = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialRef = useMemo(
    () => (searchParams.get("reference") || "").trim(),
    [searchParams]
  );

  const [reference, setReference] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Keep input in sync when user shares a link: /order-tracking?reference=...
    setReference(initialRef);
  }, [initialRef]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const ref = (reference || "").trim();
    setError("");
    setOrder(null);

    if (!ref) {
      setError("Vui lòng nhập mã đơn hàng (reference).");
      return;
    }

    setLoading(true);
    setSearchParams({ reference: ref });
    try {
      const res = await orderApi.getByReference(ref);
      const data = res?.data?.data;
      if (!data?.reference) {
        setError("Không tìm thấy đơn hàng.");
        return;
      }
      setOrder(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("Bạn cần đăng nhập để tra cứu đơn hàng này.");
        return;
      }
      const message =
        err?.response?.data?.data?.message ||
        err?.response?.data?.message ||
        "Tra cứu đơn hàng thất bại. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="order-tracking">
        <div className="order-tracking__container">
          <div className="order-tracking__breadcrumb">
            <span
              onClick={() => navigate("/")}
              className="order-tracking__crumb order-tracking__crumb--link"
            >
              Trang chủ
            </span>
            <span className="order-tracking__sep">/</span>
            <span className="order-tracking__crumb order-tracking__crumb--active">
              Kiểm tra đơn hàng
            </span>
          </div>

          <div className="order-tracking__header">
            <h1>Kiểm tra đơn hàng</h1>
            <p>
              Nhập mã đơn hàng (reference) để xem trạng thái, tổng tiền và danh sách
              sản phẩm.
            </p>
          </div>

          <form className="order-tracking__form" onSubmit={onSubmit}>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="order-tracking__input"
              placeholder="Ví dụ: TN-2026-000123"
              autoComplete="off"
            />
            <button className="order-tracking__btn" type="submit" disabled={loading}>
              {loading ? "Đang tra cứu..." : "Tra cứu"}
            </button>
          </form>

          {error ? (
            <div className="order-tracking__notice order-tracking__notice--error">
              <div>{error}</div>
              {error.includes("đăng nhập") ? (
                <button
                  type="button"
                  className="order-tracking__link"
                  onClick={() => navigate("/auth")}
                >
                  Đi tới đăng nhập
                </button>
              ) : null}
            </div>
          ) : null}

          {order ? (
            <div className="order-tracking__card">
              <div className="order-tracking__row">
                <div className="order-tracking__label">Mã đơn</div>
                <div className="order-tracking__value">{order.reference}</div>
              </div>
              <div className="order-tracking__row">
                <div className="order-tracking__label">Trạng thái</div>
                <div className="order-tracking__value">{String(order.status || "-")}</div>
              </div>
              <div className="order-tracking__row">
                <div className="order-tracking__label">Thanh toán</div>
                <div className="order-tracking__value">
                  {String(order.paymentMethod || "-")}
                </div>
              </div>
              <div className="order-tracking__row">
                <div className="order-tracking__label">Tổng tiền</div>
                <div className="order-tracking__value">
                  {formatMoney(order.totalAmount)}
                </div>
              </div>
              <div className="order-tracking__row">
                <div className="order-tracking__label">Ngày tạo</div>
                <div className="order-tracking__value">
                  {formatDateTime(order.createdDate)}
                </div>
              </div>

              <div className="order-tracking__divider" />

              <h2 className="order-tracking__sub">Sản phẩm</h2>
              {Array.isArray(order.items) && order.items.length ? (
                <div className="order-tracking__items">
                  {order.items.map((it, idx) => (
                    <div className="order-tracking__item" key={`${it?.variantId || "v"}-${idx}`}>
                      <div className="order-tracking__item-main">
                        <div className="order-tracking__item-title">
                          Variant: {String(it?.variantId || "-")}
                        </div>
                        <div className="order-tracking__item-meta">
                          SL: {it?.quantity ?? "-"} | Giá: {formatMoney(it?.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="order-tracking__muted">Không có sản phẩm.</div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
};

export default OrderTracking;

