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
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressCreating, setAddressCreating] = useState(false);
  const [addressDraft, setAddressDraft] = useState({
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    description: "",
    isDefault: false,
  });

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

  const reloadAddresses = async () => {
    const res = await addressApi.getOwn();
    const list = res?.data?.data || [];
    setAddresses(list);
    const defaultAddr = list.find((a) => a.isDefault) || list[0];
    setSelectedAddressId((prev) => prev || defaultAddr?.id || null);
    return list;
  };

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
    setAddressDraft({
      phoneNumber: "",
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      description: "",
      isDefault: false,
    });
    setAddressModalOpen(true);
  };

  const handleAddressDraftChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressDraft((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateAddressPayload = (payload) => {
    const required = ["phoneNumber", "street", "city", "state", "country", "zipCode"];
    for (const k of required) {
      if (!String(payload?.[k] || "").trim()) return false;
    }
    return true;
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    const payload = {
      phoneNumber: String(addressDraft.phoneNumber || "").trim(),
      street: String(addressDraft.street || "").trim(),
      city: String(addressDraft.city || "").trim(),
      state: String(addressDraft.state || "").trim(),
      country: String(addressDraft.country || "").trim(),
      zipCode: String(addressDraft.zipCode || "").trim(),
      description: String(addressDraft.description || "").trim(),
      isDefault: Boolean(addressDraft.isDefault),
    };
    if (!validateAddressPayload(payload)) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ (bắt buộc).");
      return;
    }
    try {
      setAddressCreating(true);
      const res = await addressApi.create(payload);
      const created = res?.data?.data;
      await reloadAddresses();
      if (created?.id) setSelectedAddressId(created.id);
      setAddressModalOpen(false);
      alert("Thêm địa chỉ thành công.");
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Thêm địa chỉ thất bại.";
      alert(message);
    } finally {
      setAddressCreating(false);
    }
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

        {addressModalOpen ? (
          <div
            className="order__modalOverlay"
            role="dialog"
            aria-modal="true"
            onMouseDown={() => (addressCreating ? null : setAddressModalOpen(false))}
          >
            <div
              className="order__modal"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h2>Thêm địa chỉ mới</h2>
              <form onSubmit={handleCreateAddress} className="order__modalForm">
                <label>
                  Số điện thoại nhận hàng
                  <input
                    name="phoneNumber"
                    value={addressDraft.phoneNumber}
                    onChange={handleAddressDraftChange}
                  />
                </label>
                <label>
                  Đường
                  <input
                    name="street"
                    value={addressDraft.street}
                    onChange={handleAddressDraftChange}
                  />
                </label>
                <label>
                  Thành phố
                  <input
                    name="city"
                    value={addressDraft.city}
                    onChange={handleAddressDraftChange}
                  />
                </label>
                <label>
                  Tỉnh/Thành
                  <input
                    name="state"
                    value={addressDraft.state}
                    onChange={handleAddressDraftChange}
                  />
                </label>
                <label>
                  Quốc gia
                  <input
                    name="country"
                    value={addressDraft.country}
                    onChange={handleAddressDraftChange}
                  />
                </label>
                <label>
                  Mã bưu điện
                  <input
                    name="zipCode"
                    value={addressDraft.zipCode}
                    onChange={handleAddressDraftChange}
                  />
                </label>
                <label>
                  Mô tả
                  <textarea
                    name="description"
                    value={addressDraft.description}
                    onChange={handleAddressDraftChange}
                  />
                </label>
                <label className="order__modalCheckbox">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressDraft.isDefault}
                    onChange={handleAddressDraftChange}
                  />
                  Đặt làm địa chỉ mặc định
                </label>
                <div className="order__modalActions">
                  <button type="submit" disabled={addressCreating}>
                    {addressCreating ? "Đang lưu..." : "Lưu địa chỉ"}
                  </button>
                  <button
                    type="button"
                    className="order__modalCancel"
                    onClick={() => setAddressModalOpen(false)}
                    disabled={addressCreating}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default Order;
