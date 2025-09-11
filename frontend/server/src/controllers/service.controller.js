import { ServiceFeature } from "../models/ServiceFeature.js";

export async function adminList(req, res, next) {
  try {
    const rows = await ServiceFeature.find().sort({ order: 1, updatedAt: -1 }).lean();
    res.json({ ok: true, rows });
  } catch (e) { next(e); }
}

export async function adminGetOne(req, res, next) {
  try {
    const row = await ServiceFeature.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ ok:false, error:"Not found" });
    res.json({ ok:true, data: row });
  } catch (e) { next(e); }
}

export async function adminCreate(req, res, next) {
  try {
    const max = await ServiceFeature.findOne({}, { order:1 }).sort({ order:-1 }).lean();
    const nextOrder = (max?.order ?? -1) + 1;
    const created = await ServiceFeature.create({ ...req.body, order: req.body.order ?? nextOrder });
    res.status(201).json({ ok:true, data: created });
  } catch (e) { next(e); }
}

export async function adminUpdate(req, res, next) {
  try {
    const updated = await ServiceFeature.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if (!updated) return res.status(404).json({ ok:false, error:"Not found" });
    res.json({ ok:true, data: updated });
  } catch (e) { next(e); }
}

export async function adminRemove(req, res, next) {
  try {
    const removed = await ServiceFeature.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ ok:false, error:"Not found" });
    res.json({ ok:true, id: req.params.id });
  } catch (e) { next(e); }
}

export async function publicList(_req, res, next) {
  try {
    const rows = await ServiceFeature.find({ isActive: true }).sort({ order:1, createdAt:1 }).lean();
    res.set("Cache-Control", "no-store");
    res.json({ ok:true, rows });
  } catch (e) { next(e); }
}
