import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../shared/api"; 
import { userAuth } from "../shared/userAuth.js";
import { adminAuth } from "../shared/adminAuth.js";

const ACCENT = "#f42c37";

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); 
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await userApi("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        if (!data?.token || !data?.user) throw new Error("Unexpected response");

        // Save into the right store
        if (data.user.role?.toLowerCase() === "admin") {
          adminAuth.loginSuccess(data);
          nav("/admin", { replace: true });
        } else {
          userAuth.loginSuccess(data);
          nav("/", { replace: true });
        }
      } else {
        // Signup only for users
        const data = await userApi("/api/auth/signup", {
          method: "POST",
          body: { email, name, password },
        });
        if (!data?.user) throw new Error("Unexpected response");
        userAuth.loginSuccess(data);
        nav("/", { replace: true });
      }
    } catch (e) {
      console.error("Auth error:", e);
      setErr(e?.data?.error?.message || e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div
        className="overflow-hidden rounded-3xl min-h-[600px] flex items-stretch mt-8 bg-white dark:bg-gray-900 shadow-xl"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))",
        }}
      >
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-red-500 to-pink-500 text-white p-10">
          <div className="max-w-md space-y-4">
            <h1 className="text-4xl font-bold drop-shadow">
              {mode === "login" ? "Welcome Back!" : "Join Us Today"}
            </h1>
            <p className="opacity-90 leading-relaxed">
              {mode === "login"
                ? ""
                : "Create your account to start exploring our platform."}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {mode === "login" ? "Sign in to your account" : "Create a new account"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {mode === "login"
                  ? "Use your credentials to access the dashboard."
                  : "Fill in your details to get started."}
              </p>
            </div>

            <form onSubmit={submit} className="grid gap-4">
              {mode === "signup" && (
                <label className="grid gap-1">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Name</span>
                  <input
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    style={{ outlineColor: ACCENT }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    required
                  />
                </label>
              )}

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
                className="mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white shadow transition hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                {loading
                  ? mode === "login"
                    ? "Signing in…"
                    : "Signing up…"
                  : mode === "login"
                  ? "Sign In"
                  : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setErr("");
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {mode === "login"
                  ? "Don’t have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
