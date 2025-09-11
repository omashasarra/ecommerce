// server/src/controllers/banner.controller.js
import { Banner } from "../models/Banner.js";

/** PUBLIC: return active banners (optionally filtered by position) */
// at top (or inside the file)
function toWebPath(v = "") {
  if (!v) return "";
  // normalize slashes and trim
  let p = String(v).replace(/\\/g, "/").trim();
  // if the value includes "public/", drop it (public is web root)
  if (p.startsWith("public/")) p = p.slice("public/".length);
  // ensure leading slash
  if (!p.startsWith("/")) p = "/" + p;
  return p;
}

export async function publicList(req, res, next) {
  try {
    const { position } = req.query;
    const filter = { isActive: true, ...(position ? { position } : {}) };
    const rows = await Banner.find(filter).sort({ order: 1, createdAt: 1 }).lean();

    const mapped = rows.map(b => ({
      ...b,
      imageUrl: toWebPath(b.image || b.imagePath || ""), // supports either field name
    }));

    res.json({ rows: mapped });
  } catch (err) {
    next(err);
  }
}


/** ADMIN: list all banners */
export async function adminList(_req, res, next) {
  try {
    const rows = await Banner.find({}).sort({ order: 1, createdAt: 1 }).lean();
    res.json({ rows });
  } catch (err) {
    next(err);
  }
}

/** ADMIN: get one */
export async function adminGetOne(req, res, next) {
  try {
    const row = await Banner.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: { message: "Not found" } });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

/** ADMIN: create */
export async function adminCreate(req, res, next) {
  try {
    const created = await Banner.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

/** ADMIN: update */
export async function adminUpdate(req, res, next) {
  try {
    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: { message: "Not found" } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/** ADMIN: delete */
export async function adminRemove(req, res, next) {
  try {
    const removed = await Banner.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: { message: "Not found" } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

