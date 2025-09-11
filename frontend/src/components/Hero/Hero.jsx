// Hero.jsx (only the data-loading part + the render condition needs this change)
import React from "react";
import SliderComponent from "../Shared/SliderComponent";

const Hero = ({ handleOrderPopup }) => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let live = true;

    (async () => {
      try {
        const res = await fetch("/api/hero", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // ✅ read from json.rows (your API shape) and normalize id
        const items = Array.isArray(json?.rows)
          ? json.rows.map((s, i) => ({ id: s._id || i, ...s }))
          : [];

        if (live) setData(items);
      } catch (e) {
        if (live) setError(e.message || "Failed to load");
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => { live = false; };
  }, []);

  return (
    <div className="container">
      <div className="overflow-hidden rounded-3xl min-h-[550px]
        sm:min-h-[650px] hero-bg-color flex justify-center items-center">
        <div className="container pb-8 sm:pb-0">

          {loading && <div style={{ padding: 12 }}>Loading...</div>}
          {error && <div style={{ padding: 12, color: "red" }}>Error: {error}</div>}

          {/* ✅ render when we have slides */}
          {!loading && !error && data.length > 0 && (
            <SliderComponent data={data} handleOrderPopup={handleOrderPopup} />
          )}

          {!loading && !error && data.length === 0 && (
            <div style={{ padding: 12 }}>No slides found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
