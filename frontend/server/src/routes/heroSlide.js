// src/routes/heroSlide.js
import { Router } from "express";
import {
  adminList,
  adminGetOne,
  adminCreate,
  adminUpdate,
  adminRemove,
  publicList,
} from "../controllers/heroSlide.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js"; 

const router = Router();

router.use("/admin", requireAuth, requireAdmin);

router.get("/admin", adminList);            
router.get("/admin/:id", adminGetOne);      
router.post("/admin", adminCreate);         
router.put("/admin/:id", adminUpdate);      
router.delete("/admin/:id", adminRemove);   

router.get("/", publicList);

export default router;
