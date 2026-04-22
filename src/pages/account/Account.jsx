/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/commons/layout/Layout";
import userApi from "@/utils/api/userApi";
import addressApi from "@/utils/api/addressApi";
import "./Account.scss";

const emptyProfile = {
  fullName: "",
  phoneNumber: "",
  gender: "",
  dateOfBirth: "",
};

const emptyAddress = {
  phoneNumber: "",
  street: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  description: "",
  isDefault: false,
};

const Account = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [addresses, setAddresses] = useState([]);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressDeletingId, setAddressDeletingId] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const resolvedAvatarUrl =
    avatarUrl && avatarUrl.startsWith("http")
      ? avatarUrl
      : avatarUrl
      ? `${apiBase}${avatarUrl}`
      : "";

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/auth");
      return;
    }
    let isMounted = true;
    Promise.all([userApi.getMe(), addressApi.getOwn()])
      .then(([meRes, addrRes]) => {
        if (!isMounted) return;
        const data = meRes?.data?.data;
        setProfile({
          fullName: data?.fullName || "",
          phoneNumber: data?.phoneNumber || "",
          gender:
            data?.gender === true ? "true" : data?.gender === false ? "false" : "",
          dateOfBirth: data?.dateOfBirth || "",
        });
        setAvatarUrl(data?.avatarUrl || "");
        setAddresses(addrRes?.data?.data || []);
      })
      .catch((error) => {
        const message =
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          "Không lấy được thông tin tài khoản.";
        alert(message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const reloadAddresses = async () => {
    const res = await addressApi.getOwn();
    setAddresses(res?.data?.data || []);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        fullName: profile.fullName || null,
        phoneNumber: profile.phoneNumber || null,
        gender:
          profile.gender === "true"
            ? true
            : profile.gender === "false"
            ? false
            : null,
        dateOfBirth: profile.dateOfBirth || null,

      };
      await userApi.updateMe(payload);
      alert("Cập nhật thông tin thành công.");
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Cập nhật thông tin thất bại.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await userApi.uploadAvatar(file);
      const data = res?.data?.data;
      setAvatarUrl(data?.avatarUrl || "");
      alert("Cập nhật avatar thành công.");
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Upload avatar thất bại.";
      alert(message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setAddressFormOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr?.id ?? null);
    setAddressForm({
      phoneNumber: addr?.phoneNumber || "",
      street: addr?.street || "",
      city: addr?.city || "",
      state: addr?.state || "",
      country: addr?.country || "",
      zipCode: addr?.zipCode || "",
      description: addr?.description || "",
      isDefault: Boolean(addr?.isDefault),
    });
    setAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setAddressFormOpen(false);
  };

  const validateAddressPayload = (payload) => {
    const required = ["phoneNumber", "street", "city", "state", "country", "zipCode"];
    for (const k of required) {
      if (!String(payload?.[k] || "").trim()) return false;
    }
    return true;
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    const payload = {
      phoneNumber: String(addressForm.phoneNumber || "").trim(),
      street: String(addressForm.street || "").trim(),
      city: String(addressForm.city || "").trim(),
      state: String(addressForm.state || "").trim(),
      country: String(addressForm.country || "").trim(),
      zipCode: String(addressForm.zipCode || "").trim(),
      description: String(addressForm.description || "").trim(),
      isDefault: Boolean(addressForm.isDefault),
    };

    if (!validateAddressPayload(payload)) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ (bắt buộc).");
      return;
    }

    try {
      setAddressSaving(true);
      if (editingAddressId) {
        await addressApi.update(editingAddressId, payload);
      } else {
        await addressApi.create(payload);
      }
      await reloadAddresses();
      closeAddressForm();
      alert("Lưu địa chỉ thành công.");
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Lưu địa chỉ thất bại.";
      alert(message);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!id) return;
    const ok = window.confirm("Xóa địa chỉ này?");
    if (!ok) return;

    try {
      setAddressDeletingId(id);
      await addressApi.remove(id);
      await reloadAddresses();
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Xóa địa chỉ thất bại.";
      alert(message);
    } finally {
      setAddressDeletingId(null);
    }
  };

  const handleSetDefault = async (addr) => {
    if (!addr?.id) return;
    try {
      setAddressSaving(true);
      await addressApi.update(addr.id, {
        phoneNumber: addr.phoneNumber,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        zipCode: addr.zipCode,
        description: addr.description,
        isDefault: true,
      });
      await reloadAddresses();
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Không đặt được địa chỉ mặc định.";
      alert(message);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setChangingPassword(true);
      await userApi.changePassword(passwords);
      alert("Đổi mật khẩu thành công.");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Đổi mật khẩu thất bại.";
      alert(message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="account-page">
        <h1>Tài khoản</h1>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="account-grid">
            <section className="account-card">
              <h2>Thông tin cá nhân</h2>
              <div className="account-avatar">
                <img
                  src={resolvedAvatarUrl || "/vite.svg"}
                  alt="avatar"
                  className="account-avatar__img"
                />
                <label className="account-avatar__upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadAvatar}
                    disabled={uploading}
                  />
                  {uploading ? "Đang upload..." : "Đổi ảnh"}
                </label>
              </div>
              <form onSubmit={handleSaveProfile} className="account-form">
                <label>
                  Họ tên
                  <input
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                  />
                </label>
                <label>
                  Số điện thoại
                  <input
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleProfileChange}
                  />
                </label>
                <label>
                  Giới tính
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleProfileChange}
                  >
                    <option value="">Chọn</option>
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </label>
                <label>
                  Ngày sinh
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleProfileChange}
                  />
                </label>

                <button type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>

              <div className="account-addresses">
                <div className="account-addresses__header">
                  <h3>Địa chỉ nhận hàng</h3>
                  <button
                    type="button"
                    className="account-button-secondary"
                    onClick={openCreateAddress}
                  >
                    Thêm địa chỉ
                  </button>
                </div>

                {addresses.length ? (
                  <div className="account-addresses__list">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="account-addresses__item">
                        <div className="account-addresses__item-main">
                          <div className="account-addresses__item-title">
                            <strong>{addr.description || "Địa chỉ"}</strong>
                            {addr.isDefault ? (
                              <span className="account-addresses__badge">
                                Mặc định
                              </span>
                            ) : null}
                          </div>
                          <div className="account-addresses__item-lines">
                            <div>{addr.phoneNumber}</div>
                            <div>
                              {addr.street}, {addr.city}, {addr.state},{" "}
                              {addr.country} ({addr.zipCode})
                            </div>
                          </div>
                        </div>
                        <div className="account-addresses__actions">
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              className="account-button-link"
                              onClick={() => handleSetDefault(addr)}
                              disabled={addressSaving}
                            >
                              Đặt mặc định
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="account-button-link"
                            onClick={() => openEditAddress(addr)}
                            disabled={addressSaving}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="account-button-link account-button-link--danger"
                            onClick={() => handleDeleteAddress(addr.id)}
                            disabled={addressDeletingId === addr.id}
                          >
                            {addressDeletingId === addr.id ? "Đang xóa..." : "Xóa"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="account-addresses__empty">
                    Chọn "Thêm địa chỉ" để tạo địa chỉ giao hàng.
                  </p>
                )}

                {addressFormOpen ? (
                  <form
                    onSubmit={handleSubmitAddress}
                    className="account-form account-addresses__form"
                  >
                    <h3>
                      {editingAddressId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                    </h3>
                    <label>
                      Số điện thoại nhận hàng
                      <input
                        name="phoneNumber"
                        value={addressForm.phoneNumber}
                        onChange={handleAddressFormChange}
                      />
                    </label>
                    <label>
                      Đường
                      <input
                        name="street"
                        value={addressForm.street}
                        onChange={handleAddressFormChange}
                      />
                    </label>
                    <label>
                      Thành phố
                      <input
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressFormChange}
                      />
                    </label>
                    <label>
                      Tỉnh/Thành
                      <input
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressFormChange}
                      />
                    </label>
                    <label>
                      Quốc gia
                      <input
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressFormChange}
                      />
                    </label>
                    <label>
                      Mã bưu điện
                      <input
                        name="zipCode"
                        value={addressForm.zipCode}
                        onChange={handleAddressFormChange}
                      />
                    </label>
                    <label>
                      Mô tả
                      <textarea
                        name="description"
                        value={addressForm.description}
                        onChange={handleAddressFormChange}
                      />
                    </label>
                    <label className="account-checkbox">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressFormChange}
                      />
                      Đặt làm địa chỉ mặc định
                    </label>
                    <div className="account-addresses__form-actions">
                      <button type="submit" disabled={addressSaving}>
                        {addressSaving ? "Đang lưu..." : "Lưu địa chỉ"}
                      </button>
                      <button
                        type="button"
                        className="account-button-secondary"
                        onClick={closeAddressForm}
                        disabled={addressSaving}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            </section>

            <section className="account-card_2">
              <h2>Đổi mật khẩu</h2>
              <form onSubmit={handleChangePassword} className="account-form">
                <label>
                  Mật khẩu hiện tại
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </label>
                <label>
                  Mật khẩu mới
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                  />
                </label>
                <button type="submit" disabled={changingPassword}>
                  {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Account;
