import React from "react";

const empty = {
  name: "",
  order: 0,
  isActive: true,
  image: "",
};

export default function AdminPartners() {
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ ...empty });
  const [file, setFile] = React.useState(null);

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    const r = await fetch("/api/partners/admin");
    const d = await r.json();
    console.log("[AdminPartners] API rows:", d.rows);
    setRows(d.rows || []);
  }

  function openCreate() {
    setForm({ ...empty });
    setFile(null);
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    console.log("[AdminPartners] Editing row:", row);
    setForm({
      _id: row._id,
      name: row.name || "",
      order: Number(row.order) || 0,
      isActive: !!row.isActive,
      image: row.image || "",
    });
    setFile(null);
    setEditing(row);
    setOpen(true);
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? !!checked : value }));
  }

  const filenameOnly = (p) => (!p ? "" : p.includes("/") ? p.split("/").pop() : p);

  // Mirror Banner’s resolve logic but for /brand
  const resolveImage = (image) => {
    if (!image) return "";
    if (image.startsWith("blob:")) return image;              // local preview
    if (/^https?:\/\//i.test(image)) return image;            // absolute url
    if (image.startsWith("/brand/")) return image;            // already normalized
    if (image.includes("/")) return `/brand/${filenameOnly(image)}`; // clean mixed paths
    return `/brand/${image}`;                                 // plain filename
  };

  async function save(e) {
    e.preventDefault();

    const fd = new FormData();

    // Align with your banner save logic
    const out = {
      ...form,
      order: Number(form.order) || 0,
    };

    Object.entries(out).forEach(([k, v]) => {
      if (k === "image" && file) return;          // when uploading, don't send string
      if (k === "image" && !file) v = filenameOnly(v); // send filename if present
      if (v === undefined || v === null) v = "";
      fd.append(k, v);
    });

    if (file) fd.append("image", file); // MUST match uploadBrand.single("image")

    const url = editing ? `/api/partners/admin/${editing._id}` : "/api/partners/admin";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, { method, body: fd });
    if (res.ok) {
      setOpen(false);
      setEditing(null);
      setFile(null);
      await load();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Save failed");
    }
  }

  async function remove(row) {
    if (!confirm("Delete this partner?")) return;
    const res = await fetch(`/api/partners/admin/${row._id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  // Live preview (same idea as Banner)
  const preview = {
    name: form.name,
    image: file ? URL.createObjectURL(file) : resolveImage(form.image),
    isActive: form.isActive,
    order: Number(form.order) || 0,
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin Partners</h1>
        <button onClick={openCreate} className="rounded bg-blue-600 text-white px-4 py-2">
          New Partner
        </button>
      </div>

      <div className="grid gap-3">
        {rows.map((row) => (
          <div key={row._id} className="border rounded p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {row.image ? (
                <img
                  src={resolveImage(row.image)}
                  alt={row.name || ""}
                  className="w-16 h-16 object-contain rounded"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded" />
              )}
              <div>
                <div className="font-medium">{row.name || "(no name)"}</div>
                <div className="text-xs text-gray-500">order: {row.order ?? 0}</div>
                <div className="text-xs">{row.isActive ? "Active" : "Inactive"}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(row)} className="rounded bg-gray-100 px-3 py-1">
                Edit
              </button>
              <button onClick={() => remove(row)} className="rounded bg-red-600 text-white px-3 py-1">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={save}
            className="bg-white rounded p-5 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm">Name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="border p-2 w-full"
                  required
                />
              </label>

              {/* Image uploader (mirrors Banner) */}
              <label className="block">
                <span className="text-sm">Logo (uploads to /public/brand)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="border p-2 w-full"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {form.image && !file && (
                  <div className="text-xs text-gray-600 mt-1">Current: {filenameOnly(form.image)}</div>
                )}
              </label>

              <label className="block">
                <span className="text-sm">Order</span>
                <input
                  name="order"
                  type="number"
                  value={form.order}
                  onChange={onChange}
                  className="border p-2 w-full"
                />
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={!!form.isActive}
                  onChange={onChange}
                />
                <span className="text-sm">Active</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="rounded bg-blue-600 text-white px-4 py-2">
                  Save
                </button>
                <button type="button" onClick={() => setOpen(false)} className="rounded bg-gray-100 px-4 py-2">
                  Cancel
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="max-h-[80vh] overflow-auto rounded-lg border p-4 flex items-center justify-center">
              {preview.image ? (
                <img
                  src={preview.image}
                  alt="preview"
                  className="max-h-64 object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-64 h-40 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                  No preview
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
