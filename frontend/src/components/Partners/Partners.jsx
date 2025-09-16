import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "";

// Same idea as Banner.resolveImage but for /brand
function resolveBrandImage(image) {
  if (!image) return "";

  // local preview blobs
  if (image.startsWith("blob:")) return image;

  // absolute URLs (CDN, etc.)
  if (/^https?:\/\//i.test(image)) return image;

  // already normalized absolute web path
  if (image.startsWith("/brand/")) return image;

  // any other absolute path, keep it (rare but safe)
  if (image.startsWith("/")) return image;

  // mixed paths or plain filename -> normalize to /brand/<file>
  if (image.includes("/")) return `/brand/${image.split("/").pop()}`;
  return `/brand/${image}`;
}

// Build final src: if it's an http(s) or blob, leave it;
// if it's a web path, prepend API_BASE (like Banner usage).
function toSrc(image) {
  const p = resolveBrandImage(image);
  if (!p) return "";
  if (p.startsWith("blob:") || /^https?:\/\//i.test(p)) return p;
  return `${API_BASE}${p}`;
}

export default function Partners() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/partners");
        const data = await res.json();
        setRows(Array.isArray(data?.rows) ? data.rows : []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="py-8 mt-24 hidden md:block bg-gray-200 dark:bg-white/10" />;
  }

  if (!rows.length) return null;

  return (
    <div className="py-8 mt-24 hidden md:block bg-gray-200 dark:bg-white/10">
      <div className="container">
        <div className="grid grid-cols-5 gap-3 place-items-center opacity-50">
          {rows.map((p) => {
            const src = toSrc(p.image);
            return (
              <img
                key={p._id}
                src={src}
                alt={p.name || "Partner"}
                className="w-[80px] dark:invert object-contain"
                loading="lazy"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
