/* eslint-disable */
import React, { useEffect, useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

import "./MenuSidebar.scss";
import categoryApi from "@/utils/api/categoryApi";
const MenuSidebar = () => {
  const [opens, setOpens] = useState([]);
  const [isOpenPrice, setIsOpenPrice] = useState(true);
  const [category, setCategory] = useState([]);

  const handleClick = (value, isOpen) => {
    if (isOpen) {
      setOpens((prev) => [...prev, value]);
    } else {
      setOpens((prev) => prev.filter((item) => item !== value));
    }
  };

  useEffect(() => {
    let isMounted = true;
    categoryApi
      .getCategories({ page: 0, size: 50 })
      .then((res) => {
        const items = res?.data?.data?.content || [];
        if (isMounted) setCategory(items);
      })
      .catch((error) => {
        console.error("Load categories error:", error);
      });
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="menuSidebar">
      <div className="menuSidebar__category">
        <h1>Danh mục sản phẩm</h1>
        {category.map((item, index) => (
          <div key={index}>
            <div key={item.id} className="menuSidebar__category-item">
              <p>{item.name}</p>
              {opens.includes(item.id) ? (
                <FaCaretUp
                  className="icon-up"
                  onClick={() => handleClick(item.id, false)}
                />
              ) : (
                <FaCaretDown
                  className="icon-down"
                  onClick={() => handleClick(item.id, true)}
                />
              )}
            </div>
            {opens.includes(item.id) && (
              <div className="menuSidebar__category-item-child">
                <p>KhÃ´ng cÃ³ danh má»¥c con</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="menuSidebar__price">
        <div className="menuSidebar__price-header">
          <p>Chọn mức giá</p>
          {isOpenPrice ? (
            <FaCaretDown
              className="icon"
              onClick={() => setIsOpenPrice(false)}
            />
          ) : (
            <FaCaretUp className="icon" onClick={() => setIsOpenPrice(true)} />
          )}
        </div>
        {isOpenPrice && (
          <div>
            <div className="menuSidebar__price-item">
              <input type="checkbox" />
              <p>Giá dưới 200.000đ</p>
            </div>
            <div className="menuSidebar__price-item">
              <input type="checkbox" />
              <p>200.000đ - 500.000đ</p>
            </div>
            <div className="menuSidebar__price-item">
              <input type="checkbox" />
              <p>500.000đ - 700.000đ</p>
            </div>
            <div className="menuSidebar__price-item">
              <input type="checkbox" />
              <p>700.000đ - 1.000.000đ</p>
            </div>
            <div className="menuSidebar__price-item">
              <input type="checkbox" />
              <p>Giá trên 1.000.000đ</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuSidebar;
