// src/pages/Blogs.jsx
import React from "react";
import Heading from "../Shared/Heading";

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

  // NEW: modal state
  const [openId, setOpenId] = React.useState(null);
  const [detail, setDetail] = React.useState(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/blogs");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json?.data) ? json.data : [];
        const mapped = items.map((b) => ({
          _id: b._id,
          title: b.title || "Untitled",
          subtitle: b.subtitle || "",
          author: b.author || "",
          publishedAt: b.publishedAt || null,
          image:
            b.image || "https://picsum.photos/seed/blog-fallback/800/500",
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

  // NEW: open modal and fetch one blog
  async function openBlog(id) {
    try {
      setOpenId(id);
      setDetail(null);
      setDetailError("");
      setDetailLoading(true);
      const res = await fetch(`/api/blogs/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDetail(json?.data || null);
    } catch (e) {
      setDetailError(e.message || "Failed to load blog");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setOpenId(null);
    setDetail(null);
    setDetailError("");
  }

  return (
    <div className="container px-4 mx-auto">
      <Heading title="Recent News" subtitle="Explore Our Blogs" />

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-4 md:gap-7 mt-6">
          {blogs.map((blog) => (
            <button
              type="button"
              key={blog._id || blog.title}
              onClick={() => openBlog(blog._id)}
              data-aos="fade-up"
              data-aos-delay={blog.aosDelay}
              className="text-left bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
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
            </button>
          ))}

          {blogs.length === 0 && (
            <div className="col-span-full text-sm text-gray-500">
              No blogs found.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {openId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b dark:border-slate-800">
              <h3 className="text-lg font-semibold">
                {detail?.title || "Blog"}
              </h3>
              <button
                onClick={closeModal}
                className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {detailLoading && <div>Loading…</div>}
              {detailError && (
                <div className="text-red-600">Error: {detailError}</div>
              )}
              {detail && (
                <>
                  {detail.image ? (
                    <img
                      src={detail.image}
                      alt={detail.title}
                      className="w-full h-56 object-cover rounded-xl"
                    />
                  ) : null}

                  <p className="text-xs text-gray-500">
                    {formatPublished(detail.author, detail.publishedAt)}
                  </p>

                  {/* Show full content if present; otherwise show excerpt; otherwise nothing */}
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        detail.content ||
                        detail.excerpt ||
                        "<p>No content.</p>",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
