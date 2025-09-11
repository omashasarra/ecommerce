import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import * as C from "../controllers/block.controller.js";

const router = Router();

// Public read by type (so frontend can render site if needed)
router.get("/:type", C.listByType);

// Admin writes
router.post("/:type", requireAuth, requireAdmin, C.create);
router.put("/:id", requireAuth, requireAdmin, C.update);
router.delete("/:id", requireAuth, requireAdmin, C.remove);

export default router;
