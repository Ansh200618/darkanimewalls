# Dark Anime Walls — Cloudinary Functional Website

This version uses Cloudinary as the image backend and keeps the public website completely separate from the private admin page.

## What is included

- `index.html` — public user website
- `admin.html` — private admin page
- `/api/wallpapers.js` — reads approved Cloudinary images
- `/api/sign-upload.js` — creates a secure upload signature
- `/api/delete-wallpaper.js` — deletes a Cloudinary image
- `package.json` — Vercel project config

## Public website behavior

The public website does not mention admin, uploads, backend, management, Cloudinary, or dashboard.
Users can only:
- browse wallpapers
- search/filter wallpapers
- preview wallpapers
- download original-quality images
- send custom requests
- contact for collabs

## Admin page

Open it manually:

```text
https://your-domain.com/admin.html
```

Do not add this link to the public navbar.

## Required Cloudinary setup

1. Create a Cloudinary account.
2. Go to Dashboard.
3. Copy:
   - Cloud name
   - API Key
   - API Secret

## Vercel environment variables

In Vercel Project Settings → Environment Variables, add:

```text
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_PASSWORD=choose_a_strong_private_password
CLOUDINARY_TAG=dark-anime-walls
CLOUDINARY_FOLDER=dark-anime-walls
```

Important:
Never paste your Cloudinary API Secret into `index.html` or `admin.html`.
The secret must stay inside Vercel environment variables only.

## How upload works

1. You open `/admin.html`.
2. You enter your `ADMIN_PASSWORD`.
3. The admin page asks `/api/sign-upload` for a secure upload signature.
4. The original image uploads directly to Cloudinary.
5. The public website reads images tagged `dark-anime-walls`.
6. Users download the Cloudinary original-quality image.

## Uploading high quality images

Upload the original PNG/JPG/WebP file.
This project does not compress the image before upload.
Cloudinary stores the original asset and the download button uses the original uploaded file.

## Local testing

Install Vercel CLI:

```bash
npm i -g vercel
```

Run locally:

```bash
vercel dev
```

Then open:

```text
http://localhost:3000
http://localhost:3000/admin.html
```

## Deploying

1. Upload this folder to GitHub.
2. Import the repo in Vercel.
3. Add environment variables.
4. Deploy.
5. Open `/admin.html` and upload your first wallpaper.

## Replace these values in HTML

In `index.html`, replace:

```text
darkanimewalls
contact@darkanimewalls.com
```

with your real Instagram username and email.

## Security note

This is a clean beginner-friendly setup for one admin user.
For a bigger public product, add a full authentication provider later.
