import { Blog } from "../models/Blog.js";

// GET /api/blogs/admin
export async function adminList(req, res, next) {
  try {
    const page     = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "10", 10), 1), 100);
    const search   = (req.query.search || "").trim();
    const sortBy   = req.query.sortBy || "updatedAt"; // keep close to your original
    const sortDir  = req.query.sortDir === "asc" ? 1 : -1;

    const filter = search
      ? {
          $or: [
            { title:   new RegExp(search, "i") },
            { excerpt: new RegExp(search, "i") },
            { content: new RegExp(search, "i") },
          ],
        }
      : {};

    const [rows, total] = await Promise.all([
      Blog.find(filter)
        .sort({ [sortBy]: sortDir, order: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    res.json({
      ok: true,
      data: rows,
      pagination: { total, page, pages: Math.ceil(total / pageSize), pageSize },
    });
  } catch (error) { next(error); }
}

// GET /api/blogs/admin/:id
export async function adminGetOne(req, res, next) {
  try {
    const row = await Blog.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, data: row });
  } catch (error) { next(error); }
}

// POST /api/blogs/admin
export async function adminCreate(req, res, next) {
  try {
    // optional: auto-increment `order` similar to your Category controller
    const maxOrderDoc = await Blog.findOne({}, { order: 1 }).sort({ order: -1 }).lean();
    const nextOrder = (maxOrderDoc?.order ?? -1) + 1;

    const created = await Blog.create({ ...req.body, order: req.body.order ?? nextOrder });
    res.status(201).json({ ok: true, data: created });
  } catch (error) { next(error); }
}

// PUT /api/blogs/admin/:id
export async function adminUpdate(req, res, next) {
  try {
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, data: updated });
  } catch (error) { next(error); }
}

// DELETE /api/blogs/admin/:id
export async function adminRemove(req, res, next) {
  try {
    const removed = await Blog.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, id: req.params.id });
  } catch (error) { next(error); }
}


// GET /api/blogs
export async function publicList(req, res, next) {
  try {
    const limit     = Math.min(parseInt(req.query.limit) || 9, 100);
    const page      = Math.max(parseInt(req.query.page) || 1, 1);
    const activeOnly = String(req.query.active ?? "1") === "1";

    const filter = activeOnly ? { isActive: true } : {};

    const [total, items] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter)
        .sort({ order: 1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    res.set("Cache-Control", "no-store"); // consistent with your categories controller note
    res.json({
      ok: true,
      data: items,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (error) { next(error); }
};

export async function publicGetOne(req, res, next) {
  try {
    const row = await Blog.findById(req.params.id).lean();
    if (!row || !row.isActive) {
      return res.status(404).json({ ok: false, error: "Not found" });
    }
    res.json({ ok: true, data: row });
  } catch (err) { next(err); }
}

