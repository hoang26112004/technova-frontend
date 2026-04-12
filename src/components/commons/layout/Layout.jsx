/* eslint-disable */
import React from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import "./Layout.scss";

const Layout = ({ children }) => {
  return (
    <div className="layout-root">
      <header className="layout-header">
        <Header />
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
