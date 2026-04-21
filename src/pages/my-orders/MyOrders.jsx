/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/commons/layout/Layout";
import { useNavigate } from "react-router-dom";
import orderApi from "@/utils/api/orderApi";
import productApi from "@/utils/api/productApi";
import variantApi from "@/utils/api/variantApi";
import { resolveImageUrl } from "@/utils/api/mappers";
import { formatOrderStatusVi } from "@/utils/formatters/orderStatus";
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
  const [productsById, setProductsById] = useState({});
  const [variantsById, setVariantsById] = useState({});

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

  useEffect(() => {
    // Load product info to display variant thumbnails + product name inside each order card.
    const items = orders.flatMap((o) => (Array.isArray(o?.items) ? o.items : []));
    if (!items.length) return;

    const uniqueIds = Array.from(new Set(items.map((it) => it?.productId).filter(Boolean)));
    const missing = uniqueIds.filter((pid) => !productsById[pid]);
    if (!missing.length) return;

    let cancelled = false;
    Promise.all(
      missing.map((pid) =>
        productApi
          .getById(pid)
          .then((res) => ({ pid, data: res?.data?.data }))
          .catch(() => ({ pid, data: null }))
      )
    ).then((results) => {
      if (cancelled) return;
      setProductsById((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r?.pid && r?.data) next[r.pid] = r.data;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [orders, productsById]);

  useEffect(() => {
    // Fallback: if item doesn't have productId, still try variant API for image/name.
    const items = orders.flatMap((o) => (Array.isArray(o?.items) ? o.items : []));
    if (!items.length) return;

    const uniqueVariantIds = Array.from(
      new Set(items.map((it) => it?.variantId).filter(Boolean))
    );
    const missing = uniqueVariantIds.filter((vid) => !variantsById[vid]);
    if (!missing.length) return;

    let cancelled = false;
    Promise.all(
      missing.map((vid) =>
        variantApi
          .getById(vid)
          .then((res) => ({ vid, data: res?.data?.data }))
          .catch(() => ({ vid, data: null }))
      )
    ).then((results) => {
      if (cancelled) return;
      setVariantsById((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r?.vid && r?.data) next[r.vid] = r.data;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [orders, variantsById]);

  const getItemDisplay = (it) => {
    const productId = it?.productId;
    const product = productId ? productsById[productId] : null;
    const variantId = it?.variantId;
    const variantInfo = variantId ? variantsById[variantId] : null;

    const variant = product?.variants?.find((v) => String(v?.id) === String(variantId));
    const thumbUrl =
      resolveImageUrl(variant?.imageUrl) ||
      resolveImageUrl(variantInfo?.imageUrl) ||
      resolveImageUrl(product?.images?.[0]?.imageUrl) ||
      "/vite.svg";

    return {
      productId,
      name:
        product?.name ||
        variantInfo?.productName ||
        `Variant: ${String(variantId || "-")}`,
      thumbUrl,
    };
  };

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
                    <div className="my-orders__value">{formatOrderStatusVi(o.status)}</div>
                  </div>
                  <div className="my-orders__row">
                    <div className="my-orders__label">Thanh toán</div>
                    <div className="my-orders__value">
                      {String(o.paymentMethod || "-")}
                    </div>
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

                  <section className="my-orders__items" aria-label="Sản phẩm trong đơn">
                    <div className="my-orders__subRow">
                      <h3 className="my-orders__sub">Sản phẩm</h3>
                    </div>
                    {Array.isArray(o.items) && o.items.length ? (
                      <div className="my-orders__itemList">
                        {o.items.map((it, idx) => {
                          const display = getItemDisplay(it);
                          const canOpen = !!display?.productId;
                          return (
                            <div
                              key={`${it?.variantId || "v"}-${idx}`}
                              className="my-orders__item"
                            >
                              <img
                                className={[
                                  "my-orders__itemThumb",
                                  canOpen ? "my-orders__itemThumb--link" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                src={display.thumbUrl}
                                alt={display.name}
                                onClick={() =>
                                  canOpen && navigate("/product/" + display.productId)
                                }
                              />
                              <div className="my-orders__itemBody">
                                <div
                                  className={[
                                    "my-orders__itemTitle",
                                    canOpen ? "my-orders__itemTitle--link" : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                  onClick={() =>
                                    canOpen && navigate("/product/" + display.productId)
                                  }
                                >
                                  {display.name}
                                </div>
                                <div className="my-orders__itemMeta">
                                  SL: {it?.quantity ?? "-"} | Giá:{" "}
                                  {formatMoney(it?.price)}
                                </div>
                                <div className="my-orders__itemSku">
                                  Variant: {String(it?.variantId || "-")}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="my-orders__muted">Không có sản phẩm.</div>
                    )}
                  </section>
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
