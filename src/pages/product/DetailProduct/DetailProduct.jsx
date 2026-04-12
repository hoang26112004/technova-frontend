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
  const [selectedType, setSelectedType] = useState(0);

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

  useEffect(() => {
    // When navigating between products, reset variant selection
    setSelectedType(0);
  }, [id]);

  useEffect(() => {
    // If API returns fewer variants than previously selected, clamp back to 0
    const max = (product?.variants || []).length - 1;
    if (max < 0) return;
    if (selectedType > max) setSelectedType(0);
  }, [product, selectedType]);

  const productView = useMemo(() => {
    if (!product) return null;
    const variants = product?.variants || [];
    const types = variants.map(buildVariantLabel);
    const stock = product?.stock ?? 0;

    const baseImages =
      product?.images?.map((img) => resolveImageUrl(img?.imageUrl)) || [];
    const selectedVariantImage = resolveImageUrl(
      variants?.[selectedType]?.imageUrl
    );
    const images = Array.from(
      new Set([selectedVariantImage, ...baseImages].filter(Boolean))
    );

    return {
      id: product?.id,
      name: product?.name || "",
      images: images.length ? images : ["/vite.svg"],
      price: Number(product?.price || 0),
      discount: 0,
      count: stock,
      status: product?.isActive && stock > 0 ? "Còn hàng" : "Hết hàng",
      types,
      description: product?.description || "",
      exchangePolicy: "Đổi trả trong 7 ngày.",
      comments: reviews,
      variants,
    };
  }, [product, reviews, selectedType]);

  if (loading || !productView) {
    return (
      <Layout>
        <div className="detail-product_info">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <TitleRouter title={productView?.name || "Chi tiết"} />
      <div data-aos="fade-up" className="detail-product_info">
        <LeftSession images={productView.images} />
        <RightSession
          product={productView}
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />
      </div>
      <InformationDetail product={productView} />
    </Layout>
  );
};

export default DetailProduct;
