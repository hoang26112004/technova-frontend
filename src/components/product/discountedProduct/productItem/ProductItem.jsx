/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "@/utils/function";
import { FaRegHeart } from "react-icons/fa";
import cartApi from "@/utils/api/cartApi";

import "./ProductItem.scss";

const ProductItem = ({ product }) => {
  const [indexImage, setIndexImage] = useState(0);
  const navigate = useNavigate();
  const [isFettching, setIsFetching] = useState(false);
  const [likeProducts, setLikeProducts] = useState(
    JSON.parse(localStorage.getItem("likeProducts")) || []
  );

  useEffect(() => {
    setLikeProducts(JSON.parse(localStorage.getItem("likeProducts")) || []);
  }, [isFettching]);

  const isLiked = (item) => likeProducts.some((p) => p.id === item.id);

  const handleLike = (item) => {
    setIsFetching(!isFettching);
    const isLike = isLiked(item);
    if (isLike) {
      const updatedLikeProducts = likeProducts.filter((p) => p.id !== item.id);
      localStorage.setItem("likeProducts", JSON.stringify(updatedLikeProducts));
    } else {
      likeProducts.push(item);
      localStorage.setItem("likeProducts", JSON.stringify(likeProducts));
    }
  };

  const discount = Number(product?.discount || 0);
  const images = product?.image || ["/vite.svg"];
  const count = product?.count || 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const variantId = product?.variants?.[0]?.id;
    if (!variantId) {
      alert("San pham chua co bien the de mua.");
      return;
    }
    try {
      await cartApi.addItem(variantId, 1);
      alert("Da them vao gio hang.");
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Them vao gio hang that bai.";
      alert(message);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="product-item"
    >
      {discount > 0 && (
        <button className="product-item_discount">- {discount}%</button>
      )}
      <div
        className={`product-item_following ${isLiked(product) ? "active" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <FaRegHeart onClick={() => handleLike(product)} />
      </div>
      <div className="product-item_img">
        <img src={images[indexImage]} alt={product.name} />
      </div>
      <button className="product-item_add-to-card" onClick={handleAddToCart}>
        Them vao gio hang
      </button>
      <div className="product-item_img-list">
        {images.map((image, index) => (
          <div
            onMouseEnter={() => setIndexImage(index)}
            key={index}
            className={`product-item_img-list-item ${
              index === indexImage ? "active" : ""
            }`}
          >
            <img src={image} alt={product.name} />
          </div>
        ))}
      </div>
      <p className="product-item_name">{product.name}</p>
      <p className="product-item_sold">
        So luong: <span>{count}</span>
      </p>
      <div className="product-item_price">
        <p className="product-item_price-fake">
          {formatNumber(product.price * (1 - discount / 100))}d
        </p>
        <p className="product-item_price-real">
          {formatNumber(product.price)} d
        </p>
      </div>
    </div>
  );
};

export default ProductItem;
