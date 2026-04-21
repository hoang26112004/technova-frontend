/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import recommendationApi from "@/utils/api/recommendationApi";
import { mapProductToCard } from "@/utils/api/mappers";
import { setInputValue, setResult } from "@/store/searchSlice";
import ProductItem from "@/components/product/discountedProduct/productItem/ProductItem";
import "./RecoHeroRail.scss";

const SKELETON_COUNT = 8;

const RecoHeroRail = ({ title = "Goi y cho ban", subtitle = "Tu thuat toan de xuat" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    recommendationApi
      .home()
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.recommendations || data?.seeds || [];
        const mapped = list.map(mapProductToCard);
        if (isMounted) setItems(mapped);
      })
      .catch((error) => {
        console.error("Load recommendations error:", error);
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const show = useMemo(() => {
    const list = items.filter(Boolean);
    return list.slice(0, 12);
  }, [items]);

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector(".reco-rail__item");
    const step = first ? first.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  const openAll = () => {
    // Reuse Search page to show the recommended list.
    dispatch(setResult(show));
    dispatch(setInputValue(""));
    navigate("/search");
  };

  return (
    <section className="reco-rail" data-aos="fade-up">
      <header className="reco-rail__header">
        <div>
          {/*<p className="reco-rail__eyebrow">Personalized</p>*/}
          <h2>{title}</h2>
          <p className="reco-rail__sub">{subtitle}</p>
        </div>
        <div className="reco-rail__actions">
          <button className="btn btn--soft btn--small" onClick={() => scrollByCards(-1)}>
            Trước
          </button>
          <button className="btn btn--soft btn--small" onClick={() => scrollByCards(1)}>
            Tiếp
          </button>
          <button className="btn btn--primary btn--small" onClick={openAll}>
            Xem tất cả
          </button>
        </div>
      </header>

      <div ref={scrollerRef} className="reco-rail__scroller" aria-label="Recommended products">
        {loading &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="reco-rail__item reco-rail__item--skeleton">
              <div className="reco-rail__media" />
              <div className="reco-rail__line" />
              <div className="reco-rail__line reco-rail__line--short" />
              <div className="reco-rail__line reco-rail__line--price" />
            </div>
          ))}

        {!loading &&
          show.map((item) => (
            <div key={item.id || item.name} className="reco-rail__item">
              <ProductItem product={item} />
            </div>
          ))}
      </div>
    </section>
  );
};

export default RecoHeroRail;
