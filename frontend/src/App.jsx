import React, { useEffect } from "react";
import { auth } from "./shared/auth.js";
import { api } from "./shared/api.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./store/cart.jsx";
import { ToastProvider } from "./shared/toast.jsx";

import Navbar from "./components/Navbar/Navbar";
import Category from "./components/Category/category";
import Category2 from "./components/Category/category2";
import Home from "./pages/Home.jsx";
import Partners from "./components/Partners/Partners.jsx";
import Login from "./components/Login.jsx";
import Products from "./components/Products/Products";
import Blogs from "./components/Blogs/Blogs";
import Footer from "./components/Footer/Footer.jsx";
import Services from "./components/Services/Services.jsx";
import Banner from "./components/Banner/Banner.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CartModal from "./components/CartModal.jsx"

import AOS from "aos";
import "aos/dist/aos.css";
import AdminRoute from "./components/AdminRoute.jsx";

const App = () => {
  useEffect(() => {
    if (!auth.token) return;
    (async () => {
      try {
        const me = await api("/api/auth/me");
        auth.user = me;
      } catch (err) {
        console.error("Failed to hydrate /auth/me:", err);
        auth.token = null;
        auth.user = null;
      }
    })();
  }, []);

  const [orderPopup, setOrderPopup] = React.useState(false);
  const handleOrderPopup = () => setOrderPopup((v) => !v);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-sine", delay: 100, offset: 100 });
    AOS.refresh();
  }, []);

  const [banners, setBanners] = React.useState([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/banners");
        const d = await r.json();
        setBanners(d.rows || []);
      } catch (e) {
        console.error("Failed to load banners:", e);
      }
    })();
  }, []);

  function CombineProducts() {
    return (
      <div>
        <Products />
        <hr />
        <Services />
        <hr />
        <Partners />
        <hr />
      </div>
    );
  }

  function CombineCategory() {
    return (
      <div>
        <Category />
        <hr />
        <Category2 />
      </div>
    );
  }

  const Trending = () => (banners[0] ? <Banner data={banners[0]} /> : null);
  const BestSelling = () => {
    const data = banners[1] || banners[0];
    return data ? <Banner data={data} /> : null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white *:duration-200 overflow-hidden">
      <ToastProvider>
      <CartProvider>
        <Router>
          <Navbar handleOrderPopup={handleOrderPopup} />
          <Routes>
            <Route path="/" element={<Home handleOrderPopup={handleOrderPopup} />} />
            <Route path="/products" element={<CombineProducts handleOrderPopup={handleOrderPopup} />} />
            <Route path="/blog" element={<Blogs handleOrderPopup={handleOrderPopup} />} />
            <Route path="/about" element={<CombineCategory handleOrderPopup={handleOrderPopup} />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/best-selling" element={<BestSelling />} />
            <Route path="/top-rated" element={<Products handleOrderPopup={handleOrderPopup} />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/login" element={<Login />} />
          </Routes>
          <Footer />
          <CartModal open={orderPopup} onClose={handleOrderPopup} />
        </Router>
      </CartProvider>
      </ToastProvider>
    </div>
  );
};

export default App;
