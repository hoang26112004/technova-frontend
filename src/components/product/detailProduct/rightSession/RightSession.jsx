/* eslint-disable */
import React, { useMemo, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { ImHeadphones } from "react-icons/im";
import { FiPackage } from "react-icons/fi";
import { FaTruck } from "react-icons/fa";
import { PiHandCoinsFill } from "react-icons/pi";
import { FaHeart } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import "./RightSession.scss";
import { formatNumber } from "@/utils/function";
import cartApi from "@/utils/api/cartApi";
import { buildVariantLabel, resolveImageUrl } from "@/utils/api/mappers";
import { setOrderList } from "@/store/orderSlice";

const RightSession = ({
  product,
  selectedType = 0,
  onSelectType = () => {},
}) => {
  const [quantity, setQuantity] = useState("1");
  const [isLike, setIsLike] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const variants = product?.variants || [];
  const selectedVariant = useMemo(
    () => variants[selectedType],
    [variants, selectedType]
  );

  const normalizeAttributeType = (type) => {
    const raw = String(type || "").trim();
    if (!raw) return "";
    const lower = raw.toLowerCase();
    // Support both enum-name ("STORAGE") and enum-value ("storage") styles.
    const aliases = {
      color: "COLOR",
      size: "SIZE",
      material: "MATERIAL",
      storage: "STORAGE",
      ram: "RAM",
      weight: "WEIGHT",
    };
    return aliases[lower] || raw.toUpperCase();
  };

  const getNormalizedAttrMap = (variant) => {
    const map = {};
    const attrs = variant?.attributes || [];
    for (const a of attrs) {
      if (!a?.type || a?.value == null) continue;
      const type = normalizeAttributeType(a.type);
      if (!type) continue;
      map[type] = String(a.value);
    }
    return map;
  };

  const selectedAttrMap = useMemo(() => {
    return getNormalizedAttrMap(selectedVariant);
  }, [selectedVariant]);

  const attributeGroups = useMemo(() => {
    // Map<type, Map<value, Variant[]>>
    const groups = new Map();

    for (const v of variants) {
      const map = getNormalizedAttrMap(v);
      for (const [type, value] of Object.entries(map)) {
        if (!groups.has(type)) groups.set(type, new Map());
        const valueMap = groups.get(type);
        if (!valueMap.has(value)) valueMap.set(value, []);
        valueMap.get(value).push(v);
      }
    }

    const priority = ["STORAGE", "COLOR"];
    const keys = Array.from(groups.keys()).sort((a, b) => {
      const ai = priority.indexOf(a);
      const bi = priority.indexOf(b);
      if (ai !== -1 || bi !== -1) {
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }
      return a.localeCompare(b);
    });

    const labelOf = (type) => {
      if (type === "STORAGE") return "Phiên bản";
      if (type === "COLOR") return "Màu sắc";
      if (type === "SIZE") return "Kích thước";
      if (type === "MATERIAL") return "Chất liệu";
      return type;
    };

    return keys.map((type) => {
      const valueMap = groups.get(type);
      const values = Array.from(valueMap.keys()).map((value) => {
        const candidates = valueMap.get(value) || [];
        const anyInStock = candidates.some((c) => Number(c?.stock || 0) > 0);
        const representative =
          candidates.find((c) => Number(c?.stock || 0) > 0) || candidates[0];

        return {
          value,
          disabled: !anyInStock,
          imageUrl:
            type === "COLOR" ? resolveImageUrl(representative?.imageUrl) : "",
        };
      });

      return { type, label: labelOf(type), values };
    });
  }, [variants]);

  const pickVariantIndexForOption = (type, value) => {
    // Choose the "closest" variant that has (type=value).
    // Prefer matching other selected attributes, then in-stock.
    let bestIdx = -1;
    let bestScore = -1;
    let bestInStock = false;

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const map = getNormalizedAttrMap(v);
      const hasPair = String(map?.[type] || "") === String(value);
      if (!hasPair) continue;

      let score = 0;
      for (const [k, sv] of Object.entries(selectedAttrMap)) {
        if (k === type) continue;
        if (map[k] != null && String(map[k]) === String(sv)) score++;
      }

      const inStock = Number(v?.stock || 0) > 0;
      if (
        score > bestScore ||
        (score === bestScore && inStock && !bestInStock) ||
        (score === bestScore && inStock === bestInStock && bestIdx === -1)
      ) {
        bestIdx = i;
        bestScore = score;
        bestInStock = inStock;
      }
    }

    return bestIdx;
  };
  const unitPrice =
    selectedVariant?.price != null ? selectedVariant.price : product?.price;

  const benefits = [
    {
      icon: <ImHeadphones />,
      title: "Giao hàng toàn quốc",
      desc: "Thanh toán (COD) khi nhận hàng",
    },
    {
      icon: <FiPackage />,
      title: "Miễn phí giao hàng",
      desc: "Theo chính sách",
    },
    {
      icon: <FaTruck />,
      title: "Đổi trả trong 7 ngày",
      desc: "Kể từ ngày giao hàng",
    },
    {
      icon: <PiHandCoinsFill />,
      title: "Hỗ trợ 24/7",
      desc: "Theo chính sách",
    },
  ];

  const addToCart = async ({ silent = false } = {}) => {
    const variantId = selectedVariant?.id;
    if (!variantId) {
      alert("Sản phẩm chưa có biến thể để mua.");
      return;
    }
    const qty = Math.max(1, Number(quantity || 1));
    try {
      await cartApi.addItem(variantId, qty);
      if (!silent) alert("Đã thêm vào giỏ hàng.");
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Thêm vào giỏ hàng thất bại.";
      alert(message);
      throw error;
    }
  };

  const handleAddToCart = async () => {
    await addToCart();
  };

  const handleBuyNow = async () => {
    const variantId = selectedVariant?.id;
    if (!variantId) {
      alert("Sản phẩm chưa có biến thể để mua.");
      return;
    }

    const qty = Math.max(1, Number(quantity || 1));
    const unitPrice =
      selectedVariant?.price != null ? selectedVariant.price : product?.price;
    const image =
      resolveImageUrl(selectedVariant?.imageUrl) ||
      (Array.isArray(product?.images) ? product.images[0] : "") ||
      "/vite.svg";

    try {
      // Keep current backend flow: order placement removes items from cart.
      await addToCart({ silent: true });
    } catch {
      return;
    }

    dispatch(
      setOrderList([
        {
          id: variantId,
          variantId,
          name: product?.name || "",
          image: [image],
          price: Number(unitPrice || 0),
          quantity: qty,
          discount: 0,
          type: buildVariantLabel(selectedVariant),
        },
      ])
    );
    navigate("/order");
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
        <span className="right-session__price__current">
          {formatNumber(unitPrice)} đ
        </span>
      </div>
      {attributeGroups.length > 0 ? (
        <div className="right-session__attrs">
          {attributeGroups.map((group) => (
            <div key={group.type} className="right-session__attr-group">
              <p>{group.label}</p>
              <div className="right-session__attr-options">
                {group.values.map((opt) => {
                  const isActive =
                    String(selectedAttrMap?.[group.type] || "") ===
                    String(opt.value);
                  return (
                    <button
                      key={`${group.type}:${opt.value}`}
                      type="button"
                      disabled={opt.disabled}
                      className={[
                        "right-session__attr-option",
                        isActive ? "active" : "",
                        opt.disabled ? "disabled" : "",
                        group.type === "COLOR" ? "color" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => {
                        const idx = pickVariantIndexForOption(
                          group.type,
                          opt.value
                        );
                        if (idx >= 0) onSelectType(idx);
                      }}
                      title={opt.disabled ? "Hết hàng" : ""}
                    >
                      {group.type === "COLOR" && opt.imageUrl ? (
                        <img
                          className="right-session__attr-thumb"
                          src={opt.imageUrl}
                          alt={opt.value}
                        />
                      ) : null}
                      <span className="right-session__attr-value">
                        {opt.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="right-session__type">
          <p>Phân loại</p>
          <div className="right-session__type__buttons">
            {(product.types || ["Default"]).map((type, index) => (
              <button
                onClick={() => onSelectType(index)}
                key={index}
                className={`${selectedType === index ? "active" : ""}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="right-session__quantity-group">
        <p>Số lượng</p>
        <div className="right-session__quantity-group__quantity">
          <div className="right-session__quantity-group__quantity-buttons">
            <button
              onClick={() =>
                setQuantity((prev) => {
                  const cur = Number(prev || 1);
                  return String(cur > 1 ? cur - 1 : 1);
                })
              }
            >
              -
            </button>
            <input
              name="quantity"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
            />
            <button
              onClick={() =>
                setQuantity((prev) => String(Number(prev || 1) + 1))
              }
            >
              +
            </button>
          </div>
          <p>Tìm kiếm sản phẩm tương tự</p>
        </div>
      </div>
      <div className="right-session__button">
        <button className="right-session__button-add" onClick={handleAddToCart}>
          Thêm vào giỏ hàng
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
