/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import reviewApi from "@/utils/api/reviewApi";
import { mapProductToCard } from "@/utils/api/mappers";
import { setInputValue, setResult } from "@/store/searchSlice";
import ProductItem from "@/components/product/discountedProduct/productItem/ProductItem";

import "./TopRatedRail.scss";

const SKELETON_COUNT = 6;

const renderStars = (value) => {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return "★".repeat(full) + (half ? "☆" : "") + "✩".repeat(empty);
};

const TopRatedRail = ({ size = 10, minCount = 1 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    reviewApi
      .getTopRated({ size, minCount })
      .then((res) => {
        const list = res?.data?.data || [];
        const mapped = (Array.isArray(list) ? list : [])
          .map((row) => {
            const product = row?.product;
            if (!product?.id) return null;
            return {
              card: mapProductToCard(product),
              avgRating: Number(row?.avgRating || 0),
              reviewCount: Number(row?.reviewCount || 0),
            };
          })
          .filter(Boolean);
        if (isMounted) setItems(mapped);
      })
      .catch((error) => {
        console.error("Load top rated products error:", error);
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [size, minCount]);

  const show = useMemo(() => items.slice(0, size), [items, size]);

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector(".top-rated-rail__item");
    const step = first ? first.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  const viewAll = () => {
    dispatch(setResult(show.map((x) => x.card)));
    dispatch(setInputValue(""));
    navigate("/search");
  };

  return (
    <section className="top-rated-rail" data-aos="fade-up">
      <header className="top-rated-rail__header">
        <div>
          <h2>Top đánh giá</h2>
          <p>Sản phẩm được khách hàng đánh giá cao</p>
        </div>
        <div className="top-rated-rail__actions">
          <button
            className="btn btn--soft btn--small"
            onClick={() => scrollByCards(-1)}
          >
            Trước
          </button>
          <button
            className="btn btn--soft btn--small"
            onClick={() => scrollByCards(1)}
          >
            Tiếp
          </button>
          <button className="btn btn--soft btn--small" onClick={viewAll}>
            Xem nhanh
          </button>
        </div>
      </header>

      <div ref={scrollerRef} className="top-rated-rail__scroller" aria-label="Top đánh giá">
        {loading &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="top-rated-rail__item top-rated-rail__item--skeleton" />
          ))}
        {!loading &&
          show.map((row) => (
            <div key={row.card.id} className="top-rated-rail__item">
              <div className="top-rated-rail__badge" title="Đánh giá trung bình">
                <span className="top-rated-rail__stars">{renderStars(row.avgRating)}</span>
                <span className="top-rated-rail__score">
                  {row.avgRating.toFixed(1)} ({row.reviewCount})
                </span>
              </div>
              <ProductItem product={row.card} />
            </div>
          ))}
      </div>
    </section>
  );
};

export default TopRatedRail;
