import { useState } from 'react';
import { api } from '../shared/api';

export default function AddProductForm({ onAdded }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  async function submit(e){
    e.preventDefault();
    const item = await api('/products', {
      method:'POST',
      body: JSON.stringify({ title, price:Number(price)||0, image })
    });
    onAdded?.(item);
    setTitle(''); setPrice(''); setImage('');
  }

  return (
    <form onSubmit={submit} style={{ display:'grid', gap:8, maxWidth:320, padding:16 }}>
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
      <input placeholder="Price" type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} />
      <input placeholder="Image URL" value={image} onChange={e=>setImage(e.target.value)} />
      <button>Add Product</button>
    </form>
  );
}
