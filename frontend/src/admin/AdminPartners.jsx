import React, { useEffect, useState } from "react";

export default function AdminPartners() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", image: "", order: 0, isActive: true });
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/partners/admin");
      if (!res.ok) throw new Error("Failed to fetch partners");
      const json = await res.json();
      setRows(json.rows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    const payload = { ...form, order: Number(form.order) || 0 };
    const url = editing ? `/api/partners/admin/${editing._id}` : "/api/partners/admin";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setOpen(false);
      setEditing(null);
      setForm({ name: "", image: "", order: 0, isActive: true });
      load();
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete partner?")) return;
    await fetch(`/api/partners/admin/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Partners</h1>
        <button
          onClick={() => {
            setForm({ name: "", image: "", order: 0, isActive: true });
            setEditing(null);
            setOpen(true);
          }}
          className="px-3 py-2 rounded bg-blue-600 text-white"
        >
          + New
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Logo</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Order</th>
              <th className="p-2 text-left">Active</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-2">
                  <img
                    src={`/brand/${p.image}`}
                    alt={p.name}
                    className="h-10 w-auto"
                  />
                </td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.order}</td>
                <td className="p-2">{p.isActive ? "✅" : "❌"}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setForm(p);
                      setOpen(true);
                    }}
                    className="px-2 py-1 border rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    className="px-2 py-1 border rounded text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-2 text-center">
                  No partners yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={save}
            className="bg-white rounded p-6 w-full max-w-md space-y-3"
          >
            <h2 className="text-lg font-semibold mb-2">
              {editing ? "Edit Partner" : "New Partner"}
            </h2>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 w-full"
              required
            />
            <input
              placeholder="Image filename (e.g. br-1.png)"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="border p-2 w-full"
              required
            />
            <input
              type="number"
              placeholder="Order"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              className="border p-2 w-full"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
