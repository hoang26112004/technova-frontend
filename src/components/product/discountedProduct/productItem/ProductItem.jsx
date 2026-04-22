/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "@/utils/function";
import { FaRegHeart } from "react-icons/fa";
import cartApi from "@/utils/api/cartApi";
import {
  isLikedProductId,
  subscribeLikeProducts,
  toggleLikeProduct,
} from "@/utils/favorites";

import "./ProductItem.scss";

const ProductItem = ({ product }) => {
  const [indexImage, setIndexImage] = useState(0);
  const navigate = useNavigate();
  const [liked, setLiked] = useState(() => isLikedProductId(product?.id));

  useEffect(() => {
    setLiked(isLikedProductId(product?.id));
    return subscribeLikeProducts(() => {
      setLiked(isLikedProductId(product?.id));
    });
  }, [product?.id]);

  const handleLike = (item) => {
    const res = toggleLikeProduct(item);
    setLiked(!!res?.liked);
  };

  const images =
    (Array.isArray(product?.image) && product.image.length ? product.image : null) ||
    (Array.isArray(product?.images) && product.images.length ? product.images : null) ||
    ["/vite.svg"];

  const count = product?.count || 0;
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const hasMultipleVariants = variants.length > 1;

  const goToDetailToPick = () => {
    if (!product?.id) return;
    navigate(`/product/${product.id}?pick=1`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    // If product has multiple variants, require the user to pick attributes/variant on detail page.
    if (hasMultipleVariants) {
      goToDetailToPick();
      return;
    }

    const variantId = variants?.[0]?.id;
    // If list payload doesn't include variants, fallback to detail page (it loads full product).
    if (!variantId) {
      goToDetailToPick();
      return;
    }

    try {
      await cartApi.addItem(variantId, 1);
      alert("Đã thêm vào giỏ hàng.");
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Thêm vào giỏ hàng thất bại.";
      alert(message);
    }
  };

  return (
    <div onClick={() => product?.id && navigate(`/product/${product.id}`)} className="product-item">
      <div
        className={`product-item_following ${liked ? "active" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <FaRegHeart onClick={() => handleLike(product)} />
      </div>
      <div className="product-item_img">
        <img src={images[indexImage]} alt={product.name} />
      </div>
      <button className="product-item_add-to-card" onClick={handleAddToCart}>
        {hasMultipleVariants ? "Chọn phiên bản" : "Thêm vào giỏ hàng"}
      </button>
      <div className="product-item_img-list">
        {images.map((image, index) => (
          <div
            onMouseEnter={() => setIndexImage(index)}
            key={index}
            className={`product-item_img-list-item ${index === indexImage ? "active" : ""}`}
          >
            <img src={image} alt={product.name} />
          </div>
        ))}
      </div>
      <p className="product-item_name">{product.name}</p>
      <p className="product-item_sold">
        Số lượng: <span>{count}</span>
      </p>
      <div className="product-item_price">
        <p className="product-item_price-current">{formatNumber(product.price)} đ</p>
      </div>
    </div>
  );
};

export default ProductItem;
