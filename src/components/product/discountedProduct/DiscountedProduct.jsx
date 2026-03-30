/* eslint-disable */
import React from "react";
import "./DiscountedProduct.scss";

const DiscountedProduct = () => {
  const deals = [
    { title: "Combo Workstation", desc: "Laptop + man hinh + dock", tag: "-12%" },
    { title: "Gaming Starter", desc: "PC + gear + ghe", tag: "-18%" },
    { title: "Creator Kit", desc: "Mic + cam + den", tag: "-10%" },
  ];

  return (
    <section className="tech-section">
      <div className="tech-section__header">
        <h2>Deal theo bo</h2>
        <p>Tiet kiem hon khi mua theo combo.</p>
      </div>
      <div className="tech-grid tech-grid--deals">
        {deals.map((item) => (
          <div key={item.title} className="tech-card tech-card--deal">
            <span className="tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <button className="btn btn--ghost">Xem ngay</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DiscountedProduct;
