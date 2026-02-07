<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1LXR4sD42ADimkewAfKhAU0seDH6QErJ0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file (based on `.env.example`) and set `OPENROUTER_API_KEY` to your OpenRouter API key.
3. Run the app:
   `npm run dev`

## Deploy on Cloudflare Pages (recommended)

This app uses a Cloudflare Pages Function to keep your API key private. The browser calls `/api/chat`, and the
function injects the secret server-side so the key is never shipped to clients.

1. Create a Cloudflare Pages project connected to this repo.
2. Set the build command to `npm run build` and the build output directory to `dist`.
3. In **Project Settings → Environment Variables**, add:
   - `OPENROUTER_API_KEY` (your OpenRouter API key)
4. Deploy.

> Optional local Pages dev (requires Wrangler): `npx wrangler pages dev --proxy 3000 -- npm run dev`

## Deploy on Cloudflare Workers (alternative)

If you are deploying with `wrangler deploy`, make sure Wrangler can find a config file in the directory it runs
from. This repo includes configs at the repo root and under `src/` so it works even if your Cloudflare project
root is set to `./src`. If you run Wrangler from another directory, pass the config explicitly, for example:
`npx wrangler deploy --config ./wrangler.toml`.
