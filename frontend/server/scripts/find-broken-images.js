// scripts/find-broken-images.js
import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Public dir relative to server root
const PUBLIC_DIR = path.join(__dirname, "..", "public");

// ✅ Models relative to server/src
import { Partner }   from "../src/models/Partner.js";
import { Banner }    from "../src/models/Banner.js";
import { Blog }      from "../src/models/Blog.js";
import { Category }  from "../src/models/Category.js";
import { HeroSlide } from "../src/models/HeroSlide.js";

// ----- helpers -----
function onDisk(relPath) {
  if (!relPath || typeof relPath !== "string") return false;
  const cleaned = relPath.replace(/^[\\/]+/, ""); // strip leading / or \
  const fp = path.join(PUBLIC_DIR, cleaned);
  return fs.existsSync(fp);
}

async function report(Model, field, label) {
  const docs = await Model.find({ [field]: { $exists: true, $ne: null } })
    .select({ _id: 1, name: 1, title: 1, [field]: 1 })
    .lean();

  let missing = 0;
  for (const d of docs) {
    const p = d[field];
    if (!onDisk(p)) {
      missing++;
      console.log(
        `❌ ${label} ${d._id} ${d.name || d.title || ""} → ${p} (missing on disk)`
      );
    }
  }
  console.log(`→ ${label}: checked ${docs.length}, missing ${missing}\n`);
}

// ----- main -----
async function main() {
  console.log("PUBLIC_DIR:", PUBLIC_DIR);
  await mongoose.connect(process.env.MONGODB_URI, {
    // if you use a separate DB name via env, you can add:
    // dbName: process.env.MONGODB_DBNAME,
  });

  await report(Partner,  "image",    "Partner");
  await report(Banner,   "image",    "Banner");
  await report(Blog,     "image",    "Blog");
  await report(Category, "imageUrl", "Category");
  await report(HeroSlide,"img",      "Hero");

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
