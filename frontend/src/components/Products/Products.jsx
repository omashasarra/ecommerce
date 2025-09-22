import React from "react";
import Heading from "../Shared/Heading";
import { ProductCard } from "./ProductCard";
import { userApi as api } from "../../shared/api";

const Products = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      // public API returns an array of products
      const rows = await api(`/api/products?_=${Date.now()}`); // timestamp busts any stale caches
      // map backend fields into what ProductCard expects
      const mapped = (rows || []).map((r, idx) => ({
      id: r._id,
      img: r.imageURL,
      title: r.title,
      price: r.price,
      stock: r.stock ?? 0,
      aosDelay: String(idx * 150),
    }));
      setItems(mapped);
    } catch (e) {
      setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="container">
        <Heading title="Our Products" subtitle={"Explore Our Products"} />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {loading ? (
          <p className="text-sm text-gray-600">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-600">No products yet.</p>
        ) : (
          <ProductCard data={items} />
        )}
      </div>
    </div>
  );
};

export default Products;
