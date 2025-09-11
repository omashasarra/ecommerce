// src/controllers/footer.controller.js
import Footer from "../models/Footer.js";

/**
 * GET /api/footer
 * Public endpoint → returns the active footer (or latest). If DB empty, returns safe minimal defaults.
 */
export const footerPublic = async (req, res) => {
  try {
    const active = await Footer.findOne({ isActive: true })
      .sort({ updatedAt: -1 })
      .lean();

    if (active) return res.json(active);

    // Fallback (keeps public site rendering before you seed)
    return res.json({
      companyName: "Eshop",
      aboutText:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo voluptatibus poss",
      madeBy: "Made by Sara",
      address: "Nabatieh, Hasbaya",
      phone: "+ 961 123 456",
      socials: { instagram: "", facebook: "", linkedin: "" },
      importantLinks: [],
      quickLinks: [],
      isActive: true,
      _id: null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * GET /api/footer/admin
 * Admin → fetch the single current footer doc (prefers active, else latest)
 */
export const footerAdminGet = async (req, res) => {
  try {
    let doc =
      (await Footer.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await Footer.findOne().sort({ updatedAt: -1 }));

    if (!doc) {
      // No doc yet; return an empty shell (admin UI can show defaults)
      return res.json(null);
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * PUT /api/footer/admin
 * Admin → upsert (single document). Pass the whole footer payload in req.body
 * If body._id exists → updateById, else upsert a single global record.
 */
export const footerAdminSave = async (req, res) => {
  try {
    const payload = sanitizeFooterPayload(req.body);

    if (payload._id) {
      const updated = await Footer.findByIdAndUpdate(payload._id, payload, {
        new: true,
        runValidators: true,
      });
      if (!updated) return res.status(404).json({ message: "Footer not found" });
      return res.json(updated);
    }

    // No _id → upsert the "singleton" footer (keep only one doc logic)
    const updated = await Footer.findOneAndUpdate(
      {},                     // match first doc
      { $set: payload },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Invalid payload" });
  }
};

// --- helpers ---
function sanitizeFooterPayload(body) {
  const toLinks = (arr) =>
    Array.isArray(arr)
      ? arr
          .filter((x) => x && (x.title?.trim() || x.link?.trim()))
          .map((x) => ({
            title: String(x.title || "").trim(),
            link: String(x.link || "").trim(),
            order: typeof x.order === "number" ? x.order : parseInt(x.order || 0, 10) || 0,
          }))
      : [];

  return {
    _id: body._id || undefined,
    companyName: (body.companyName ?? "Eshop").toString().trim(),
    aboutText: (body.aboutText ?? "").toString(),
    madeBy: (body.madeBy ?? "").toString(),
    address: (body.address ?? "").toString(),
      phone: (body.phone ?? "").toString(),
      socials: {
        instagram: (body.socials?.instagram ?? "").toString(),
        facebook: (body.socials?.facebook ?? "").toString(),
        linkedin: (body.socials?.linkedin ?? "").toString(),
      },
      importantLinks: toLinks(body.importantLinks),
      quickLinks: toLinks(body.quickLinks),
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    };
  }