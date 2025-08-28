import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

import apiRouter from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

// middleware (safe defaults)
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("dev"));

// simple health route to prove the server works
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api", apiRouter); // mounts /api/products, etc.
app.use(notFound); // 404 handler
app.use(errorHandler); // error handler

const PORT = process.env.PORT || 5000;

// connect to DB first, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
