import React from "react";
import { adminApi as api } from "../shared/api"; // ✅ use adminApi only

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

function TextInput(props) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded px-3 py-2",
        "border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
        "bg-white text-gray-900 placeholder-gray-400",
        "dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:border-slate-700 dark:focus:ring-blue-400",
        props.className || "",
      ].join(" ")}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={[
        "rounded px-2 py-1",
        "border border-gray-300 bg-white text-gray-900",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:focus:ring-blue-400",
        props.className || "",
      ].join(" ")}
    />
  );
}

function SoftButton({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={[
        "px-3 py-2 rounded transition",
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
        "dark:bg-blue-600 dark:hover:bg-blue-500",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={[
        "px-3 py-2 rounded border transition",
        "border-gray-300 text-gray-700 hover:bg-gray-50",
        "dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800/60",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function DangerButton({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={[
        "px-3 py-2 rounded border transition",
        "border-red-300 text-red-600 hover:bg-red-50",
        "dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/20",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded border",
        "bg-white border-gray-200",
        "dark:bg-slate-900 dark:border-slate-800",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Modal({ title, children, onClose, width = "w-[600px]" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className={[
          "relative rounded shadow-lg max-w-[95vw]",
          width,
          "border",
          "bg-white border-gray-200",
          "dark:bg-slate-900 dark:border-slate-800",
        ].join(" ")}
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 font-medium text-gray-900 dark:text-slate-100">
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

function CategoryForm({ initial, onSave, onCancel }) {
  const defaultForm = React.useMemo(
    () => ({
      title: "",
      subtitleTop: "Enjoy",
      subtitleMid: "With",
      buttonLabel: "Browse",
      imageUrl: "",
    }),
    []
  );

  const [form, setForm] = React.useState(initial || defaultForm);
  const [imageFile, setImageFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    setForm(initial || defaultForm);
    setImageFile(null);
    setErr("");
    setUploading(false);
  }, [initial, defaultForm]);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  // ✅ upload uses adminApi
  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("image", file);
    const data = await api("/api/categories/admin/upload", {
      method: "POST",
      body: fd,
    });
    return data;
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      let payload = { ...form };
      if (imageFile) {
        setUploading(true);
        const { url } = await uploadImage(imageFile);
        payload.imageUrl = url;
      }
      await onSave(payload);
    } catch (ex) {
      setErr(ex.message || "Save Failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-4 text-gray-900 dark:text-slate-100">
      {err && (
        <p className="text-red-600 dark:text-red-400 mb-2 text-sm">{err}</p>
      )}

      <Field label="Title">
        <TextInput
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Category title"
        />
      </Field>

      <Field label="Subtitle Top">
        <TextInput
          value={form.subtitleTop}
          onChange={(e) => update("subtitleTop", e.target.value)}
        />
      </Field>

      <Field label="Subtitle Mid">
        <TextInput
          value={form.subtitleMid}
          onChange={(e) => update("subtitleMid", e.target.value)}
        />
      </Field>

      <Field label="Button Label">
        <TextInput
          value={form.buttonLabel}
          onChange={(e) => update("buttonLabel", e.target.value)}
        />
      </Field>

      <Field label="Image URL (optional)">
        <TextInput
          value={form.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          placeholder="/category/your-file.png or https://…"
        />
      </Field>

      <Field label="Upload Image">
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {form.imageUrl || imageFile ? (
            <img
              src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl}
              alt="preview"
              className="h-12 w-auto rounded border border-gray-200 dark:border-slate-800"
            />
          ) : (
            <span className="text-xs text-gray-400 dark:text-slate-500">
              No image
            </span>
          )}
        </div>
        {uploading && (
          <p className="text-xs text-gray-500 mt-1">Uploading…</p>
        )}
      </Field>

      <div className="flex gap-2 pt-2">
        <GhostButton type="button" onClick={onCancel}>
          Cancel
        </GhostButton>
        <SoftButton type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : "Save"}
        </SoftButton>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortDir, setSortDir] = React.useState("desc");

  const [editing, setEditing] = React.useState(null);
  const [creating, setCreating] = React.useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const query = new URLSearchParams({
        page,
        pageSize,
        search,
        sortBy,
        sortDir,
      });
      const res = await api(`/api/categories/admin?${query}`);
      setRows(res.rows || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [page, pageSize, search, sortBy, sortDir]);

  async function save(form) {
    if (editing) {
      const updated = await api(`/api/categories/admin/${editing._id}`, {
        method: "PUT",
        body: form,
      });
      setRows((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setEditing(null);
    } else {
      const created = await api("/api/categories/admin", {
        method: "POST",
        body: form,
      });
      setRows((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      setCreating(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this category?")) return;
    await api(`/api/categories/admin/${id}`, { method: "DELETE" });
    await load();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-4 text-gray-900 dark:text-slate-100">
      <h1 className="text-xl font-semibold mb-4">Categories</h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <TextInput
          placeholder="Search by title…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1"
        />
        <SoftButton onClick={() => setCreating(true)}>New</SoftButton>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
      )}

      {loading ? (
        <Card className="p-4 text-sm">Loading…</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-700 dark:text-slate-200">
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Updated</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r._id}
                  className="border-t border-gray-200 dark:border-slate-800"
                >
                  <td className="p-2 align-middle">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {r.subtitleTop} • {r.subtitleMid} • {r.buttonLabel}
                    </div>
                  </td>
                  <td className="p-2 align-middle">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.title || "Category image"}
                        className="h-12 w-auto rounded border border-gray-200 dark:border-slate-800"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        No image
                      </span>
                    )}
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    {r.updatedAt
                      ? new Date(r.updatedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-2 align-middle text-right">
                    <GhostButton className="mr-2" onClick={() => setEditing(r)}>
                      Edit
                    </GhostButton>
                    <DangerButton onClick={() => remove(r._id)}>
                      Delete
                    </DangerButton>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2" colSpan={4}>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      No results
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows:</span>
          <SelectInput
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="flex items-center gap-2">
          <GhostButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </GhostButton>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <GhostButton
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </GhostButton>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Sort:</span>
          <SelectInput value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
            <option value="updatedAt">Updated</option>
          </SelectInput>
          <SelectInput value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </SelectInput>
        </div>
      </div>

      {creating && (
        <Modal title="New Category" onClose={() => setCreating(false)}>
          <CategoryForm
            initial={null}
            onSave={save}
            onCancel={() => setCreating(false)}
          />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Category" onClose={() => setEditing(null)}>
          <CategoryForm
            initial={editing}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
