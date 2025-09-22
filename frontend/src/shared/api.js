// src/shared/api.js
import { userAuth } from "./userAuth.js";
import { adminAuth } from "./adminAuth.js";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/**
 * Core API helper
 */
async function baseApi(path, opts = {}, token) {
  const hasBody = opts.body !== undefined && opts.body !== null;
  const method = opts.method || (hasBody ? "POST" : "GET");

  const headers = { ...(opts.headers || {}) };
  let body = opts.body;

  // JSON encode plain objects, but skip for FormData
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  if (hasBody && !isFormData && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  // Attach Authorization header
  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

export const userApi = (path, opts = {}) =>
  baseApi(path, opts, userAuth.token);

export const adminApi = (path, opts = {}) =>
  baseApi(path, opts, adminAuth.token);
