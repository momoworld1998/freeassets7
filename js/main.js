// ============================================
// FreeAssetsHub — Main JavaScript (js/main.js)
// ============================================

// ---- GLOBALS ----
let currentAsset = null;
let downloadTimer = null;
let displayedAssets = 0;
const ASSETS_PER_LOAD = 12;
let currentFilter = 'all';

// ---- DOM READY ----
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderCategories();
  renderAssets(currentFilter);
  renderMusicSection();
  renderInvitationSection();
  renderGifSection();
  renderWallpaperSection();
  setupSearch();
  setupNavbar();
  initLazyLoad();
  lucide.createIcons();
});

// ---- THEME ----
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    lucide.createIcons();
  });
}

// ---- NAVBAR ----
function setupNavbar() {
  // Mobile menu toggle
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('mobileMenu')?.classList.toggle('hidden');
  });
  // Navbar shadow on scroll
  window.addEventListener('scroll', () => {
    const nb = document.getElementById('navbar');
    if (nb) nb.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.1)' : 'none';
  });
}

// ---- RENDER CATEGORIES ----
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(cat => `
    <a href="categories.html?cat=${cat.id}" class="cat-card bg-gradient-to-br ${cat.color}">
      <div class="cat-bg">${cat.emoji}</div>
      <div class="cat-name">${cat.name}</div>
    </a>
  `).join('');
}

// ---- RENDER ASSETS (Masonry) ----
function renderAssets(filter) {
  const grid = document.getElementById('assetGrid');
  if (!grid) return;

  let filtered = ASSETS;
  if (filter === 'trending') filtered = ASSETS.filter(a => a.tags.includes('trending'));
  else if (filter === 'new') filtered = ASSETS.filter(a => a.tags.includes('new'));
  else if (filter === 'mostdownloaded') filtered = [...ASSETS].sort((a,b) => b.downloads - a.downloads);
  else if (filter === 'hd') filtered = ASSETS.filter(a => a.tags.includes('hd'));
  else if (filter === 'animated') filtered = ASSETS.filter(a => a.tags.includes('animated'));
  else if (filter === 'free') filtered = ASSETS.filter(a => a.tags.includes('free'));

  const toShow = filtered.slice(0, ASSETS_PER_LOAD);
  displayedAssets = toShow.length;

  grid.innerHTML = toShow.map(asset => renderAssetCard(asset)).join('');
  lucide.createIcons();
  initLazyLoad();
}

function renderAssetCard(asset) {
  const formatBadgeColor = {PNG:'bg-blue-500',JPG:'bg-green-500',GIF:'bg-yellow-500',MP4:'bg-red-500',MP3:'bg-purple-500',PSD:'bg-orange-500',ZIP:'bg-gray-500'};
  const badgeClass = formatBadgeColor[asset.format] || 'bg-gray-500';
  return `
    <div class="asset-card" onclick="openPreviewModal(${asset.id})">
      <img data-src="${asset.thumb}" alt="${asset.title}" class="lazy-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="min-height:120px;" />
      <div class="card-overlay">
        <div class="flex items-center justify-between w-full">
          <button onclick="event.stopPropagation();openDownloadModal(${JSON.stringify(asset).replace(/"/g,'&quot;')})" class="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-brand-50">
            ⬇ Free
          </button>
          <span class="${badgeClass} text-white text-xs font-bold px-2 py-0.5 rounded">${asset.format}</span>
        </div>
      </div>
      <div class="card-info">
        <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">${asset.title}</p>
        <p class="text-xs text-gray-400 mt-0.5">${formatNumber(asset.downloads)} downloads</p>
      </div>
    </div>
  `;
}

// ---- MUSIC SECTION ----
function renderMusicSection() {
  const grid = document.getElementById('musicGrid');
  if (!grid) return;
  grid.innerHTML = MUSIC_SAMPLES.map(m => `
    <div class="music-card" onclick="openDownloadModal({id:${m.id},title:'${m.title}',format:'MP3',category:'music',thumb:'',downloadUrl:'#'})">
      <div class="music-thumb">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-white font-semibold text-sm truncate">${m.title}</p>
        <p class="text-white/60 text-xs">${m.genre} • ${m.duration} • ${m.bpm} BPM</p>
        <p class="text-white/40 text-xs mt-0.5">${formatNumber(m.downloads)} downloads</p>
      </div>
      <button class="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors">
        ⬇ Free
      </button>
    </div>
  `).join('');
}

