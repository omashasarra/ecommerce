// src/controllers/product.controller.js
import LiteProduct from '../models/product.model.js';

export async function list(req, res, next) {
  try { res.json(await LiteProduct.find().sort({ createdAt: -1 })); }
  catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    // 🔧 was Product.create(...) which isn't imported; use LiteProduct
    const created = await LiteProduct.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const item = await LiteProduct.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await LiteProduct.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
}
