import React from 'react';
import { api } from '../shared/api';

// Minimal field presets per type. Adjust/extend anytime.
const PRESETS = {
  Banner: ['key','title','image','order','isActive'],
  Blog: ['key','title','content','order','isActive'],
  Category: ['key','title','image','order','isActive'],
  Footer: ['key','content','order','isActive'],
  Hero: ['key','title','image','content','order','isActive'],
  Partners: ['key','image','order','isActive'],
  Products: ['key','content','order','isActive'],
  Services: ['key','title','content','order','isActive'],
};

function Field({ label, value, onChange, type='text' }){
  const isBool = type==='checkbox';
  return (
    <label style={{ display:'grid', gap:6 }}>
      <span style={{ fontSize:12, color:'#666' }}>{label}</span>
      {isBool ? (
        <input type="checkbox" checked={!!value} onChange={e=>onChange(e.target.checked)} />
      ) : (
        <input type={type} value={value ?? ''} onChange={e=>onChange(e.target.value)} />
      )}
    </label>
  );
}

export default function BlockEditor({ type, item, onClose, onSaved }){
  const isNew = !item;
  const [form, setForm] = React.useState(() => item || { key:'', title:'', image:'', content:{}, order:0, isActive:true });
  const [json, setJson] = React.useState(() => JSON.stringify(form.content || {}, null, 2));
  const fields = PRESETS[type] || ['key','title','image','content','order','isActive'];

  async function submit(e){
    e.preventDefault();
    let payload = { ...form };
    try { payload.content = JSON.parse(json || '{}'); } catch { alert('Content JSON is invalid'); return; }

    if (isNew) await api(`/blocks/${type}`, { method:'POST', body: JSON.stringify(payload) });
    else await api(`/blocks/${item._id}`, { method:'PUT', body: JSON.stringify(payload) });

    onSaved?.();
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'grid', placeItems:'center', zIndex:50 }}>
      <div style={{ width:720, maxWidth:'95vw', background:'#fff', borderRadius:12, padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <h3 style={{ margin:0 }}>{isNew ? `Add ${type}` : `Edit ${type}`}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {fields.includes('key') && (
            <Field label="Key" value={form.key} onChange={(v)=>setForm(f=>({ ...f, key:v }))} />
          )}
          {fields.includes('title') && (
            <Field label="Title" value={form.title} onChange={(v)=>setForm(f=>({ ...f, title:v }))} />
          )}
          {fields.includes('image') && (
            <Field label="Image URL" value={form.image} onChange={(v)=>setForm(f=>({ ...f, image:v }))} />
          )}
          {fields.includes('order') && (
            <Field label="Order" type="number" value={form.order} onChange={(v)=>setForm(f=>({ ...f, order:Number(v)||0 }))} />
          )}
          {fields.includes('isActive') && (
            <Field label="Active" type="checkbox" value={form.isActive} onChange={(v)=>setForm(f=>({ ...f, isActive:!!v }))} />
          )}

          {fields.includes('content') && (
            <label style={{ gridColumn:'1 / -1', display:'grid', gap:6 }}>
              <span style={{ fontSize:12, color:'#666' }}>Content (JSON)</span>
              <textarea rows={12} value={json} onChange={e=>setJson(e.target.value)} style={{ fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} />
            </label>
          )}

          <div style={{ gridColumn:'1 / -1', display:'flex', justifyContent:'flex-end', gap:8 }}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}