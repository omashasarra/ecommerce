// src/shared/adminAuth.js
function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const adminAuth = {
  get token() {
    return localStorage.getItem("admin_token") || "";
  },

  get payload() {
    return decodeJwt(this.token);
  },

  admin: (() => {
    try {
      return JSON.parse(localStorage.getItem("admin_data") || "null");
    } catch {
      return null;
    }
  })(),

  get user() {
    return this.admin;
  },
  setUser(u) {
    this.setAdmin(u);
  },

  
  setAdmin(u) {
    this.admin = u;
    try {
      localStorage.setItem("admin_data", JSON.stringify(u));
    } catch {}
  },

  loginSuccess(data) {
    if (data?.token) {
      localStorage.setItem("admin_token", data.token);
    }
    if (data?.user) {
      this.setAdmin(data.user);
    }
  },

  isAuthed() {
    const p = this.payload;
    if (!p) return false;
    if (typeof p.exp === "number") {
      const nowSec = Math.floor(Date.now() / 1000);
      if (nowSec >= p.exp) return false;
    }
    return true;
  },

  isAdmin() {
    const role = this.admin?.role ?? this.payload?.role;
    return role === "admin" || this.admin?.isAdmin === true || this.payload?.isAdmin === true;
  },

  logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    this.admin = null;
  },
};
