/* eslint-disable */
import React, { useEffect, useState } from "react";
import "./Category.scss";
import { useNavigate } from "react-router-dom";
import categoryApi from "@/utils/api/categoryApi";
import { resolveImageUrl } from "@/utils/api/mappers";

const Category = () => {
  const [categorys, setCategorys] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    categoryApi
      .getCategories({ page: 0, size: 20 })
      .then((res) => {
        const items = res?.data?.data?.content || [];
        if (isMounted) setCategorys(items);
      })
      .catch((error) => {
        console.error("Load categories error:", error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="category">
      {!loading &&
        categorys.map((item, index) => (
        <div
          key={index}
          className="category__item"
          onClick={() => navigate(`/productsByCategory/${item.name}`)}
        >
          <div className="category__item-img">
            <img src={resolveImageUrl(item.imageUrl)} alt={item.name} />
          </div>
          <button className="category__item-btn">{item.name}</button>
        </div>
      ))}
    </div>
  );
};

export default Category;
