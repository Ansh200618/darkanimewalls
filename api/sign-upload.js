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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const folder = process.env.CLOUDINARY_FOLDER || "dark-anime-walls";

  if (!cloudName || !apiKey || !apiSecret || !adminPassword) {
    res.status(500).json({ error: "Server environment variables are missing." });
    return;
  }

  const body = req.body || {};

  if (body.password !== adminPassword) {
    res.status(401).json({ error: "Invalid admin password." });
    return;
  }

  const title = safeText(body.title, "Untitled Wallpaper");
  const category = safeText(body.category, "Dark Anime");
  const type = safeText(body.type, "Mobile 9:16");
  const mood = safeText(body.mood, "Mixed");
  const description = safeText(body.description, "Premium dark anime wallpaper.");
  const extraTags = String(body.tags || "")
    .split(",")
    .map(t => safeText(t).toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean)
    .slice(0, 8);

  const tags = [CLOUDINARY_TAG, category.toLowerCase().replace(/\s+/g, "-"), type.toLowerCase().replace(/\s+/g, "-"), mood.toLowerCase().replace(/\s+/g, "-"), ...extraTags]
    .filter(Boolean)
    .join(",");

  const context = [
    `title=${title}`,
    `category=${category}`,
    `type=${type}`,
    `mood=${mood}`,
    `description=${description}`
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
