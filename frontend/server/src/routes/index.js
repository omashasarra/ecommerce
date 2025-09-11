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

const router = Router();

// mount under /api/*
router.use("/auth",       authRoutes);
router.use("/products",   productRoutes);
router.use("/blocks",     blockRoutes);
router.use("/admin",      adminRoutes);
router.use("/categories", categoriesRoutes);
router.use("/footer",     footerRoutes);
router.use("/hero",       heroRoutes);
router.use("/blogs",      blogsRoutes);
router.use("/services",   servicesRoutes);
router.use("/partners", partnersRoutes);
router.use("/banners", bannersRoutes);

router.get("/__ping", (_req, res) => res.json({ ok: true, scope: "apiRouter" }));

export default router;
