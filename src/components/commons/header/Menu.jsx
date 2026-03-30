/* eslint-disable */
import React from 'react';
import { useNavigate } from "react-router-dom";

import { FaCaretDown } from "react-icons/fa6";
import { FaBars } from "react-icons/fa";
import { IoHeart } from "react-icons/io5";
import { MdAccountCircle } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { FaCaretUp } from "react-icons/fa";

import "./Menu.scss";
const Menu = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="menu-desktop">
        <ul className="menu-desktop__list">
          <li className="menu-desktop__item">
            <span
              onClick={() => navigate("/")}
              className="menu-desktop__item-span"
            >
              Trang chủ
            </span>
          </li>
          <li className="menu-desktop__item">
            <span onClick={() => navigate("/blog")} className="menu-desktop__item-span">Tin tức</span>
          </li>
          <li className="menu-desktop__item">
            <span onClick={() => navigate("/contact")} className="menu-desktop__item-span">Liên hệ</span>
          </li>
          <li className="menu-desktop__item">
            <span onClick={() => navigate("/market-system")} className="menu-desktop__item-span">Hệ thống cửa hàng</span>
          </li>
          <li className="menu-desktop__item">
            <span className="menu-desktop__item-span">Kiểm tra đơn hàng</span>
          </li>
        </ul>
      </div>

      
    </>
  );
}

export default Menu
