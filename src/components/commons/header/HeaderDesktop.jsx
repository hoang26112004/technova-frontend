﻿/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setInputValue, setResult } from "@/store/searchSlice";
import Menu from "./Menu";
import authApi from "@/utils/api/authApi";
import productApi from "@/utils/api/productApi";
import { mapProductToCard } from "@/utils/api/mappers";
import logo from "@/assets/images/logo.png";
import { clearAdminFlag, ensureAdminStatus } from "@/utils/auth";
import notificationApi from "@/utils/api/notificationApi";

import { FiSearch } from "react-icons/fi";
import { AiOutlineHeart } from "react-icons/ai";
import { MdOutlineAccountCircle } from "react-icons/md";
import { GrCart } from "react-icons/gr";
import { IoNotificationsOutline } from "react-icons/io5";

import "./HeaderDesktop.scss";
const HeaderDesktop = () => {
  const [inputText, setInputText] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [isShowNotifications, setIsShowNotifications] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const childRef = useRef(null);
  const notificationsRef = useRef(null);
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notiLoading, setNotiLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedAccount =
        childRef.current && childRef.current.contains(event.target);
      const clickedNoti =
        notificationsRef.current &&
        notificationsRef.current.contains(event.target);

      if (!clickedAccount) setIsShow(false);
      if (!clickedNoti) setIsShowNotifications(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsAdmin(false);
      setUnreadCount(0);
      setNotifications([]);
      return;
    }
    let isMounted = true;
    ensureAdminStatus()
      .then((value) => {
        if (isMounted) setIsAdmin(value);
      })
      .catch(() => {
        if (isMounted) setIsAdmin(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let alive = true;

    const loadUnread = async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        const count = Number(res?.data?.data || 0);
        if (!alive) return;
        setUnreadCount(Number.isFinite(count) ? count : 0);
      } catch {
        // Ignore transient failures.
      }
    };

    loadUnread();
    const id = setInterval(loadUnread, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [isLoggedIn]);

  const openNotifications = async () => {
    if (!isLoggedIn) {
      navigate("/auth?mode=login");
      return;
    }
    setIsShow(false);

    const next = !isShowNotifications;
    setIsShowNotifications(next);
    if (!next) return;

    setNotiLoading(true);
    try {
      const res = await notificationApi.getNotifications({
        page: 0,
        size: 10,
        sort: "createdAt,desc",
      });
      const items = res?.data?.data?.content || [];
      setNotifications(items);
    } catch (error) {
      console.error("Load notifications error:", error);
      setNotifications([]);
    } finally {
      setNotiLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  };

  const markRead = async (id) => {
    const before = notifications.find((n) => n?.id === id);
    if (!before || before.read) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => (c > 0 ? c - 1 : 0));
    try {
      await notificationApi.markRead(id);
    } catch (error) {
      // Rollback on failure.
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
      setUnreadCount((c) => c + 1);
      console.error("Mark read error:", error);
    }
  };

  const openNotification = async (n) => {
    if (!n) return;
    if (!n.read) await markRead(n.id);
    setIsShowNotifications(false);

    if (n.type === "ORDER" || n.type === "PAYMENT") {
      navigate("/order");
    }
  };

  const resultFake = [
  {
    name: "Tai nghe Bluetooth Sony WH-1000XM6",
    image: ["/vite.svg"],
    discount: 0,
    price: 10390000,
    count: 34,
  },
  {
    name: "Màn hình gaming ASUS TUF VG27AQ5A",
    image: ["/vite.svg"],
    discount: 0,
    price: 4990000,
    count: 34,
  },
  {
    name: "Apple Watch Series 11 42mm (GPS)",
    image: ["/vite.svg"],
    discount: 0,
    price: 10990000,
    count: 176,
  },
  {
    name: "Bàn phím cơ Keychron K8",
    image: ["/vite.svg"],
    discount: 0,
    price: 1790000,
    count: 52,
  },
  {
    name: "Chuột Logitech MX Master 3S",
    image: ["/vite.svg"],
    discount: 0,
    price: 2490000,
    count: 80,
  },
  {
    name: "SSD Samsung 990 PRO 1TB",
    image: ["/vite.svg"],
    discount: 0,
    price: 2890000,
    count: 60,
  },
];

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleKeyPress = async (e) => {
    if (e.key !== "Enter") return;
    const keyword = inputText.trim();
    if (!keyword) return;
    dispatch(setInputValue(keyword));
    try {
      const res = await productApi.search(keyword);
      const items = res?.data?.data || [];
      dispatch(setResult(items.map(mapProductToCard)));
    } catch (error) {
      console.error("Search error:", error);
      dispatch(setResult(resultFake));
    }
    navigate("/search");
    dispatch(setInputValue(""));
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessTokenExpiresAt");
      clearAdminFlag();
      setIsShow(false);
      navigate("/auth");
    }
  };

  return (
    <div className="header-desktop">
      <div className="header-desktop__search">
        <div onClick={() => navigate("/")} className="header-desktop__logo">
          <img className="header-desktop__logo-img" src={logo} alt="TechNova" />
        </div>

        <div className="header-desktop__search-input">
          <button className="header-desktop__search-input-button">
            <FiSearch className="header-desktop__search-input-icon1" />
          </button>
          <input
            onChange={(e) => setInputText(e.target.value)}
            className="header-desktop__search-i"
            onKeyDown={handleKeyPress}
            value={inputText}
            type="text"
            placeholder="Tìm kiếm sản phẩm"
          />
        </div>

        <div className="header-desktop__group-icon">
          <div
            className="header-desktop__group-icon-item flex items-center justify-center flex-col"
            onClick={() => navigate(`/followingProducts/1`)}
          >
            <AiOutlineHeart className="header-desktop_group-i" />
            <p className="header-desktop_group-p">Yêu thích</p>
          </div>
          <div
            ref={notificationsRef}
            className="header-desktop__group-icon-item header-desktop__group-icon-item--noti flex items-center justify-center flex-col"
            onClick={openNotifications}
          >
            <div className="header-desktop__noti-icon-wrap">
              <IoNotificationsOutline className="header-desktop_group-i" />
              {isLoggedIn && unreadCount > 0 ? (
                <span className="header-desktop__noti-badge">
                  {unreadCount > 99 ? "99+" : String(unreadCount)}
                </span>
              ) : null}
            </div>
            <p className="header-desktop_group-p">Thông báo</p>

            {isShowNotifications && (
              <div
                className="header-desktop__noti-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="header-desktop__noti-head">
                  <p className="header-desktop__noti-title">Thông báo</p>
                  <button
                    type="button"
                    className="header-desktop__noti-markall"
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    title={
                      unreadCount === 0 ? "Không có thông báo chưa đọc" : ""
                    }
                  >
                    Đọc tất cả
                  </button>
                </div>
                <div className="header-desktop__noti-list">
                  {notiLoading ? (
                    <p className="header-desktop__noti-empty">Đang tải...</p>
                  ) : notifications.length === 0 ? (
                    <p className="header-desktop__noti-empty">
                      Chưa có thông báo.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={[
                          "header-desktop__noti-item",
                          n.read ? "is-read" : "is-unread",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => openNotification(n)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            openNotification(n);
                        }}
                      >
                        <div className="header-desktop__noti-item-top">
                          <p className="header-desktop__noti-item-title">
                            {n.title || "Thông báo"}
                          </p>
                          {!n.read ? (
                            <span className="header-desktop__noti-dot" />
                          ) : null}
                        </div>
                        <p className="header-desktop__noti-item-msg">
                          {n.message || ""}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div
            className="header-desktop__group-icon-item flex items-center justify-center flex-col"
            onClick={() => {
              setIsShowNotifications(false);
              setIsShow(!isShow);
            }}
          >
            <MdOutlineAccountCircle className="header-desktop_group-i" />
            <p className="header-desktop_group-p">Tài khoản</p>
          </div>
          {isShow && (
            <div
              ref={childRef}
              className="header-desktop__group-icon-item-child"
            >
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <p onClick={() => navigate("/admin")}>Admin</p>
                  )}
                  <p onClick={() => navigate("/account")}>Tài khoản</p>
                  <p onClick={handleLogout}>Đăng xuất</p>
                </>
              ) : (
                <>
                  <p onClick={() => navigate("/auth?mode=register")}>
                    Đăng ký
                  </p>
                  <p onClick={() => navigate("/auth?mode=login")}>Đăng nhập</p>
                </>
              )}
              
            </div>
          )}
          <div
            className="header-desktop__group-icon-item flex items-center justify-center flex-col"
            onClick={() => navigate("/cart")}
          >
            <GrCart className="header-desktop_group-i" />
            <p className="header-desktop_group-p">Giỏ hàng</p>
          </div>
        </div>
      </div>
      <Menu />
    </div>
  );
};

export default HeaderDesktop;

