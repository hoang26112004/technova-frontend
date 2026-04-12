/* eslint-disable */
import React from "react";
import "./Banner.scss";

const Banner = ({ onPrimary, onSecondary, compact = false }) => {
  return (
    <section className={`tech-hero ${compact ? "tech-hero--compact" : ""}`}>
      <div className="tech-hero__content">
        <p className="tech-hero__eyebrow">TechNova | Đồ công nghệ chính hãng</p>
        <h1>Nâng cấp góc làm việc. Tăng tốc trải nghiệm.</h1>
        <p className="tech-hero__sub">
          Hàng mới mỗi tuần, bảo hành rõ ràng, giao nhanh 2 giờ nội thành.
        </p>
        <div className="tech-hero__actions">
          <button className="btn btn--primary" onClick={onPrimary}>
            Mua ngay
          </button>
          <button className="btn btn--soft" onClick={onSecondary}>
            Xem khuyến mãi
          </button>
        </div>
        <div className="tech-hero__stats">
          <div>
            <strong>10k+</strong>
            <span>Khách hàng tin dùng</span>
          </div>
          <div>
            <strong>500+</strong>
            <span>Sản phẩm công nghệ</span>
          </div>
          <div>
            <strong>4.9/5</strong>
            <span>Đánh giá trung bình</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
