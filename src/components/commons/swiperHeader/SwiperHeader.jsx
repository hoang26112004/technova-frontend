/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import "./SwiperHeader.scss";

const STORAGE_KEY = "technova_announce_hidden_v1";

const SwiperHeader = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  const slides = useMemo(
    () => [
      "TechNova: Hàng mới về hàng tuần",
      "Giảm giá linh kiện và phụ kiện gaming",
      "Trả góp 0% cho laptop và điện thoại",
    ],
    []
  );

  if (hidden) return null;

  return (
    <div className="swiper-header">
      <div className="swiper-header__inner">
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 3800,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={slides.length > 1}
          speed={650}
          className="swiper-container"
          aria-label="Thông báo"
        >
          {slides.map((text) => (
            <SwiperSlide key={text}>{text}</SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          className="swiper-header__close"
          aria-label="Đóng thông báo"
          onClick={() => {
            setHidden(true);
            try {
              localStorage.setItem(STORAGE_KEY, "1");
            } catch {}
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default SwiperHeader;
