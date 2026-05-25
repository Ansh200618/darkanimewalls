# Dark Anime Walls

Dark Anime Walls is a wallpaper website with two parts:

- **Public page (`/`)** – where visitors browse and download wallpapers
- **Private studio page (`/studio.html`)** – where you upload and manage wallpapers

This setup is made for a single owner who wants an easy way to run a wallpaper site.

---

## How the app works (simple)

1. You upload a wallpaper from your private studio page.
2. The wallpaper is saved in your cloud storage.
3. It appears on the public website automatically.
4. Visitors can view, search, preview, and download it.

So your work is simple: upload once in Studio, and it becomes available to everyone on the main site.

---

## What visitors can do

On the public website, visitors can:

- Browse all wallpapers
- Search for specific wallpapers
- Open a preview before downloading
- Download original-quality wallpaper files
- Send wallpaper requests
- Contact you for collaborations

Visitors cannot access your private upload tools.

---

## What you can do in Studio

On your private Studio page, you can:

- Sign in with your studio password
- Upload new wallpapers
- Remove wallpapers you no longer want to show

Your Studio link should stay private.

---

## Your normal daily flow

- Open `/studio.html`
- Log in
- Upload new wallpaper
- Check `/` to confirm it is live
- Share your site with your audience

---

## Where to update your public contact info

If you want to change your name/email shown on the site, update `index.html`.

---

## Local run (optional)

If you want to run it on your own computer:

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:3000`
- `http://localhost:3000/studio.html`
