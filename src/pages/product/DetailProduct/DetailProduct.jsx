/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";

import "./DetailProduct.scss";
import InformationDetail from "@/components/product/detailProduct/informationDetail/InformationDetail";
import Layout from "@/components/commons/layout/Layout";
import TitleRouter from "@/components/product/titleRouter/TitleRouter";
import LeftSession from "@/components/product/detailProduct/leftSession/LeftSession";
import RightSession from "@/components/product/detailProduct/rightSession/RightSession";
import { useParams } from "react-router-dom";
import productApi from "@/utils/api/productApi";
import reviewApi from "@/utils/api/reviewApi";
import {
  buildVariantLabel,
  mapReviewToComment,
  resolveImageUrl,
} from "@/utils/api/mappers";

const DetailProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);
    productApi
      .getById(id)
      .then((res) => {
        const data = res?.data?.data;
        if (isMounted) setProduct(data || null);
      })
      .catch((error) => {
        console.error("Load product error:", error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    reviewApi
      .getByProduct(id)
      .then((res) => {
        const data = res?.data?.data || [];
        if (isMounted) setReviews(data.map(mapReviewToComment));
      })
      .catch((error) => {
        console.error("Load reviews error:", error);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const productView = useMemo(() => {
    if (!product) return null;
    const images =
      product?.images?.map((img) => resolveImageUrl(img?.imageUrl)) || [];
    const variants = product?.variants || [];
    const types = variants.map(buildVariantLabel);
    const stock = product?.stock ?? 0;
    return {
      id: product?.id,
      name: product?.name || "",
      images: images.length ? images : ["/vite.svg"],
      price: Number(product?.price || 0),
      discount: 0,
      count: stock,
      status: product?.isActive && stock > 0 ? "Con hang" : "Het hang",
      types,
      description: product?.description || "",
      exchangePolicy: "Doi tra trong 7 ngay.",
      comments: reviews,
      variants,
    };
  }, [product, reviews]);

  if (loading || !productView) {
    return (
      <Layout>
        <div className="detail-product_info">Dang tai...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <TitleRouter title={productView?.name || "Chi tiet"} />
      <div data-aos="fade-up" className="detail-product_info">
        <LeftSession product={productView} />
        <RightSession product={productView} />
      </div>
      <InformationDetail product={productView} />
    </Layout>
  );
};

export default DetailProduct;
