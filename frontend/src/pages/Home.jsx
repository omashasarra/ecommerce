import React from "react";
import Hero from "../components/Hero/Hero";
import Category from "../components/Category/category";
import Category2 from "../components/Category/category2";
import Services from "../components/Services/Services";
import Banner from "../components/Banner/Banner";
import Products from "../components/Products/Products";
import Blogs from "../components/Blogs/Blogs";
import Partners from "../components/Partners/Partners";

export default function Home({ handleOrderPopup }) {
  const [b1, setB1] = React.useState(null);
  const [b2, setB2] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/banners"); 
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        const list = Array.isArray(json?.rows) ? json.rows : [];

        const byPos = (pos) => list.find((b) => b.position === pos) || null;

        const normalize = (b) =>
          b && {
            discount: b.discount || "",
            title: b.title || "",
            date: b.date || "",
            image: b.image || "",
            title2: b.title2 || "",
            title3: b.title3 || "",
            title4: b.title4 || "",
            bgColor: b.bgColor || "#000000",
          };

        const p1 = byPos("home-1") || list[0] || null;
        const p2 = byPos("home-2") || list[1] || (list[0] && list.length > 1 ? list[1] : null);

        setB1(normalize(p1));
        setB2(normalize(p2));
      } catch (e) {
        console.error("Failed to load banners:", e);
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

      {b1 && <Banner data={b1} />}
      <Products />
      {b2 && <Banner data={b2} />}

      <Blogs />
      <Partners />
    </>
  );
}
