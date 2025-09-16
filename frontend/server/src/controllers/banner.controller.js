import { Banner } from "../models/Banner.js";
import { normalizeImagePath } from "../utils/imagePath.js";

function filenameFromUpload(req) {
  return req?.file?.filename || "";
}

function filenameOnly(p) {
  if (!p) return "";
  const i = p.lastIndexOf("/");
  return i >= 0 ? p.slice(i + 1) : p;
}

export async function publicList(_req, res, next) {
  try {
    const rows = await Banner.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json({ rows });
  } catch (err) { next(err); }
}

export async function adminList(_req, res, next) {
  try {
    const rows = await Banner.find({}).sort({ createdAt: -1 });
    res.json({ rows });
  } catch (err) { next(err); }
}

export async function adminGetOne(req, res, next) {
  try {
    const row = await Banner.findById(req.params.id);
    if (!row) return res.status(404).json({ error: { message: "Not found" } });
    res.json(row);
  } catch (err) { next(err); }
}

export async function adminCreate(req, res, next) {
  try {
    const body = { ...req.body };
   body.image = normalizeImagePath("banner", req.file, body.image);

    if (body.order !== undefined) body.order = Number(body.order) || 0;
    const created = await Banner.create(body);
    res.status(201).json(created);
  } catch (err) { next(err); }
}

export async function adminUpdate(req, res, next) {
  try {
    const body = { ...req.body };
   const normalized = normalizeImagePath("banner", req.file, body.image);
   if (normalized) body.image = normalized;
    if (body.order !== undefined) body.order = Number(body.order) || 0;

    const updated = await Banner.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!updated) return res.status(404).json({ error: { message: "Not found" } });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function adminRemove(req, res, next) {
  try {
    const removed = await Banner.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: { message: "Not found" } });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
