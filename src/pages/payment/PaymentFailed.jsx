/* eslint-disable */
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/commons/layout/Layout";

import "./PaymentResult.scss";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = (searchParams.get("error") || "").trim();

  return (
    <Layout>
      <div className="payment-result">
        <div className="payment-result__container">
          <h1>Thanh toán thất bại</h1>
          <p>
            {error ? `Lý do: ${error}` : "Thanh toán bị hủy hoặc không thành công."}
          </p>
          <div className="payment-result__actions">
            <button
              className="payment-result__btn payment-result__btn--primary"
              onClick={() => navigate("/order", { replace: true })}
              type="button"
            >
              Quay lại thanh toán
            </button>
            <button
              className="payment-result__btn payment-result__btn--ghost"
              onClick={() => navigate("/order-tracking", { replace: true })}
              type="button"
            >
              Tra cứu đơn hàng
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentFailed;
