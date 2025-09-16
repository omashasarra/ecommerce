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
import {uploadBanner} from "../middleware/upload.js";

const router = Router();

// Public
router.get("/", publicList);

// Admin
router.get("/admin", adminList);
router.get("/admin/:id", adminGetOne);

router.post("/admin", uploadBanner.single("image"), adminCreate);
router.put("/admin/:id", uploadBanner.single("image"), adminUpdate);

router.delete("/admin/:id", adminRemove);

export default router;
