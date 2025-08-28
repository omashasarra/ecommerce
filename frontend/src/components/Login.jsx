import { useState } from 'react';
import { api } from '../shared/api';
import { auth } from '../shared/auth';

export default function Login({ onLogin }) {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');

  async function submit(e){
    e.preventDefault();
    setErr('');
    try{
      const data = await api('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) });
      auth.token = data.token;
      onLogin?.(data.user);
    }catch(e){ setErr('Invalid email or password'); }
  }

  return (
    <form onSubmit={submit} style={{ display:'grid', gap:8, maxWidth:300 }}>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button>Login</button>
      {err && <div style={{ color:'crimson' }}>{err}</div>}
    </form>
  );
}
