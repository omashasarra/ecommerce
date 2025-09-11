// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../shared/api";
import { auth } from "../shared/auth";

const ACCENT = "#f42c37";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        body: { email, password },
      });
      auth.loginSuccess(data); // expects { token, user }
      nav("/admin", { replace: true });
    } catch (e) {
      setErr(e?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div
        className="overflow-hidden rounded-3xl min-h-[550px] sm:min-h-[650px] flex items-stretch mt-8 bg-white dark:bg-gray-900"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))" }}
      >
        {/* Left panel (intro) */}
        <div className="hidden md:flex flex-1 items-center justify-center relative bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.04)]">
          <div className="text-center text-gray-900 dark:text-gray-100 px-8 max-w-md">
            <p className="text-sm opacity-90 mb-2">Welcome back</p>
            <h1 className="uppercase text-4xl md:text-5xl font-bold drop-shadow">
              Admin Login
            </h1>
            <button
              type="button"
              className="mt-6 bg-white dark:bg-gray-100 py-2 px-5 rounded-full text-sm shadow"
              style={{ color: ACCENT }}
              onClick={() =>
                document.getElementById("login-form")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Continue to Sign In
            </button>
          </div>
        </div>

        {/* Right panel (form) */}
        <div className="flex-1 bg-white dark:bg-gray-900 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Sign in to your account
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Use your admin credentials to access the dashboard.
              </p>
            </div>

            <form id="login-form" onSubmit={submit} className="grid gap-4">
              <label className="grid gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-300">Email</span>
                <input
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  style={{ outlineColor: ACCENT }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-300">Password</span>
                <div className="relative">
                  <input
                    className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    style={{ outlineColor: ACCENT }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPw ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-300"
                    aria-label="Toggle password"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {err && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white shadow"
                style={{ backgroundColor: ACCENT }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
