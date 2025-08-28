import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar/Navbar';
import Category from './components/Category/category';
import Category2 from './components/Category/category2';
import Home from './pages/Home.jsx';
import Partners from './components/Partners/Partners.jsx';

import headphone from "./assets/hero/headphone.png"
import Products from './components/Products/Products';
import smartwatch2 from "./assets/category/smartwatch2-removebg-preview.png"
import Blogs from './components/Blogs/Blogs';
import Footer from './components/Footer/Footer.jsx';
import Popup from './components/Popup/Popup.jsx';
import Services from './components/Services/Services.jsx';
import Banner from './components/Banner/Banner.jsx';



import AOS from "aos";
import "aos/dist/aos.css";




const BannerData = {
  discount: "30% OFF",
  title: "Fine Smile",
  date: "10 Jan to 28 Jan",
  image: headphone,
  title2: "Air Solo Bass",
  title3: "Winter Sale",
  title4: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  bgColor: "#f42c37",
};

const BannerData2 = {
  discount: "30% OFF",
  title: "Happy Hours",
  date: "10 Jan to 28 Jan",
  image: smartwatch2,
  title2: "Smart Solo",
  title3: "Winter Sale",
  title4: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  bgColor: "#2dcc6f",
};

const App = () => {
  const [orderPopup, setOrderPopup] = React.useState(false);

  const handleOrderPopup = () => {
    setOrderPopup(!orderPopup);
  };

  React.useEffect(() => {
    AOS.init(
      {
        duration: 800,
        easing: "ease-in-sine",
        delay: 100,
        offset: 100,
      });
    AOS.refresh();
  }, []);

  function CombineProducts () {
    return (
      <div>
        <Products />
        <hr />
        <Services />
        <hr />
        <Partners />
        <hr />
      </div>
    )
  }

  function CombineCategory () {
    return (
      <div>
        <Category />
        <hr />
        <Category2 />
      </div>
    )
  }
  return (
    <div className='bg-white dark:bg-gray-900 dark:text-white *:duration-200
    overflow-hidden'>
      <Router>
        <Navbar handleOrderPopup={handleOrderPopup} />

        <Routes>
          <Route path='/' element={<Home handleOrderPopup={handleOrderPopup} />} />
          <Route path='/products' element={<CombineProducts handleOrderPopup={handleOrderPopup}/>} />
          <Route path='/blog' element={<Blogs handleOrderPopup={handleOrderPopup}/>} />
          <Route path="/about" element={<CombineCategory handleOrderPopup={handleOrderPopup} />} />
          <Route path='trending' element={<Banner data={BannerData} handleOrderPopup={handleOrderPopup}/>}/>
          <Route path='best-selling' element={<Banner data={BannerData2} handleOrderPopup={handleOrderPopup}/>}/>
          <Route path='/top-rated' element={<Products handleOrderPopup={handleOrderPopup}/>} />
        </Routes>

        <Footer />
        <Popup orderPopup={orderPopup} handleOrderPopup={handleOrderPopup} />
      </Router>
    </div>
  )
}

export default App