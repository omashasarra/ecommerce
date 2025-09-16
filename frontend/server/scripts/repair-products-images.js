// server/scripts/repair-products-images.js
import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

// --- paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const PRODUCT_DIR = path.join(PUBLIC_DIR, "product");

// --- model (default export in your repo) ---
import Product from "../src/models/Product.js";

// --- helpers ---
const existsLocal = (url = "") => {
  if (!url || !url.startsWith("/product/")) return false;
  const abs = path.join(PRODUCT_DIR, url.replace("/product/", ""));
  return fs.existsSync(abs);
};

const normalize = (u = "") => {
  const v = (u || "").trim().replace(/\\/g, "/");
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;         // allow remote
  if (v.startsWith("/product/")) return v;        // already normalized
  if (v.startsWith("product/")) return `/${v}`;   // add leading slash
  return `/product/${v.replace(/^\/+/, "")}`;     // bare filename -> product
};

const stemOf = (name) => {
  const base = name.replace(/\.(png|jpg|jpeg|webp|gif)$/i, "");
  const m = base.match(/^(.*?)-\d{8,}$/); // strip trailing -timestamp if any
  return m ? m[1] : base;
};

// replace previous findTimestampedMatch with this:
const findLooseMatch = (want) => {
  // want e.g. "speaker-1757999789959.png" or "p-2.jpg"
  if (!fs.existsSync(PRODUCT_DIR)) return null;
  const files = fs.readdirSync(PRODUCT_DIR);

  // derive a stem without timestamp and without extension
  const stripExt = (n) => n.replace(/\.(png|jpg|jpeg|webp|gif)$/i, "");
  const stemOf  = (n) => {
    const base = stripExt(n);
    const m = base.match(/^(.*?)-\d{8,}$/);
    return m ? m[1] : base; // "speaker-1757..." -> "speaker"
  };

  const targetStem = stemOf(want).toLowerCase();

  // rank candidates: exact stem match first, then files starting with the stem
  const candidates = files
    .map((f) => ({ f, stem: stemOf(f).toLowerCase(), mtime: fs.statSync(path.join(PRODUCT_DIR, f)).mtimeMs }))
    .filter((x) => x.stem === targetStem || x.f.toLowerCase().startsWith(targetStem))
    .sort((a, b) => b.mtime - a.mtime); // newest first

  return candidates[0]?.f || null; // filename or null
};


async function main() {
  console.log("PUBLIC_DIR:", PUBLIC_DIR);
  await mongoose.connect(process.env.MONGODB_URI);

  const rows = await Product.find({}, { title: 1, imageURL: 1 }).lean();
  let fixed = 0, warn = 0;

  for (const r of rows) {
    const before = (r.imageURL || "").trim();
    let after = normalize(before);

    // If already OK and file exists (for local paths), skip.
    if (after && (after.startsWith("http") || existsLocal(after))) continue;

    // If it’s a local path but file missing, try to map "p-2.jpg" -> "p-2-<timestamp>.jpg"
    if (after && after.startsWith("/product/")) {
      const filename = after.replace("/product/", "");
      const abs = path.join(PRODUCT_DIR, filename);
      if (!fs.existsSync(abs)) {
        const alt = findLooseMatch(filename);
        if (alt) {
          after = `/product/${alt}`;
        }
      }
    }

    // If still missing and not remote, warn and continue (re-upload needed)
    if (after && after.startsWith("/product/") && !existsLocal(after)) {
      console.log(`❌ ${r.title || r._id}: file not found -> ${after}`);
      warn++;
      continue;
    }

    if (before !== after) {
      await Product.updateOne({ _id: r._id }, { $set: { imageURL: after } });
      console.log(`✓ UPDATED ${r.title || r._id}: ${before || "(empty)"} -> ${after}`);
      fixed++;
    }
  }

  console.log(`\nProducts checked: ${rows.length}, updated: ${fixed}, unresolved: ${warn}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
