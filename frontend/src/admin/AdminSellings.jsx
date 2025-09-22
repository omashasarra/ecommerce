// client/src/admin/AdminServices.jsx
import React from "react";
import { adminApi as api } from "../../shared/api"; // ✅ use adminApi

function Input(p) {
  return <input {...p} className={"w-full rounded border px-3 py-2 " + (p.className || "")} />;
}
function Textarea(p) {
  return <textarea {...p} rows={5} className={"w-full rounded border px-3 py-2 " + (p.className || "")} />;
}
function Btn({ kind = "primary", className = "", ...p }) {
  const base = "px-3 py-2 rounded";
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "border border-gray-300 hover:bg-gray-50",
    danger: "border border-red-300 text-red-600 hover:bg-red-50",
  };
  return <button {...p} className={[base, styles[kind] || styles.primary, className].join(" ")} />;
}

export default function AdminServices() {
  const [rows, setRows] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [form, setForm] = React.useState(blank());

  function blank() {
    return {
      title: "",
      tagline: "",
      price: 0,
      unit: "one-time",
      cta: "Get started",
      popular: false,
      active: true,
      featuresText: "",
    };
  }

  async function load() {
    const r = await api("/api/services/admin");
    setRows(r.rows || []);
  }
  React.useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEdit(null);
    setForm(blank());
    setShowForm(true);
  }
  function openEdit(row) {
    setEdit(row);
    setForm({
      title: row.title || "",
      tagline: row.tagline || "",
      price: row.price || 0,
      unit: row.unit || "one-time",
      cta: row.cta || "Get started",
      popular: !!row.popular,
      active: !!row.active,
      featuresText: (row.features || []).join("\n"),
    });
    setShowForm(true);
  }

  async function save(e) {
    e.preventDefault();
    const payload = {
      title: form.title,
      tagline: form.tagline,
      price: Number(form.price),
      unit: form.unit,
      cta: form.cta,
      popular: form.popular,
      active: form.active,
      features: form.featuresText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
    };
    if (edit) {
      await api(`/api/services/admin/${edit._id}`, { method: "PUT", body: payload });
    } else {
      await api(`/api/services/admin`, { method: "POST", body: payload });
    }
    setShowForm(false);
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete?")) return;
    await api(`/api/services/admin/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Services</h1>
        <Btn onClick={openNew}>New</Btn>
      </div>

      <div className="rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Unit</th>
              <th className="p-2 text-left">Popular</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.tagline}</div>
                </td>
                <td className="p-2">${r.price}</td>
                <td className="p-2">{r.unit}</td>
                <td className="p-2">{r.popular ? "Yes" : "No"}</td>
                <td className="p-2 text-right">
                  <Btn kind="ghost" className="mr-2" onClick={() => openEdit(r)}>
                    Edit
                  </Btn>
                  <Btn kind="danger" onClick={() => remove(r._id)}>
                    Delete
                  </Btn>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={5}>
                  No services yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl rounded border bg-white p-4">
            <h2 className="text-lg font-semibold mb-3">{edit ? "Edit" : "New"} Service</h2>
            <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label>
                <span className="block text-sm mb-1">Title</span>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label>
                <span className="block text-sm mb-1">Tagline</span>
                <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              </label>
              <label>
                <span className="block text-sm mb-1">Price</span>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </label>
              <label>
                <span className="block text-sm mb-1">Unit</span>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="one-time / month"
                />
              </label>
              <label>
                <span className="block text-sm mb-1">CTA</span>
                <Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
              </label>
              <label className="flex items-center gap-2 mt-7">
                <input
                  type="checkbox"
                  checked={form.popular}
                  onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                />
                <span className="text-sm">Popular</span>
              </label>
              <label className="flex items-center gap-2 mt-7">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <span className="text-sm">Active</span>
              </label>
              <label className="md:col-span-2">
                <span className="block text-sm mb-1">Features (one per line)</span>
                <Textarea value={form.featuresText} onChange={(e) => setForm({ ...form, featuresText: e.target.value })} />
              </label>

              <div className="md:col-span-2 flex gap-2 pt-2">
                <Btn type="button" kind="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Btn>
                <Btn type="submit">Save</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
