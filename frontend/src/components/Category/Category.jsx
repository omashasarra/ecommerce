import React from "react";
import Button from "../Shared/Button";
import api from "../../shared/api";

const resolveCategoryImage = (image) => {
  if (!image) return "";
  if (image.startsWith("blob:")) return image;                 // local preview
  if (/^https?:\/\//i.test(image)) return image;               // absolute URL
  if (image.startsWith("/category/")) return image;            // backend-served
  if (image.startsWith("/")) return image;                     // other app assets
  if (image.includes("/")) return `/category/${image.split("/").pop()}`; // legacy
  return `/category/${image}`;                                 // filename only
};

const Category = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api("/api/categories"); // public list
        const rows = Array.isArray(data?.rows) ? data.rows : [];
        const sorted = [...rows].sort(
          (a, b) =>
            (a.order - b.order) ||
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setItems(sorted.slice(0, 3));
      } catch (e) {
        setError(e.message || "Failed to load categories");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [first, second, third] = items;
  const t = (o, k, d) => (o && o[k]) || d;
  const img = (o) => resolveCategoryImage(o?.image ?? o?.imageUrl ?? "");

  return (
    <div className="py-8">
      <div className="container">
        {error && <p className="text-red-600 mb-3">{error}</p>}
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Earphones */}
            {first && (
              <div className="py-10 pl-5 bg-gradient-to-br from-black/90 to-black/70 text-white rounded-3xl relative h-[320px] flex items-end">
                <div className="mb-4">
                  <p className="mb-[2px] text-gray-400">{t(first, "subtitleTop", "Enjoy")}</p>
                  <p className="text-2xl font-semibold mb-[2px]">{t(first, "subtitleMid", "With")}</p>
                  <p className="text-4xl xl:text-5xl font-bold opacity-20 mb-2">{t(first, "title", "Earphones")}</p>
                  <Button text={t(first, "buttonLabel", "Browse")} bgColor={"bg-primary"} textColor={"text-white"} />
                </div>
                {img(first) && (
                  <img src={img(first)} alt={first.title} className="w-[320px] absolute bottom-0" />
                )}
              </div>
            )}

            {/* Gadget */}
            {second && (
              <div className="py-10 pl-5 bg-gradient-to-br from-brandYellow to-brandYellow/90 text-white rounded-3xl relative h-[320px] flex items-end">
                <div className="mb-4">
                  <p className="mb-[2px] text-white">{t(second, "subtitleTop", "Enjoy")}</p>
                  <p className="text-2xl font-semibold mb-[2px]">{t(second, "subtitleMid", "With")}</p>
                  <p className="text-4xl xl:text-5xl font-bold opacity-40 mb-2">{t(second, "title", "Gadget")}</p>
                  <Button text={t(second, "buttonLabel", "Browse")} bgColor={"bg-white"} textColor={"text-brandYellow"} />
                </div>
                {img(second) && (
                  <img src={img(second)} alt={second.title} className="w-[320px] absolute -right-4 lg:top-[40px]" />
                )}
              </div>
            )}

            {/* Laptop */}
            {third && (
              <div className="col-span-2 py-10 pl-5 bg-gradient-to-br from-primary to-primary/70 text-white rounded-3xl relative h-[320px] flex items-end">
                <div className="mb-4">
                  <p className="mb-[2px] text-white">{t(third, "subtitleTop", "Enjoy")}</p>
                  <p className="text-2xl font-semibold mb-[2px]">{t(third, "subtitleMid", "With")}</p>
                  <p className="text-4xl xl:text-5xl font-bold opacity-40 mb-2">{t(third, "title", "Laptop")}</p>
                  <Button text={t(third, "buttonLabel", "Browse")} bgColor={"bg-white"} textColor={"text-primary"} />
                </div>
                {img(third) && (
                  <img src={img(third)} alt={third.title} className="w-[250px] absolute top-1/2 -translate-y-1/2 -right-0" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
