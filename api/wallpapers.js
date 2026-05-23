const CLOUDINARY_TAG = process.env.CLOUDINARY_TAG || "dark-anime-walls";

function cleanContext(resource) {
  return resource.context && resource.context.custom ? resource.context.custom : {};
}

function safeDownloadName(resource, title) {
  const fallback = (resource.public_id || "wallpaper").split("/").pop();
  const baseName = String(title || fallback || "wallpaper").trim();
  const normalized = baseName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "wallpaper";

  return resource.format ? `${normalized}.${resource.format}` : normalized;
}

function buildCloudinaryDownloadUrl(resource, downloadName = "") {
  if (!resource.secure_url) return "";
  try {
    const url = new URL(resource.secure_url);
    url.searchParams.set("dl", downloadName || safeDownloadName(resource));
    return url.toString();
  } catch {
    return resource.secure_url;
  }
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function parseTimestamp(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return timestamp;
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map(item => String(item || "").trim())
    .filter(Boolean);
}

function isStudioAuthorized(req, studioPassword) {
  if (!studioPassword) return false;
  const provided =
    req.headers?.["x-studio-password"] ||
    req.query?.password ||
    req.query?.studioPassword ||
    "";
  return String(provided) === String(studioPassword);
}

function isStudioAccessRequest(req) {
  return parseBoolean(req.query?.studio);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const studioPassword = process.env.STUDIO_PASSWORD;
  const studioAccessRequested = isStudioAccessRequest(req);
  const isAuthorizedStudio = isStudioAuthorized(req, studioPassword);

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(500).json({ error: "Cloudinary environment variables are missing." });
    return;
  }

  if (studioAccessRequested && !isAuthorizedStudio) {
    res.status(401).json({ error: "Invalid studio password." });
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

    const showAll = isAuthorizedStudio;
    const now = Date.now();

    const wallpapers = (data.resources || [])
      .filter(resource => !resource.tags?.includes("hidden"))
      .map(resource => {
        const ctx = cleanContext(resource);
        const title = ctx.title || resource.public_id.split("/").pop().replace(/[-_]/g, " ");
        const downloadName = safeDownloadName(resource, title);
        const type = ctx.type || (resource.width > resource.height ? "Desktop 16:9" : "Mobile 9:16");
        const resolution = `${resource.width}x${resource.height}`;
        const draft = parseBoolean(ctx.draft);
        const publishAt = ctx.publishAt || "";
        const publishAtTs = parseTimestamp(publishAt);
        const isPublished = !draft && (!publishAtTs || publishAtTs <= now);
        const extraTags = parseList(ctx.extraTags);

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
          downloadUrl: buildCloudinaryDownloadUrl(resource, downloadName),
          createdAt: resource.created_at,
          draft,
          publishAt,
          isPublished,
          extraTags
        };
      })
      .filter(item => showAll || item.isPublished)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ wallpapers });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error." });
  }
};
