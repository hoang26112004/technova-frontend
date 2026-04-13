/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/commons/layout/Layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import orderApi from "@/utils/api/orderApi";
import productApi from "@/utils/api/productApi";
import variantApi from "@/utils/api/variantApi";
import { resolveImageUrl } from "@/utils/api/mappers";

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
  const [productsById, setProductsById] = useState({});
  const [variantsById, setVariantsById] = useState({});
  const lastFetchedRef = useRef("");

  useEffect(() => {
    // Keep input in sync when user shares a link: /order-tracking?reference=...
    setReference(initialRef);
  }, [initialRef]);

  useEffect(() => {
    // Load product info to display thumbnails in the order item list.
    const items = order?.items;
    if (!Array.isArray(items) || items.length === 0) return;

    const uniqueIds = Array.from(
      new Set(items.map((it) => it?.productId).filter(Boolean))
    );
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
  }, [order, productsById]);

  useEffect(() => {
    // Fallback: if order items don't include productId (older BE) still try to load variant info for thumbnails.
    const items = order?.items;
    if (!Array.isArray(items) || items.length === 0) return;

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
  }, [order, variantsById]);

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

  const canReview = (ord) =>
    String(ord?.status || "").toUpperCase() === "DELIVERED";

  useEffect(() => {
    // Auto-fetch when landing on a shared link: /order-tracking?reference=...
    const ref = (initialRef || "").trim();
    if (!ref) return;
    if (lastFetchedRef.current === ref) return;

    lastFetchedRef.current = ref;
    setError("");
    setOrder(null);
    setLoading(true);

    orderApi
      .getByReference(ref)
      .then((res) => {
        const data = res?.data?.data;
        if (!data?.reference) {
          setError("KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng.");
          lastFetchedRef.current = "";
          return;
        }
        setOrder(data);
      })
      .catch((err) => {
        lastFetchedRef.current = "";
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setError("Báº¡n cáº§n Ä‘Äƒng nháº­p Ä‘á»ƒ tra cá»©u Ä‘Æ¡n hÃ ng nÃ y.");
          return;
        }
        const message =
          err?.response?.data?.data?.message ||
          err?.response?.data?.message ||
          "Tra cá»©u Ä‘Æ¡n hÃ ng tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.";
        setError(message);
      })
      .finally(() => setLoading(false));
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

    lastFetchedRef.current = ref;
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
                  {order.items.map((it, idx) => {
                    const display = getItemDisplay(it);
                    const reviewable = canReview(order) && !!display?.productId;
                    return (
                    <div className="order-tracking__item" key={`${it?.variantId || "v"}-${idx}`}>
                      <div className="order-tracking__item-main">
                        <img
                          className="order-tracking__item-thumb"
                          src={display.thumbUrl}
                          alt={display.name}
                          onClick={() =>
                            display?.productId && navigate("/product/" + display.productId)
                          }
                        />
                        <div className="order-tracking__item-body">
                          <div
                            className={
                              display?.productId
                                ? "order-tracking__item-title order-tracking__item-title--link"
                                : "order-tracking__item-title"
                            }
                            onClick={() =>
                              display?.productId && navigate("/product/" + display.productId)
                            }
                          >
                            {display.name}
                          </div>
                        <div className="order-tracking__item-meta">
                          SL: {it?.quantity ?? "-"} | Giá: {formatMoney(it?.price)}
                        </div>
                        <div className="order-tracking__item-sku">
                          Variant: {String(it?.variantId || "-")}
                        </div>

                        {canReview(order) ? (
                          <div className="order-tracking__item-actions">
                            <button
                              type="button"
                              className="order-tracking__item-review"
                              disabled={!reviewable}
                              onClick={() => {
                                if (!reviewable) return;
                                navigate(`/product/${display.productId}?review=1`);
                              }}
                            >
                              Đánh giá
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    </div>
                  );
                  })}
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
