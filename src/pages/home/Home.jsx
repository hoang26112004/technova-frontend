import Layout from "@/components/commons/layout/Layout";
import Banner from "@/components/commons/banner/Banner";
import Category from "@/components/product/category/Category";
import Voucher from "@/components/product/voucher/Voucher";
import React from "react";
import "./Home.scss";
import RecoHeroRail from "@/components/product/recoHeroRail/RecoHeroRail";
import HomeProductRail from "@/components/home/HomeProductRail";
import TopRatedRail from "@/components/home/TopRatedRail";

const Home = () => {
  return (
    <Layout>
      <div className="tech-home">
        <div className="tech-home__container tech-container">
          <section className="tech-home__top">
            <Banner
              compact={true}
              onPrimary={() => {
                const el = document.getElementById("home-reco");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              onSecondary={() => {
                const el = document.getElementById("home-deals");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
            <div id="home-reco">
              <RecoHeroRail
                title="Gợi ý cho bạn"
                subtitle="Kết quả từ thuật toán đề xuất sản phẩm"
              />
            </div>
          </section>

          <Voucher />

          <HomeProductRail
            title="Hàng mới về"
            subtitle="Sản phẩm mới cập nhật gần đây"
            params={{ sortedBy: "createdDate", sortDirection: "desc" }}
            viewAllLabel="Xem nhanh"
          />

          <TopRatedRail />

          <section className="tech-section tech-home__cats" data-aos="fade-up">
            <header className="tech-section__header">
              <div>
                <h2>Danh mục</h2>
                <p>Chọn nhanh theo nhu cầu</p>
              </div>
            </header>
            <Category />
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default Home;
