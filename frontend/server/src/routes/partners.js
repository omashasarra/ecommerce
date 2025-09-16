import { Router } from "express";
import {
  publicList,
  adminList,
  adminCreate,
  adminUpdate,
  adminRemove,
} from "../controllers/partner.controller.js";
import { uploadBrand } from "../middleware/upload.js";

const router = Router();

router.get("/", publicList);
router.get("/admin", adminList);

router.post(
  "/admin",
  (req, res, next) => {
    // 👀 Debug: check headers and body *before* Multer parses
    console.log("CT:", req.headers["content-type"]);
    next();
  },
  uploadBrand.single("image"), // Multer parses the form-data
  (req, res, next) => {
    // 👀 Debug: see what Multer produced
    console.log("Body after multer:", req.body);
    console.log("File after multer:", req.file);
    next();
  },
  adminCreate // finally your controller
);

router.put(
  "/admin/:id",
  (req, res, next) => {
    // 👀 Before Multer parses the form-data
    console.log("🔄 [UPDATE] Headers CT:", req.headers["content-type"]);
    next();
  },
  uploadBrand.single("image"), // Multer will parse the file + fields
  (req, res, next) => {
    // 👀 After Multer has run
    console.log("🔄 [UPDATE] Body after multer:", req.body);
    console.log("🔄 [UPDATE] File after multer:", req.file);
    next();
  },
  adminUpdate // your controller
);

router.delete("/admin/:id", adminRemove);

export default router;
