import React from "react";
import { api } from "../shared/api";
import { auth } from "../shared/auth";
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

// Tiny no-deps HTML editor
function HtmlEditor({ value, onChange, minHeight = 160 }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current && value !== undefined) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function exec(cmd, arg = null) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange?.(ref.current?.innerHTML || "");
  }

  function onInput() {
    onChange?.(ref.current?.innerHTML || "");
  }

  function insertLink() {
    const url = window.prompt("Enter URL:");
    if (url) exec("createLink", url);
  }

  function setBlock(tag) {
    exec("formatBlock", `<${tag}>`);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        <button type="button" onClick={() => exec("bold")} className="px-2 py-1 border rounded">B</button>
        <button type="button" onClick={() => exec("italic")} className="px-2 py-1 border rounded italic">I</button>
        <button type="button" onClick={() => exec("underline")} className="px-2 py-1 border rounded">U</button>
        <button type="button" onClick={() => setBlock("p")} className="px-2 py-1 border rounded">P</button>
        <button type="button" onClick={() => setBlock("h3")} className="px-2 py-1 border rounded">H3</button>
        <button type="button" onClick={() => exec("insertUnorderedList")} className="px-2 py-1 border rounded">• List</button>
        <button type="button" onClick={() => exec("insertOrderedList")} className="px-2 py-1 border rounded">1. List</button>
        <button type="button" onClick={insertLink} className="px-2 py-1 border rounded">Link</button>
        <button type="button" onClick={() => exec("removeFormat")} className="px-2 py-1 border rounded">Clear</button>
      </div>

      <div
        ref={ref}
        contentEditable
        onInput={onInput}
        className="w-full rounded border dark:bg-slate-800 dark:border-slate-700 p-3 prose prose-sm max-w-none dark:prose-invert"
        style={{ minHeight }}
        spellCheck={false}
      />
      <p className="mt-1 text-xs text-gray-500">
        Tip: paste formatted text, or use the toolbar. You can also add spacing using paragraphs.
      </p>
    </div>
  );
}

export default function AdminBlogs() {
  const nav = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [editing, setEditing] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  // NEW: local file + preview while editing
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [previewURL, setPreviewURL] = React.useState("");

  React.useEffect(() => {
    if (!auth.isAuthed() || !auth.isAdmin()) {
      nav("/login", { replace: true });
    }
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const json = await api(`/api/blogs/admin`);
      setRows(Array.isArray(json?.data) ? json.data : json?.rows || []);
    } catch (e) {
      if (e.status === 401) nav("/login");
      setError(e.message || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  function onEdit(blog) {
    setEditing({ ...blog });
    setSelectedFile(null);
    setPreviewURL(blog?.image || ""); // show currently stored image if any
  }
  function onCancelEdit() {
    setEditing(null);
    setSelectedFile(null);
    setPreviewURL("");
  }

  async function onSaveEdit(e) {
    e.preventDefault();
    try {
      const { _id, image, ...payload } = editing; // exclude image URL; file will replace if provided

      // Build multipart/form-data
      const form = new FormData();
      for (const [k, v] of Object.entries(payload)) {
        if (v === null || v === undefined) continue;
        // convert objects to strings (e.g., dates already strings)
        form.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
      }
      if (selectedFile) {
        form.append("image", selectedFile); // field name must match uploader.single("image")
      }

      await api(`/api/blogs/admin/${_id}`, {
        method: "PUT",
        body: form,
      });

      setEditing(null);
      setSelectedFile(null);
      setPreviewURL("");
      await load();
    } catch (err) {
      if (err.status === 401) nav("/login");
      alert(err?.data?.error || err.message || "Update failed");
    }
  }

  function onAskDelete(blog) {
    setConfirmDelete(blog);
  }
  function onCancelDelete() {
    setConfirmDelete(null);
  }

  async function onConfirmDelete() {
    try {
      const id = confirmDelete._id;
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
            id="edit-blog-modal"
            className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xl
                       max-h-[85vh] overflow-y-auto"
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

              {/* ✅ Image upload from desktop (no URL input) */}
              <Field label="Blog Image (upload from desktop)">
                <div className="space-y-2">
                  {previewURL ? (
                    <img
                      src={previewURL}
                      alt="preview"
                      className="w-full h-36 object-cover rounded-lg"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setPreviewURL(url);
                      } else {
                        setPreviewURL(editing?.image || "");
                      }
                    }}
                    className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                  />
                  {/* Show current stored path if no new file chosen */}
                  {editing?.image && !selectedFile && (
                    <p className="text-xs text-gray-500 break-all">
                      Stored: {editing.image}
                    </p>
                  )}
                </div>
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

            {/* Rich text editors */}
            <div className="mt-4 grid grid-cols-1 gap-4">
              <Field label="Excerpt (short paragraph – HTML)">
                <HtmlEditor
                  value={editing.excerpt || ""}
                  onChange={(html) => setEditing({ ...editing, excerpt: html })}
                  minHeight={120}
                />
              </Field>

              <Field label="Content (full HTML)">
                <HtmlEditor
                  value={editing.content || ""}
                  onChange={(html) => setEditing({ ...editing, content: html })}
                  minHeight={240}
                />
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
