import Layout from "@/components/commons/layout/Layout";
import Banner from "@/components/commons/banner/Banner";
import Category from "@/components/product/category/Category";
import SuggestedProduct from "@/components/product/suggestedProducts/SuggestedProduct";
import DiscountedProduct from "@/components/product/discountedProduct/DiscountedProduct";
import Voucher from "@/components/product/voucher/Voucher";
import React from "react";
import "./Home.scss";

const Home = () => {
  return (
    <Layout>
      <div className="tech-home">
        <Banner />
        <Voucher />
        <Category />
        <SuggestedProduct />
        <DiscountedProduct />
      </div>
    </Layout>
  );
};

export default Home;
