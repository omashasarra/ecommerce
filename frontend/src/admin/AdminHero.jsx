import React from "react";
import api from "../shared/api";

/* ---------- UI helpers (dark-mode aware) ---------- */
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

function NumberInput(props) {
  return <TextInput type="number" {...props} />;
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500
                   dark:bg-slate-900 dark:border-slate-700"
      />
      <span className="text-sm text-gray-700 dark:text-slate-200">{label}</span>
    </label>
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
        aria-hidden="true"
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
        role="dialog"
        aria-modal="true"
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 font-medium text-gray-900 dark:text-slate-100">
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}
/* -------------------------------------------------- */

const API_BASE = import.meta.env.VITE_API_BASE || "";
const toAbsolute = (src) => (!src ? "" : src.startsWith("/") ? `${API_BASE}${src}` : src);

function HeroForm({ initial, onSave, onCancel }) {
  const [form, setForm] = React.useState(
    initial || {
      subtitle: "",
      title: "",
      title2: "",
      buttonLabel: "Shop Now",
      order: 0,
      isActive: true,
    }
  );

  // NEW: local file + preview (no URL field anymore)
  const [file, setFile] = React.useState(null);
  const [preview, setPreview] = React.useState(initial?.img ? toAbsolute(initial.img) : "");
  const [err, setErr] = React.useState("");

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onPick(e) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : initial?.img ? toAbsolute(initial.img) : "");
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const fd = new FormData();
      for (const [k, v] of Object.entries(form)) {
        if (v === null || v === undefined) continue;
        fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
      }
      if (file) fd.append("img", file); // field name must match backend uploader

      await onSave(fd);
    } catch (ex) {
      setErr(ex.message || "Save Failed");
    }
  }

  return (
    <form onSubmit={submit} className="p-4 text-gray-900 dark:text-slate-100">
      {err && <p className="text-red-600 dark:text-red-400 mb-2 text-sm">{err}</p>}

      <Field label="Subtitle">
        <TextInput
          value={form.subtitle}
          onChange={(e) => update("subtitle", e.target.value)}
          placeholder="Beats Solo"
        />
      </Field>

      <Field label="Title">
        <TextInput
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Wireless"
        />
      </Field>

      <Field label="Title 2">
        <TextInput
          value={form.title2}
          onChange={(e) => update("title2", e.target.value)}
          placeholder="Headphone"
        />
      </Field>

      <Field label="Button Label">
        <TextInput
          value={form.buttonLabel}
          onChange={(e) => update("buttonLabel", e.target.value)}
          placeholder="Shop Now"
        />
      </Field>

      {/* ✅ Image upload from desktop (replaces URL input) */}
      <Field label="Hero Image (upload from desktop)">
        <div className="space-y-2">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="h-28 w-auto rounded border border-gray-200 dark:border-slate-800"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : null}
          <input
            type="file"
            accept="image/*"
            onChange={onPick}
            className="w-full rounded border dark:bg-slate-900 dark:border-slate-800 px-3 py-2"
          />
          {!file && initial?.img && (
            <p className="text-xs text-gray-500 break-all">Stored: {initial.img}</p>
          )}
        </div>
      </Field>

      <Field label="Order">
        <NumberInput
          value={form.order}
          onChange={(e) => update("order", Number(e.target.value))}
        />
      </Field>

      <div className="mb-4">
        <Checkbox
          checked={form.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
          label="Active"
        />
      </div>

      <div className="flex gap-2">
        <GhostButton type="button" onClick={onCancel}>
          Cancel
        </GhostButton>
        <SoftButton type="submit">Save</SoftButton>
      </div>
    </form>
  );
}

export default function AdminHero() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [editing, setEditing] = React.useState(null);
  const [creating, setCreating] = React.useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await api("/api/hero/admin");
      setRows(res.rows);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function save(body /* FormData */) {
    if (editing) {
      const updated = await api(`/api/hero/admin/${editing._id}`, {
        method: "PUT",
        body,
      });
      setRows((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setEditing(null);
    } else {
      const created = await api("/api/hero/admin", {
        method: "POST",
        body,
      });
      setRows((prev) => [created, ...prev]);
      setCreating(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this slide?")) return;
    await api(`/api/hero/admin/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-4 text-gray-900 dark:text-slate-100">
      <h1 className="text-xl font-semibold mb-4">Hero Slides</h1>

      <SoftButton className="mb-3" onClick={() => setCreating(true)}>
        New Slide
      </SoftButton>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}

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
                <tr key={r._id} className="border-t border-gray-200 dark:border-slate-800">
                  <td className="p-2 align-middle">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {r.subtitle} • {r.title2} • {r.buttonLabel} •{" "}
                      <span
                        className={[
                          "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium",
                          r.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300",
                        ].join(" ")}
                        title={r.isActive ? "Active" : "Inactive"}
                      >
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 align-middle">
                    {r.img ? (
                      <img
                        src={toAbsolute(r.img)}
                        alt={r.title || "Hero image"}
                        className="h-12 w-auto rounded border border-gray-200 dark:border-slate-800"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-slate-500">No image</span>
                    )}
                  </td>
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
                  <td className="p-2" colSpan={4}>
                    <div className="text-sm text-gray-500 dark:text-slate-400">No slides</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* dialogs */}
      {creating && (
        <Modal title="New Slide" onClose={() => setCreating(false)}>
          <HeroForm initial={null} onSave={save} onCancel={() => setCreating(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Slide" onClose={() => setEditing(null)}>
          <HeroForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
