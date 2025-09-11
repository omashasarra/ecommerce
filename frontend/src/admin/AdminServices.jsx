import React from "react";
import { api } from "../shared/api";
import { auth } from "../shared/auth";
import { useNavigate } from "react-router-dom";

const ICON_OPTIONS = [
  { value: "car",        label: "Car (Free Shipping)" },
  { value: "check",      label: "Check (Safe Money)" },
  { value: "wallet",     label: "Wallet (Secure Payment)" },
  { value: "headphones", label: "Headphones (Support)" },
];

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function AdminServices() {
  const nav = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [editing, setEditing] = React.useState(null);
  const [creating, setCreating] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  React.useEffect(() => {
    if (!auth.isAuthed() || !auth.isAdmin()) nav("/login", { replace: true });
    // eslint-disable-next-line
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await api("/api/services/admin");
      setRows(res?.rows || res?.data || []);
    } catch (e) {
      if (e.status === 401) nav("/login");
      setError(e?.data?.error || e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  // CREATE
  async function onCreate(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title")?.trim(),
      description: form.get("description")?.trim(),
      iconKey: form.get("iconKey"),
      order: Number(form.get("order") || 0),
      isActive: form.get("isActive") === "1",
    };
    try {
      await api("/api/services/admin", { method: "POST", body: payload });
      setCreating(false);
      await load();
    } catch (e) {
      alert(e?.data?.error || e.message || "Create failed");
    }
  }

  // UPDATE
  async function onSaveEdit(e) {
    e.preventDefault();
    const {_id, ...payload} = editing;
    try {
      await api(`/api/services/admin/${_id}`, { method: "PUT", body: payload });
      setEditing(null);
      await load();
    } catch (e) {
      alert(e?.data?.error || e.message || "Update failed");
    }
  }

  // DELETE
  async function onConfirmDelete() {
    try {
      await api(`/api/services/admin/${confirmDelete._id}`, { method: "DELETE" });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      alert(e?.data?.error || e.message || "Delete failed");
    }
  }

  return (
    <div className="p-2 sm:p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Service Features</h2>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            Refresh
          </button>
          <button
            onClick={() => setCreating(true)}
            className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            New
          </button>
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto border rounded-lg dark:border-slate-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60">
              <tr className="text-left">
                <th className="px-3 py-2 border-b dark:border-slate-700">Title</th>
                <th className="px-3 py-2 border-b dark:border-slate-700">Icon</th>
                <th className="px-3 py-2 border-b dark:border-slate-700">Order</th>
                <th className="px-3 py-2 border-b dark:border-slate-700">Active</th>
                <th className="px-3 py-2 border-b dark:border-slate-700"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2 border-b dark:border-slate-800">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{r.description}</div>
                  </td>
                  <td className="px-3 py-2 border-b dark:border-slate-800">{r.iconKey}</td>
                  <td className="px-3 py-2 border-b dark:border-slate-800">{r.order ?? 0}</td>
                  <td className="px-3 py-2 border-b dark:border-slate-800">{r.isActive ? "Yes" : "No"}</td>
                  <td className="px-3 py-2 border-b dark:border-slate-800">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(r)}
                        className="px-2 py-1 rounded border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(r)}
                        className="px-2 py-1 rounded border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">No items</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-3 z-50">
          <form onSubmit={onCreate} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-3">New Service Feature</h3>
            <Field label="Title"><input name="title" required className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700" /></Field>
            <Field label="Description"><input name="description" className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700" /></Field>
            <Field label="Icon">
              <select name="iconKey" required className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700">
                {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Order"><input name="order" type="number" defaultValue={0} className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700" /></Field>
            <Field label="Active">
              <select name="isActive" defaultValue="1" className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700">
                <option value="1">Yes</option><option value="0">No</option>
              </select>
            </Field>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className="px-3 py-2 rounded border bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700">Cancel</button>
              <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-3 z-50">
          <form onSubmit={onSaveEdit} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-3">Edit Service Feature</h3>
            <Field label="Title">
              <input className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                     value={editing.title || ""} onChange={e=>setEditing({...editing, title:e.target.value})} required />
            </Field>
            <Field label="Description">
              <input className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                     value={editing.description || ""} onChange={e=>setEditing({...editing, description:e.target.value})} />
            </Field>
            <Field label="Icon">
              <select className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                      value={editing.iconKey || "check"} onChange={e=>setEditing({...editing, iconKey:e.target.value})}>
                {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Order">
              <input type="number" className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                     value={editing.order ?? 0} onChange={e=>setEditing({...editing, order:Number(e.target.value||0)})} />
            </Field>
            <Field label="Active">
              <select className="w-full px-3 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"
                      value={editing.isActive ? "1":"0"} onChange={e=>setEditing({...editing, isActive:e.target.value==="1"})}>
                <option value="1">Yes</option><option value="0">No</option>
              </select>
            </Field>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={()=>setEditing(null)} className="px-3 py-2 rounded border bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700">Cancel</button>
              <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-3 z-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete feature?</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300">This will permanently delete: <b>{confirmDelete.title}</b></p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setConfirmDelete(null)} className="px-3 py-2 rounded border bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700">Cancel</button>
              <button onClick={onConfirmDelete} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
