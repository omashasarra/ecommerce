import { Router } from "express";
import {
    publicList,
    adminList,
    adminCreate,
    adminUpdate,
    adminRemove,
} from "../controllers/partner.controller.js";

const router = Router();

router.get("/", publicList);

router.get("/admin", adminList);
router.post("/admin", adminCreate);
router.put("/admin/:id", adminUpdate);
router.delete("/admin/:id", adminRemove);

export default router;