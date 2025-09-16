import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import api from "../shared/api";
import { auth } from "../shared/auth";

export default function AuthPopup({ open, onClose, defaultTab = "signup" }) {
  const [mode, setMode] = React.useState(defaultTab); // "signup" | "login"
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setMode(defaultTab);
      setName("");
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [open, defaultTab]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "signup" ? { name, email, password } : { email, password };
      const res = await api(path, { body });
      auth.loginSuccess(res); // stores token + user in localStorage
      onClose?.();
    } catch (err) {
      setError(err?.data?.error?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="h-screen w-screen fixed top-0 left-0 bg-black/50 z-50 backdrop-blur-sm">
      <div className="w-[340px] sm:w-[380px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      p-4 shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-semibold">{mode === "signup" ? "Create an account" : "Welcome back"}</h1>
          <button onClick={onClose} aria-label="Close">
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        {/* Switch */}
        <div className="flex gap-2 text-sm mb-4">
          <button
            className={`px-3 py-1 rounded-full ${mode === "signup" ? "bg-primary text-white" : "bg-gray-100 dark:bg-white/10"}`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
          <button
            className={`px-3 py-1 rounded-full ${mode === "login" ? "bg-primary text-white" : "bg-gray-100 dark:bg-white/10"}`}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              className="form-input w-full"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="form-input w-full"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            className="form-input w-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg bg-primary text-white disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        {/* Hint */}
        <p className="text-xs mt-3 opacity-80">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button className="underline" onClick={() => setMode("login")}>Log in</button>.
            </>
          ) : (
            <>
              New here?{" "}
              <button className="underline" onClick={() => setMode("signup")}>Create an account</button>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
