import { Partner } from "../models/Partner.js";

export async function publicList(_req, res, next) {
    try {
        const rows = await Partner.find({ isActive: true })
        .sort({ order:1 })
        .lean()
        res.json({ rows });
    } catch (error) {
        next(error);
    }
}

export async function adminList(_req, res, next) {
    try {
        const rows = await Partner.find().sort({ order: 1 }).lean();
        res.json({ rows });
    } catch (error) {
        next(error);
    }
}

export async function adminCreate(req, res, next) {
    try {
        const created = await Partner.create(req.body);
        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
}

export async function adminUpdate(req, res, next) {
    try {
        const updated = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: "Not found" });
        res.json(updated);
    } catch (error) { 
        next(error);
    }
}

export async function adminRemove(req, res, next) {
    try {
        await Partner.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
}