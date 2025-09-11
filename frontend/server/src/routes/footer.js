// src/routes/footer.js
import { Router } from "express";
import { footerPublic, footerAdminGet, footerAdminSave } from "../controllers/footer.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

// Public
router.get("/", footerPublic);

// Admin
router.get("/admin", requireAuth, requireAdmin, footerAdminGet);
router.put("/admin", requireAuth, requireAdmin, footerAdminSave);

export default router;
