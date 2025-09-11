// src/shared/api.js
import { auth } from "./auth";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/**
 * api(path, { method, body, headers })
 * - Auto-JSON body/parse
 * - Injects Authorization: Bearer <token> if present
 * - Throws Error("HTTP <code>") with response text/json
 */
export async function api(path, opts = {}) {
  const method =
    opts.method || (opts.body !== undefined && opts.body !== null ? "POST" : "GET");

  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
    ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
    // credentials included is fine; token is in header
    credentials: "include",
  });

  // read safely (some endpoints may return empty body)
  const text = await res.text();
  const data = text ? safeParseJSON(text) : null;

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.data = data ?? text ?? null;
    throw err;
  }

  return data;
}

function safeParseJSON(t) {
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

export default api;
