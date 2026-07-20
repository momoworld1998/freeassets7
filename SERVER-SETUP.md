# Public File Storage — Setup

Previously, files uploaded through the Admin Panel were encrypted and
saved **inside the admin's own browser** (IndexedDB). That meant no one
else visiting the site could ever download them — the file only
"existed" on the one computer that uploaded it.

This update adds a small backend (`/server`) so uploaded files are saved
to a real folder on the server — **`/uploads`** — and served publicly.
Anyone who visits the website can now download them.

## What changed
- **New:** `/server/server.js` — a small Node/Express server with an
  upload API and static file hosting.
- **New:** `/uploads/` — the public folder where uploaded files actually
  land. Served at `https://yourdomain.com/uploads/<file>`.
- **New:** `/data/vault-index.json` — keeps track of which file belongs
  to which asset (auto-managed, don't edit by hand).
- **Changed:** `assets/vault.js` — same `VAULT.store / .list / .has /
  .download / .remove` functions the admin panel and site already use,
  but now they call the server's API instead of the browser's local
  storage. No changes were needed in `admin/dashboard.html` or
  `js/site-sync.js`.
- **Kept:** `assets/vault.local-encrypted.js.bak` — the original
  browser-only version, kept for reference in case you ever want it back.

## How to run it

```bash
cd server
npm install
npm start
```

Then open **http://localhost:3000** — the whole site (home page, admin
panel, everything) is served from that one address. Upload a file from
Admin Panel → Vault Manager and it will be saved into `/uploads` on
disk — check that folder and you'll see it appear there.

## Deploying

This needs a host that can run a persistent Node.js process (Render,
Railway, a VPS, DigitalOcean App Platform, Fly.io, etc.) — not a
pure static host like GitHub Pages, since those can't accept file
uploads or run the API. Point your domain at wherever `server.js` runs.

If you deploy the site's static files and the API separately (e.g.
static frontend on Netlify + API on Render), add this **before** the
`<script src="assets/vault.js">` tag on every page:

```html
<script>window.FAH_API_BASE = 'https://your-api-domain.com';</script>
```

Also make sure your persistent-disk / volume setting on your host maps
to the `/uploads` and `/data` folders, so uploaded files survive
restarts and redeploys.
