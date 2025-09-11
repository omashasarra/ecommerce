import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        // ✅ use a path prefix, not "^/api"
        "/api": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
          // no rewrite needed since your backend expects /api/*
        },
      },
    },
  };
});
