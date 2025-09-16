import React from "react";
import Banner from "../components/Banner/Banner.jsx";

const empty = {
  discount: "",
  title: "",
  date: "",
  image: "",        
  title2: "",
  title3: "",
  title4: "",
  bgColor: "#000000",
  active: true,
  order: 0,
};

export default function AdminBanners() {
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ ...empty });
  const [file, setFile] = React.useState(null);

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    const r = await fetch("/api/banners/admin");
    const d = await r.json();
    setRows(d.rows || []);
  }

  function openCreate() {
    setForm({ ...empty });
    setFile(null);
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    setForm({ ...row });
    setFile(null);
    setEditing(row);
    setOpen(true);
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? !!checked : value }));
  }

  const filenameOnly = (p) => (!p ? "" : p.includes("/") ? p.split("/").pop() : p);

  const resolveImage = (image) => {
    if (!image) return "";
    if (image.startsWith("blob:")) return image;              
    if (/^https?:\/\//i.test(image)) return image;            
    if (image.startsWith("/banner/")) return image;           
    if (image.includes("/")) return `/banner/${filenameOnly(image)}`; 
    return `/banner/${image}`;                                
  };

  async function save(e) {
    e.preventDefault();

    const fd = new FormData();

    Object.entries({ ...form, order: Number(form.order) || 0 }).forEach(([k, v]) => {
      if (k === "image" && file) return;           
      if (k === "image" && !file) v = filenameOnly(v); 
      if (v === undefined || v === null) v = "";
      fd.append(k, v);
    });

    if (file) fd.append("image", file);

    const url = editing ? `/api/banners/admin/${editing._id}` : "/api/banners/admin";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, { method, body: fd });
    if (res.ok) {
      setOpen(false);
      setEditing(null);
      setFile(null);
      await load();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error?.message || "Save failed");
    }
  }

  async function remove(row) {
    if (!confirm("Delete this banner?")) return;
    const res = await fetch(`/api/banners/admin/${row._id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  const preview = {
    discount: form.discount,
    title: form.title,
    date: form.date,
    image: file ? URL.createObjectURL(file) : resolveImage(form.image),
    title2: form.title2,
    title3: form.title3,
    title4: form.title4,
    bgColor: form.bgColor || "#000000",
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin Banners</h1>
        <button
          onClick={openCreate}
          className="rounded bg-blue-600 text-white px-4 py-2"
        >
          New Banner
        </button>
      </div>

      <div className="grid gap-3">
        {rows.map((row) => (
          <div key={row._id} className="border rounded p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {row.image ? (
                <img
                  src={resolveImage(row.image)}
                  alt=""
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded" />
              )}
              <div>
                <div className="font-medium">{row.title || "(no title)"}</div>
                <div className="text-xs text-gray-500">order: {row.order ?? 0}</div>
                <div className="text-xs">{row.active ? "Active" : "Inactive"}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(row)}
                className="rounded bg-gray-100 px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => remove(row)}
                className="rounded bg-red-600 text-white px-3 py-1"
              >
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
                <span className="text-sm">Discount</span>
                <input
                  name="discount"
                  value={form.discount}
                  onChange={onChange}
                  className="border p-2 w-full"
                />
              </label>

              <label className="block">
                <span className="text-sm">Title</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  className="border p-2 w-full"
                />
              </label>

              <label className="block">
                <span className="text-sm">Date</span>
                <input
                  name="date"
                  value={form.date}
                  onChange={onChange}
                  className="border p-2 w-full"
                />
              </label>

              {/* Image uploader */}
              <label className="block">
                <span className="text-sm">Banner Image (uploads to /public/banner)</span>
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
                <span className="text-sm">Title 2</span>
                <input
                  name="title2"
                  value={form.title2}
                  onChange={onChange}
                  className="border p-2 w-full"
                />
              </label>

              <label className="block">
                <span className="text-sm">Title 3</span>
                <input
                  name="title3"
                  value={form.title3}
                  onChange={onChange}
                  className="border p-2 w-full"
                />
              </label>

              <label className="block">
                <span className="text-sm">Title 4</span>
                <input
                  name="title4"
                  value={form.title4}
                  onChange={onChange}
                  className="border p-2 w-full"
                />
              </label>

              <label className="block">
                <span className="text-sm">Background Color</span>
                <input
                  type="color"
                  name="bgColor"
                  value={form.bgColor}
                  onChange={onChange}
                  className="border p-2 w-full h-10"
                />
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={!!form.active}
                  onChange={onChange}
                />
                <span className="text-sm">Active</span>
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

              <div className="flex gap-2 pt-2">
                <button type="submit" className="rounded bg-blue-600 text-white px-4 py-2">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded bg-gray-100 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="max-h-[80vh] overflow-auto rounded-lg border">
              <Banner data={preview} />
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