// ---- INVITATION SECTION ----
function renderInvitationSection() {
  const grid = document.getElementById('invitationGrid');
  if (!grid) return;
  const invites = ASSETS.filter(a => ['wedding','birthday','invitations'].includes(a.category)).slice(0,8);
  grid.innerHTML = invites.map(asset => `
    <div class="invite-card" onclick="openPreviewModal(${asset.id})">
      <img data-src="${asset.thumb}" alt="${asset.title}" class="lazy-img w-full h-64 object-cover" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
      <div class="p-3 bg-white dark:bg-gray-800">
        <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">${asset.title}</p>
        <button onclick="event.stopPropagation();openDownloadModal(${JSON.stringify(asset).replace(/"/g,'&quot;')})" class="mt-2 w-full bg-brand-600 hover:bg-brand-700 text-white text-xs py-2 rounded-lg font-medium transition-colors">
          Free Download
        </button>
      </div>
    </div>
  `).join('');
  initLazyLoad();
}

// ---- GIF SECTION ----
function renderGifSection() {
  const grid = document.getElementById('gifGrid');
  if (!grid) return;
  const gifs = ASSETS.filter(a => a.category === 'gifs').slice(0,6);
  grid.innerHTML = gifs.map(asset => `
    <div class="gif-card" onclick="openPreviewModal(${asset.id})">
      <img data-src="${asset.thumb}" alt="${asset.title}" class="lazy-img w-full h-full object-cover" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
      <span class="gif-badge">GIF</span>
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
        <button onclick="event.stopPropagation();openDownloadModal(${JSON.stringify(asset).replace(/"/g,'&quot;')})" class="w-full bg-white text-gray-900 text-xs py-1.5 rounded font-bold">⬇ Download Free</button>
      </div>
    </div>
  `).join('');
  initLazyLoad();
}

// ---- WALLPAPER SECTION ----
function renderWallpaperSection() {
  const grid = document.getElementById('wallpaperGrid');
  if (!grid) return;
  const walls = ASSETS.filter(a => a.category === 'wallpapers').slice(0,12);
  grid.innerHTML = walls.map(asset => `
    <div class="wallpaper-card" onclick="openPreviewModal(${asset.id})">
      <img data-src="${asset.thumb}" alt="${asset.title}" class="lazy-img w-full h-full object-cover" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
        <span class="text-white text-xs font-bold truncate">${asset.title}</span>
      </div>
    </div>
  `).join('');
  initLazyLoad();
}

// ---- FILTER ----
function filterAssets(type) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');
  renderAssets(type);
  // Scroll to grid
  document.getElementById('assetGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- LOAD MORE ----
function loadMore() {
  const grid = document.getElementById('assetGrid');
  if (!grid) return;
  const allFiltered = currentFilter === 'all' ? ASSETS :
    ASSETS.filter(a => a.tags.includes(currentFilter) || a.category === currentFilter);
  const nextBatch = allFiltered.slice(displayedAssets, displayedAssets + ASSETS_PER_LOAD);
  if (nextBatch.length === 0) {
    document.getElementById('loadMoreBtn').textContent = 'All Assets Loaded!';
    document.getElementById('loadMoreBtn').disabled = true;
    return;
  }
  grid.innerHTML += nextBatch.map(a => renderAssetCard(a)).join('');
  displayedAssets += nextBatch.length;
  lucide.createIcons();
  initLazyLoad();
}

// ---- SEARCH ----
function setupSearch() {
  const input = document.getElementById('heroSearch');
  const suggestions = document.getElementById('searchSuggestions');
  if (!input || !suggestions) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { suggestions.classList.add('hidden'); return; }
    const matches = TRENDING_SEARCHES.filter(s => s.toLowerCase().includes(q)).slice(0, 6);
    const assetMatches = ASSETS.filter(a => a.title.toLowerCase().includes(q)).slice(0, 4);
    if (matches.length === 0 && assetMatches.length === 0) { suggestions.classList.add('hidden'); return; }
    suggestions.innerHTML = [
      ...matches.map(s => `<button onclick="setSearch('${s}')" class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>${s}</button>`),
      ...assetMatches.map(a => `<button onclick="setSearch('${a.title}')" class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><img src="${a.thumb}" class="w-8 h-8 rounded object-cover"/>${a.title}</button>`)
    ].join('');
    suggestions.classList.remove('hidden');
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) suggestions.classList.add('hidden');
  });
}

function setSearch(q) {
  const input = document.getElementById('heroSearch');
  if (input) input.value = q;
  document.getElementById('searchSuggestions')?.classList.add('hidden');
  doSearch();
}

