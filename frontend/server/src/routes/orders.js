// routes/orders.js  (use your existing path/filename)
import { Router } from "express";
import jwt from "jsonwebtoken";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
    }
  }
  next();
}


router.post("/", optionalAuth, async (req, res, next) => {
  try {
    const { paymentMethod, buyer, items } = req.body || {};
    const shipping = Number(req.body?.shipping || 0);
    const tax = Number(req.body?.tax || 0);

    if (paymentMethod !== "COD") {
      return res.status(400).json({ error: { message: "Only Cash on Delivery is supported" } });
    }
    if (!buyer?.fullName || !buyer?.email || !buyer?.phone || !buyer?.address?.address1 || !buyer?.address?.city) {
      return res.status(400).json({ error: { message: "Missing buyer information" } });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: { message: "No items provided" } });
    }

    const ids = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids }, isActive: true }).lean();
    const byId = new Map(products.map((p) => [String(p._id), p]));

    let subtotal = 0;
    const orderItems = [];
    for (const it of items) {
      const p = byId.get(String(it.productId));
      const qty = Number(it.qty || 0);
      if (!p) return res.status(400).json({ error: { message: "Product not found or inactive" } });
      if (qty <= 0) return res.status(400).json({ error: { message: "Invalid quantity" } });
      if (Number(p.stock ?? 0) < qty) {
        return res.status(409).json({ error: { message: `Insufficient stock for "${p.title}"` } });
      }
      const price = Number(p.price || 0);
      const line = price * qty;
      subtotal += line;
      orderItems.push({ product: p._id, title: p.title, price, qty, subtotal: line });
    }

    for (const it of items) {
      await Product.updateOne(
        { _id: it.productId, stock: { $gte: it.qty } },
        { $inc: { stock: -Number(it.qty) } }
      );
    }

    const total = subtotal + shipping + tax;

    const order = await Order.create({
      userId: req.user?.sub || undefined,
      buyer,
      items: orderItems,
      currency: "USD",
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod: "COD",
      isPaid: false,
      status: "pending",
    });

    res.status(201).json({ ok: true, id: order._id });
  } catch (e) {
    next(e);
  }
});

router.get("/admin", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "20", 10), 1), 100);
    const status = (req.query.status || "").trim();
    const q = (req.query.q || "").trim();

    const filter = {};
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { "buyer.email": new RegExp(q, "i") },
        { "buyer.phone": new RegExp(q, "i") },
        { "buyer.fullName": new RegExp(q, "i") },
      ];
    }

    const [rows, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ rows, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

router.get("/admin/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const row = await Order.findById(req.params.id)
      .populate("items.product", "title price imageURL sku")
      .lean();
    if (!row) return res.status(404).json({ error: { message: "Not found" } });
    res.json(row);
  } catch (e) {
    next(e);
  }
});
router.delete("/admin/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const row = await Order.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ error: { message: "Order not found" } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// put near the other /admin routes
router.patch("/admin/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const raw = String(req.body?.status || "").trim().toLowerCase();
    const alias = { recieved:"received", shipped:"shipping", confirm:"confirmed" };
    const status = alias[raw] || raw;
    const ALLOWED = ["pending","received","confirmed","shipping","completed","canceled"];
    if (!ALLOWED.includes(status)) return res.status(400).json({ error:{ message:"Invalid status" } });

    const row = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new:true, runValidators:true }
    ).lean();
    if (!row) return res.status(404).json({ error:{ message:"Not found" } });
    res.json({ ok:true, status: row.status });
  } catch (e) { next(e); }
});

export default router;
