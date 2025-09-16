import path from "path";
import { Partner } from "../models/Partner.js";

function filenameFromUpload(req) {
  return req?.file?.filename ? `/brand/${req.file.filename}` : "";
}
function filenameOnly(p) {
  if (!p) return "";
  return path.basename(p);
}

export async function publicList(_req, res, next) {
  try {
    const rows = await Partner.find({ isActive: true }).sort({ order: 1 }).lean();
    res.json({ rows });
  } catch (error) { next(error); }
}

export async function adminList(_req, res, next) {
  try {
    const rows = await Partner.find().sort({ order: 1 }).lean();
    res.json({ rows });
  } catch (error) { next(error); }
}

export async function adminCreate(req, res, next) {
  try {
    console.log("[partners.create] body:", req.body);
    console.log("[partners.create] file:", req.file?.filename);

    const payload = { ...req.body };

    if (req.file) {
      payload.image = filenameFromUpload(req);
    } else if (payload.image) {
      payload.image = `/brand/${filenameOnly(payload.image)}`;
    }

    if (!payload.image) {
      return res.status(400).json({ error: "Image is required" });
    }

    payload.order = Number(payload.order) || 0;
    payload.isActive = String(payload.isActive) === "true";

    const created = await Partner.create(payload);
    res.status(201).json(created);
  } catch (err) { next(err); }
}

export async function adminUpdate(req, res, next) {
  try {
    console.log("[partners.update] body:", req.body);
    console.log("[partners.update] file:", req.file?.filename);

    const update = { ...req.body };

    if (req.file) {
      update.image = filenameFromUpload(req);
    } else if (update.image) {
      update.image = `/brand/${filenameOnly(update.image)}`;
    }
    if (update.order !== undefined) update.order = Number(update.order) || 0;
    if (update.isActive !== undefined) update.isActive = String(update.isActive) === "true";

    const updated = await Partner.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function adminRemove(req, res, next) {
  try {
    await Partner.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) { next(error); }
}
