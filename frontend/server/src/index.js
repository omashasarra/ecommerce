// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { connectDB } from "./config/db.js";

import apiRouter from "./routes/index.js";
import blogsRouter from "./routes/blogs.js";

import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

// --- Middleware setup ---
app.use(helmet());

app.use(cors({ origin: true, credentials: true }));

app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(compression());

app.use(morgan("dev"));


// Mount generic API router
app.use("/api", (req, res, next) => {
  console.log("Incoming request to /api:", req.method, req.originalUrl);
  next();
}, apiRouter);

// Mount blogs router
app.use("/api/blogs", (req, res, next) => {
  console.log("Incoming request to /api/blogs:", req.method, req.originalUrl);
  next();
}, blogsRouter);


// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Not found + error handler
app.use((req, res, next) => {
  console.warn("Not found:", req.method, req.originalUrl);
  notFound(req, res, next);
});

app.use((err, req, res, next) => {
  console.error("Error handler caught:", err.message);
  errorHandler(err, req, res, next);
});

// --- Server start ---
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(` API server running → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
// Error handler - keep last
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack || err);
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || "Internal Server Error",
  });
});
