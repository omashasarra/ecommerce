export const auth = {
  get token() {
    return localStorage.getItem("token");
  },
  set token(t) {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  },

  get user() {
    const raw = localStorage.getItem("user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set user(u) {
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  },

  isAuthed() {
    return !!this.token;
  },
  isAdmin() {
    const u = this.user;
    return !!u && u.role === "admin";
  },

  loginSuccess({ token, user }) {
    this.token = token;
    this.user = user;
  },
  logout() {
    this.token = null;
    this.user = null;
  },
};
