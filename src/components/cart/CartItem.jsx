/* eslint-disable */
import React from "react";
import { MdCancel } from "react-icons/md";
import { FaCaretDown } from "react-icons/fa6";
import { formatNumber } from "@/utils/function";

import "./CartItem.scss";

const CartItem = ({
  product,
  selectedProducts,
  onToggleSelect,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const isSelected = selectedProducts.some((p) => p.id === product.id);
  const discount = Number(product?.discount || 0);

  return (
    <div className="card-item">
      <div className="card-item__left">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(product.id)}
        />

        <img src={product.image?.[0]} alt="product" />

        <div className="card-item__left-info">
          <h3>{product.name}</h3>
          <p>{product.type || ""}</p>
          <p className="price">
            <span className="sale">
              {formatNumber(product.price * (1 - discount / 100))} d
            </span>
            -<span className="real">{formatNumber(product.price)} d</span>
          </p>
          <div className="quantity">
            <button onClick={() => onDecrease(product.id)}>-</button>
            <span>{product.quantity}</span>
            <button onClick={() => onIncrease(product.id)}>+</button>
          </div>
          <p className="price__res">
            {formatNumber(
              product.quantity * product.price * (1 - discount / 100)
            )}{" "}
            d
          </p>
        </div>
      </div>

      <div className="card-item__right">
        <p className="price">
          {formatNumber(
            product.quantity * product.price * (1 - discount / 100)
          )}{" "}
          d
        </p>
        <div className="card-item__right-search">
          <MdCancel className="icon-cancel" onClick={() => onRemove(product.id)} />
          <div className="search">
            <p>Tim kiem san pham tuong tu</p>
            <FaCaretDown className="icon-down" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
