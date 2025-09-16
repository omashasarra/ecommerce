// server/src/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { connectDB } from "./config/db.js";
import apiRouter from "./routes/index.js";
import blogsRouter from "./routes/blogs.js";
import { notFound, errorHandler } from "./middleware/error.js";

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve from server/public (one level UP from /src)
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const app = express();

// --- Middleware ---
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("dev"));

// --- Static (must come before 404) ---
app.use(express.static(PUBLIC_DIR));
app.use("/brand", express.static(path.join(PUBLIC_DIR, "brand")));
app.use("/banner", express.static(path.join(PUBLIC_DIR, "banner")));
app.use("/blogs", express.static(path.join(PUBLIC_DIR, "blogs")));
app.use("/category", express.static(path.join(PUBLIC_DIR, "category")));
app.use("/hero",    express.static(path.join(PUBLIC_DIR, "hero")));
app.use("/product", express.static(path.join(PUBLIC_DIR, "product")));

// --- Routers ---
app.use(
  "/api",
  (req, _res, next) => {
    console.log("Incoming request to /api:", req.method, req.originalUrl);
    next();
  },
  apiRouter
);

app.use(
  "/api/blogs",
  (req, _res, next) => {
    console.log("Incoming request to /api/blogs:", req.method, req.originalUrl);
    next();
  },
  blogsRouter
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/__debug/:section", (req, res) => {
  const dir = path.join(PUBLIC_DIR, req.params.section || "");
  const exists = fs.existsSync(dir);
  const files = exists ? fs.readdirSync(dir) : [];
  res.json({ publicDir: PUBLIC_DIR, dir, exists, files });
});

// --- 404 handler (after all routes) ---
app.use((req, res, next) => {
  console.warn("Not found:", req.method, req.originalUrl);
  notFound(req, res, next);
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error("Error handler caught:", err.message);
  errorHandler(err, req, res, next);
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 API server running → http://localhost:${PORT}`);
      console.log("📂 Serving static from:", PUBLIC_DIR);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
