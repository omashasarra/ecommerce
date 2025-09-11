import { Router } from "express";
import {
  adminList, adminGetOne, adminCreate, adminUpdate, adminRemove,
  publicList,
} from "../controllers/service.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

console.log("[services] router file loaded"); // debug

const router = Router();

// quick ping so we can prove this router is mounted
router.get("/__ping", (_req, res) => res.json({ ok: true, scope: "servicesRouter" }));

// ADMIN (before "/:id")
router.get("/admin",       requireAuth, requireAdmin, adminList);
router.get("/admin/:id",   requireAuth, requireAdmin, adminGetOne);
router.post("/admin",      requireAuth, requireAdmin, adminCreate);
router.put("/admin/:id",   requireAuth, requireAdmin, adminUpdate);
router.delete("/admin/:id",requireAuth, requireAdmin, adminRemove);

// PUBLIC
router.get("/", publicList);

export default router;
