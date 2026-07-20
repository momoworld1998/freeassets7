// =============================================================
// FreeAssetsHub — Public File Server  (server/server.js)
//
// This replaces the old "encrypt-and-store-in-the-browser" vault.
// Files uploaded from the Admin Panel are now written to a real
// folder on disk — /uploads — and served publicly, so ANY visitor
// on ANY device/browser can download them. Nothing is stored in
// localStorage / IndexedDB anymore.
//
// Run:
//   cd server
//   npm install
//   npm start
// Then open http://localhost:3000  (whole site + admin + API,
// all from one server).
// =============================================================

const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Root of the site (one level up from /server)
const SITE_ROOT   = path.join(__dirname, '..');
const UPLOADS_DIR = path.join(SITE_ROOT, 'uploads');   // <-- public download folder
const DATA_DIR    = path.join(SITE_ROOT, 'data');
const INDEX_FILE  = path.join(DATA_DIR, 'vault-index.json');

// Make sure the folders/files exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR))    fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(INDEX_FILE))  fs.writeFileSync(INDEX_FILE, '[]');

// ── helpers to read/write the metadata index ───────────────────
function readIndex() {
  try { return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8') || '[]'); }
  catch (e) { return []; }
}
function writeIndex(list) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(list, null, 2));
}
function sanitize(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
}

// ── multer: save the uploaded file straight into /uploads ──────
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOADS_DIR); },
  filename: function (req, file, cb) {
    var assetId = req.body.assetId || 'file';
    var stamp   = Date.now();
    cb(null, assetId + '__' + stamp + '__' + sanitize(file.originalname));
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB cap

app.use(express.json());

// Serve the whole static site (index.html, admin/, css/, js/, assets/…)
app.use(express.static(SITE_ROOT));

// Serve the uploads folder publicly — anyone can download directly via
// e.g.  https://yourdomain.com/uploads/<filename>
app.use('/uploads', express.static(UPLOADS_DIR));

// ── API: store a file (admin upload) ────────────────────────────
app.post('/api/vault/store', upload.single('file'), function (req, res) {
  try {
    var assetId = Number(req.body.assetId);
    if (!assetId || !req.file) {
      return res.status(400).json({ ok: false, error: 'assetId and file are required' });
    }
    var list = readIndex();
    // Remove any previous file for this assetId (overwrite behaviour)
    var prev = list.find(function (r) { return r.assetId === assetId; });
    if (prev) {
      var prevPath = path.join(UPLOADS_DIR, prev.fileName);
      if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
      list = list.filter(function (r) { return r.assetId !== assetId; });
    }

    var record = {
      id: 'vault_' + assetId,
      assetId: assetId,
      fileName: req.file.filename,           // actual name on disk in /uploads
      meta: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        storedAt: new Date().toISOString()
      }
    };
    list.push(record);
    writeIndex(list);

    res.json({ ok: true, assetId: assetId, size: req.file.size, url: '/uploads/' + req.file.filename });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── API: list all stored files ──────────────────────────────────
app.get('/api/vault/list', function (req, res) {
  var list = readIndex();
  res.json(list.map(function (r) {
    return { id: r.id, assetId: r.assetId, meta: r.meta, url: '/uploads/' + r.fileName };
  }));
});

// ── API: check if a file exists for an assetId ──────────────────
app.get('/api/vault/has/:assetId', function (req, res) {
  var assetId = Number(req.params.assetId);
  var list = readIndex();
  res.json({ exists: list.some(function (r) { return r.assetId === assetId; }) });
});

// ── API: download a file (streams it with the right filename) ──
app.get('/api/vault/download/:assetId', function (req, res) {
  var assetId = Number(req.params.assetId);
  var list = readIndex();
  var record = list.find(function (r) { return r.assetId === assetId; });
  if (!record) return res.status(404).json({ ok: false, error: 'File not found' });

  var filePath = path.join(UPLOADS_DIR, record.fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ ok: false, error: 'File missing on disk' });

  var downloadName = req.query.filename || record.meta.name || record.fileName;
  res.download(filePath, downloadName);
});

// ── API: delete one file ────────────────────────────────────────
app.delete('/api/vault/:assetId', function (req, res) {
  var assetId = Number(req.params.assetId);
  var list = readIndex();
  var record = list.find(function (r) { return r.assetId === assetId; });
  if (record) {
    var filePath = path.join(UPLOADS_DIR, record.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    list = list.filter(function (r) { return r.assetId !== assetId; });
    writeIndex(list);
  }
  res.json({ ok: true });
});

// ── API: wipe everything ────────────────────────────────────────
app.delete('/api/vault', function (req, res) {
  var list = readIndex();
  list.forEach(function (r) {
    var filePath = path.join(UPLOADS_DIR, r.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
  writeIndex([]);
  res.json({ ok: true });
});

// ── API: export metadata backup (the real files live in /uploads,
//          back that folder up separately — e.g. zip it) ─────────
app.get('/api/vault/export', function (req, res) {
  var list = readIndex();
  res.json({ version: 1, exportedAt: new Date().toISOString(), records: list });
});

app.listen(PORT, function () {
  console.log('FreeAssetsHub server running at http://localhost:' + PORT);
  console.log('Public downloads folder: ' + UPLOADS_DIR);
});
