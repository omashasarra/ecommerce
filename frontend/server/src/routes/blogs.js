import { Router } from "express";
import {
  adminList, adminGetOne, adminCreate, adminUpdate, adminRemove,
  publicList, publicGetOne,
} from "../controllers/blog.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import { uploadBlog } from "../middleware/upload.js";

const router = Router();

router.get("/admin",     requireAuth, requireAdmin, adminList);
router.get("/admin/:id", requireAuth, requireAdmin, adminGetOne);

router.post("/admin",    requireAuth, requireAdmin, uploadBlog.single("image"), adminCreate);
router.put("/admin/:id", requireAuth, requireAdmin, uploadBlog.single("image"), adminUpdate);

router.delete("/admin/:id", requireAuth, requireAdmin, adminRemove);

router.get("/", publicList);
router.get("/:id", publicGetOne);

export default router;
