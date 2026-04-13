/* eslint-disable */
import React, { useEffect, useState } from "react";

import "./Order.scss";
import Layout from "@/components/commons/layout/Layout";
import LeftOrder from "@/components/order/leftOrder/LeftOrder";
import RightOrder from "@/components/order/rightOrder/RightOrder";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import addressApi from "@/utils/api/addressApi";
import orderApi from "@/utils/api/orderApi";
import paymentApi from "@/utils/api/paymentApi";
import cartApi from "@/utils/api/cartApi";
import { setOrderList } from "@/store/orderSlice";

const Order = () => {
  const selectedProducts = useSelector((state) => state.order.orderList);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    addressApi
      .getOwn()
      .then((res) => {
        const list = res?.data?.data || [];
        if (!isMounted) return;
        setAddresses(list);
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr?.id || null);
      })
      .catch((error) => {
        console.error("Load addresses error:", error);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleIncrease = (id) => {
    dispatch(
      setOrderList(
        selectedProducts.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    );
  };

  const handleDecrease = (id) => {
    dispatch(
      setOrderList(
        selectedProducts.map((item) =>
          item.id === id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      )
    );
  };

  const handleAddAddress = () => {
    alert("Vui lòng thêm địa chỉ trong trang tài khoản.");
  };

  const handlePlaceOrder = async () => {
    if (!selectedProducts.length) {
      alert("Không có sản phẩm để đặt hàng.");
      return;
    }
    if (!selectedAddressId) {
      alert("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }
    if (paymentMethod === "MOMO") {
      alert("Chưa hỗ trợ thanh toán Momo.");
      return;
    }
    const payload = {
      items: selectedProducts.map((item) => ({
        variantId: item.variantId || item.id,
        quantity: item.quantity,
      })),
      paymentMethod,
      addressId: selectedAddressId,
      notes: "",
      bankCode: null,
      language: "vn",
    };
    try {
      setPlacing(true);
      const res = await orderApi.create(payload);
      const order = res?.data?.data;
      if (paymentMethod === "VN_PAY" && order?.reference) {
        const paymentRes = await paymentApi.createVnpayLink(order.reference);
        const paymentUrl = paymentRes?.data?.data;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      }
      await Promise.all(
        selectedProducts.map((item) =>
          cartApi.removeItem(item.variantId || item.id)
        )
      );
      alert("Đặt hàng thành công.");
      dispatch(setOrderList([]));

      const ref = (order?.reference || "").trim();
      if (ref) {
        navigate(`/order-tracking?reference=${encodeURIComponent(ref)}`, {
          replace: true,
        });
      } else {
        navigate("/my-orders", { replace: true });
      }
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Đặt hàng thất bại.";
      alert(message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Layout>
      <div className="order">
        <LeftOrder
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={setSelectedAddressId}
          paymentMethod={paymentMethod}
          onSelectPayment={setPaymentMethod}
          onAddAddress={handleAddAddress}
        />
        <RightOrder
          products={selectedProducts}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          onPlaceOrder={placing ? () => {} : handlePlaceOrder}
        />
      </div>
    </Layout>
  );
};

export default Order;
