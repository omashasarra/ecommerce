import { Category } from "../models/Category.js";

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
    const { title, imageUrl } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: { message: "title and imageUrl are required" } });
    }

    const maxOrderDoc = await Category.findOne({}, { order: 1 }).sort({ order: -1 }).lean();
    const nextOrder = (maxOrderDoc?.order ?? -1) + 1;

    const created = await Category.create({ ...req.body, order: nextOrder });
    res.status(201).json(created);
  } catch (error) { next(error); }
}

export async function adminUpdate(req, res, next) {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: { message: "Not found" } });
    res.json(updated);
  } catch (error) { next(error); }
}

export async function adminRemove(req, res, next) {
  try {
    const removed = await Category.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: { message: "Not found" } });
    res.json({ ok: true, id: req.params.id });   // instead of 204
  } catch (error) { next(error); }
}

// public
export async function publicList(_req, res, next) {
  try {
    const rows = await Category.find()
      .sort({ order: 1, createdAt: 1 }) // deterministic order
      .lean();
    res.set('Cache-Control', 'no-store'); // avoid CDN/browser caching
    res.json({ rows });
  } catch (error) { next(error); }
}
