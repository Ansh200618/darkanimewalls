const { Readable } = require("node:stream");

function safeFileName(value) {
  const cleaned = String(value || "wallpaper")
    .replace(/[\\/:*?"<>|\r\n]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "wallpaper";
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const source = new URL(String(req.query?.url || ""));
    if (source.protocol !== "https:" || source.hostname !== "res.cloudinary.com") {
      res.status(400).json({ error: "Invalid wallpaper URL" });
      return;
    }

    const response = await fetch(source, { redirect: "follow" });
    if (!response.ok || !response.body) {
      res.status(response.status || 502).json({ error: "Unable to download wallpaper" });
      return;
    }

    const fileName = safeFileName(req.query?.name);
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (contentLength) res.setHeader("Content-Length", contentLength);

    Readable.fromWeb(response.body).pipe(res);
  } catch {
    res.status(400).json({ error: "Invalid wallpaper download request" });
  }
};
