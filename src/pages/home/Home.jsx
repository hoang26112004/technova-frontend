import Layout from "@/components/commons/layout/Layout";
import Banner from "@/components/commons/banner/Banner";
import Category from "@/components/product/category/Category";
import Voucher from "@/components/product/voucher/Voucher";
import React from "react";
import "./Home.scss";
import RecoHeroRail from "@/components/product/recoHeroRail/RecoHeroRail";
import HomeProductRail from "@/components/home/HomeProductRail";
import TopRatedRail from "@/components/home/TopRatedRail";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiPercent, FiStar, FiZap } from "react-icons/fi";

const Home = () => {
  const navigate = useNavigate();

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout>
      <div className="tech-home">
        <div className="tech-home__container tech-container">
          <section className="tech-home__hero" data-aos="fade-up">
            <div className="tech-home__heroGrid">
              <Banner
                compact={true}
                onPrimary={() => scrollToId("home-deals")}
                onSecondary={() => scrollToId("home-voucher")}
              />

              <aside className="tech-home__heroAside" aria-label="Đi nhanh">
                <div className="tech-home__asideHead">
                  <div>
                    <p className="tech-home__asideEyebrow">Hôm nay có gì?</p>
                    <h3 className="tech-home__asideTitle">Chọn nhanh, mua gọn</h3>
                  </div>
                  <button
                    type="button"
                    className="tech-home__asideAll"
                    onClick={() => navigate("/search")}
                  >
                    Xem tất cả <FiArrowRight />
                  </button>
                </div>

                <button
                  type="button"
                  className="tech-home__asideCard tech-home__asideCard--deal"
                  onClick={() => scrollToId("home-deals")}
                >
                  <div className="tech-home__asideIcon">
                    <FiPercent />
                  </div>
                  <div className="tech-home__asideText">
                    <div className="tech-home__asideCardTitle">Giá tốt hôm nay</div>
                    <div className="tech-home__asideCardSub">Lướt nhanh các mức giá dễ chốt</div>
                  </div>
                  <FiArrowRight className="tech-home__asideArrow" />
                </button>

                <button
                  type="button"
                  className="tech-home__asideCard tech-home__asideCard--top"
                  onClick={() => scrollToId("home-top-rated")}
                >
                  <div className="tech-home__asideIcon">
                    <FiStar />
                  </div>
                  <div className="tech-home__asideText">
                    <div className="tech-home__asideCardTitle">Top đánh giá</div>
                    <div className="tech-home__asideCardSub">Được khách chọn, đáng tin để mua</div>
                  </div>
                  <FiArrowRight className="tech-home__asideArrow" />
                </button>

                <button
                  type="button"
                  className="tech-home__asideCard tech-home__asideCard--reco"
                  onClick={() => scrollToId("home-reco")}
                >
                  <div className="tech-home__asideIcon">
                    <FiZap />
                  </div>
                  <div className="tech-home__asideText">
                    <div className="tech-home__asideCardTitle">Gợi ý phù hợp</div>
                    <div className="tech-home__asideCardSub">Đề xuất theo xu hướng và hành vi</div>
                  </div>
                  <FiArrowRight className="tech-home__asideArrow" />
                </button>
              </aside>
            </div>
          </section>

          <div id="home-voucher">
            <Voucher />
          </div>
          <section className="tech-section tech-home__cats" data-aos="fade-up">
            <header className="tech-section__header">
              <div>
                <h2>Danh mục</h2>
                <p>Chọn nhanh theo nhu cầu</p>
              </div>
            </header>
            <Category />
          </section>
          <div id="home-reco">
            <RecoHeroRail
              title="Gợi ý cho bạn"
              subtitle="Kết quả từ thuật toán đề xuất sản phẩm"
            />
          </div>
          <div id="home-deals">
            <HomeProductRail
                title="Giá tốt hôm nay"
                subtitle="Chọn nhanh theo mức giá dễ mua, cập nhật liên tục"
                params={{ sortedBy: "price", sortDirection: "asc" }}
                viewAllLabel="Xem nhanh"
            />
          </div>
          <HomeProductRail
            title="Hàng mới về"
            subtitle="Sản phẩm mới cập nhật gần đây"
            params={{ sortedBy: "createdDate", sortDirection: "desc" }}
            viewAllLabel="Xem nhanh"
          />

          <div id="home-top-rated">
            <TopRatedRail />
          </div>

          {/*<section className="tech-section tech-home__cats" data-aos="fade-up">*/}
          {/*  <header className="tech-section__header">*/}
          {/*    <div>*/}
          {/*      <h2>Danh mục</h2>*/}
          {/*      <p>Chọn nhanh theo nhu cầu</p>*/}
          {/*    </div>*/}
          {/*  </header>*/}
          {/*  <Category />*/}
          {/*</section>*/}

          {/*<section className="tech-home__cta" data-aos="fade-up">*/}
          {/*  <div className="tech-home__ctaInner">*/}
          {/*    <div>*/}
          {/*      <h2>Muốn mua nhanh hơn?</h2>*/}
          {/*      <p>*/}
          {/*        Vào trang tìm kiếm để lọc theo giá, danh mục, và xem sản phẩm đang*/}
          {/*        có hàng.*/}
          {/*      </p>*/}
          {/*    </div>*/}
          {/*    <div className="tech-home__ctaActions">*/}
          {/*      <button*/}
          {/*        type="button"*/}
          {/*        className="btn btn--primary"*/}
          {/*        onClick={() => navigate("/search")}*/}
          {/*      >*/}
          {/*        Tìm sản phẩm phù hợp*/}
          {/*      </button>*/}
          {/*      <button*/}
          {/*        type="button"*/}
          {/*        className="btn btn--soft"*/}
          {/*        onClick={() => scrollToId("home-deals")}*/}
          {/*      >*/}
          {/*        Xem giá tốt*/}
          {/*      </button>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</section>*/}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
