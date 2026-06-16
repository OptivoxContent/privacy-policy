# vy-reel-site

Static site for **vy-reel.com**. Its job today is to host the VyReel privacy
policy at **https://vy-reel.com/privacy-policy**. Deployed on Vercel.

## Structure

| Path | What it is |
|---|---|
| `privacy-policy.md` | The policy source (kept in sync with the `vy-reel` app repo) |
| `build.mjs` | Converts the Markdown into a branded `public/privacy-policy/index.html` |
| `assets/favicon.ico` | Favicon (copied from the app) |
| `assets/logo.svg` | Wordmark logo — **swap this for your real logo** if you have one |
| `public/` | Generated static output — this is what Vercel serves |
| `vercel.json` | Tells Vercel to run `build.mjs` and serve `public/` with clean URLs |

## Build locally

```bash
npm install
npm run build
# then open public/privacy-policy/index.html in a browser
```

## Deploy to Vercel + connect the domain

1. Install the CLI once: `npm i -g vercel`
2. From this folder: `vercel` (preview), then `vercel --prod`
3. In the Vercel dashboard → your project → **Settings → Domains**, add **vy-reel.com**
   and follow the DNS records it shows (point your domain's nameservers or add the
   A/CNAME records at your registrar).
4. Done — the policy is live at **https://vy-reel.com/privacy-policy** and the root at
   **https://vy-reel.com/**.

Vercel reads `vercel.json`, runs `npm install` + `node build.mjs`, and serves `public/`.

## Updating the policy

Edit `privacy-policy.md` here (or re-copy it from the app repo), then
`npm run build` and redeploy (`vercel --prod`). Keep this copy in sync with the
canonical `vy-reel/privacy-policy.md`.
