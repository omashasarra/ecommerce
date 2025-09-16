import { Router } from "express";
import {
  adminList, adminGetOne, adminCreate, adminUpdate, adminRemove, publicList,
} from "../controllers/heroSlide.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import { uploadHero } from "../middleware/upload.js"; 

const router = Router();

router.use("/admin", requireAuth, requireAdmin);

router.get("/admin", adminList);
router.get("/admin/:id", adminGetOne);

router.post("/admin", uploadHero.single("img"), adminCreate);
router.put("/admin/:id", uploadHero.single("img"), adminUpdate);

router.delete("/admin/:id", adminRemove);
router.get("/", publicList);

export default router;
