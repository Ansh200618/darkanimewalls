# Dark Anime Walls Website

This project gives you:

- a **public wallpaper website** (`index.html`) for your visitors
- a **private upload page** (`studio.html`) only for you
- API files that connect everything to Cloudinary storage

It is designed to be simple, clean, and easy to manage.

---

## What visitors can do

On the public website, people can:

- browse wallpapers
- search and filter wallpapers
- open previews
- download original-quality files
- send custom wallpaper requests
- contact you for collaborations

Visitors do **not** see your private upload tools.

---

## Your private manager page

Your private page is:

```text
https://your-domain.com/studio.html
```

Use this page to upload and delete wallpapers.

Important:
- Keep this link private.
- Do not put it in your public menu.

---

## Before you start

You need:

1. A Cloudinary account
2. A Vercel project
3. Your Cloudinary details from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

---

## Vercel settings you must add

In **Vercel → Project Settings → Environment Variables**, add:

```text
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STUDIO_PASSWORD=choose_a_strong_private_password
CLOUDINARY_TAG=dark-anime-walls
CLOUDINARY_FOLDER=dark-anime-walls
```

Security rule:
- Never place your API Secret directly inside HTML files.
- Keep secrets only in Vercel environment variables.
- Always use HTTPS in production so the studio password is never sent over plain HTTP.

---

## How uploading works (simple flow)

1. Open `/studio.html`
2. Enter your private studio password
3. Upload your original image (PNG/JPG/WebP)
4. Image is saved to Cloudinary
5. It appears automatically on the public website

The file stays in original quality for downloads.

---

## Run locally on your computer

Install Vercel CLI:

```bash
npm i -g vercel
```

Start the project:

```bash
vercel dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/studio.html
```

---

## Deploy steps

1. Push this project to GitHub
2. Import the repository in Vercel
3. Add all required environment variables
4. Deploy
5. Open `/studio.html` and upload your first wallpaper

---

## Update your contact details

In `index.html`, replace these placeholders with your real details:

```text
darkanimewalls
contact@darkanimewalls.com
```

---

## Notes

- This setup is best for a single owner/admin.
- If you plan to grow into a bigger team, add a full authentication system later.
