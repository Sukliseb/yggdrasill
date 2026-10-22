YGGDRASILL — DEPLOY TO RENDER

Files in this folder:
- index.html: website UI
- server.js: Node.js server and /api/real-lots endpoint
- package.json: start script for hosting

1. Extract this archive.
2. On GitHub, create a new repository named yggdrasill. For a simple first deploy, choose Public or Private as you prefer.
3. Upload the four project files to the repository root (index.html, server.js, package.json, README-DEPLOY.txt). Commit the changes.
4. Sign in to https://render.com and connect your GitHub account.
5. Choose New + -> Web Service, then select the yggdrasill repository.
6. Configure:
   - Runtime/Language: Node
   - Build Command: npm install
   - Start Command: npm start
   - Instance type: Free (if offered and suitable)
7. Click Create Web Service and wait for the deploy to finish.
8. Open the public onrender.com URL shown by Render.
9. Check the site and test GET /api/real-lots by opening https://YOUR-SERVICE.onrender.com/api/real-lots.

REAL LOTS FEED
By default, /api/real-lots returns a fallback list of known lot pages. This does not confirm that their auctions are currently active. To use live data, configure the Render environment variable REAL_LOTS_FEED_URL with an HTTPS URL to a trusted JSON feed that returns either an array or {"lots": [...]} in the documented format. A normal auction catalog page is not a JSON feed.

Render docs: https://render.com/docs/your-first-deploy
