// server/src/routes/categories.js
import { Router } from "express";
import {
  adminList,
  adminGetOne,
  adminCreate,
  adminUpdate,
  adminRemove,
  publicList,
} from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

// Admin (JWT + admin role)
router.get("/admin", requireAuth, requireAdmin, adminList);
router.get("/admin/:id", requireAuth, requireAdmin, adminGetOne);
router.post("/admin", requireAuth, requireAdmin, adminCreate);
router.put("/admin/:id", requireAuth, requireAdmin, adminUpdate);
router.delete("/admin/:id", requireAuth, requireAdmin, adminRemove);

// Public (storefront)
router.get("/", publicList);

export default router;
