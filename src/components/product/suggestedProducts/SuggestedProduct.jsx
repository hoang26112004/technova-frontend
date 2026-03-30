/* eslint-disable */
import React, { useEffect, useState } from "react";
import "./SuggestedProduct.scss";
import recommendationApi from "@/utils/api/recommendationApi";
import { mapProductToCard } from "@/utils/api/mappers";

const SuggestedProduct = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let isMounted = true;
    recommendationApi
      .home()
      .then((res) => {
        const data = res?.data?.data;
        const list = data?.recommendations || data?.seeds || [];
        if (isMounted) setFeatured(list.map(mapProductToCard).slice(0, 4));
      })
      .catch((error) => {
        console.error("Load recommendations error:", error);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="tech-section tech-section--dark">
      <div className="tech-section__header">
        <h2>San pham noi bat</h2>
        <p>De xuat boi doi ngu ky thuat cua TechNova.</p>
      </div>
      <div className="tech-grid tech-grid--featured">
        {featured.map((item) => (
          <div key={item.id || item.name} className="tech-card tech-card--product">
            <div className="tech-card__badge">Moi</div>
            <div className="tech-card__media" />
            <h3>{item.name}</h3>
            <p className="tech-price">
              {new Intl.NumberFormat("vi-VN").format(item.price)} d
            </p>
            <button className="btn btn--small">Them vao gio</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SuggestedProduct;
