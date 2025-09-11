import { Router } from "express";
import {
  adminList, adminGetOne, adminCreate, adminUpdate, adminRemove,
  publicList, publicGetOne,
} from "../controllers/blog.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

// ADMIN (before "/:id")
router.get("/admin",       requireAuth, requireAdmin, adminList);
router.get("/admin/:id",   requireAuth, requireAdmin, adminGetOne);
router.post("/admin",      requireAuth, requireAdmin, adminCreate);
router.put("/admin/:id",   requireAuth, requireAdmin, adminUpdate);
router.delete("/admin/:id",requireAuth, requireAdmin, adminRemove);

// PUBLIC
router.get("/", publicList);
router.get("/:id", publicGetOne);

export default router;
