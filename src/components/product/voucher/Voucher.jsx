/* eslint-disable */
import React from "react";
import "./Voucher.scss";

const Voucher = () => {
  const items = [
    "Mien phi doi tra 7 ngay",
    "Bao hanh dien tu",
    "Tra gop 0%",
    "Ho tro ky thuat 24/7",
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
