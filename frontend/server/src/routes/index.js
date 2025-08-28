import { Router } from "express";
import productRoutes from "./product.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/products", productRoutes);

export default router;
