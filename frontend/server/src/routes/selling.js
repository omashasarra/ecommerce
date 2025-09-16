import { Router } from "express";
import {
    listPublic,
    listAdmin,
    getOne,
    createOne,
    updateOne,
    removeOne,
} from "../controllers/Selling.controller.js";

const router = Router();

router.get("/", listPublic);

router.get("/admin", listAdmin);
router.get("/admin/:id", getOne);
router.post("/admin", createOne);
router.put("/admin/:id", updateOne);
router.delete("/admin/:id", removeOne);

export default router;