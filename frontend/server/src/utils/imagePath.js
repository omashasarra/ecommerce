export function fileNameOnly(p = "") {
  if (!p) return "";
  const i = p.lastIndexOf("/");
  return i >= 0 ? p.slice(i + 1) : p;
}

export function normalizeImagePath(section, reqFile, incomingPath) {
  if (reqFile?.filename) return `/${section}/${reqFile.filename}`;
  const name = fileNameOnly(incomingPath);
  return name ? `/${section}/${name}` : undefined;
}
