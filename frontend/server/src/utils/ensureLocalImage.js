// server/src/utils/ensureLocalImage.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const PRODUCT_DIR = path.join(PUBLIC_DIR, "product");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeBase(name = "img") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\-_.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "img";
}

function pickExtFromContentType(ct = "") {
  ct = ct.toLowerCase();
  if (ct.includes("image/png")) return "png";
  if (ct.includes("image/webp")) return "webp";
  if (ct.includes("image/jpeg") || ct.includes("image/jpg")) return "jpg";
  if (ct.includes("image/gif")) return "gif";
  return "jpg";
}

function extFromUrl(u = "") {
  const m = u.toLowerCase().match(/\.(png|jpe?g|webp|gif)(?:\?|#|$)/);
  return m ? m[1].replace("jpeg", "jpg") : null;
}

function writeBufferToProductDir(base, ext, buf) {
  ensureDir(PRODUCT_DIR);
  const filename = `${safeBase(base)}-${Date.now()}.${ext}`;
  const abs = path.join(PRODUCT_DIR, filename);
  fs.writeFileSync(abs, buf);
  return `/product/${filename}`;
}

function existsLocalProductUrl(url = "") {
  if (!url.startsWith("/product/")) return false;
  const abs = path.join(PRODUCT_DIR, url.replace("/product/", ""));
  return fs.existsSync(abs);
}

// data:image/png;base64,....
function decodeDataUrl(dataUrl) {
  const m = /^data:(.+?);base64,(.+)$/i.exec(dataUrl);
  if (!m) return null;
  const contentType = m[1];
  const buf = Buffer.from(m[2], "base64");
  return { buf, ext: pickExtFromContentType(contentType) };
}

/**
 * Ensure we end up with a local /product/<file> URL, regardless of input.
 * Accepts:
 *  - req.file from multer (preferred)
 *  - body.imageURL as:
 *      • /product/<file> (kept if exists)
 *      • bare filename like "foo.jpg" (normalized if exists)
 *      • http(s) URL (downloaded and stored locally)
 *      • data: URL (decoded and stored locally)
 *
 * Throws an Error if we cannot produce a local file.
 */
export async function ensureLocalProductImage({ file, imageURL }) {
  // 1) Multer upload wins
  if (file?.filename) {
    return `/product/${file.filename}`;
  }

  const raw = (imageURL || "").trim();
  if (!raw) throw new Error("No image provided");

  // 2) Already a local /product URL
  if (raw.startsWith("/product/")) {
    if (existsLocalProductUrl(raw)) return raw;
    throw new Error(`Local image not found: ${raw}`);
  }

  // 3) Bare filename -> look inside /public/product
  if (!raw.startsWith("http://") && !raw.startsWith("https://") && !raw.startsWith("data:")) {
    const abs = path.join(PRODUCT_DIR, raw.replace(/^[/\\]+/, ""));
    if (fs.existsSync(abs)) return `/product/${path.basename(abs)}`;
    throw new Error(`Filename not found in /public/product: ${raw}`);
  }

  // 4) data: URL -> decode & store
  if (raw.startsWith("data:")) {
    const decoded = decodeDataUrl(raw);
    if (!decoded) throw new Error("Invalid data URL");
    return writeBufferToProductDir("img", decoded.ext, decoded.buf);
  }

  // 5) http(s) URL -> download & store using native fetch (Node 18+)
  const url = raw;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
  const ct = res.headers.get("content-type") || "";
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extFromUrl(url) || pickExtFromContentType(ct);
  const base = safeBase(path.basename(new URL(url).pathname).replace(/\.[^.]+$/, "")) || "img";
  return writeBufferToProductDir(base, ext, buf);
}
