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
        "/api": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
        "/banner": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
        "/category": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
        "/blogs": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
        "/hero": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
        "/brand": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
        "/product" : {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
        "/products": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
