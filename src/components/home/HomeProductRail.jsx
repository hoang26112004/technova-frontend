/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import productApi from "@/utils/api/productApi";
import { mapProductToCard } from "@/utils/api/mappers";
import { setInputValue, setResult } from "@/store/searchSlice";
import ProductItem from "@/components/product/discountedProduct/productItem/ProductItem";
import "./HomeProductRail.scss";

const SKELETON_COUNT = 6;

const HomeProductRail = ({ title, subtitle, params, viewAllLabel = "Xem tat ca" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    productApi
      .getProducts({ page: 0, size: 10, status: true, ...(params || {}) })
      .then((res) => {
        const pageData = res?.data?.data;
        const list = pageData?.content || [];
        if (isMounted) setItems(list.map(mapProductToCard));
      })
      .catch((error) => {
        console.error("Load home rail products error:", error);
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(params || {})]);

  const show = useMemo(() => items.slice(0, 10), [items]);

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector(".home-rail__item");
    const step = first ? first.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  const viewAll = () => {
    dispatch(setResult(show));
    dispatch(setInputValue(""));
    navigate("/search");
  };

  return (
    <section className="home-rail" data-aos="fade-up">
      <header className="home-rail__header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="home-rail__actions">
          <button className="btn btn--soft btn--small" onClick={() => scrollByCards(-1)}>
            Trước
          </button>
          <button className="btn btn--soft btn--small" onClick={() => scrollByCards(1)}>
            Tiếp
          </button>
          <button className="btn btn--soft btn--small" onClick={viewAll}>
            {viewAllLabel}
          </button>
        </div>
      </header>

      <div ref={scrollerRef} className="home-rail__scroller" aria-label={title}>
        {loading &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="home-rail__item home-rail__item--skeleton" />
          ))}
        {!loading &&
          show.map((item) => (
            <div key={item.id || item.name} className="home-rail__item">
              <ProductItem product={item} />
            </div>
          ))}
      </div>
    </section>
  );
};

export default HomeProductRail;
