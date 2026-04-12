/* eslint-disable */
import React, { useMemo } from "react";

import "./RightOrder.scss";
import { formatNumber } from "@/utils/function";
import { GrFormPrevious } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

const RightOrder = ({ products, onIncrease, onDecrease, onPlaceOrder }) => {
  const navigate = useNavigate();
  const total = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
      ),
    [products]
  );

  return (
    <div className="rightOrder">
      <h1>Đơn hàng ({products.length} sản phẩm)</h1>
      <div className="rightOrder__list">
        {products.map((product) => (
          <div key={product.id} className="rightOrder__list-item">
            <img src={product.image?.[0]} />
            <div className="rightOrder__list-item-info">
              <p>{product.name}</p>
              <p className="rightOrder__list-item-info-type">
                {product.type || ""}
              </p>
              <div className="rightOrder__list-item-info-price">
                <div className="rightOrder__list-item-info-price-quantity">
                  <button
                    className="rightOrder__list-item-info-price-quantity-button"
                    onClick={() => onDecrease(product.id)}
                  >
                    -
                  </button>
                  <span>{product.quantity}</span>
                  <button
                    className="rightOrder__list-item-info-price-quantity-button"
                    onClick={() => onIncrease(product.id)}
                  >
                    +
                  </button>
                </div>
                <p>{formatNumber(product.price * product.quantity)} d</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rightOrder__total-container">
        <div className="rightOrder__total-container-item">
          <div className="rightOrder__total-container-item-i">
            <p>Tạm tính:</p>
            <p>{formatNumber(total)} d</p>
          </div>
          <div className="rightOrder__total-container-item-i">
            <p>Phí vận chuyển:</p>
            <p>0 d</p>
          </div>
        </div>
      </div>
      <div className="rightOrder__total-container">
        <div className=" total-item">
          <p>Tổng cộng:</p>
          <p>{formatNumber(total)} d</p>
        </div>
      </div>
      <div className="rightOrder__button">
        <p className="rightOrder__button-back" onClick={() => navigate("/cart")}>
          <span>
            <GrFormPrevious />
          </span>
          Quay lại giỏ hàng
        </p>
        <button className="rightOrder__button-btn" onClick={onPlaceOrder}>
          Đặt hàng
        </button>
      </div>
    </div>
  );
};

export default RightOrder;
