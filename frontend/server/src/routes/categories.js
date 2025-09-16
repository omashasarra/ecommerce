// server/src/routes/categories.js
import { Router } from "express";
import {
  adminList, adminGetOne, adminCreate, adminUpdate, adminRemove, publicList,
} from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import { uploadCategory } from "../middleware/upload.js"; 

const router = Router();

router.get("/admin",        requireAuth, requireAdmin, adminList);
router.get("/admin/:id",    requireAuth, requireAdmin, adminGetOne);
router.post("/admin",       requireAuth, requireAdmin, uploadCategory.single("image"), adminCreate);
router.put("/admin/:id",    requireAuth, requireAdmin, uploadCategory.single("image"), adminUpdate);
router.delete("/admin/:id", requireAuth, requireAdmin, adminRemove);

router.post("/admin/upload", requireAuth, requireAdmin, uploadCategory.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: "No file uploaded" } });
  res.json({
    filename: req.file.filename,
    url: `/category/${req.file.filename}`, 
  });
});

router.get("/", publicList);

export default router;
