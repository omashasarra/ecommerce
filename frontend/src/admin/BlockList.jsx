import React from 'react';
import { adminApi as api } from '../shared/api';
import { adminAuth as auth } from "../shared/adminAuth.js";
import BlockEditor from './BlockEditor';

export default function BlockList({ type }){
  const [items, setItems] = React.useState([]);
  const [editing, setEditing] = React.useState(null); // id or 'new'

  async function load(){
    const data = await api(`/api/blocks/${type}`);
    setItems(data);
  }
  React.useEffect(()=>{ load(); setEditing(null); }, [type]);

  function onClose(){ setEditing(null); }
  function onSaved(){ setEditing(null); load(); }

  const isAdmin = auth.isAuthed();

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h2 style={{ margin:'12px 0' }}>{type}</h2>
        {isAdmin && <button onClick={()=>setEditing('new')}>+ Add {type}</button>}
      </div>

      {!items.length && <div style={{ padding:8, color:'#777' }}>No items yet.</div>}

      <ul style={{ listStyle:'none', padding:0 }}>
        {items.map(item => (
          <li key={item._id} style={{ border:'1px solid #eee', padding:12, borderRadius:8, margin:'10px 0' }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div><strong>{item.title || item.key}</strong> {item.isActive ? '' : <em style={{color:'#999'}}>(inactive)</em>}</div>
                <small>ID: {item._id}</small>
              </div>
              {isAdmin && (
                <div>
                  <button onClick={()=>setEditing(item._id)}>Edit</button>
                  <button style={{ marginLeft:8 }} onClick={async()=>{
                    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
                    await api(`/blocks/${item._id}`, { method:'DELETE' });
                    await load();
                  }}>Delete</button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <BlockEditor
          type={type}
          item={editing==='new' ? null : items.find(i=>i._id===editing)}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}