import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

// everything in /api/admin/* requires auth + admin
router.use(requireAuth, requireAdmin);

// sanity endpoint
router.get("/ping", (req, res) => {
  res.json({ ok: true, who: req.user.email });
});

export default router;
