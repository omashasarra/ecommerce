// server/src/routes/banners.js
import { Router } from "express";
import {
  publicList,
  adminList,
  adminGetOne,
  adminCreate,
  adminUpdate,
  adminRemove,
} from "../controllers/banner.controller.js";

// If you have auth middlewares, add them to admin routes
// import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

// Public
router.get("/", publicList); // GET /api/banners?position=home-1

// Admin (unprotected here; add auth if needed)
// router.get("/admin", requireAuth, requireAdmin, adminList);
router.get("/admin", adminList);
router.get("/admin/:id", adminGetOne);
router.post("/admin", adminCreate);
router.put("/admin/:id", adminUpdate);
router.delete("/admin/:id", adminRemove);

export default router;
