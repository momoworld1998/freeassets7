// =============================================================
// FreeAssetsHub — Encrypted Asset Vault  (assets/vault.js)
// Uses Web Crypto API (AES-256-GCM) to store and retrieve asset
// files encrypted in IndexedDB.  Zero server needed.
// =============================================================

const VAULT = (function () {
  'use strict';

  // ── Constants ───────────────────────────────────────────────
  const DB_NAME    = 'FAH_Vault';
  const STORE_NAME = 'encrypted_assets';
  const DB_VERSION = 1;

  // Vault master key is derived from a site-wide secret + the
  // asset ID using PBKDF2.  You can change VAULT_SECRET here —
  // just make sure every page that needs to decrypt uses the same
  // string.  Never expose this to end-users; it lives only in JS.
  const VAULT_SECRET = 'FAH$2025#Vault!Key';

  // ── Open / initialise IndexedDB ─────────────────────────────
  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          var store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('assetId', 'assetId', { unique: true });
        }
      };
      req.onsuccess = function (e) { resolve(e.target.result); };
      req.onerror   = function (e) { reject(e.target.error); };
    });
  }

  // ── Key derivation (PBKDF2 → AES-256-GCM) ──────────────────
  async function deriveKey(assetId) {
    var enc     = new TextEncoder();
    var keyMat  = await crypto.subtle.importKey(
      'raw', enc.encode(VAULT_SECRET + '_' + assetId),
      { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name:'PBKDF2', salt: enc.encode('FAH_salt_' + assetId),
        iterations: 100000, hash: 'SHA-256' },
      keyMat,
      { name:'AES-GCM', length:256 },
      false, ['encrypt','decrypt']
    );
  }

  // ── Encrypt a File/Blob ──────────────────────────────────────
  // Returns { id, assetId, iv(hex), ciphertext(ArrayBuffer), meta }
  async function encryptFile(assetId, file) {
    var key   = await deriveKey(assetId);
    var iv    = crypto.getRandomValues(new Uint8Array(12));
    var plain = await file.arrayBuffer();
    var cipher = await crypto.subtle.encrypt(
      { name:'AES-GCM', iv: iv }, key, plain
    );
    return {
      id:        'vault_' + assetId,
      assetId:   assetId,
      iv:        Array.from(iv).map(b => b.toString(16).padStart(2,'0')).join(''),
      ciphertext: cipher,
      meta: {
        name:     file.name,
        type:     file.type,
        size:     file.size,
        storedAt: new Date().toISOString()
      }
    };
  }

  // ── Decrypt back to a Blob ───────────────────────────────────
  async function decryptRecord(record) {
    var key   = await deriveKey(record.assetId);
    var ivArr = new Uint8Array(record.iv.match(/.{2}/g).map(h => parseInt(h,16)));
    var plain = await crypto.subtle.decrypt(
      { name:'AES-GCM', iv: ivArr }, key, record.ciphertext
    );
    return new Blob([plain], { type: record.meta.type || 'application/octet-stream' });
  }

  // ── PUBLIC API ───────────────────────────────────────────────

  /**
   * Store an encrypted copy of `file` under `assetId`.
   * Overwrites if an entry for that assetId already exists.
   * Returns { ok, assetId, size }
   */
  async function store(assetId, file) {
    try {
      var record = await encryptFile(assetId, file);
      var db = await openDB();
      return new Promise(function (resolve, reject) {
        var tx  = db.transaction(STORE_NAME, 'readwrite');
        var req = tx.objectStore(STORE_NAME).put(record);
        req.onsuccess = function () {
          resolve({ ok:true, assetId: assetId, size: file.size });
          console.log('[vault] Stored encrypted file for asset', assetId, 'size', file.size);
        };
        req.onerror = function (e) { reject(e.target.error); };
      });
    } catch (err) {
      console.error('[vault] store failed', err);
      return { ok:false, error: err.message };
    }
  }

  /**
   * Download / decrypt the file for `assetId`.
   * Triggers browser save-dialog with the original filename.
   * Returns { ok } or { ok:false, error }
   */
  async function download(assetId, filename) {
    try {
      var db = await openDB();
      var record = await new Promise(function (resolve, reject) {
        var tx  = db.transaction(STORE_NAME, 'readonly');
        var req = tx.objectStore(STORE_NAME).get('vault_' + assetId);
        req.onsuccess = function (e) { resolve(e.target.result); };
        req.onerror   = function (e) { reject(e.target.error); };
      });

      if (!record) return { ok:false, error:'File not found in vault' };

      var blob = await decryptRecord(record);
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.href   = url;
      a.download = filename || record.meta.name || ('asset_' + assetId);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 3000);
      console.log('[vault] Downloaded decrypted file for asset', assetId);
      return { ok:true };
    } catch (err) {
      console.error('[vault] download failed', err);
      return { ok:false, error: err.message };
    }
  }

  /**
   * Check whether an encrypted file exists for `assetId`.
   * Returns true / false.
   */
  async function has(assetId) {
    try {
      var db = await openDB();
      return new Promise(function (resolve) {
        var tx  = db.transaction(STORE_NAME, 'readonly');
        var req = tx.objectStore(STORE_NAME).count('vault_' + assetId);
        req.onsuccess = function (e) { resolve(e.target.result > 0); };
        req.onerror   = function ()  { resolve(false); };
      });
    } catch (e) { return false; }
  }

  /**
   * List all stored records (id, assetId, meta, NO ciphertext).
   * Returns array of { id, assetId, meta }
   */
  async function list() {
    try {
      var db = await openDB();
      return new Promise(function (resolve, reject) {
        var tx      = db.transaction(STORE_NAME, 'readonly');
        var req     = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = function (e) {
          resolve(e.target.result.map(function(r){
            return { id: r.id, assetId: r.assetId, meta: r.meta };
          }));
        };
        req.onerror = function (e) { reject(e.target.error); };
      });
    } catch (e) { return []; }
  }

  /**
   * Remove a single stored file.
   */
  async function remove(assetId) {
    try {
      var db = await openDB();
      return new Promise(function (resolve, reject) {
        var tx  = db.transaction(STORE_NAME, 'readwrite');
        var req = tx.objectStore(STORE_NAME).delete('vault_' + assetId);
        req.onsuccess = function () { resolve({ ok:true }); };
        req.onerror   = function (e) { reject(e.target.error); };
      });
    } catch (err) { return { ok:false, error: err.message }; }
  }

  /**
   * Wipe entire vault.
   */
  async function wipe() {
    try {
      var db = await openDB();
      return new Promise(function (resolve, reject) {
        var tx  = db.transaction(STORE_NAME, 'readwrite');
        var req = tx.objectStore(STORE_NAME).clear();
        req.onsuccess = function () { resolve({ ok:true }); };
        req.onerror   = function (e) { reject(e.target.error); };
      });
    } catch (err) { return { ok:false, error: err.message }; }
  }

  /**
   * Export ALL encrypted records as a single JSON blob file
   * so you can back them up and re-import on another machine.
   * NOTE: ciphertext is exported as base64 — still encrypted.
   */
  async function exportVault() {
    try {
      var db = await openDB();
      var all = await new Promise(function(resolve, reject){
        var tx  = db.transaction(STORE_NAME,'readonly');
        var req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = function(e){ resolve(e.target.result); };
        req.onerror   = function(e){ reject(e.target.error); };
      });
      // Encode ArrayBuffers to base64
      var encoded = all.map(function(r){
        var bytes = new Uint8Array(r.ciphertext);
        var bin   = '';
        bytes.forEach(function(b){ bin += String.fromCharCode(b); });
        return { id:r.id, assetId:r.assetId, iv:r.iv,
                 ciphertext: btoa(bin), meta:r.meta };
      });
      var json = JSON.stringify({ version:1, exportedAt:new Date().toISOString(), records: encoded });
      var blob = new Blob([json], { type:'application/json' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.href=url; a.download='FAH_vault_backup_'+Date.now()+'.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); },3000);
      return { ok:true, count: encoded.length };
    } catch(err){ return { ok:false, error:err.message }; }
  }

  /**
   * Import a vault backup JSON file (re-encrypts nothing — records
   * stay as-is since ciphertext was already encrypted with same key).
   */
  async function importVault(file) {
    try {
      var text = await file.text();
      var data = JSON.parse(text);
      if(!data.records) throw new Error('Invalid backup file');
      var db = await openDB();
      var tx = db.transaction(STORE_NAME,'readwrite');
      var store = tx.objectStore(STORE_NAME);
      var count = 0;
      for(var r of data.records){
        // Decode base64 back to ArrayBuffer
        var bin   = atob(r.ciphertext);
        var bytes = new Uint8Array(bin.length);
        for(var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
        store.put({ id:r.id, assetId:r.assetId, iv:r.iv, ciphertext:bytes.buffer, meta:r.meta });
        count++;
      }
      await new Promise(function(res,rej){ tx.oncomplete=res; tx.onerror=function(e){rej(e.target.error);}; });
      return { ok:true, count: count };
    } catch(err){ return { ok:false, error:err.message }; }
  }

  // ── Expose public API ────────────────────────────────────────
  return { store, download, has, list, remove, wipe, exportVault, importVault };
})();

// Make globally accessible
window.VAULT = VAULT;
console.log('[vault] FreeAssetsHub Encrypted Vault loaded (AES-256-GCM)');
