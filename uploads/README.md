# /uploads — Public Download Folder

This is where every file uploaded through the Admin Panel (Vault Manager
→ Upload) actually gets saved.

- Files are written here **on the server's disk**, not in the admin's
  browser localStorage/IndexedDB.
- This folder is served publicly by `server/server.js` at `/uploads/...`,
  so **anyone visiting the website can download a file directly**, e.g.:
  `https://yourdomain.com/uploads/12__1737...__wallpaper.jpg`
- You normally won't touch files here by hand — the admin panel and the
  API in `/server/server.js` manage it for you (upload, list, delete).
- `data/vault-index.json` (one level up) keeps the metadata (which file
  belongs to which asset, original name, size, upload date).

## Backing this up
Since real files live here (not in a database), back this folder up the
same way you'd back up any uploads directory — e.g. zip `/uploads` and
`/data/vault-index.json` together periodically, or point it at a mounted
persistent disk / volume when you deploy.

## Running the server
See `SERVER-SETUP.md` in the project root.
