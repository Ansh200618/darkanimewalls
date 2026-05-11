const crypto = require("crypto");

function signCloudinaryParams(params, apiSecret) {
  const sorted = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(sorted + apiSecret).digest("hex");
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

  if (!cloudName || !apiKey || !apiSecret || !studioPassword) {
    res.status(500).json({ error: "Server environment variables are missing." });
    return;
  }

  const { password, public_id } = req.body || {};

  if (password !== studioPassword) {
    res.status(401).json({ error: "Invalid studio password." });
    return;
  }

  if (!public_id) {
    res.status(400).json({ error: "public_id is required." });
    return;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const invalidate = true;
  const signature = signCloudinaryParams({ public_id, timestamp, invalidate }, apiSecret);

  const form = new URLSearchParams();
  form.set("public_id", public_id);
  form.set("timestamp", timestamp);
  form.set("invalidate", "true");
  form.set("api_key", apiKey);
  form.set("signature", signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: form
    });

    const data = await response.json();

    if (!response.ok || data.result === "not found") {
      res.status(response.ok ? 404 : response.status).json({ error: data.error?.message || "Unable to delete image." });
      return;
    }

    res.status(200).json({ ok: true, result: data.result });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error." });
  }
};
