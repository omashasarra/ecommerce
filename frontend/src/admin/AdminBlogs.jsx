// src/admin/AdminBlogs.jsx
import React from "react";
import { api } from "../shared/api";   // ← use your helper (adds Bearer token)
import { auth } from "../shared/auth"; // ← optional: guard for non-admins
import { useNavigate } from "react-router-dom";

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function AdminBlogs() {
  const nav = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [editing, setEditing] = React.useState(null);        // blog doc or null
  const [confirmDelete, setConfirmDelete] = React.useState(null); // blog doc or null

  // optional: block access if not authed/admin
  React.useEffect(() => {
    if (!auth.isAuthed() || !auth.isAdmin()) {
      nav("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      // ADMIN list (requires token) — NOT /api/blogs
      const json = await api(`/api/blogs/admin`);
      setRows(Array.isArray(json?.data) ? json.data : json?.rows || []);
    } catch (e) {
      // 401 → token missing/expired → send user to login
      if (e.status === 401) nav("/login");
      setError(e.message || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []); // load once

  function onEdit(blog) { setEditing({ ...blog }); }
  function onCancelEdit() { setEditing(null); }

  async function onSaveEdit(e) {
    e.preventDefault();
    try {
      const { _id, ...payload } = editing;
      // ADMIN update endpoint
      await api(`/api/blogs/admin/${_id}`, {
        method: "PUT",
        body: payload,
      });
      setEditing(null);
      await load();
    } catch (err) {
      if (err.status === 401) nav("/login");
      alert(err?.data?.error || err.message || "Update failed");
    }
  }

  function onAskDelete(blog) { setConfirmDelete(blog); }
  function onCancelDelete() { setConfirmDelete(null); }

  async function onConfirmDelete() {
    try {
      const id = confirmDelete._id;
      // ADMIN delete endpoint
      await api(`/api/blogs/admin/${id}`, { method: "DELETE" });
      setConfirmDelete(null);
      await load();
    } catch (err) {
      if (err.status === 401) nav("/login");
      alert(err?.data?.error || err.message || "Delete failed");
    }
  }

  return (
    <div className="p-2 sm:p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Blogs</h2>
        <button
          onClick={load}
          className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50
                     dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
        >
          Refresh
        </button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto border rounded-lg dark:border-slate-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60">
              <tr className="text-left">
                <th className="px-3 py-2 border-b dark:border-slate-700">Title</th>
                <th className="px-3 py-2 border-b dark:border-slate-700">Author</th>
                <th className="px-3 py-2 border-b dark:border-slate-700">Active</th>
                <th className="px-3 py-2 border-b dark:border-slate-700">Order</th>
                <th className="px-3 py-2 border-b dark:border-slate-700">Updated</th>
                <th className="px-3 py-2 border-b dark:border-slate-700"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2 border-b dark:border-slate-800">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">
                      {b.subtitle}
                    </div>
                  </td>
                  <td className="px-3 py-2 border-b dark:border-slate-800">{b.author || "-"}</td>
                  <td className="px-3 py-2 border-b dark:border-slate-800">{b.isActive ? "Yes" : "No"}</td>
                  <td className="px-3 py-2 border-b dark:border-slate-800">{b.order ?? 0}</td>
                  <td className="px-3 py-2 border-b dark:border-slate-800">
                    {b.updatedAt ? new Date(b.updatedAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-3 py-2 border-b dark:border-slate-800">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(b)}
                        className="px-2 py-1 rounded border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onAskDelete(b)}
                        className="px-2 py-1 rounded border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                    No blogs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-3 z-50">
          <form
            onSubmit={onSaveEdit}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xl"
          >
            <h3 className="text-lg font-semibold mb-3">Edit Blog</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title">
                <input
                  className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  required
                />
              </Field>

              <Field label="Subtitle">
                <input
                  className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                  value={editing.subtitle || ""}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                />
              </Field>

              <Field label="Author">
                <input
                  className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                  value={editing.author || ""}
                  onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                />
              </Field>

              <Field label="Published At">
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                  value={
                    editing.publishedAt
                      ? new Date(editing.publishedAt).toISOString().slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                />
              </Field>

              <Field label="Image URL (from /public)">
                <input
                  className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                  value={editing.image || ""}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                  placeholder="/blogs/blog-1.jpg"
                />
              </Field>

              <Field label="Order">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                  value={editing.order ?? 0}
                  onChange={(e) => setEditing({ ...editing, order: Number(e.target.value || 0) })}
                />
              </Field>

              <Field label="AOS Delay (ms)">
                <input
                  type="number"
                  min={0}
                  className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                  value={editing.aosDelay ?? 0}
                  onChange={(e) => setEditing({ ...editing, aosDelay: Number(e.target.value || 0) })}
                />
              </Field>

              <Field label="Active">
                <select
                  className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                  value={editing.isActive ? "1" : "0"}
                  onChange={(e) => setEditing({ ...editing, isActive: e.target.value === "1" })}
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </Field>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3 py-2 rounded border bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-3 z-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete blog?</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              This will permanently delete: <b>{confirmDelete.title}</b>
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={onCancelDelete}
                className="px-3 py-2 rounded border bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDelete}
                className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
