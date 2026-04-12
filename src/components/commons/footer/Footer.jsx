/* eslint-disable */
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/images/logo.png";

import "./Footer.scss";
const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="footer" data-aos="fade-up">
      <div className="header-desktop__logo">
        <img className="footer__logo-img" src={logo} alt="TechNova" />
      </div>
      <ul className="footer__list">
        <li className="footer__title">Công ty</li>
        <li className="footer__item">Địa chỉ: 266 Đội Cấn, Ba Đình, Hà Nội</li>
        <li className="footer__item">Email: support@technova.com</li>
        <li className="footer__item">Hotline: +84 345 736 388</li>
      </ul>
      <ul className="footer__list">
        <li className="footer__title">Điều hướng</li>
        <li className="footer__item hover" onClick={() => navigate("/")}>
          Trang chủ
        </li>
        <li className="footer__item hover" onClick={() => navigate("/contact")}>
          Liên hệ
        </li>
      </ul>
      <ul className="footer__list">
        <li className="footer__title">Dịch vụ khách hàng</li>
        <li
          className="footer__item hover"
          onClick={() => navigate("/my-orders")}
        >
          Kiểm tra đơn hàng
        </li>
      </ul>
    </div>
  );
};

export default Footer;
