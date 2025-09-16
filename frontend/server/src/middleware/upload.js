import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");

function deleteOlderVariants(dir, base) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  const prefix = `${base}`; 
  for (const name of entries) {
    const ext = path.extname(name);
    const stem = path.basename(name, ext);

    if (stem === prefix || stem.startsWith(prefix + "-")) {
      try {
        fs.unlinkSync(path.join(dir, name));
      } catch {
      }
    }
  }
}

function makeUploader(subdir) {
  const uploadRoot = path.join(PUBLIC_DIR, subdir);
  fs.mkdirSync(uploadRoot, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadRoot),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path
        .basename(file.originalname, ext)
        .replace(/\s+/g, "-")
        .toLowerCase();

      try {
        deleteOlderVariants(uploadRoot, base);
      } catch {
      }
      const ts = Date.now();
      cb(null, `${base}-${ts}${ext.toLowerCase()}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
      if (!/^image\//.test(file.mimetype)) {
        return cb(new Error("Only image uploads are allowed"));
      }
      cb(null, true);
    },
  });
}

export const uploadBrand   = makeUploader("brand");
export const uploadBanner  = makeUploader("banner");
export const uploadCategory= makeUploader("category");
export const uploadBlog    = makeUploader("blogs");
export const uploadHero    = makeUploader("hero");
export const uploadProduct = makeUploader("product");
