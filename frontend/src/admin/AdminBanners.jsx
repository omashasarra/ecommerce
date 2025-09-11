// src/pages/AdminBanners.jsx
import React, { useEffect, useState } from "react";
import Banner from "../components/Banner/Banner";

const empty = {
  position: "",
  discount: "",
  title: "",
  date: "",
  image: "",   // filename only, e.g. "headphone.png"
  title2: "",
  title3: "",
  title4: "",
  bgColor: "#000000",
  isActive: true,
  order: 0,
};

export default function AdminBanners() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // row obj
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/banners/admin");
      const json = await res.json();
      setRows(json.rows || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm({ ...empty });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row) {
    setForm({ ...row });
    setEditing(row);
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    const payload = { ...form, order: Number(form.order) || 0 };
    const url = editing ? `/api/banners/admin/${editing._id}` : "/api/banners/admin";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setOpen(false);
      setEditing(null);
      await load();
    } else {
      const err = await res.json().catch(()=>({}));
      alert(err?.error?.message || "Save failed");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete banner?")) return;
    await fetch(`/api/banners/admin/${id}`, { method: "DELETE" });
    load();
  }

  // live preview data (uses your Banner component)
  const preview = {
    discount: form.discount,
    title: form.title,
    date: form.date,
    // preview uses public path to /banner/<filename>
    image: form.image ? `/banner/${form.image}` : "",
    title2: form.title2,
    title3: form.title3,
    title4: form.title4,
    bgColor: form.bgColor || "#000000",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Banners</h1>
        <button onClick={openCreate} className="px-3 py-2 rounded bg-blue-600 text-white">
          + New Banner
        </button>
      </div>

      {loading && <div>Loading…</div>}

      {!loading && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Order</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r._id} className="border-t">
                  <td className="p-2">{r.position}</td>
                  <td className="p-2">{r.title}</td>
                  <td className="p-2">{r.image}</td>
                  <td className="p-2">{r.order}</td>
                  <td className="p-2">{r.isActive ? "✅" : "❌"}</td>
                  <td className="p-2 text-right">
                    <button className="px-2 py-1 border rounded mr-2" onClick={() => openEdit(r)}>
                      Edit
                    </button>
                    <button className="px-2 py-1 border rounded text-red-600" onClick={() => remove(r._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-2 text-center" colSpan={6}>No banners</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white rounded p-5 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{editing ? "Edit Banner" : "New Banner"}</h2>

              <label className="block text-sm">Position (e.g. home-1 / home-2)</label>
              <input required className="border p-2 w-full"
                value={form.position}
                onChange={e => setForm({ ...form, position: e.target.value })}
              />

              <label className="block text-sm">Discount</label>
              <input className="border p-2 w-full"
                value={form.discount}
                onChange={e => setForm({ ...form, discount: e.target.value })}
              />

              <label className="block text-sm">Title</label>
              <input className="border p-2 w-full"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />

              <label className="block text-sm">Date</label>
              <input className="border p-2 w-full"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />

              <label className="block text-sm">Image filename (in /public/banner)</label>
              <input className="border p-2 w-full" placeholder="headphone.png"
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
              />

              <label className="block text-sm">Title 2</label>
              <input className="border p-2 w-full"
                value={form.title2}
                onChange={e => setForm({ ...form, title2: e.target.value })}
              />

              <label className="block text-sm">Title 3</label>
              <input className="border p-2 w-full"
                value={form.title3}
                onChange={e => setForm({ ...form, title3: e.target.value })}
              />

              <label className="block text-sm">Title 4</label>
              <textarea className="border p-2 w-full"
                value={form.title4}
                onChange={e => setForm({ ...form, title4: e.target.value })}
              />

              <label className="block text-sm">Background Color (hex)</label>
              <input className="border p-2 w-full" placeholder="#f42c37"
                value={form.bgColor}
                onChange={e => setForm({ ...form, bgColor: e.target.value })}
              />

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                />
                <label htmlFor="isActive">Active</label>
              </div>

              <label className="block text-sm">Order</label>
              <input type="number" className="border p-2 w-full"
                value={form.order}
                onChange={e => setForm({ ...form, order: e.target.value })}
              />

              <div className="flex gap-2 pt-2">
                <button type="button" className="px-3 py-1 border rounded" onClick={() => setOpen(false)}>Close</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
              </div>
            </div>

            {/* Live preview using your exact Banner design */}
            <div className="max-h-[80vh] overflow-auto rounded-lg border">
              <Banner data={preview} />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
