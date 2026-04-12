/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import productApi from "@/utils/api/productApi";
import { mapProductToCard } from "@/utils/api/mappers";
import ProductItem from "../../discountedProduct/productItem/ProductItem";

import "./ProductsContainer.scss";

const ProductsContainer = ({ categoryName }) => {
  const [pageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState("default");

  const sortParams = useMemo(() => {
    switch (sortKey) {
      case "price_asc":
        return { sortedBy: "price", sortDirection: "asc" };
      case "price_desc":
        return { sortedBy: "price", sortDirection: "desc" };
      case "newest":
        return { sortedBy: "createdDate", sortDirection: "desc" };
      case "name_asc":
        return { sortedBy: "name", sortDirection: "asc" };
      default:
        return {};
    }
  }, [sortKey]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    productApi
      .getProducts({
        page: currentPage - 1,
        size: pageSize,
        category: categoryName,
        ...sortParams,
        status: true,
      })
      .then((res) => {
        if (!isMounted) return;
        const pageData = res?.data?.data;
        const items = pageData?.content || [];
        setProducts(items.map(mapProductToCard));
        setTotal(pageData?.totalElements || items.length);
      })
      .catch((error) => {
        console.error("Load products error:", error);
        if (isMounted) {
          setProducts([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize, categoryName, sortParams]);

  return (
    <div className="productsContainer">
      <div className="productsContainer__header">
        <div className="productsContainer__header-left">
          <h1>{categoryName || "Sản phẩm"}</h1>
          <p className="productsContainer__meta">
            {loading ? "Đang tải..." : `${total} sản phẩm`}
          </p>
        </div>
        <div className="productsContainer__header-search">
          <p>Sắp xếp</p>
          <select
            value={sortKey}
            onChange={(e) => {
              setCurrentPage(1);
              setSortKey(e.target.value);
            }}
          >
            <option value="default">Mặc định</option>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="name_asc">Tên A - Z</option>
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
        onChange={(p) => setCurrentPage(p)}
        style={{ marginBottom: "20px" }}
      />
    </div>
  );
};

export default ProductsContainer;

