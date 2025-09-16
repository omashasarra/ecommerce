import { HeroSlide } from "../models/HeroSlide.js";

export async function adminList (req, res, next) {
    try {
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "10", 10), 1), 100);
        const search = (req.query.search || "").trim();
        const sortBy = req.query.sortBy || "createdAt";
        const sortDir = req.query.sortDir === "asc" ? 1 : -1;

        const filter = search ? {
            $or: [
                { subtitle: new RegExp(search, "i") },
                { title: new RegExp(search, "i") },
                { title2: new RegExp(search, "i") },
            ]
        } : {};

        const [rows, total] = await Promise.all([
            HeroSlide.find(filter).sort({ [sortBy]: sortDir }).skip((page - 1) * pageSize).limit(pageSize).lean(),
            HeroSlide.countDocuments(filter),
        ]);

        res.json({ rows, total, page, pageSize });
    } catch (error) {
        next(error);
    }
}

export async function adminGetOne(req, res, next){
    try {
        const row = await HeroSlide.findById(req.params.id).lean();
        if (!row) return res.status(404).json({error: {message: "Not found"} });
        res.json(row);
    } catch (error) {
        next(error);
    }
}

export async function adminCreate (req, res, next) {
  try {
    const fileImg = req.file ? `/hero/${req.file.filename}` : undefined;

    const maxOrderDoc = await HeroSlide.findOne({}, { order: 1 }).sort({ order: -1 }).lean();
    const nextOrder = (maxOrderDoc?.order ?? -1) + 1;

    const payload = { ...req.body, order: req.body.order ?? nextOrder };
    if (fileImg) payload.img = fileImg;

    if (!payload.img) {
      return res.status(400).json({ error: { message: "img is required" } });
    }

    const created = await HeroSlide.create(payload);
    res.status(201).json(created);
  } catch (error) { next(error); }
}

export async function adminUpdate(req, res, next) {
  try {
    const update = { ...req.body };
    if (req.file) {
      update.img = `/hero/${req.file.filename}`;
    }
    const updated = await HeroSlide.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: { message: "Not found" } });
    res.json(updated);
  } catch (error) { next(error); }
}

export async function adminRemove(req, res, next) {
    try {
        const removed = await HeroSlide.findByIdAndDelete(req.params.id);
        if (!removed) return res.status(404).json({ error: { message: "Not found" } });
        res.json({ ok: true, id: req.params.id });
    } catch (error) {
        next(error);
    }
}

export async function publicList(_req, res, next) {
    try {
        const rows = await HeroSlide.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .lean();
        res.set("Cache-Control", "no_store");
        res.json({ rows });
    } catch (error) {
        next(error);
    }
}