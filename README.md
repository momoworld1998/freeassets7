# FreeAssetsHub — /assets/ Folder

## What this folder is for

This folder holds **vault.js** — now a thin client that talks to the
server API in `/server`, so uploaded files are saved to the public
**`/uploads`** folder on the server's disk instead of the admin's own
browser. See **`SERVER-SETUP.md`** in the project root for setup.

All asset files you upload via the Admin Panel are:
1. Uploaded to the server and written into `/uploads`
2. Served publicly from `/uploads/<file>` — any visitor can download them
3. Tracked in `/data/vault-index.json` (which file belongs to which asset)

## How it works

```
Admin uploads file  →  vault.js POSTs it to the server  →  saved in /uploads
                                                                    ↓
Any visitor clicks Download →  vault.js fetches it from the server →  browser Save dialog
```

> The previous browser-only (IndexedDB, AES-256-GCM encrypted) version is
> kept as `vault.local-encrypted.js.bak` for reference.

## Files in this folder

| File | Purpose |
|------|---------|
| `vault.js` | Core AES-256-GCM encrypt/decrypt engine |

## Vault API (used by admin/dashboard.html)

```js
// Store a file (from file input)
await VAULT.store(assetId, file)      // returns { ok, assetId, size }

// Download / decrypt a file
await VAULT.download(assetId, 'filename.png')  // triggers browser save dialog

// Check if a file exists
await VAULT.has(assetId)              // returns true/false

// List all stored files
await VAULT.list()                    // returns [{ id, assetId, meta }]

// Delete one file
await VAULT.remove(assetId)           // returns { ok }

// Export all encrypted data as backup JSON
await VAULT.exportVault()             // downloads a .json backup file

// Import from a backup file
await VAULT.importVault(file)         // re-loads encrypted records
```

## Security Notes

- The encryption key is derived from `VAULT_SECRET` constant in `vault.js`
  — change this string before deploying to production
- Ciphertext stays encrypted at rest in IndexedDB
- Each file gets a unique random IV (Initialization Vector)
- The secret is in client-side JS — this protects against casual snooping
  and disk-level access, but not against someone who inspects the JS source
- For production, move the VAULT_SECRET server-side and use a backend API

## Backup & Restore

1. Admin Panel → Vault Manager → **Export Backup**
   → downloads `FAH_vault_backup_TIMESTAMP.json`
2. On a new browser/machine: Admin Panel → Vault Manager → **Import Backup**
   → re-loads all encrypted records

The export file contains ciphertext only — files cannot be read from the
backup without also having the same `VAULT_SECRET`.
