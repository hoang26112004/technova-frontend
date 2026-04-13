/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { formatNumber } from "@/utils/function";

import "./Cart.scss";
import TitleRouter from "@/components/product/titleRouter/TitleRouter";
import Layout from "@/components/commons/layout/Layout";
import CartItem from "@/components/cart/CartItem";
import { useDispatch } from "react-redux";
import { setOrderList, setPrice } from "@/store/orderSlice";
import cartApi from "@/utils/api/cartApi";
import { resolveImageUrl } from "@/utils/api/mappers";

const Cart = () => {
  const [listProducts, setListProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const totalPrice = useMemo(() => {
    return selectedProducts.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  }, [selectedProducts]);

  const mapCartItems = (cartItems) =>
    (cartItems || []).map((item) => ({
      id: item.variantId,
      variantId: item.variantId,
      name: item.productName,
      image: [resolveImageUrl(item.imageUrl)],
      price: item.price,
      quantity: item.quantity,
      discount: 0,
      type: "",
    }));

  const refreshCart = async () => {
    try {
      const res = await cartApi.getCart();
      const items = res?.data?.data?.items || [];
      const mapped = mapCartItems(items);
      setListProducts(mapped);
      setSelectedProducts((prev) =>
        prev
          .map((p) => mapped.find((m) => m.id === p.id))
          .filter(Boolean)
      );
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Không lấy được giỏ hàng.";
      alert(message);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const handleIncrease = async (id) => {
    const current = listProducts.find((p) => p.id === id);
    if (!current) return;
    try {
      const res = await cartApi.updateItem(id, current.quantity + 1);
      const items = res?.data?.data?.items || [];
      setListProducts(mapCartItems(items));
      setSelectedProducts((prev) =>
        prev
          .map((p) => {
            const updated = items.find((i) => i.variantId === p.id);
            return updated
              ? { ...p, quantity: updated.quantity, price: updated.price }
              : p;
          })
          .filter(Boolean)
      );
    } catch {
      alert("Cập nhật số lượng thất bại.");
    }
  };

  const handleDecrease = async (id) => {
    const current = listProducts.find((p) => p.id === id);
    if (!current || current.quantity <= 1) return;
    try {
      const res = await cartApi.updateItem(id, current.quantity - 1);
      const items = res?.data?.data?.items || [];
      setListProducts(mapCartItems(items));
      setSelectedProducts((prev) =>
        prev
          .map((p) => {
            const updated = items.find((i) => i.variantId === p.id);
            return updated
              ? { ...p, quantity: updated.quantity, price: updated.price }
              : p;
          })
          .filter(Boolean)
      );
    } catch {
      alert("Cập nhật số lượng thất bại.");
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedProducts((prev) => {
      const index = prev.findIndex((p) => p.id === id);
      if (index === -1) {
        const item = listProducts.find((p) => p.id === id);
        return item ? [...prev, item] : prev;
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleRemove = async (id) => {
    try {
      await cartApi.removeItem(id);
      setListProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Xóa sản phẩm thất bại.");
    }
  };

  const handleClickBuy = () => {
    if (selectedProducts.length === 0) {
      alert("Vui lòng chọn sản phẩm để thanh toán.");
      return;
    }

    dispatch(setOrderList(selectedProducts));
    dispatch(setPrice(totalPrice));
    navigate("/order");
  };

  return (
    <div>
      <Layout>
        <div className="card-page">
          <TitleRouter title="Giỏ hàng" />
          <div className="card">
            <div className="card-container">
              <h1>Giỏ hàng của bạn</h1>
              <div className="card-container__list">
                {listProducts.map((product) => (
                  <CartItem
                    key={product.id}
                    product={product}
                    selectedProducts={selectedProducts}
                    onToggleSelect={handleToggleSelect}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
              <div className="card-container__total">
                <p>
                  Tổng tiền: <span>{formatNumber(totalPrice)} đ</span>
                </p>
                <div className="card-container__total-buttons">
                  <button className="btn1" onClick={() => navigate("/")}>
                    Tiếp tục mua hàng
                  </button>
                  <button className="btn2" onClick={handleClickBuy}>
                    Thanh toán ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Cart;
