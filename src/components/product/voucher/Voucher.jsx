/* eslint-disable */
import React from "react";
import "./Voucher.scss";

const Voucher = () => {
  const items = [
    "Miễn phí đổi trả 7 ngày",
    "Bảo hành điện tử",
    "Trả góp 0%",
    "Hỗ trợ kỹ thuật 24/7",
  ];

  return (
    <section className="tech-strip">
      {items.map((text) => (
        <div key={text} className="tech-strip__item">
          {text}
        </div>
      ))}
    </section>
  );
};

export default Voucher;
