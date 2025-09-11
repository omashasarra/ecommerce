import Block, { VALID_TYPES } from '../models/block.model.js';

function ensureValidType(t) {
  if (!VALID_TYPES.includes(t)) {
    const list = VALID_TYPES.join(', ');
    const err = new Error(`Invalid type. Must be one of: ${list}`);
    err.status = 400; throw err;
  }
}

export async function listByType(req, res, next) {
  try {
    const { type } = req.params; ensureValidType(type);
    const items = await Block.find({ type }).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { type } = req.params; ensureValidType(type);
    const payload = { ...req.body, type };
    const item = await Block.create(payload);
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const item = await Block.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await Block.findByIdAndDelete(id);
    res.status(204).end();
  } catch (e) { next(e); }
}