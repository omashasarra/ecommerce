// src/shared/userAuth.js
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

export const userAuth = {
  get token() {
    return localStorage.getItem("user_token") || "";
  },

  get payload() {
    return decodeJwt(this.token);
  },

  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("user_data") || "null");
    } catch {
      return null;
    }
  })(),

  setUser(u) {
    this.user = u;
    try {
      localStorage.setItem("user_data", JSON.stringify(u));
    } catch {}
  },

  loginSuccess(data) {
    if (data?.token) {
      localStorage.setItem("user_token", data.token);
    }
    if (data?.user) {
      this.setUser(data.user);
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

  logout() {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    this.user = null;
  },
};
