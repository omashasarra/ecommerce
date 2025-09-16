import { Category } from "../models/Category.js";
import { normalizeImagePath } from "../utils/imagePath.js";

const filenameOnly = (p) => (!p ? "" : p.includes("/") ? p.split("/").pop() : p);

export async function adminList(req, res, next) {
  try {
    const page     = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "10", 10), 1), 100);
    const search   = (req.query.search || "").trim();
    const sortBy   = req.query.sortBy || "createdAt";
    const sortDir  = req.query.sortDir === "asc" ? 1 : -1;

    const filter = search ? { $or: [{ title: new RegExp(search, "i") }] } : {};

    const [rows, total] = await Promise.all([
      Category.find(filter).sort({ [sortBy]: sortDir }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Category.countDocuments(filter),
    ]);

    res.json({ rows, total, page, pageSize });
  } catch (error) { next(error); }
}

export async function adminGetOne(req, res, next) {
  try {
    const row = await Category.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: { message: "Not found" } });
    res.json(row);
  } catch (error) { next(error); }
}

export async function adminCreate(req, res, next) {
  try {
    const body = { ...req.body };
   body.imageUrl = normalizeImagePath("category", req.file, body.imageUrl);
   if (!body.imageUrl) {
     return res.status(400).json({ error: { message: "Image file is required" } });
   }

    const created = await Category.create(body);
    res.status(201).json(created);
  } catch (err) { next(err); }
}

export async function adminUpdate(req, res, next) {
  try {
    const body = { ...req.body };
   const normalized = normalizeImagePath("category", req.file, body.imageUrl);
   if (normalized) body.imageUrl = normalized; else delete body.imageUrl;

    const updated = await Category.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!updated) return res.status(404).json({ error: { message: "Not found" } });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function adminRemove(req, res, next) {
  try {
    const removed = await Category.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: { message: "Not found" } });
    res.json({ ok: true, id: req.params.id });
  } catch (error) { next(error); }
}

export async function publicList(_req, res, next) {
  try {
    const rows = await Category.find().sort({ order: 1, createdAt: 1 }).lean();
    res.set("Cache-Control", "no-store");
    res.json({ rows });
  } catch (error) { next(error); }
}
