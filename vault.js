// =============================================================
// FreeAssetsHub — Public File Vault  (assets/vault.js)
//
// IMPORTANT: This file used to store admin-uploaded files inside
// the ADMIN'S OWN BROWSER (IndexedDB). That meant only the admin's
// own browser could ever "find" the file — nobody else visiting
// the site could actually download it.
//
// This version keeps the exact same VAULT.* function names used
// everywhere else on the site (admin/dashboard.html, js/site-sync.js)
// but now talks to a real backend (see /server) which saves every
// uploaded file into the /uploads folder on the server's disk.
// That folder is served publicly, so ANY visitor, on ANY device,
// can download the file — not just the admin who uploaded it.
//
// Nothing else on the site needs to change: dashboard.html and the
// public pages already call VAULT.store / VAULT.list / VAULT.has /
// VAULT.download / VAULT.remove — those calls now just go over the
// network to the server instead of the browser's local storage.
//
// Requires the Node server in /server to be running (see
// /server/server.js and the root SERVER-SETUP.md for instructions).
// If you deploy the API somewhere other than the site's own domain,
// set window.FAH_API_BASE = 'https://your-api-domain.com' in a
// <script> tag BEFORE this file loads.
// =============================================================

const VAULT = (function () {
  'use strict';

  var API_BASE = (window.FAH_API_BASE || '').replace(/\/$/, '');

  function url(path) { return API_BASE + path; }

  // ── PUBLIC API ───────────────────────────────────────────────

  /**
   * Upload `file` for `assetId` to the server's /uploads folder.
   * Returns { ok, assetId, size } (matches the old vault API).
   */
  async function store(assetId, file) {
    try {
      var fd = new FormData();
      fd.append('assetId', assetId);
      fd.append('file', file);
      var resp = await fetch(url('/api/vault/store'), { method: 'POST', body: fd });
      var data = await resp.json();
      if (!resp.ok || !data.ok) throw new Error(data.error || 'Upload failed');
      console.log('[vault] Stored file for asset', assetId, 'in public /uploads folder, size', data.size);
      return { ok: true, assetId: assetId, size: data.size, url: data.url };
    } catch (err) {
      console.error('[vault] store failed', err);
      return { ok: false, error: err.message };
    }
  }

  /**
   * Download the file for `assetId` from the public server folder.
   * Triggers the browser save-dialog with the original filename.
   * Works for ANY visitor, not just the admin who uploaded it.
   */
  async function download(assetId, filename) {
    try {
      var resp = await fetch(url('/api/vault/download/' + assetId + (filename ? ('?filename=' + encodeURIComponent(filename)) : '')));
      if (!resp.ok) {
        var errData = await resp.json().catch(function () { return {}; });
        return { ok: false, error: errData.error || 'File not found' };
      }
      var blob = await resp.blob();
      var objUrl = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = objUrl;
      a.download = filename || ('asset_' + assetId);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(objUrl); }, 3000);
      console.log('[vault] Downloaded public file for asset', assetId);
      return { ok: true };
    } catch (err) {
      console.error('[vault] download failed', err);
      return { ok: false, error: err.message };
    }
  }

  /**
   * Check whether a file exists on the server for `assetId`.
   */
  async function has(assetId) {
    try {
      var resp = await fetch(url('/api/vault/has/' + assetId));
      if (!resp.ok) return false;
      var data = await resp.json();
      return !!data.exists;
    } catch (e) { return false; }
  }

  /**
   * List all files stored on the server.
   * Returns array of { id, assetId, meta }
   */
  async function list() {
    try {
      var resp = await fetch(url('/api/vault/list'));
      if (!resp.ok) return [];
      return await resp.json();
    } catch (e) { return []; }
  }

  /**
   * Remove a single stored file from the server.
   */
  async function remove(assetId) {
    try {
      var resp = await fetch(url('/api/vault/' + assetId), { method: 'DELETE' });
      var data = await resp.json();
      return data;
    } catch (err) { return { ok: false, error: err.message }; }
  }

  /**
   * Wipe every file on the server.
   */
  async function wipe() {
    try {
      var resp = await fetch(url('/api/vault'), { method: 'DELETE' });
      return await resp.json();
    } catch (err) { return { ok: false, error: err.message }; }
  }

  /**
   * Download a JSON backup of the file INDEX (names/sizes/dates).
   * The actual files live in the server's /uploads folder — back
   * that folder up separately (e.g. zip it) since this export is
   * metadata only, not the file bytes.
   */
  async function exportVault() {
    try {
      var resp = await fetch(url('/api/vault/export'));
      var data = await resp.json();
      var json = JSON.stringify(data, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var objUrl = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = objUrl; a.download = 'FAH_vault_backup_' + Date.now() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(objUrl); }, 3000);
      return { ok: true, count: (data.records || []).length };
    } catch (err) { return { ok: false, error: err.message }; }
  }

  /**
   * Importing a metadata-only backup can't restore actual file
   * bytes. Restore the server's /uploads folder + data/vault-index.json
   * directly instead (copy them back onto the server).
   */
  async function importVault(file) {
    return { ok: false, error: 'Files now live on the server. Restore by copying your backed-up /uploads folder and data/vault-index.json back onto the server, then restart it.' };
  }

  // ── Expose public API ────────────────────────────────────────
  return { store, download, has, list, remove, wipe, exportVault, importVault };
})();

// Make globally accessible
window.VAULT = VAULT;
console.log('[vault] FreeAssetsHub Public File Vault loaded (server-backed, /uploads folder)');
