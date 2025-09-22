import React from "react";
import Button from "../Shared/Button";
import { userApi as api } from "../../shared/api";


const resolveCategoryImage = (image) => {
  if (!image) return "";
  if (image.startsWith("blob:")) return image;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/category/")) return image;
  if (image.startsWith("/")) return image;                        
  if (image.includes("/")) return `/category/${image.split("/").pop()}`;
  return `/category/${image}`;
};

export default function Category2() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api("/api/categories");
        const rows = Array.isArray(data?.rows) ? data.rows : [];
        const sorted = [...rows].sort(
          (a, b) =>
            (a.order - b.order) ||
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setItems(sorted);
      } catch (e) {
        setError(e.message || "Failed to load categories");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // items 3..5 (Console, Oculus, Speakers)
  const [consoleItem, oculusItem, speakersItem] = (Array.isArray(items) ? items : []).slice(3, 6);
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
            {/* CONSOLE (col-span-2) */}
            {consoleItem && (
              <div className="col-span-2 py-10 pl-5 bg-gradient-to-br from-gray-400/90 to-gray-100 text-white rounded-3xl relative h-[320px] flex items-end">
                <div className="mb-4">
                  <p className="mb-[2px] text-white">{t(consoleItem, "subtitleTop", "Enjoy")}</p>
                  <p className="text-2xl font-semibold mb-[2px]">{t(consoleItem, "subtitleMid", "With")}</p>
                  <p className="text-4xl xl:text-5xl font-bold opacity-40 mb-2">{t(consoleItem, "title", "CONSOLE")}</p>
                  <Button text={t(consoleItem, "buttonLabel", "Browse")} bgColor={"bg-primary"} textColor={"text-white"} />
                </div>
                {img(consoleItem) && (
                  <img src={img(consoleItem)} alt={consoleItem.title} className="w-[250px] absolute top-1/2 -translate-y-1/2 -right-0" />
                )}
              </div>
            )}

            {/* Oculus */}
            {oculusItem && (
              <div className="py-10 pl-5 bg-gradient-to-br from-brandGreen/90 to-brandGreen/70 text-white rounded-3xl relative h-[320px] flex items-start">
                <div className="mb-4">
                  <p className="mb-[2px] text-white">{t(oculusItem, "subtitleTop", "Enjoy")}</p>
                  <p className="text-2xl font-semibold mb-[2px]">{t(oculusItem, "subtitleMid", "With")}</p>
                  <p className="text-4xl xl:text-5xl font-bold opacity-20 mb-2">{t(oculusItem, "title", "Oculus")}</p>
                  <Button text={t(oculusItem, "buttonLabel", "Browse")} bgColor={"bg-white"} textColor={"text-brandGreen"} />
                </div>
                {img(oculusItem) && (
                  <img src={img(oculusItem)} alt={oculusItem.title} className="w-[320px] absolute bottom-0" />
                )}
              </div>
            )}

            {/* Speakers */}
            {speakersItem && (
              <div className="py-10 pl-5 bg-gradient-to-br from-brandBlue to-brandBlue/90 text-white rounded-3xl relative h-[320px] flex items-start">
                <div className="mb-4">
                  <p className="mb-[2px] text-white">{t(speakersItem, "subtitleTop", "Enjoy")}</p>
                  <p className="text-2xl font-semibold mb-[2px]">{t(speakersItem, "subtitleMid", "With")}</p>
                  <p className="text-4xl xl:text-5xl font-bold opacity-40 mb-2">{t(speakersItem, "title", "Speakers")}</p>
                  <Button text={t(speakersItem, "buttonLabel", "Browse")} bgColor={"bg-white"} textColor={"text-brandBlue"} />
                </div>
                {img(speakersItem) && (
                  <img src={img(speakersItem)} alt={speakersItem.title} className="w-[200px] absolute bottom-0 right-0" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
