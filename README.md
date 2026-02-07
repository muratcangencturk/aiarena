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

## Deploy on Cloudflare (Wrangler)

This app uses a Cloudflare Worker to keep your API key private. The browser calls `/api/chat`, and the
worker injects the secret server-side so the key is never shipped to clients. Static assets are served
from `dist` via the Worker Assets binding.

1. Build the app:
   `npm run build`
2. Set the secret:
   `npx wrangler secret put OPENROUTER_API_KEY`
3. Deploy:
   `npx wrangler deploy`

> Local dev (requires Wrangler): `npx wrangler dev -- npm run dev`
