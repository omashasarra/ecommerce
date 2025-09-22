import { userAuth } from "../shared/userAuth.js";

const KEY = (uid) => `profile_defaults:${uid}`;

export const EMPTY_DEFAULTS = {
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export function getCurrentUserId() {
  return userAuth?.user?.id || userAuth?.user?._id || null;
}

export function loadDefaults() {
  const uid = getCurrentUserId();
  if (!uid) return { ...EMPTY_DEFAULTS };
  try {
    const raw = localStorage.getItem(KEY(uid));
    return raw ? { ...EMPTY_DEFAULTS, ...JSON.parse(raw) } : { ...EMPTY_DEFAULTS };
  } catch {
    return { ...EMPTY_DEFAULTS };
  }
}

export function saveDefaults(partial) {
  const uid = getCurrentUserId();
  if (!uid) return;
  const existing = loadDefaults();
  const merged = { ...existing, ...partial };
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(merged));
  } catch {}
  return merged;
}

export async function syncToServer(apiBase) {
  const uid = getCurrentUserId();
  if (!uid) return;
  const body = loadDefaults();
  try {
    await fetch(`${apiBase}/api/users/me/profile-defaults`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAuth.token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {}
}

export async function hydrateFromServer(apiBase) {
  const uid = getCurrentUserId();
  if (!uid) return;
  try {
    const r = await fetch(`${apiBase}/api/users/me/profile-defaults`, {
      headers: { Authorization: `Bearer ${userAuth.token}` },
    });
    if (r.ok) {
      const d = await r.json();
      saveDefaults(d || {});
    }
  } catch {}
}
