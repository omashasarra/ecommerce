// server/src/routes/products.js
import { Router } from "express";
import {
  adminList, adminGetOne, adminCreate, adminUpdate, adminRemove,
  publicList, publicGetById,
} from "../controllers/pro.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import { uploadProduct } from "../middleware/upload.js";

const router = Router();

router.get("/admin",        requireAuth, requireAdmin, adminList);
router.get("/admin/:id",    requireAuth, requireAdmin, adminGetOne);

router.post("/admin",       requireAuth, requireAdmin, uploadProduct.single("image"), adminCreate);
router.put("/admin/:id",    requireAuth, requireAdmin, uploadProduct.single("image"), adminUpdate);
router.delete("/admin/:id", requireAuth, requireAdmin, adminRemove);

// 👇 upload endpoint (same as categories)
router.post("/admin/upload", requireAuth, requireAdmin, uploadProduct.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: "No file uploaded" } });
  res.json({ filename: req.file.filename, url: `/product/${req.file.filename}` });
});

// public
router.get("/", publicList);
router.get("/id/:id", publicGetById);

export default router;
