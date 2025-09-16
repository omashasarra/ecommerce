// scripts/repair-images.js
import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

// ---- resolve paths ----
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
let DRY_RUN = false;       
const VERBOSE = true;

// Known sections -> subfolders
const SECTIONS = ["brand", "banner", "blogs", "category", "hero"];

function basenameOnly(p = "") {
  if (!p) return "";
  return path.basename(p).replace(/^[/\\]+/, "");
}
function sectionOf(p = "") {
  if (!p.startsWith("/")) return "";
  const [, sec] = p.split("/");
  return sec || "";
}
function existsIn(section, filename) {
  const fp = path.join(PUBLIC_DIR, section, filename);
  return fs.existsSync(fp);
}
function copyBetween(sectionFrom, sectionTo, filename) {
  const src = path.join(PUBLIC_DIR, sectionFrom, filename);
  const dstDir = path.join(PUBLIC_DIR, sectionTo);
  const dst = path.join(dstDir, filename);
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(dstDir, { recursive: true });
  if (!DRY_RUN) fs.copyFileSync(src, dst);
  return true;
}
function targetPath(section, filename) {
  return `/${section}/${filename}`;
}

async function fixCollection({ Model, field, label, targetSection }) {
  const docs = await Model.find({ [field]: { $exists: true, $ne: null } })
    .select({ _id: 1, name: 1, title: 1, [field]: 1 })
    .lean();

  let fixed = 0, unresolved = 0;
  for (const d of docs) {
    const display = d.name || d.title || d._id;
    const raw = d[field];

    // Parse input
    const fname = basenameOnly(raw);
    if (!fname) continue;

    // Where does it claim to live now?
    const claimedSection = sectionOf(raw);
    const isBare = !raw.startsWith("/");

    // Case A: correct & file exists -> nothing to do
    if (!isBare && claimedSection === targetSection && existsIn(targetSection, fname)) continue;

    // Case B: correct section but file missing -> try to recover from other sections
    if (!isBare && claimedSection === targetSection && !existsIn(targetSection, fname)) {
      // try to copy from another section if same filename exists there
      let recovered = false;
      for (const sec of SECTIONS) {
        if (sec === targetSection) continue;
        if (existsIn(sec, fname)) {
          if (VERBOSE) console.log(`↪ ${label} ${display}: copying ${fname} from /${sec} → /${targetSection}`);
          if (copyBetween(sec, targetSection, fname)) {
            if (!DRY_RUN) await Model.updateOne({ _id: d._id }, { $set: { [field]: targetPath(targetSection, fname) } });
            fixed++;
            recovered = true;
          }
          break;
        }
      }
      if (!recovered) {
        console.log(`❌ ${label} ${display}: ${targetPath(targetSection, fname)} missing and not found elsewhere`);
        unresolved++;
      }
      continue;
    }

    // Case C: bare filename -> normalize to target section (and ensure file is there)
    if (isBare) {
      // If file already in target section, just update path
      if (existsIn(targetSection, fname)) {
        if (VERBOSE) console.log(`✓ ${label} ${display}: prefixing bare filename → ${targetPath(targetSection, fname)}`);
        if (!DRY_RUN) await Model.updateOne({ _id: d._id }, { $set: { [field]: targetPath(targetSection, fname) } });
        fixed++;
        continue;
      }
      // Else copy from any other section that has it
      let copied = false;
      for (const sec of SECTIONS) {
        if (sec === targetSection) continue;
        if (existsIn(sec, fname)) {
          if (VERBOSE) console.log(`↪ ${label} ${display}: copying bare ${fname} from /${sec} → /${targetSection}`);
          if (copyBetween(sec, targetSection, fname)) {
            if (!DRY_RUN) await Model.updateOne({ _id: d._id }, { $set: { [field]: targetPath(targetSection, fname) } });
            fixed++;
            copied = true;
          }
          break;
        }
      }
      if (!copied) {
        console.log(`❌ ${label} ${display}: bare "${fname}" not found on disk; please re-upload`);
        unresolved++;
      }
      continue;
    }

    // Case D: points to a different section (e.g. /blogs/x.jpg) -> copy into target & update
    if (claimedSection && claimedSection !== targetSection) {
      if (existsIn(claimedSection, fname)) {
        if (VERBOSE) console.log(`↪ ${label} ${display}: copying ${fname} from /${claimedSection} → /${targetSection}`);
        if (copyBetween(claimedSection, targetSection, fname)) {
          if (!DRY_RUN) await Model.updateOne({ _id: d._id }, { $set: { [field]: targetPath(targetSection, fname) } });
          fixed++;
        }
      } else {
        console.log(`❌ ${label} ${display}: ${raw} not found; cannot copy`);
        unresolved++;
      }
      continue;
    }
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
