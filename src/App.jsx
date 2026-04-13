/* eslint-disable */
import React, { useEffect } from "react";
import { useLocation, useRoutes } from "react-router-dom";
import Home from "./pages/home/Home";
import AOS from "aos";
import "aos/dist/aos.css";
import DetailProduct from "./pages/product/DetailProduct/DetailProduct";
import Search from "./pages/product/search/Search";
import Cart from "./pages/cart/Cart";
import Auth from "./pages/auth/Auth";
import OAuthCallback from "./pages/auth/OAuthCallback";
import Account from "./pages/account/Account";
import ProductsByCategory from "./pages/productsByCategory/ProductsByCategory";
import ContactPage from "./pages/contact/ContactPage";
import MarketSystemPage from "./pages/market-system/MarketSystemPage";
import Order from "./pages/order/Order";
import OrderTracking from "./pages/order-tracking/OrderTracking";
import MyOrders from "./pages/my-orders/MyOrders";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentFailed from "./pages/payment/PaymentFailed";
import BlogList from "./components/blog/BlogList";
import BlogDetail from "./components/blog/BlogDetail";
import SearchResultPage from "./pages/blog/SearchResultPage";
import Overview from "./pages/admin/Overview";
import ProductAdminPage from "./pages/admin/ProductAdminPage";
import OrderAdminPage from "./pages/admin/OrderAdminPage";
import CategoryAdminPage from "./pages/admin/CategoryAdminPage";
import UserAdminPage from "./pages/admin/UserAdminPage";
import VariantAdminPage from "./pages/admin/VariantAdminPage";
import AttributeAdminPage from "./pages/admin/AttributeAdminPage";
import FollowingProducts from "./pages/followingProducts/FollowingProducts";
import AdminGuard from "./components/commons/guards/AdminGuard";
const App = () => {
  const location = useLocation();
  useEffect(() => {
    AOS.init({
      duration: 1000, // Thời gian hiệu ứng (ms)
      once: true, // Chỉ chạy một lần khi cuộn
    });
  }, []);

  useEffect(() => {
    // Ensure AOS recalculates positions after initial paint and on route changes.
    // This avoids elements staying hidden until a resize (e.g. opening DevTools).
    const t = setTimeout(() => {
      try {
        AOS.refreshHard();
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);

  const routes = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/product/:id",
      element: <DetailProduct />,
    },
    {
      path: "/search",
      element: <Search />,
    },
    {
      path: "/cart",
      element: <Cart />,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "/auth/callback",
      element: <OAuthCallback />,
    },
    {
      path: "/account",
      element: <Account />,
    },
    {
      path: "/productsByCategory/:categoryName",
      element: <ProductsByCategory />,
    },
    {
      path: "/contact",
      element: <ContactPage />,
    },
    {
      path: "/market-system",
      element: <MarketSystemPage />,
    },
    {
      path: "/order",
      element: <Order />,
    },
    {
      path: "/order-tracking",
      element: <OrderTracking />,
    },
    {
      path: "/my-orders",
      element: <MyOrders />,
    },
    {
      path: "/payment-success",
      element: <PaymentSuccess />,
    },
    {
      path: "/payment-failed",
      element: <PaymentFailed />,
    },
    {
      path: "/blog",
      element: <BlogList />,
    },
    {
      path: "/blog/:slug",
      element: <BlogDetail />,
    },
    {
      path: "/search-blog",
      element: <SearchResultPage />,
    },
    {
      path: "/admin/*",
      element: (
        <AdminGuard>
          <Overview />
        </AdminGuard>
      ),
    },
    {
      path: "/admin/products",
      element: (
        <AdminGuard>
          <ProductAdminPage />
        </AdminGuard>
      ),
    },
    {
      path: "/admin/orders",
      element: (
        <AdminGuard>
          <OrderAdminPage />
        </AdminGuard>
      ),
    },
    {
      path: "/admin/variants",
      element: (
        <AdminGuard>
          <VariantAdminPage />
        </AdminGuard>
      ),
    },
    {
      path: "/admin/attributes",
      element: (
        <AdminGuard>
          <AttributeAdminPage />
        </AdminGuard>
      ),
    },
    {
      path: "/admin/categories",
      element: (
        <AdminGuard>
          <CategoryAdminPage />
        </AdminGuard>
      ),
    },
    {
      path: "/admin/users",
      element: (
        <AdminGuard>
          <UserAdminPage />
        </AdminGuard>
      ),
    },
    {
      path: "/followingProducts/:id",
      element: <FollowingProducts />,
    },
  ]);
  return <>{routes}</>;
};

export default App;
