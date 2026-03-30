/* eslint-disable */
import React, { useEffect, useState } from "react";

import "./Order.scss";
import Layout from "@/components/commons/layout/Layout";
import LeftOrder from "@/components/order/leftOrder/LeftOrder";
import RightOrder from "@/components/order/rightOrder/RightOrder";
import { useDispatch, useSelector } from "react-redux";
import addressApi from "@/utils/api/addressApi";
import orderApi from "@/utils/api/orderApi";
import paymentApi from "@/utils/api/paymentApi";
import cartApi from "@/utils/api/cartApi";
import { setOrderList } from "@/store/orderSlice";

const Order = () => {
  const selectedProducts = useSelector((state) => state.order.orderList);
  const dispatch = useDispatch();
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
    alert("Vui long them dia chi trong trang tai khoan.");
  };

  const handlePlaceOrder = async () => {
    if (!selectedProducts.length) {
      alert("Khong co san pham de dat hang.");
      return;
    }
    if (!selectedAddressId) {
      alert("Vui long chon dia chi giao hang.");
      return;
    }
    if (paymentMethod === "MOMO") {
      alert("Chua ho tro thanh toan Momo.");
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
      alert("Dat hang thanh cong.");
      dispatch(setOrderList([]));
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Dat hang that bai.";
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
