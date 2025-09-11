// src/pages/Blogs.jsx
import React from "react";
import Heading from "../Shared/Heading";
// إذا عندك helper جاهز مثل api("/url") استعمله. غير هيك، رح نستخدم fetch مباشرة
// import { api } from "../../shared/api";

function formatPublished(author, publishedAt) {
  const date = publishedAt ? new Date(publishedAt) : null;
  const dateStr = date && !isNaN(date) ? date.toLocaleDateString() : "";
  const by = author ? ` by ${author}` : "";
  return `${dateStr}${by}`.trim();
}

export default function Blogs() {
  const [blogs, setBlogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        // لو بدك تشوف الكل بما فيها drafts استعمل ?active=all
        const res = await fetch("/api/blogs"); // أو "/api/blogs?active=all"
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const items = Array.isArray(json?.data) ? json.data : [];

        // توحيد/حماية القيم الناقصة
        const mapped = items.map((b) => ({
          _id: b._id,
          title: b.title || "Untitled",
          subtitle: b.subtitle || "",
          author: b.author || "",
          publishedAt: b.publishedAt || null,
          image:
            b.image ||
            "https://picsum.photos/seed/blog-fallback/800/500", // fallback إذا ما في صورة
          aosDelay: typeof b.aosDelay === "number" ? b.aosDelay : 0,
        }));

        setBlogs(mapped);
      } catch (e) {
        console.error("Blogs load failed:", e);
        setError(e.message || "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container px-4 mx-auto">
      <Heading title="Recent News" subtitle="Explore Our Blogs" />

      {loading && <div>Loading…</div>}
      {error && (
        <div className="text-red-600 mt-2">
          {error}
          {/* ملاحظة: /api/auth/me 401 ما له علاقة بهالصفحة لأن /api/blogs public */}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-4 md:gap-7 mt-6">
          {blogs.map((blog) => (
            <div
              key={blog._id || blog.title}
              data-aos="fade-up"
              data-aos-delay={blog.aosDelay}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px] object-cover rounded-t-2xl hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://picsum.photos/seed/blog-fallback/800/500";
                  }}
                />
              </div>
              <div className="p-4 sm:p-5 space-y-2">
                <p className="text-xs sm:text-sm text-gray-500">
                  {formatPublished(blog.author, blog.publishedAt)}
                </p>
                <p className="font-bold text-sm sm:text-base line-clamp-1">
                  {blog.title}
                </p>
                <p className="line-clamp-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {blog.subtitle}
                </p>
              </div>
            </div>
          ))}

          {blogs.length === 0 && (
            <div className="col-span-full text-sm text-gray-500">
              No blogs found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
