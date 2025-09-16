import {Selling} from "../models/Selling.js"

function normalizeFeatures(input) {
    if (Array.isArray(input)) {
        return input.map(String).map( s => s.trim()).filter(Boolean);
    }
    if (typeof input === "string") {
        return input 
    }
}

export async function listPublic(req, res, next) {
  try {
    const rows = await Selling.find({ active: true }).sort({ createdAt: 1 }).lean();
    res.json({ rows });
  } catch (e) { next(e); }
}

export async function listAdmin(req, res, next) {
  try {
    const rows = await Selling.find({}).sort({ updatedAt: -1 }).lean();
    res.json({ rows });
  } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const row = await Selling.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: { message: "Not found" } });
    res.json(row);
  } catch (e) { next(e); }
}

export async function createOne(req, res, next) {
  try {
    // expect features as an ARRAY already
    const created = await Selling.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

export async function updateOne(req, res, next) {
  try {
    const updated = await Selling.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: { message: "Not found" } });
    res.json(updated);
  } catch (e) { next(e); }
}

export async function removeOne(req, res, next) {
  try {
    const removed = await Selling.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: { message: "Not found" } });
    res.json({ ok: true });
  } catch (e) { next(e); }
}
