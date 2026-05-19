const crypto = require("crypto");

const CLOUDINARY_TAG = process.env.CLOUDINARY_TAG || "dark-anime-walls";

function signCloudinaryParams(params, apiSecret) {
  const sorted = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(sorted + apiSecret).digest("hex");
}

function safeText(value, fallback = "") {
  return String(value || fallback).replace(/[|=<>]/g, "").trim().slice(0, 180);
}

function parseMultiValue(value, fallback) {
  const list = (Array.isArray(value) ? value : String(value || "").split(","))
    .map(item => safeText(item))
    .filter(Boolean)
    .slice(0, 6);

  return list.length ? list : [fallback];
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function normalizePublishAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const studioPassword = process.env.STUDIO_PASSWORD;
  const folder = process.env.CLOUDINARY_FOLDER || "dark-anime-walls";

  if (!cloudName || !apiKey || !apiSecret || !studioPassword) {
    res.status(500).json({ error: "Server environment variables are missing." });
    return;
  }

  const body = req.body || {};

  if (body.password !== studioPassword) {
    res.status(401).json({ error: "Invalid studio password." });
    return;
  }

  const title = safeText(body.title, "Untitled Wallpaper");
  const categoryList = parseMultiValue(body.category, "Dark Anime");
  const category = categoryList.join(", ");
  const type = safeText(body.type, "Mobile 9:16");
  const moodList = parseMultiValue(body.mood, "Mixed");
  const mood = moodList.join(", ");
  const description = safeText(body.description, "Premium dark anime wallpaper.");
  const draft = parseBoolean(body.draft);
  const publishAt = normalizePublishAt(body.publishAt);
  const extraTags = String(body.tags || "")
    .split(",")
    .map(t => safeText(t).toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean)
    .slice(0, 8);

  const tags = [
    CLOUDINARY_TAG,
    ...categoryList.map(item => item.toLowerCase().replace(/\s+/g, "-")),
    type.toLowerCase().replace(/\s+/g, "-"),
    ...moodList.map(item => item.toLowerCase().replace(/\s+/g, "-")),
    ...extraTags
  ]
    .filter(Boolean)
    .join(",");

  const context = [
    `title=${title}`,
    `category=${category}`,
    `type=${type}`,
    `mood=${mood}`,
    `description=${description}`,
    `draft=${draft ? "true" : "false"}`,
    `publishAt=${publishAt}`
  ].join("|");

  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    context,
    folder,
    tags,
    timestamp
  };

  const signature = signCloudinaryParams(paramsToSign, apiSecret);

  res.status(200).json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    tags,
    context,
    signature
  });
};
