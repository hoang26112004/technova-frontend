/* eslint-disable */
import React, { useMemo, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { ImHeadphones } from "react-icons/im";
import { FiPackage } from "react-icons/fi";
import { FaTruck } from "react-icons/fa";
import { PiHandCoinsFill } from "react-icons/pi";
import { FaHeart } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import "./RightSession.scss";
import { formatNumber } from "@/utils/function";
import cartApi from "@/utils/api/cartApi";

const RightSession = ({ product }) => {
  const [infoSelect, setInfoSelect] = useState({
    type: 0,
    quantity: "1",
  });
  const [isLike, setIsLike] = useState(false);
  const navigate = useNavigate();

  const variants = product?.variants || [];
  const selectedVariant = useMemo(
    () => variants[infoSelect.type],
    [variants, infoSelect.type]
  );
  const unitPrice =
    selectedVariant?.price != null ? selectedVariant.price : product?.price;
  const discount = Number(product?.discount || 0);

  const benefits = [
    {
      icon: <ImHeadphones />,
      title: "Giao hang toan quoc",
      desc: "Thanh toan (COD) khi nhan hang",
    },
    {
      icon: <FiPackage />,
      title: "Mien phi giao hang",
      desc: "Theo chinh sach",
    },
    {
      icon: <FaTruck />,
      title: "Doi tra trong 7 ngay",
      desc: "Ke tu ngay giao hang",
    },
    {
      icon: <PiHandCoinsFill />,
      title: "Ho tro 24/7",
      desc: "Theo chinh sach",
    },
  ];

  const handleAddToCart = async () => {
    const variantId = selectedVariant?.id;
    if (!variantId) {
      alert("San pham chua co bien the de mua.");
      return;
    }
    const qty = Math.max(1, Number(infoSelect.quantity || 1));
    try {
      await cartApi.addItem(variantId, qty);
      alert("Da them vao gio hang.");
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Them vao gio hang that bai.";
      alert(message);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  return (
    <div className="right-session">
      <div className="right-session__product-name">
        <h1>{product.name}</h1>
        <div className="right-session__product-name__icons">
          {isLike ? (
            <FaHeart
              onClick={() => setIsLike(!isLike)}
              style={{ fontSize: "24px", cursor: "pointer", color: "#ff6347" }}
            />
          ) : (
            <FaRegHeart
              onClick={() => setIsLike(!isLike)}
              style={{ fontSize: "24px", cursor: "pointer" }}
            />
          )}
          <button>{product.status}</button>
        </div>
      </div>
      <div className="right-session__price">
        <span
          className={`right-session__price__sale ${
            discount > 0 ? "" : "hidden"
          }`}
        >
          {formatNumber(unitPrice * (1 - discount / 100))} d
        </span>
        <span className="right-session__price__real">
          {formatNumber(unitPrice)} d
        </span>
      </div>
      <div className="right-session__type">
        <p>Phan loai</p>
        <div className="right-session__type__buttons">
          {(product.types || ["Default"]).map((type, index) => (
            <button
              onClick={() => setInfoSelect({ ...infoSelect, type: index })}
              key={index}
              className={`${infoSelect.type === index ? "active" : ""}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="right-session__quantity-group">
        <p>So luong</p>
        <div className="right-session__quantity-group__quantity">
          <div className="right-session__quantity-group__quantity-buttons">
            <button
              onClick={() =>
                setInfoSelect({
                  ...infoSelect,
                  quantity:
                    Number(infoSelect.quantity) > 1
                      ? Number(infoSelect.quantity) - 1
                      : 1,
                })
              }
            >
              -
            </button>
            <input
              name="quantity"
              value={infoSelect.quantity}
              onChange={(e) =>
                setInfoSelect({ ...infoSelect, quantity: e.target.value })
              }
            />
            <button
              onClick={() =>
                setInfoSelect({
                  ...infoSelect,
                  quantity: Number(infoSelect.quantity) + 1,
                })
              }
            >
              +
            </button>
          </div>
          <p>Tim kiem san pham tuong tu</p>
        </div>
      </div>
      <div className="right-session__button">
        <button className="right-session__button-add" onClick={handleAddToCart}>
          Them vao gio hang
        </button>
        <button className="right-session__button-buy" onClick={handleBuyNow}>
          Mua ngay
        </button>
      </div>
      <div className="right-session__benefits">
        {benefits.map((benefit, index) => (
          <div key={index} className="right-session__benefits__item">
            <div className="right-session__benefits__icon-item">
              {benefit.icon}
            </div>
            <div className="right-session__benefits__content-item">
              <p className="title-item">{benefit.title} :</p>
              <p className="content-item">{benefit.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightSession;