function doSearch() {
  const q = document.getElementById('heroSearch')?.value.toLowerCase().trim();
  if (!q) return;
  const results = ASSETS.filter(a => a.title.toLowerCase().includes(q) || a.category.includes(q) || a.tags.some(t => t.includes(q)));
  const grid = document.getElementById('assetGrid');
  if (grid) {
    if (results.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center py-16 text-gray-400">No results found. Try different keywords.</div>';
    } else {
      grid.innerHTML = results.map(a => renderAssetCard(a)).join('');
      lucide.createIcons();
      initLazyLoad();
    }
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---- PREVIEW MODAL ----
function openPreviewModal(id) {
  const asset = ASSETS.find(a => a.id === id);
  if (!asset) return;
  currentAsset = asset;
  document.getElementById('previewImage').src = asset.thumb;
  document.getElementById('previewTitle').textContent = asset.title;
  document.getElementById('previewCategory').textContent = asset.category;
  document.getElementById('previewDownloads').textContent = `${formatNumber(asset.downloads)} downloads`;
  document.getElementById('previewFormat').textContent = asset.format;
  document.getElementById('previewModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}
function closePreviewModal() {
  document.getElementById('previewModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ---- DOWNLOAD MODAL ----
let pendingDownload = null;
function openDownloadModal(asset) {
  pendingDownload = typeof asset === 'string' ? JSON.parse(asset.replace(/&quot;/g,'"')) : asset;
  closePreviewModal();
  document.getElementById('downloadModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
  startCountdown();
  // Track pending download in page share links
  updateShareLinks(pendingDownload);
}
function closeDownloadModal() {
  document.getElementById('downloadModal').classList.add('hidden');
  document.body.style.overflow = '';
  clearInterval(downloadTimer);
  // Reset countdown
  document.getElementById('countdownDisplay').textContent = '5';
  document.getElementById('countdownBar').style.width = '0%';
  document.getElementById('downloadNowBtn').disabled = true;
  document.getElementById('downloadNowBtn').classList.add('opacity-50','cursor-not-allowed');
}

function startCountdown() {
  let seconds = 5;
  document.getElementById('countdownDisplay').textContent = seconds;
  document.getElementById('countdownBar').style.width = '0%';
  clearInterval(downloadTimer);
  downloadTimer = setInterval(() => {
    seconds--;
    document.getElementById('countdownDisplay').textContent = seconds;
    document.getElementById('countdownBar').style.width = `${((5 - seconds) / 5) * 100}%`;
    if (seconds <= 0) {
      clearInterval(downloadTimer);
      const btn = document.getElementById('downloadNowBtn');
      btn.disabled = false;
      btn.classList.remove('opacity-50','cursor-not-allowed');
      btn.textContent = '⬇ Download Now — It\'s Free!';
    }
  }, 1000);
}

function startActualDownload() {
  if (!pendingDownload) return;
  // Increment download count (in real app, call backend API)
  const asset = ASSETS.find(a => a.id === pendingDownload.id);
  if (asset) asset.downloads++;
  closeDownloadModal();

  const url = pendingDownload.downloadUrl;
  if (!url || url === '#' || url.trim() === '') {
    showToast('⚠️ This is a sample asset — admin needs to add a real file URL.');
    return;
  }

  // Trigger the actual file download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '');
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast('⬇ Download started! Enjoy your free asset.');
}

// ---- SHARE ----
function updateShareLinks(asset) {
  const shareText = `Download "${asset.title}" for free on FreeAssetsHub! 🎨 https://freeassetshub.com`;
  window._shareText = encodeURIComponent(shareText);
}
function shareWhatsApp() {
  window.open(`https://wa.me/?text=${window._shareText || encodeURIComponent('Check out FreeAssetsHub for free digital assets! https://freeassetshub.com')}`, '_blank');
}
function shareTelegram() {
  window.open(`https://t.me/share/url?url=${encodeURIComponent('https://freeassetshub.com')}&text=${window._shareText || ''}`, '_blank');
}
function likeAsset(asset) {
  if (!asset) return;
  const a = ASSETS.find(x => x.id === asset.id);
  if (a) a.likes++;
  showToast('❤️ Added to your liked assets!');
}

// ---- LAZY LOAD ----
function initLazyLoad() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.addEventListener('load', () => img.classList.add('loaded'));
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  } else {
    // Fallback for older browsers
    document.querySelectorAll('img[data-src]').forEach(img => { img.src = img.dataset.src; img.classList.add('loaded'); });
  }
}

// ---- UTILS ----
function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
