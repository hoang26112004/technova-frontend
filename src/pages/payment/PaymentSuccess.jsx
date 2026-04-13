/* eslint-disable */
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/commons/layout/Layout";

import "./PaymentResult.scss";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderRef = (searchParams.get("orderRef") || "").trim();

  useEffect(() => {
    if (!orderRef) return;
    navigate(`/order-tracking?reference=${encodeURIComponent(orderRef)}`, {
      replace: true,
    });
  }, [orderRef, navigate]);

  return (
    <Layout>
      <div className="payment-result">
        <div className="payment-result__container">
          <h1>Thanh toán thành công</h1>
          <p>
            {orderRef
              ? "Đang chuyển đến trang đơn hàng..."
              : "Thiếu mã đơn hàng. Bạn vẫn có thể tra cứu ở trang Tra cứu đơn hàng."}
          </p>
          <div className="payment-result__actions">
            <button
              className="payment-result__btn payment-result__btn--primary"
              onClick={() => navigate("/order-tracking", { replace: true })}
              type="button"
            >
              Tra cứu đơn hàng
            </button>
            <button
              className="payment-result__btn payment-result__btn--ghost"
              onClick={() => navigate("/", { replace: true })}
              type="button"
            >
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
