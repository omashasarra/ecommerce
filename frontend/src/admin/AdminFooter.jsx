// src/pages/admin/AdminFooter.jsx
import React from "react";
import { adminApi as api } from "../shared/api"; 

function Field({ label, children, hint }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block mt-1 text-xs text-gray-500 dark:text-slate-400">{hint}</span>
      )}
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

function TextArea(props) {
  return (
    <textarea
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

function Modal({ title, children, onClose, width = "w-[720px]" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
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

// ---------- LINK EDITOR ----------
function LinkRow({ value, onChange, onRemove }) {
  return (
    <div className="grid md:grid-cols-12 gap-2 items-center">
      <TextInput
        className="md:col-span-4"
        placeholder="Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />
      <TextInput
        className="md:col-span-6"
        placeholder="Link (e.g. /#about)"
        value={value.link}
        onChange={(e) => onChange({ ...value, link: e.target.value })}
      />
      <TextInput
        type="number"
        className="md:col-span-1"
        placeholder="Order"
        value={value.order ?? 0}
        onChange={(e) => onChange({ ...value, order: Number(e.target.value || 0) })}
      />
      <DangerButton className="md:col-span-1" onClick={onRemove}>
        Remove
      </DangerButton>
    </div>
  );
}

// ---------- PAGE ----------
const emptyLink = () => ({ title: "", link: "", order: 0 });

export default function AdminFooter() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [form, setForm] = React.useState({
    _id: undefined,
    companyName: "Eshop",
    aboutText: "",
    madeBy: "Made by Sara",
    address: "Nabatieh, Hasbaya",
    phone: "+ 961 123 456",
    socials: { instagram: "", facebook: "", linkedin: "" },
    importantLinks: [emptyLink()],
    quickLinks: [emptyLink()],
    isActive: true,
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const doc = await api("/api/footer/admin");
      if (doc) {
        setForm({
          _id: doc._id,
          companyName: doc.companyName ?? "Eshop",
          aboutText: doc.aboutText ?? "",
          madeBy: doc.madeBy ?? "Made by Sara",
          address: doc.address ?? "",
          phone: doc.phone ?? "",
          socials: doc.socials ?? { instagram: "", facebook: "", linkedin: "" },
          importantLinks: doc.importantLinks?.length ? doc.importantLinks : [emptyLink()],
          quickLinks: doc.quickLinks?.length ? doc.quickLinks : [emptyLink()],
          isActive: !!doc.isActive,
        });
      }
    } catch (e) {
      setError(e.message || "Failed to load footer");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setSocial = (k, v) =>
    setForm((p) => ({ ...p, socials: { ...p.socials, [k]: v } }));

  const updateLink = (which, idx, val) =>
    setForm((p) => {
      const copy = p[which].slice();
      copy[idx] = val;
      return { ...p, [which]: copy };
    });

  const addLink = (which) => setForm((p) => ({ ...p, [which]: [...p[which], emptyLink()] }));
  const removeLink = (which, idx) =>
    setForm((p) => {
      const copy = p[which].slice();
      copy.splice(idx, 1);
      return { ...p, [which]: copy.length ? copy : [emptyLink()] };
    });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const clean = (arr) =>
        (arr || [])
          .filter((x) => (x.title || "").trim() || (x.link || "").trim())
          .map((x) => ({ ...x, order: Number(x.order || 0) }));

      const payload = {
        _id: form._id,
        companyName: (form.companyName || "Eshop").trim(),
        aboutText: form.aboutText || "",
        madeBy: form.madeBy || "",
        address: form.address || "",
        phone: form.phone || "",
        socials: {
          instagram: form.socials?.instagram || "",
          facebook: form.socials?.facebook || "",
          linkedin: form.socials?.linkedin || "",
        },
        importantLinks: clean(form.importantLinks),
        quickLinks: clean(form.quickLinks),
        isActive: !!form.isActive,
      };

      const updated = await api("/api/footer/admin", {
        method: "PUT",
        body: payload,
      });
      setForm((p) => ({ ...p, _id: updated._id }));
    } catch (e) {
      setError(e.message || "Save failed");
      return;
    } finally {
      setSaving(false);
    }
    alert("Saved");
  };

  return (
    <div className="p-4 text-gray-900 dark:text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Footer</h1>
        <div className="flex gap-2">
          <GhostButton onClick={load}>{loading ? "Loading…" : "Refresh"}</GhostButton>
          <SoftButton form="footer-form" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </SoftButton>
        </div>
      </div>

      {error && (
        <Card className="p-3 mb-3">
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        </Card>
      )}

      <form id="footer-form" onSubmit={submit}>
        {/* Company */}
        <Card className="p-4 mb-4">
          <div className="font-medium mb-3">Company</div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Company Name">
              <TextInput
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder="Eshop"
              />
            </Field>
            <Field label="Made By">
              <TextInput
                value={form.madeBy}
                onChange={(e) => set("madeBy", e.target.value)}
                placeholder="Made by Sara"
              />
            </Field>
            <Field label="About Text" hint="Short description shown under the brand name.">
              <TextArea
                rows={3}
                value={form.aboutText}
                onChange={(e) => set("aboutText", e.target.value)}
                placeholder="About the company…"
              />
            </Field>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-4 mb-4">
          <div className="font-medium mb-3">Contact</div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Address">
              <TextInput
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Nabatieh, Hasbaya"
              />
            </Field>
            <Field label="Phone">
              <TextInput
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+ 961 123 456"
              />
            </Field>
          </div>
        </Card>

        {/* Socials */}
        <Card className="p-4 mb-4">
          <div className="font-medium mb-3">Socials</div>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Instagram URL">
              <TextInput
                value={form.socials.instagram}
                onChange={(e) => setSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/…"
              />
            </Field>
            <Field label="Facebook URL">
              <TextInput
                value={form.socials.facebook}
                onChange={(e) => setSocial("facebook", e.target.value)}
                placeholder="https://facebook.com/…"
              />
            </Field>
            <Field label="LinkedIn URL">
              <TextInput
                value={form.socials.linkedin}
                onChange={(e) => setSocial("linkedin", e.target.value)}
                placeholder="https://linkedin.com/…"
              />
            </Field>
          </div>
        </Card>

        {/* Important Links */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Important Links</div>
            <GhostButton onClick={() => addLink("importantLinks")}>Add Link</GhostButton>
          </div>
          <div className="space-y-2">
            {form.importantLinks.map((lnk, i) => (
              <LinkRow
                key={`imp-${i}`}
                value={lnk}
                onChange={(val) => updateLink("importantLinks", i, val)}
                onRemove={() => removeLink("importantLinks", i)}
              />
            ))}
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Quick Links</div>
            <GhostButton onClick={() => addLink("quickLinks")}>Add Link</GhostButton>
          </div>
          <div className="space-y-2">
            {form.quickLinks.map((lnk, i) => (
              <LinkRow
                key={`quick-${i}`}
                value={lnk}
                onChange={(val) => updateLink("quickLinks", i, val)}
                onRemove={() => removeLink("quickLinks", i)}
              />
            ))}
          </div>
        </Card>

        {/* Flags */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
        </Card>

        <div className="flex items-center gap-2">
          <GhostButton type="button" onClick={load}>
            Reload
          </GhostButton>
          <SoftButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </SoftButton>
        </div>
      </form>
    </div>
  );
}
