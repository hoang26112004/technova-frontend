/* eslint-disable */
import React from "react";
import "./Voucher.scss";
import { FiCreditCard, FiHeadphones, FiRepeat, FiShield } from "react-icons/fi";

const Voucher = () => {
  const items = [
    {
      icon: <FiRepeat />,
      title: "Đổi trả 7 ngày",
      desc: "Yên tâm trải nghiệm",
    },
    {
      icon: <FiShield />,
      title: "Bảo hành rõ ràng",
      desc: "Hỗ trợ nhanh chóng",
    },
    {
      icon: <FiCreditCard />,
      title: "Trả góp 0%",
      desc: "Thủ tục đơn giản",
    },
    {
      icon: <FiHeadphones />,
      title: "Hỗ trợ 24/7",
      desc: "Tư vấn trước và sau mua",
    },
  ];

  return (
    <section className="tech-strip">
      {items.map((it) => (
        <div key={it.title} className="tech-strip__item">
          <div className="tech-strip__icon" aria-hidden="true">
            {it.icon}
          </div>
          <div className="tech-strip__text">
            <div className="tech-strip__title">{it.title}</div>
            <div className="tech-strip__desc">{it.desc}</div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Voucher;
