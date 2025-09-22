import { Router } from "express";
import multer from "multer";
import {
  publicList,
  adminCreate,
  createBooking,
  myBookings,
  adminListBookings,
  adminUpdateBooking,
  adminDeleteBooking,
} from "../controllers/service.controller.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/services"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const uploadService = multer({ storage });

router.get("/", publicList);

router.post("/book", requireAuth, createBooking); 
router.get("/my", requireAuth, myBookings);       

router.post("/admin", requireAuth, requireAdmin, uploadService.single("image"), adminCreate);
router.get("/admin/bookings", requireAuth, requireAdmin, adminListBookings);
router.patch("/admin/bookings/:id", requireAuth, requireAdmin, adminUpdateBooking);

router.delete("/admin/bookings/:id", requireAuth, adminDeleteBooking);

export default router;
