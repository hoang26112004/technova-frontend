/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./Banner.scss";

const DEFAULT_SLIDES = [
  {
    tone: "sale",
    eyebrow: "Flash deals",
    badge: "Giá sốc",
    title: "Giá tốt hôm nay. Chốt nhanh trong vài phút.",
    sub: "Deal phụ kiện và công nghệ hot, số lượng có hạn.",
    primaryLabel: "Xem deal",
    secondaryLabel: "Mua ngay",
  },
  {
    tone: "work",
    eyebrow: "Work setup",
    badge: "Góc làm việc",
    title: "Nâng cấp setup: mượt, gọn, đúng nhu cầu.",
    sub: "Chuột, phím, tai nghe, màn hình, dock sạc, laptop.",
    primaryLabel: "Gợi ý cho bạn",
    secondaryLabel: "Xem khuyến mãi",
  },
  {
    tone: "gaming",
    eyebrow: "Gaming gear",
    badge: "Chiến thôi",
    title: "Gear gaming ngon: nhanh tay, chắc thắng.",
    sub: "Chọn gear theo lối chơi, ưu đãi theo combo.",
    primaryLabel: "Xem top đánh giá",
    secondaryLabel: "Mua ngay",
  },
];

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
};

const Banner = ({ onPrimary, onSecondary, compact = false, slides }) => {
  const list = useMemo(
    () => (Array.isArray(slides) && slides.length ? slides : DEFAULT_SLIDES),
    [slides]
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const intervalRef = useRef(null);

  const safeIndex = ((index % list.length) + list.length) % list.length;
  const active = list[safeIndex] || DEFAULT_SLIDES[0];

  const next = () => setIndex((i) => i + 1);
  const prev = () => setIndex((i) => i - 1);
  const goTo = (i) => setIndex(i);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (paused) return;
    if (!list || list.length <= 1) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex((i) => i + 1);
    }, 6500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [paused, prefersReducedMotion, list.length]);

  return (
    <section
      className={[
        "tech-hero",
        compact ? "tech-hero--compact" : "",
        active?.tone ? `tech-hero--tone-${active.tone}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Quảng cáo và chương trình nổi bật"
    >
      <div className="tech-hero__content">
        <div key={safeIndex} className="tech-hero__slide">
          <div className="tech-hero__topline">
            <p className="tech-hero__eyebrow">
              {active?.eyebrow || "TechNova | Đồ công nghệ chính hãng"}
            </p>
            {active?.badge ? (
              <span className="tech-hero__badge">{active.badge}</span>
            ) : null}
          </div>

          <h1>{active?.title || "Nâng cấp góc làm việc. Tăng tốc trải nghiệm."}</h1>
          <p className="tech-hero__sub">
            {active?.sub ||
              "Hàng mới mỗi tuần, bảo hành rõ ràng, giao nhanh 2 giờ nội thành."}
          </p>

          <div className="tech-hero__actions">
            <button className="btn btn--primary" onClick={onPrimary}>
              {active?.primaryLabel || "Mua ngay"}
            </button>
            <button className="btn btn--soft" onClick={onSecondary}>
              {active?.secondaryLabel || "Xem khuyến mãi"}
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
      </div>

      {!compact ? (
        <div className="tech-hero__ad">
          <div className="tech-hero__adFrame" aria-hidden="true" />
          <div className="tech-hero__controls" aria-label="Điều khiển banner">
            <button type="button" className="tech-hero__nav" onClick={prev} aria-label="Banner trước">
              <FiChevronLeft />
            </button>
            <div className="tech-hero__dots" aria-label="Chọn banner">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={["tech-hero__dot", i === safeIndex ? "is-active" : ""].join(" ")}
                  onClick={() => goTo(i)}
                  aria-label={`Chuyển đến banner ${i + 1}`}
                />
              ))}
            </div>
            <button type="button" className="tech-hero__nav" onClick={next} aria-label="Banner tiếp theo">
              <FiChevronRight />
            </button>
          </div>

          <div className="tech-hero__adMeta">
            <div className="tech-hero__adKicker">Ưu đãi</div>
            <div className="tech-hero__adLine">Đổi trả 7 ngày. Bảo hành rõ ràng.</div>
            <div className="tech-hero__adLine tech-hero__adLine--muted">Hover để tạm dừng auto.</div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Banner;
