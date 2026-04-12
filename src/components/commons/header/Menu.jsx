/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import categoryApi from "@/utils/api/categoryApi";

import "./Menu.scss";

const Menu = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;
    categoryApi
      .getCategories({ page: 0, size: 50 })
      .then((res) => {
        const items = res?.data?.data?.content || [];
        if (!isMounted) return;
        setCategories(Array.isArray(items) ? items : []);
      })
      .catch((error) => {
        console.error("Load categories error:", error);
        if (isMounted) setCategories([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="menu-desktop">
      <ul className="menu-desktop__list">
        <li className="menu-desktop__item">
          <span onClick={() => navigate("/")} className="menu-desktop__item-span">
            Trang chủ
          </span>
        </li>
        <li className="menu-desktop__item">
          <span className="menu-desktop__item-span">Danh mục</span>
          <div className="menu-desktop__sub sub1">
            <ul className="menu-desktop__sub-list">
              <li className="menu-desktop__sub-list-title">Danh mục sản phẩm</li>
              {categories.length ? (
                categories.map((c) => (
                  <li
                    key={c.id || c.name}
                    className="menu-desktop__sub-list-item"
                    onClick={() =>
                      navigate(
                        `/productsByCategory/${encodeURIComponent(c?.name || "")}`
                      )
                    }
                  >
                    {c?.name || "Danh mục"}
                  </li>
                ))
              ) : (
                <li className="menu-desktop__sub-list-item">Đang tải...</li>
              )}
            </ul>
          </div>
        </li>
        <li className="menu-desktop__item">
          <span
            onClick={() => navigate("/my-orders")}
            className="menu-desktop__item-span"
          >
            Kiểm tra đơn hàng
          </span>
        </li>
        <li className="menu-desktop__item">
          <span
            onClick={() => navigate("/contact")}
            className="menu-desktop__item-span"
          >
            Liên hệ
          </span>
        </li>
      </ul>
    </div>
  );
};

export default Menu;
