function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    // handle base64url
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const auth = {
  get token() {
    return localStorage.getItem("token") || "";
  },

  get payload() {
    return decodeJwt(this.token);
  },

  // Optional cached user (if you store it after login/me)
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })(),

  setUser(u) {
    this.user = u;
    try {
      localStorage.setItem("user", JSON.stringify(u));
    } catch {}
  },

  /**
   * Called after successful login.
   * Saves token and user into localStorage and updates memory.
   */
  loginSuccess(data) {
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    if (data?.user) {
      this.setUser(data.user);
    }
  },

  isAuthed() {
    const p = this.payload;
    if (!p) return false;
    // check expiration if present
    if (typeof p.exp === "number") {
      const nowSec = Math.floor(Date.now() / 1000);
      if (nowSec >= p.exp) return false;
    }
    return true;
  },

  isAdmin() {
    const p = this.payload;
    const role =
      this.user?.role ??
      p?.role ??
      (Array.isArray(p?.roles) ? p.roles[0] : undefined);
    const isAdminFlag = this.user?.isAdmin === true || p?.isAdmin === true;

    // Optional: allow admin by email too (set in .env as VITE_ADMIN_EMAIL)
    const adminEmail = import.meta?.env?.VITE_ADMIN_EMAIL;
    const email = this.user?.email ?? p?.email;

    return (
      role === "admin" ||
      isAdminFlag ||
      (!!adminEmail && email === adminEmail)
    );
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.user = null;
  },
};
