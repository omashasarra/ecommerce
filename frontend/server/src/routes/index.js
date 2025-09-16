// server/src/routes/index.js
import { Router } from "express";

import productRoutes   from "./product.routes.js";
import authRoutes      from "./auth.routes.js";
import blockRoutes     from "./block.routes.js";
import adminRoutes     from "./admin.routes.js";
import categoriesRoutes from "./categories.js";
import footerRoutes    from "./footer.js";
import heroRoutes      from "./heroSlide.js";
import blogsRoutes     from "./blogs.js";
import servicesRoutes  from "./services.js";
import partnersRoutes from "./partners.js";
import bannersRoutes from "./banners.js";
import productsRouter from "./products.js";
import sellingRouter from "./selling.js";
import ordersRouter from "./orders.js";

const router = Router();

// mount under /api/*
router.use("/auth",       authRoutes);
router.use("/product",   productRoutes);
router.use("/blocks",     blockRoutes);
router.use("/admin",      adminRoutes);
router.use("/categories", categoriesRoutes);
router.use("/footer",     footerRoutes);
router.use("/hero",       heroRoutes);
router.use("/blogs",      blogsRoutes);
router.use("/services",   servicesRoutes);
router.use("/partners", partnersRoutes);
router.use("/banners", bannersRoutes);
router.use("/products", productsRouter);
router.use("/selling", sellingRouter);
router.use("/orders", ordersRouter);

router.get("/__ping", (_req, res) => res.json({ ok: true, scope: "apiRouter" }));

export default router;
