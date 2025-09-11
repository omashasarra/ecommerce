import React from "react";
import Hero from "../components/Hero/Hero";
import Category from "../components/Category/category";
import Category2 from "../components/Category/category2";
import Services from "../components/Services/Services";
import Banner from "../components/Banner/Banner";
import Products from "../components/Products/Products";
import Blogs from "../components/Blogs/Blogs";
import Partners from "../components/Partners/Partners";

import headphone from "../assets/hero/headphone.png";
import smartwatch2 from "../assets/category/smartwatch2-removebg-preview.png";

const FALLBACK_1 = {
  discount: "30% OFF",
  title: "Fine Smile",
  date: "10 Jan to 28 Jan",
  image: headphone,
  title2: "Air Solo Bass",
  title3: "Winter Sale",
  title4: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  bgColor: "#f42c37",
};

const FALLBACK_2 = {
  discount: "30% OFF",
  title: "Happy Hours",
  date: "10 Jan to 28 Jan",
  image: smartwatch2,
  title2: "Smart Solo",
  title3: "Winter Sale",
  title4: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  bgColor: "#2dcc6f",
};

export default function Home({ handleOrderPopup }) {
  const [b1, setB1] = React.useState(null);
  const [b2, setB2] = React.useState(null);

  React.useEffect(() => {
    // Fetch active banners and map positions to component props
    (async () => {
      try {
        const res = await fetch("/api/banners"); // make sure Vite proxy to 5000 exists
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        const list = Array.isArray(json?.rows) ? json.rows : [];

        const m = new Map(list.map(b => [b.position, b]));
        const mapBanner = (b) =>
          b
            ? {
                discount: b.discount,
                title: b.title,
                date: b.date,
                image: b.imageUrl || "", // server mapped -> /banner/<file>
                title2: b.title2,
                title3: b.title3,
                title4: b.title4,
                bgColor: b.bgColor,
              }
            : null;

        setB1(mapBanner(m.get("home-1")));
        setB2(mapBanner(m.get("home-2")));
      } catch {
        // Fall back to static data if API fails
        setB1(null);
        setB2(null);
      }
    })();
  }, []);

  return (
    <>
      <Hero handleOrderPopup={handleOrderPopup} />
      <Category />
      <Category2 />
      <Services />

      {/* Use API data if present, else fallbacks so design stays identical */}
      <Banner data={b1 || FALLBACK_1} />
      <Products />
      <Banner data={b2 || FALLBACK_2} />

      <Blogs />
      <Partners />
    </>
  );
}

