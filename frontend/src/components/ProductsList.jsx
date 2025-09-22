import { useEffect, useState } from 'react';
import { api } from '../shared/api';
import { adminAuth as auth } from "../shared/adminAuth.js";

export default function ProductsList() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title:'', price:'', image:'' });

  async function load(){ setItems(await api('/products')); }
  useEffect(()=>{ load(); }, []);

  function startEdit(p){
    setEditing(p._id);
    setForm({ title:p.title, price:p.price, image:p.image || '' });
  }

  async function saveEdit(){
    await api(`/products/${editing}`, {
      method:'PUT',
      body: JSON.stringify({ title:form.title, price:Number(form.price)||0, image:form.image })
    });
    setEditing(null);
    await load();
  }

  async function remove(id){
    await api(`/products/${id}`, { method:'DELETE' });
    await load();
  }

  const isAdmin = auth.isAuthed();

  return (
    <div style={{ padding: 16 }}>
      <h2>Products</h2>
      <ul>
        {items.map(p => (
          <li key={p._id} style={{ marginBottom: 8 }}>
            {editing === p._id ? (
              <>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
                <input type="number" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
                <input value={form.image} onChange={e=>setForm(f=>({...f,image:e.target.value}))} />
                <button onClick={saveEdit}>Save</button>
                <button onClick={()=>setEditing(null)}>Cancel</button>
              </>
            ) : (
              <span><strong>{p.title}</strong> — ${p.price}</span>
            )}
            {isAdmin && editing !== p._id && (
              <>
                <button style={{ marginLeft:8 }} onClick={()=>startEdit(p)}>Edit</button>
                <button style={{ marginLeft:4 }} onClick={()=>remove(p._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
