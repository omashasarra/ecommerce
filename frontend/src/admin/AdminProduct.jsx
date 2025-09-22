// client/src/admin/AdminProduct.jsx
import React from "react";
import { adminApi as api } from "../shared/api"; // ✅ use adminApi

// ---------- Module constants (stable across renders) ----------
const EMPTY_PRODUCT = {
  title: "",
  imageURL: "",
  price: 0,
  currency: "USD",
  stock: 0,
  sku: "",
  isActive: true,
  order: 0,
  description: "",
  tagsText: "", // UI-only; converted to tags[] on submit
};

// ---------- Small UI primitives ----------
function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
    </label>
  );
}

// --- Safe inputs: never switch to uncontrolled ---
function TextInput({ value, className = "", ...rest }) {
  return (
    <input
      {...rest}
      value={value ?? ""}
      className={[
        "w-full rounded px-3 py-2",
        "border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
        "bg-white text-gray-900 placeholder-gray-400",
        className,
      ].join(" ")}
    />
  );
}

function TextArea({ value, className = "", ...rest }) {
  return (
    <textarea
      {...rest}
      value={value ?? ""}
      className={[
        "w-full rounded px-3 py-2",
        "border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
        "bg-white text-gray-900 placeholder-gray-400",
        className,
      ].join(" ")}
    />
  );
}

function SelectInput({ value, className = "", ...rest }) {
  return (
    <select
      {...rest}
      value={value ?? ""}
      className={[
        "rounded px-2 py-1",
        "border border-gray-300 bg-white text-gray-900",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        className,
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
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={["rounded border bg-white border-gray-200", className].join(" ")}>{children}</div>;
}

function Modal({ title, children, onClose, width = "w-[900px]" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className={["relative rounded shadow-lg max-w-[95vw]", width, "border bg-white border-gray-200"].join(" ")}>
        <div className="px-4 py-3 border-b border-gray-200 font-medium">{title}</div>
        {children}
      </div>
    </div>
  );
}

// ---------- Product Form ----------
function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = React.useState({ ...EMPTY_PRODUCT, ...(initial || {}) });
  const [err, setErr] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (!initial) return;
    setForm({
      ...EMPTY_PRODUCT,
      ...initial,
      tagsText: Array.isArray(initial.tags) ? initial.tags.join("\n") : (initial.tagsText ?? ""),
    });
  }, [initial]);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("image", file);

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("token");

    const res = await fetch("/api/products/admin/upload", {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd,
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setForm((f) => ({ ...f, imageURL: data.url }));
  }

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await uploadImage(file);
    } catch (ex) {
      setErr(ex.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const payload = {
        ...form,
        price: Number(form.price ?? 0),
        stock: Number(form.stock ?? 0),
        order: Number(form.order ?? 0),
        tags: String(form.tagsText || "")
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean),
      };
      delete payload.tagsText;
      await onSave(payload);
    } catch (ex) {
      setErr(ex.message || "Save failed");
    }
  }

  return (
    <form onSubmit={submit} className="p-4">
      {err && <p className="text-red-600 mb-2 text-sm">{err}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Title">
          <TextInput value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Boat Headphone" />
        </Field>

        <Field label="Image URL">
          <TextInput
            value={form.imageURL}
            onChange={(e) => update("imageURL", e.target.value)}
            placeholder="/product/p-1.jpg"
          />
        </Field>

        <Field label="Upload Image (optional)">
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={onPickFile} />
            {uploading ? <span className="text-xs text-gray-500">Uploading…</span> : null}
          </div>
          <div className="text-xs text-gray-500 mt-1">If you upload, the Image URL will be filled automatically.</div>
          {form.imageURL ? (
            <img
              src={form.imageURL}
              alt=""
              className="mt-2 h-20 w-28 object-cover rounded border border-gray-200"
            />
          ) : null}
        </Field>

        <Field label="Price">
          <TextInput type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} />
        </Field>

        <Field label="Currency">
          <TextInput value={form.currency} onChange={(e) => update("currency", e.target.value)} />
        </Field>

        <Field label="Stock">
          <TextInput type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
        </Field>

        <Field label="SKU">
          <TextInput value={form.sku} onChange={(e) => update("sku", e.target.value)} />
        </Field>

        <Field label="Order">
          <TextInput type="number" value={form.order} onChange={(e) => update("order", e.target.value)} />
        </Field>
      </div>

      <Field label="Description">
        <TextArea
          rows={4}
          value={form.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Short description…"
        />
      </Field>

      <Field label="Tags (one per line)">
        <TextArea
          rows={3}
          value={form.tagsText ?? ""}
          onChange={(e) => update("tagsText", e.target.value)}
          placeholder={"audio\nwireless\nsale"}
        />
      </Field>

      <div className="flex items-center gap-6 mt-1">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={!!form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
          />
          <span className="text-sm">Active</span>
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <GhostButton type="button" onClick={onCancel}>
          Cancel
        </GhostButton>
        <SoftButton type="submit">Save</SoftButton>
      </div>
    </form>
  );
}

// ---------- Admin Page ----------
export default function AdminProduct() {
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
      const query = new URLSearchParams({ page, pageSize, search, sortBy, sortDir });
      const res = await api(`/api/products/admin?${query}`);
      setRows(res.rows || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, sortBy, sortDir]);

  async function save(form) {
    if (editing) {
      const updated = await api(`/api/products/admin/${editing._id}`, {
        method: "PUT",
        body: form,
      });
      setRows((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setEditing(null);
    } else {
      const created = await api("/api/products/admin", {
        method: "POST",
        body: form,
      });
      setRows((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      setCreating(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    await api(`/api/products/admin/${id}`, { method: "DELETE" });
    await load();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Products</h1>

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

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {loading ? (
        <Card className="p-4 text-sm">Loading…</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Stock</th>
                <th className="p-2 text-left">Updated</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-gray-2">
                  <td className="p-2 align-middle">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500">SKU {r.sku || "—"} {r.isActive ? "" : " • inactive"}</div>
                    {r.imageURL ? <img src={r.imageURL} alt="" className="mt-1 h-12 w-16 object-cover rounded" /> : null}
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    {typeof r.price === "number"
                      ? r.price.toLocaleString(undefined, { style: "currency", currency: r.currency || "USD" })
                      : r.price}
                  </td>
                  <td className="p-2 align-middle whitespace-nowrap">{r.stock ?? "-"}</td>
                  <td className="p-2 align-middle whitespace-nowrap">
                    {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-2 align-middle text-right">
                    <GhostButton className="mr-2" onClick={() => setEditing(r)}>
                      Edit
                    </GhostButton>
                    <DangerButton onClick={() => remove(r._id)}>Delete</DangerButton>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2" colSpan={5}>
                    <div className="text-sm text-gray-500">No results</div>
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
          <GhostButton disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </GhostButton>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Sort:</span>
          <SelectInput value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
            <option value="updatedAt">Updated</option>
            <option value="price">Price</option>
            <option value="order">Order</option>
            <option value="stock">Stock</option>
          </SelectInput>
          <SelectInput value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </SelectInput>
        </div>
      </div>

      {creating && (
        <Modal title="New Product" onClose={() => setCreating(false)}>
          <ProductForm initial={null} onSave={save} onCancel={() => setCreating(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Product" onClose={() => setEditing(null)}>
          <ProductForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
