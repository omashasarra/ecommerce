// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../shared/auth";
import { api } from "../shared/api";

export default function AdminRoute({ children }) {
  // if we already have a user in memory/localStorage, we can render immediately
  const [ready, setReady] = React.useState(!!auth.user);
  const [allowed, setAllowed] = React.useState(auth.isAdmin());

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        // no token => definitely not allowed
        if (!auth.token) {
          setAllowed(false);
          return;
        }

        // if user isn’t loaded yet (typical after hard refresh), fetch it
        if (!auth.user) {
          const me = await api("/api/auth/me"); // must return the current user
          if (cancelled) return;
          // set user on the auth singleton (support both patterns)
          if (typeof auth.setUser === "function") auth.setUser(me);
          else auth.user = me;
        }

        setAllowed(auth.isAdmin());
      } catch {
        // token invalid/expired
        if (typeof auth.logout === "function") auth.logout();
        else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        setAllowed(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    if (!auth.user) hydrate();
    else setReady(true);

    return () => { cancelled = true; };
  }, []);

  // Keep the URL on /admin while we check auth
  if (!ready) {
    return <div style={{ padding: 24 }}>Loading admin…</div>;
  }

  // After hydration, decide
  if (!auth.isAuthed()) return <Navigate to="/login" replace />;
  if (!allowed) return <Navigate to="/" replace />;

  return children;
}
