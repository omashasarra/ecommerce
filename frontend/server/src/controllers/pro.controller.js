import Product from "../models/Product.js";
import { ensureLocalProductImage } from "../utils/ensureLocalImage.js";

export async function adminList(req, res, next) {
  try {
    const page     = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "10", 10), 1), 100);
    const search   = (req.query.search || "").trim();
    const sortBy   = req.query.sortBy || "createdAt";
    const sortDir  = req.query.sortDir === "asc" ? 1 : -1;

    const filter = search ? { $or: [{ title: new RegExp(search, "i") }] } : {};

    const [rows, total] = await Promise.all([
      Product.find(filter).sort({ [sortBy]: sortDir }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ rows, total, page, pageSize });
  } catch (error) { next(error); }
}

export async function adminGetOne(req, res, next) {
  try {
    const row = await Product.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: { message: "Not found" } });
    res.json(row);
  } catch (error) { next(error); }
}

export async function adminCreate(req, res, next) {
  try {
    const body = { ...req.body };

    body.imageURL = await ensureLocalProductImage({
      file: req.file,            
      imageURL: body.imageURL,   
    });

    if (!body.title || body.price == null) {
      return res.status(400).json({ error: "title and price are required" });
    }

    body.price = Number(body.price);
    body.stock = body.stock != null ? Number(body.stock) : 0;
    const maxOrder = await Product.findOne({}, { order: 1 }).sort({ order: -1 }).lean();
    body.order = (maxOrder?.order ?? -1) + 1;

    const created = await Product.create(body);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

export async function adminUpdate(req, res, next) {
  try {
    const body = { ...req.body };

    if (req.file || (typeof body.imageURL === "string" && body.imageURL.trim())) {
      body.imageURL = await ensureLocalProductImage({
        file: req.file,
        imageURL: body.imageURL,
      });
    } else {
      delete body.imageURL;
    }

    if (body.price != null) body.price = Number(body.price);
    if (body.stock != null) body.stock = Number(body.stock);
    if (body.order != null) body.order = Number(body.order);

    const updated = await Product.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!updated) return res.status(404).json({ error: "Not Found" });
    res.json(updated);
  } catch (e) { next(e); }
}

export async function adminRemove(req, res, next) {
  try {
    const removed = await Product.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: { message: "Not found" } });
    res.json({ ok: true, id: req.params.id });
  } catch (error) { next(error); }
}


export async function publicList(_req, res, next) {
  try {
    const rows = await Product.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    res.set("Cache-Control", "no-store");
    res.json(rows);
  } catch (error) { next(error); }
}

export async function publicGetById(req, res, next) {
  try {
    const row = await Product.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!row) return res.status(404).json({ error: { message: "Not found" } });
    res.set("Cache-Control", "no-store");
    res.json(row);
  } catch (error) { next(error); }
}
