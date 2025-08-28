import Product from '../models/product.model.js';

export async function list(req, res, next) {
  try { res.json(await Product.find().sort({ createdAt: -1 })); }
  catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { res.status(201).json(await Product.create(req.body)); }
  catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const item = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
}
