/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/commons/layout/Layout";
import userApi from "@/utils/api/userApi";
import "./Account.scss";
import { MdHeight } from "react-icons/md";

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
  const [address, setAddress] = useState(emptyAddress);
  const [addressId, setAddressId] = useState(null);
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
    userApi
      .getMe()
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data;
        setProfile({
          fullName: data?.fullName || "",
          phoneNumber: data?.phoneNumber || "",
          gender:
            data?.gender === true ? "true" : data?.gender === false ? "false" : "",
          dateOfBirth: data?.dateOfBirth || "",
        });
        setAvatarUrl(data?.avatarUrl || "");
        const firstAddress = data?.addresses?.[0];
        if (firstAddress) {
          setAddressId(firstAddress?.id || null);
          setAddress({
            phoneNumber: firstAddress?.phoneNumber || "",
            street: firstAddress?.street || "",
            city: firstAddress?.city || "",
            state: firstAddress?.state || "",
            country: firstAddress?.country || "",
            zipCode: firstAddress?.zipCode || "",
            description: firstAddress?.description || "",
            isDefault: Boolean(firstAddress?.isDefault),
          });
        } else {
          setAddressId(null);
          setAddress(emptyAddress);
        }
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

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const hasAddressInput = Object.entries(address).some(([key, value]) => {
    if (key === "isDefault") return value === true;
    return String(value || "").trim().length > 0;
  });

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
        address: hasAddressInput ? address : null,
      };
      await userApi.updateMe(payload, addressId);
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

                <h3>Địa chỉ</h3>
                <label>
                  Số điện thoại nhận hàng
                  <input
                    name="phoneNumber"
                    value={address.phoneNumber}
                    onChange={handleAddressChange}
                  />
                </label>
                <label>
                  Đường
                  <input
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                  />
                </label>
                <label>
                  Thành phố
                  <input
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                  />
                </label>
                <label>
                  Tỉnh/Thành
                  <input
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                  />
                </label>
                <label>
                  Quốc gia
                  <input
                    name="country"
                    value={address.country}
                    onChange={handleAddressChange}
                  />
                </label>
                <label>
                  Mã bưu điện
                  <input
                    name="zipCode"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                  />
                </label>
                <label>
                  Mô tả
                  <textarea
                    name="description"
                    value={address.description}
                    onChange={handleAddressChange}
                  />
                </label>
                <label className="account-checkbox">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={address.isDefault}
                    onChange={handleAddressChange}
                  />
                  Đặt làm địa chỉ mặc định
                </label>

                <button type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
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
