import { auth } from './auth';

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers||{}) };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}
