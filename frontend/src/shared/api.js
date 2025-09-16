// src/shared/api.js
import { auth } from "./auth";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function api(path, opts = {}) {
  const hasBody = opts.body !== undefined && opts.body !== null;
  const method = opts.method || (hasBody ? "POST" : "GET");

  const headers = { ...(opts.headers || {}) };

  // If body is a plain object → JSON encode.
  // If it's FormData → DO NOT set Content-Type (browser will add boundary).
  let body = opts.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (hasBody && !isFormData && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  if (auth.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body,
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? safeParseJSON(text) : null;

  if (!res.ok) {
    const err = new Error(data?.error?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data ?? text ?? null;
    throw err;
  }
  return data;
}

function safeParseJSON(t) {
  try { return JSON.parse(t); } catch { return t; }
}

export default api;
