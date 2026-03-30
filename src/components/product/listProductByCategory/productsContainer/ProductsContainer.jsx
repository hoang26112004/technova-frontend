/* eslint-disable*/
import React, { useEffect, useState } from "react";
import productApi from "@/utils/api/productApi";
import { mapProductToCard } from "@/utils/api/mappers";

import "./ProductsContainer.scss";
import ProductItem from "../../discountedProduct/productItem/ProductItem";
import { Pagination } from "antd";
const ProductsContainer = ({ categoryName }) => {
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    productApi
      .getProducts({
        page: currentPage - 1,
        size: pageSize,
        category: categoryName,
        status: true,
      })
      .then((res) => {
        const pageData = res?.data?.data;
        const items = pageData?.content || [];
        if (isMounted) {
          setProducts(items.map(mapProductToCard));
          setTotal(pageData?.totalElements || items.length);
        }
      })
      .catch((error) => {
        console.error("Load products error:", error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize, categoryName]);

  return (
    <div className="productsContainer">
      <div className="productsContainer__header">
        <h1>Tất cả sản phẩm</h1>
        <div className="productsContainer__header-search">
          <p>Sắp xếp theo</p>
          <select>
            <option>Mặc định</option>
            <option>A - Z</option>
            <option>Z - A</option>
            <option>Giá tăng dần</option>
            <option>Giá giảm dần</option>
            <option>Hàng mới nhất</option>
            <option>Hàng cũ nhất</option>
          </select>
        </div>
      </div>
      <div className="productsContainer__list">
        {!loading &&
          products.map((product, index) => (
            <ProductItem key={product.id || index} product={product} />
          ))}
      </div>
      <Pagination
        align="center"
        pageSize={pageSize}
        total={total}
        current={currentPage}
        onChange={handleChangePage}
        style={{marginBottom: "20px"}}
      />
    </div>
  );
};

export default ProductsContainer;
