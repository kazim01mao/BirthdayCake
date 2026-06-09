<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/49dc2d1a-414f-4333-b11e-24cc57d720f4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
4. Open the Vite URL shown in the terminal, usually:
   `http://localhost:3000`

Do not open `index.html` directly or serve the project root with a generic static server. The entry file imports `/src/main.tsx`, which must be transformed by Vite during development. For static hosting, deploy the built `dist` folder instead:

```bash
npm run build
npm run preview
```
