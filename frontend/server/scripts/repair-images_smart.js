// scripts/repair-images_smart.js
import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MUST match what server.js serves:
const PUBLIC_DIR = path.join(__dirname, "..", "public");

// Models (adjust paths if yours differ)
import { Partner }   from "../src/models/Partner.js";
import { Banner }    from "../src/models/Banner.js";
import { Blog }      from "../src/models/Blog.js";
import { Category }  from "../src/models/Category.js";
import { HeroSlide } from "../src/models/HeroSlide.js";

// ---- config ----
const DRY_RUN = false;    // set true to preview first
const VERBOSE = true;

// Known sections -> subfolders
const SECTIONS = ["brand", "banner", "blogs", "category", "hero"];

function listFiles(section) {
  const dir = path.join(PUBLIC_DIR, section);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile());
}

function stemOf(name) {
  const ext = path.extname(name);
  const stem = path.basename(name, ext);
  // If it ends with -digits (timestamp), drop that suffix for matching
  const m = stem.match(/^(.*?)-\d{8,}$/);
  return (m && m[1]) ? m[1] : stem;
}

function findBestByStem(targetStem, sections = SECTIONS) {
  let best = null;
  for (const sec of sections) {
    const files = listFiles(sec);
    // Prefer exact stem at start (e.g., blog-2*)
    const candidates = files
      .filter((f) => stemOf(f).startsWith(targetStem))
      .map((f) => {
        const full = path.join(PUBLIC_DIR, sec, f);
        return { section: sec, name: f, mtime: fs.statSync(full).mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime); // newest first
    if (candidates.length && (!best || candidates[0].mtime > best.mtime)) {
      best = candidates[0];
    }
  }
  return best; // { section, name, mtime } or null
}

function existsIn(section, filename) {
  return fs.existsSync(path.join(PUBLIC_DIR, section, filename));
}

function copyInto(sectionFrom, sectionTo, filename) {
  const src = path.join(PUBLIC_DIR, sectionFrom, filename);
  const dstDir = path.join(PUBLIC_DIR, sectionTo);
  const dst = path.join(dstDir, filename);
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(dstDir, { recursive: true });
  if (!DRY_RUN) fs.copyFileSync(src, dst);
  return true;
}

const asPath = (section, filename) => `/${section}/${filename}`;
const basenameOnly = (p = "") => path.basename(p || "").replace(/^[/\\]+/, "");
const sectionOf = (p = "") => (p.startsWith("/") ? p.split("/")[1] || "" : "");

async function fixOne({ Model, doc, field, targetSection, label }) {
  const display = doc.name || doc.title || doc._id;
  const raw = doc[field];
  const fname = basenameOnly(raw);
  if (!fname) return { fixed: 0, unresolved: 0 };

  const currentSection = sectionOf(raw);
  const targetFileExists = existsIn(targetSection, fname);

  // If it's already correct and exists, nothing to do.
  if (currentSection === targetSection && targetFileExists) return { fixed: 0, unresolved: 0 };

  // Determine a target stem (without timestamp)
  const desiredStem = stemOf(fname);

  // Try a best match (same stem) across sections
  const best = findBestByStem(desiredStem);
  if (!best) {
    if (VERBOSE) console.log(`❌ ${label} ${display}: no file found matching stem "${desiredStem}" in any section`);
    return { fixed: 0, unresolved: 1 };
  }

  // If the best is already in the target section, just update the path to the actual filename
  if (best.section === targetSection) {
    if (VERBOSE) console.log(`✓ ${label} ${display}: using ${asPath(best.section, best.name)}`);
    if (!DRY_RUN) await Model.updateOne({ _id: doc._id }, { $set: { [field]: asPath(best.section, best.name) } });
    return { fixed: 1, unresolved: 0 };
  }

  // Otherwise copy into target section, then update path
  if (VERBOSE) console.log(`↪ ${label} ${display}: copying ${best.name} from /${best.section} → /${targetSection}`);
  if (!copyInto(best.section, targetSection, best.name)) {
    console.log(`❌ ${label} ${display}: failed to copy ${best.name} from /${best.section}`);
    return { fixed: 0, unresolved: 1 };
  }
  if (!DRY_RUN) await Model.updateOne({ _id: doc._id }, { $set: { [field]: asPath(targetSection, best.name) } });
  return { fixed: 1, unresolved: 0 };
}

async function fixCollection({ Model, field, label, targetSection }) {
  const docs = await Model.find({ [field]: { $exists: true, $ne: null } })
    .select({ _id: 1, name: 1, title: 1, [field]: 1 })
    .lean();

  let fixed = 0, unresolved = 0;
  for (const d of docs) {
    const p = d[field];
    // Skip already-good & existing
    if (p?.startsWith(`/${targetSection}/`) && existsIn(targetSection, basenameOnly(p))) continue;

    const res = await fixOne({ Model, doc: d, field, targetSection, label });
    fixed += res.fixed;
    unresolved += res.unresolved;
  }
  console.log(`→ ${label}: processed ${docs.length}, fixed ${fixed}, unresolved ${unresolved}\n`);
}

async function main() {
  console.log("PUBLIC_DIR:", PUBLIC_DIR, "\n");
  await mongoose.connect(process.env.MONGODB_URI);

  await fixCollection({ Model: Partner,  field: "image",    label: "Partner",  targetSection: "brand"    });
  await fixCollection({ Model: Banner,   field: "image",    label: "Banner",   targetSection: "banner"   });
  await fixCollection({ Model: Blog,     field: "image",    label: "Blog",     targetSection: "blogs"    });
  await fixCollection({ Model: Category, field: "imageUrl", label: "Category", targetSection: "category" });
  await fixCollection({ Model: HeroSlide,field: "img",      label: "Hero",     targetSection: "hero"     });

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
