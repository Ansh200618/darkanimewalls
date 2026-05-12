const CLOUDINARY_TAG = process.env.CLOUDINARY_TAG || "dark-anime-walls";

function cleanContext(resource) {
  return resource.context && resource.context.custom ? resource.context.custom : {};
}

function safeDownloadName(resource, title) {
  const fallback = (resource.public_id || "wallpaper").split("/").pop();
  const baseName = String(title || fallback || "wallpaper").trim();
  const normalized = baseName
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "wallpaper";

  return resource.format ? `${normalized}.${resource.format}` : normalized;
}

function originalDownloadUrlWithName(resource, filename) {
  if (!resource.secure_url) return "";
  const encodedFilename = encodeURIComponent(filename);
  return resource.secure_url.replace("/upload/", `/upload/fl_attachment:${encodedFilename}/`);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(500).json({ error: "Cloudinary environment variables are missing." });
    return;
  }

  try {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/${encodeURIComponent(CLOUDINARY_TAG)}?max_results=100&context=true`;
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` }
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data.error?.message || "Unable to fetch Cloudinary wallpapers." });
      return;
    }

    const wallpapers = (data.resources || [])
      .filter(resource => !resource.tags?.includes("hidden"))
      .map(resource => {
        const ctx = cleanContext(resource);
        const title = ctx.title || resource.public_id.split("/").pop().replace(/[-_]/g, " ");
        const downloadName = safeDownloadName(resource, title);
        const type = ctx.type || (resource.width > resource.height ? "Desktop 16:9" : "Mobile 9:16");
        const resolution = `${resource.width}x${resource.height}`;

        return {
          public_id: resource.public_id,
          title,
          category: ctx.category || "Dark Anime",
          type,
          mood: ctx.mood || "Mixed",
          tags: resource.tags || [],
          description: ctx.description || "Premium dark anime wallpaper.",
          resolution,
          width: resource.width,
          height: resource.height,
          imageUrl: resource.secure_url,
          downloadName,
          downloadUrl: originalDownloadUrlWithName(resource, downloadName),
          createdAt: resource.created_at
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ wallpapers });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error." });
  }
};
