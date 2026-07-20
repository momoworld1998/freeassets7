// ============================================================
// site-sync.js  v3 — COMPLETE REWRITE
// Load AFTER data.js on every page.
// Reads every key admin dashboard writes and applies it live.
// ============================================================
(function(){
'use strict';

// ── 1. OVERRIDE IN-MEMORY DATA ARRAYS (must run before main.js) ────────────
try{
  var _a=localStorage.getItem('adminAssets');
  var _c=localStorage.getItem('adminCats');
  var _m=localStorage.getItem('adminMusic');

  if(_a && window.ASSETS){
    var parsed=JSON.parse(_a);
    var live=parsed.filter(function(a){return a.published!==false;});
    window.ASSETS.length=0;
    live.forEach(function(a){window.ASSETS.push(a);});
    console.log('[site-sync] Assets: '+live.length+' loaded');
  }
  if(_c && window.CATEGORIES){
    var pc=JSON.parse(_c);
    window.CATEGORIES.length=0;
    pc.forEach(function(c){window.CATEGORIES.push(c);});
    console.log('[site-sync] Categories: '+pc.length+' loaded');
  }
  if(_m && window.MUSIC_SAMPLES){
    var pm=JSON.parse(_m);
    window.MUSIC_SAMPLES.length=0;
    pm.forEach(function(m){window.MUSIC_SAMPLES.push(m);});
    console.log('[site-sync] Music: '+pm.length+' loaded');
  }
  var _st=JSON.parse(localStorage.getItem('adminSettings')||'{}');
  if(_st.trendingKeywords && window.TRENDING_SEARCHES){
    var kws=_st.trendingKeywords.split(',').map(function(s){return s.trim();}).filter(Boolean);
    if(kws.length){window.TRENDING_SEARCHES.length=0;kws.forEach(function(k){window.TRENDING_SEARCHES.push(k);});}
  }
}catch(e){console.warn('[site-sync] data override failed',e);}

// ── 2. PATCH DOWNLOAD FUNCTION — handles __local__ files ───────────────────
// Intercept after DOM ready so main.js's startActualDownload is overrideable
window.addEventListener('load',function(){
  var origFn = window.startActualDownload;
  window.startActualDownload = function(){
    var pd = window.pendingDownload;
    if(!pd){if(origFn)origFn();return;}

    var url = pd.downloadUrl||'';

    // Try encrypted vault first (admin uploaded file directly)
    if(url==='__local__' || url===''){
      if(window.VAULT){
        // Check vault first
        VAULT.has(pd.id).then(function(exists){
          if(exists){
            if(typeof closeDownloadModal==='function')closeDownloadModal();
            if(typeof showToast==='function')showToast('🔓 Decrypting your file…');
            var filename=(pd.title||'asset').replace(/[^a-z0-9]/gi,'_')+'.'+((pd.format||'file').toLowerCase());
            VAULT.download(pd.id, filename).then(function(res){
              if(res.ok){
                var a=window.ASSETS&&window.ASSETS.find(function(x){return x.id===pd.id;});
                if(a)a.downloads++;
                if(typeof showToast==='function')showToast('⬇️ Download started!');
              } else {
                if(typeof showToast==='function')showToast('⚠️ File not found in vault. Admin needs to re-upload.');
              }
            });
          } else {
            if(typeof closeDownloadModal==='function')closeDownloadModal();
            if(typeof showToast==='function')showToast('⚠️ No file in vault for this asset. Admin needs to upload it.');
          }
        });
        return;
      }
      if(typeof showToast==='function')showToast('⚠️ File not available. Admin needs to upload it.');
      if(typeof closeDownloadModal==='function')closeDownloadModal();
      return;
    }

    // External URL — open/download normally
    if(url && url!=='#' && url.trim()!==''){
      var link2=document.createElement('a');
      link2.href=url;link2.setAttribute('download','');link2.target='_blank';link2.rel='noopener';
      document.body.appendChild(link2);link2.click();link2.remove();
      if(typeof closeDownloadModal==='function')closeDownloadModal();
      if(typeof showToast==='function')showToast('⬇️ Download started!');
      var a2=window.ASSETS&&window.ASSETS.find(function(x){return x.id===pd.id;});
      if(a2)a2.downloads++;
      return;
    }

    if(typeof showToast==='function')showToast('⚠️ No file available. Admin needs to upload the file.');
    if(typeof closeDownloadModal==='function')closeDownloadModal();
  };
});

// ── 3. DOM-READY: apply all settings to page elements ──────────────────────
document.addEventListener('DOMContentLoaded',function(){
  var st={};
  try{st=JSON.parse(localStorage.getItem('adminSettings')||'{}');}catch(e){}

  applyHero(st);
  applyContact(st);
  applyAds(st);
  applySections();
  applyAnnouncement(st);
  applyTrendingPage(st);
  applyCatPage(st);
  applyCountdown(st);
});

// ── Hero section ────────────────────────────────────────────────────────────
function applyHero(st){
  setText('heroTitle1Text',  st.heroTitle1);
  setText('heroTitle2Text',  st.heroTitle2);
  setText('heroSubtitleText',st.heroSubtitle);
  setPlaceholder('heroSearch',   st.heroSearchPlaceholder);
  setPlaceholder('heroSearchCat',st.heroSearchPlaceholder);
  setText('stat1NumText',    st.stat1Num);
  setText('stat1LabelText',  st.stat1Label);
  setText('stat2NumText',    st.stat2Num);
  setText('stat2LabelText',  st.stat2Label);
}

// ── Contact info ─────────────────────────────────────────────────────────────
function applyContact(st){
  // dashboard uses contactPhone / contactEmail / contactWA / contactTG
  var phone = st.contactPhone||'';
  var email = st.contactEmail||'';
  var wa    = st.contactWA||st.contactWhatsapp||'';
  var tg    = st.contactTG||st.contactTelegram||'';

  if(phone){
    var digits=phone.replace(/[^0-9+]/g,'');
    document.querySelectorAll('.contact-phone-text').forEach(function(el){el.textContent=phone;});
    document.querySelectorAll('.contact-phone-link').forEach(function(el){el.href='tel:'+digits;});
  }
  if(email){
    document.querySelectorAll('.contact-email-text').forEach(function(el){el.textContent=email;});
    document.querySelectorAll('.contact-email-link').forEach(function(el){el.href='mailto:'+email;});
  }
  if(wa){
    var waNum=wa.replace(/[^0-9]/g,'');
    document.querySelectorAll('.contact-whatsapp-link').forEach(function(el){el.href='https://wa.me/'+waNum;});
  }
  if(tg){
    document.querySelectorAll('.contact-telegram-link').forEach(function(el){el.href='https://t.me/'+tg;});
  }
}

// ── AdSense publisher ID + slot IDs ─────────────────────────────────────────
function applyAds(st){
  var pubId = st.publisherId||'';
  if(pubId && pubId!=='ca-pub-XXXXXXXXXXXXXXXX'){
    document.querySelectorAll('ins.adsbygoogle').forEach(function(el){
      el.setAttribute('data-ad-client',pubId);
    });
  }
  // Per-slot overrides
  var slotMap=JSON.parse(localStorage.getItem('adSlots')||'{}');
  // Map: panel key → placeholder slot IDs used in HTML files
  var placeholderMap={
    header:  '1111111111',
    content1:'2222222222',
    sidebar: '3333333333',
    mobile:  '4444444444',
    download:'5555555555',
    content2:'6666666666',
    bottom:  '7777777777'
  };
  Object.keys(placeholderMap).forEach(function(key){
    if(slotMap[key]){
      document.querySelectorAll('[data-ad-slot="'+placeholderMap[key]+'"]').forEach(function(el){
        el.setAttribute('data-ad-slot',slotMap[key]);
      });
    }
  });
  // Sticky mobile ad visibility
  if(st.showStickyAd===false){
    var sad=document.getElementById('stickyMobileAd');
    if(sad)sad.style.display='none';
  }
}

// ── Download countdown timer ──────────────────────────────────────────────
function applyCountdown(st){
  if(st.dlCountdown && st.dlCountdown>0){
    window._adminCountdownSecs = parseInt(st.dlCountdown)||5;
    // Patch startCountdown if it exists
    var origSC = window.startCountdown;
    window.startCountdown = function(){
      var secs = window._adminCountdownSecs||5;
      var numEl=document.getElementById('countdownNum');
      var barEl=document.getElementById('countdownBar');
      var btn=document.getElementById('dlNowBtn');
      if(!numEl||!barEl||!btn)return;
      numEl.textContent=secs; barEl.style.width='0%';
      btn.disabled=true; btn.classList.add('opacity-50','cursor-not-allowed');
      clearInterval(window._dlTimer);
      window._dlTimer=setInterval(function(){
        secs--;
        numEl.textContent=secs;
        barEl.style.width=(((window._adminCountdownSecs||5)-secs)/(window._adminCountdownSecs||5))*100+'%';
        if(secs<=0){
          clearInterval(window._dlTimer);
          btn.disabled=false;
          btn.classList.remove('opacity-50','cursor-not-allowed');
          btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Download Now — Free!';
        }
      },1000);
    };
  }
}

// ── Section visibility (homepage) ────────────────────────────────────────────
function applySections(){
  var vis=JSON.parse(localStorage.getItem('sectionVisibility')||'{}');
  Object.keys(vis).forEach(function(key){
    if(vis[key]===false){
      document.querySelectorAll('[data-section="'+key+'"]').forEach(function(el){
        el.style.display='none';
      });
    }
  });
}

// ── Announcement bar ─────────────────────────────────────────────────────────
function applyAnnouncement(st){
  var ann=st.announcement;
  if(!ann||!ann.enabled||!ann.text)return;
  var colors={
    brand:'linear-gradient(90deg,#7c3aed,#3b82f6)',
    green:'linear-gradient(90deg,#059669,#10b981)',
    red:  'linear-gradient(90deg,#dc2626,#ef4444)',
    blue: 'linear-gradient(90deg,#2563eb,#3b82f6)'
  };
  var bar=document.createElement('div');
  bar.id='announcementBar';
  bar.style.cssText='position:fixed;top:0;left:0;right:0;z-index:60;background:'+(colors[ann.color]||colors.brand)+';color:#fff;text-align:center;font-size:.8125rem;font-weight:600;padding:8px 40px;';
  bar.innerHTML=ann.text+'<button onclick="(function(){document.getElementById(\'announcementBar\').remove();document.body.style.paddingTop=\'0\';var nb=document.getElementById(\'navbar\');if(nb)nb.style.top=\'0\';})()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.2);border:none;color:#fff;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:.75rem;">✕</button>';
  document.body.prepend(bar);
  var h=bar.offsetHeight||36;
  var nb=document.getElementById('navbar');
  if(nb) nb.style.top=h+'px';
  document.body.style.paddingTop=h+'px';
}

// ── Trending page live settings ───────────────────────────────────────────────
function applyTrendingPage(st){
  if(!st.trendingPage)return;
  var tp=st.trendingPage;
  // Hero title H1
  var h1=document.querySelector('.trending-page-title');
  if(h1&&tp.title) h1.textContent=tp.title;
  // Hero subtitle
  var sub=document.querySelector('.trending-page-subtitle');
  if(sub&&tp.subtitle) sub.textContent=tp.subtitle;
  // Badge text
  var badge=document.querySelector('.trending-page-badge');
  if(badge&&tp.badge) badge.textContent=tp.badge;
  // Default time period (trigger click)
  if(tp.defaultPeriod && typeof setTimePeriod==='function'){
    try{setTimePeriod(tp.defaultPeriod);}catch(e){}
  }
  // Toggle Top3
  if(tp.showTop3===false){
    var top3=document.querySelector('[data-trending-section="top3"]');
    if(top3)top3.style.display='none';
  }
  // Toggle Leaderboard
  if(tp.leaderboard===false){
    var lb=document.querySelector('[data-trending-section="leaderboard"]');
    if(lb)lb.style.display='none';
  }
  // Toggle stats bar
  if(tp.stats===false){
    var sb=document.querySelector('[data-trending-section="stats"]');
    if(sb)sb.style.display='none';
  }
  // Toggle category strip
  if(tp.catStrip===false){
    var cs=document.querySelector('[data-trending-section="catstrip"]');
    if(cs)cs.style.display='none';
  }
}

// ── Categories page live settings ─────────────────────────────────────────────
function applyCatPage(st){
  if(!st.catPage)return;
  var cp=st.catPage;
  var h1=document.querySelector('.cat-page-title');
  if(h1&&cp.title) h1.textContent=cp.title;
  var sub=document.querySelector('.cat-page-subtitle');
  if(sub&&cp.subtitle) sub.textContent=cp.subtitle;
  setPlaceholder('heroSearchCat',cp.searchPlaceholder);
  if(cp.perPage && window._catPageSize!==undefined) window._catPageSize=parseInt(cp.perPage)||20;
  // Section visibility for cat page
  if(cp.showCatGrid===false){var g=document.querySelector('[data-cat-section="catgrid"]');if(g)g.style.display='none';}
  if(cp.showBrowser===false){var b=document.querySelector('[data-cat-section="browser"]');if(b)b.style.display='none';}
  if(cp.showSpotlight===false){var sp=document.querySelector('[data-cat-section="spotlight"]');if(sp)sp.style.display='none';}
  if(cp.showTrendSearch===false){var ts=document.querySelector('[data-cat-section="trendsearch"]');if(ts)ts.style.display='none';}
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setText(id,val){if(!val)return;var el=document.getElementById(id);if(el)el.textContent=val;}
function setPlaceholder(id,val){if(!val)return;var el=document.getElementById(id);if(el)el.placeholder=val;}

})();
