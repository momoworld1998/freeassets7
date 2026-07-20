// ============================================
// FreeAssetsHub — Sample Data (js/data.js)
// Replace image URLs with real Cloudinary/Firebase URLs
// ============================================

var CATEGORIES = [
  { id: 'instagram', name: 'Instagram', emoji: '📸', color: 'from-pink-500 to-orange-400', count: 850 },
  { id: 'whatsapp', name: 'WhatsApp', emoji: '💬', color: 'from-green-500 to-emerald-400', count: 620 },
  { id: 'thumbnails', name: 'Thumbnails', emoji: '▶️', color: 'from-red-500 to-pink-500', count: 430 },
  { id: 'wallpapers', name: 'Wallpapers', emoji: '🖼', color: 'from-blue-500 to-cyan-400', count: 1200 },
  { id: 'desktop', name: 'Desktop BG', emoji: '🖥', color: 'from-indigo-500 to-purple-500', count: 380 },
  { id: 'music', name: 'Free Music', emoji: '🎵', color: 'from-purple-600 to-pink-500', count: 290 },
  { id: 'invitations', name: 'Invitations', emoji: '💌', color: 'from-rose-500 to-red-400', count: 540 },
  { id: 'gifs', name: 'GIF Cards', emoji: '🎞', color: 'from-yellow-500 to-orange-400', count: 310 },
  { id: 'stickers', name: 'PNG Stickers', emoji: '🎨', color: 'from-teal-500 to-cyan-500', count: 720 },
  { id: 'social', name: 'Social Media', emoji: '📱', color: 'from-blue-600 to-brand-500', count: 960 },
  { id: 'logos', name: 'Logo Templates', emoji: '🏷', color: 'from-gray-700 to-gray-500', count: 280 },
  { id: 'flyers', name: 'Business Flyers', emoji: '📄', color: 'from-amber-500 to-yellow-400', count: 190 },
  { id: 'banners', name: 'Banners', emoji: '🎌', color: 'from-violet-600 to-brand-500', count: 250 },
  { id: 'memes', name: 'Meme Templates', emoji: '😂', color: 'from-orange-500 to-red-400', count: 480 },
  { id: 'reels', name: 'Reels Cover', emoji: '🎬', color: 'from-pink-600 to-rose-500', count: 340 },
  { id: 'festival', name: 'Festival Cards', emoji: '🎉', color: 'from-green-600 to-teal-500', count: 415 },
  { id: 'animated', name: 'Animated Status', emoji: '✨', color: 'from-brand-500 to-accent-500', count: 230 },
  { id: 'ai-bg', name: 'AI Backgrounds', emoji: '🤖', color: 'from-cyan-600 to-blue-600', count: 170 },
  { id: 'wedding', name: 'Wedding Cards', emoji: '💍', color: 'from-pink-400 to-rose-600', count: 310 },
  { id: 'birthday', name: 'Birthday Cards', emoji: '🎂', color: 'from-yellow-400 to-orange-500', count: 390 },
];

// Sample assets — replace with real data from backend
var ASSETS = [
  { id:1, title:'Minimal Instagram Story', category:'instagram', tags:['trending','new','hd'], format:'PNG', size:'2MB', downloads:12400, likes:843, thumb:'https://picsum.photos/seed/ig1/400/600', downloadUrl:'#', featured:true },
  { id:2, title:'Sunset 4K Wallpaper', category:'wallpapers', tags:['hd','trending'], format:'JPG', size:'8MB', downloads:45200, likes:3201, thumb:'https://picsum.photos/seed/wall1/400/700', downloadUrl:'#', featured:true },
  { id:3, title:'YouTube Gaming Thumbnail', category:'thumbnails', tags:['trending','hd'], format:'PNG', size:'1.5MB', downloads:8900, likes:621, thumb:'https://picsum.photos/seed/yt1/400/225', downloadUrl:'#', featured:false },
  { id:4, title:'Lofi Chill Beats', category:'music', tags:['free','trending'], format:'MP3', size:'5MB', downloads:22100, likes:1540, thumb:'https://picsum.photos/seed/mu1/200/200', downloadUrl:'#', featured:true },
  { id:5, title:'Wedding Invitation Gold', category:'wedding', tags:['new','hd'], format:'PNG', size:'3MB', downloads:5600, likes:402, thumb:'https://picsum.photos/seed/wed1/400/600', downloadUrl:'#', featured:true },
  { id:6, title:'Happy Birthday GIF Card', category:'gifs', tags:['animated','new'], format:'GIF', size:'4MB', downloads:18700, likes:1230, thumb:'https://picsum.photos/seed/gif1/300/300', downloadUrl:'#', featured:false },
  { id:7, title:'Festival Diwali Greeting', category:'festival', tags:['new','trending'], format:'PNG', size:'2.5MB', downloads:31000, likes:2100, thumb:'https://picsum.photos/seed/diwali1/400/500', downloadUrl:'#', featured:true },
  { id:8, title:'WhatsApp Status Template', category:'whatsapp', tags:['trending','animated'], format:'MP4', size:'6MB', downloads:9800, likes:712, thumb:'https://picsum.photos/seed/wa1/360/640', downloadUrl:'#', featured:false },
  { id:9, title:'Abstract AI Background', category:'ai-bg', tags:['new','hd'], format:'JPG', size:'5MB', downloads:6700, likes:480, thumb:'https://picsum.photos/seed/ai1/400/400', downloadUrl:'#', featured:false },
  { id:10, title:'Business Logo Template', category:'logos', tags:['free','hd'], format:'PNG', size:'1MB', downloads:14300, likes:950, thumb:'https://picsum.photos/seed/logo1/300/300', downloadUrl:'#', featured:false },
  { id:11, title:'Reels Cover Neon', category:'reels', tags:['trending','animated'], format:'PNG', size:'2MB', downloads:7600, likes:530, thumb:'https://picsum.photos/seed/reel1/400/400', downloadUrl:'#', featured:false },
  { id:12, title:'Birthday Invitation Pink', category:'birthday', tags:['new','hd'], format:'PNG', size:'2.5MB', downloads:4200, likes:310, thumb:'https://picsum.photos/seed/bday1/400/600', downloadUrl:'#', featured:false },
  { id:13, title:'Nature Desktop Wallpaper', category:'desktop', tags:['hd','trending'], format:'JPG', size:'10MB', downloads:38000, likes:2600, thumb:'https://picsum.photos/seed/dt1/800/500', downloadUrl:'#', featured:false },
  { id:14, title:'Meme Template Classic', category:'memes', tags:['trending','free'], format:'PNG', size:'500KB', downloads:55000, likes:4100, thumb:'https://picsum.photos/seed/meme1/400/400', downloadUrl:'#', featured:false },
  { id:15, title:'Social Media Post Modern', category:'social', tags:['new','hd'], format:'PNG', size:'2MB', downloads:11200, likes:820, thumb:'https://picsum.photos/seed/sm1/400/400', downloadUrl:'#', featured:false },
  { id:16, title:'Tropical GIF Animation', category:'gifs', tags:['animated','trending'], format:'GIF', size:'3.5MB', downloads:9200, likes:680, thumb:'https://picsum.photos/seed/gif2/300/300', downloadUrl:'#', featured:false },
  { id:17, title:'Opening Ceremony Banner', category:'banners', tags:['new','hd'], format:'PNG', size:'4MB', downloads:3400, likes:245, thumb:'https://picsum.photos/seed/banner1/600/200', downloadUrl:'#', featured:false },
  { id:18, title:'PNG Sticker Pack Love', category:'stickers', tags:['trending','free'], format:'ZIP', size:'8MB', downloads:21000, likes:1480, thumb:'https://picsum.photos/seed/stick1/300/300', downloadUrl:'#', featured:false },
  { id:19, title:'Corporate Business Flyer', category:'flyers', tags:['new','hd'], format:'PSD', size:'12MB', downloads:2800, likes:195, thumb:'https://picsum.photos/seed/flyer1/400/500', downloadUrl:'#', featured:false },
  { id:20, title:'Instagram Story Gradient', category:'instagram', tags:['trending','animated'], format:'MP4', size:'7MB', downloads:16800, likes:1120, thumb:'https://picsum.photos/seed/ig2/400/700', downloadUrl:'#', featured:false },
  { id:21, title:'Cinematic Wallpaper Dark', category:'wallpapers', tags:['hd','mostdownloaded'], format:'JPG', size:'9MB', downloads:67000, likes:4800, thumb:'https://picsum.photos/seed/wall2/400/600', downloadUrl:'#', featured:true },
  { id:22, title:'Epic Gaming Beats', category:'music', tags:['trending','free'], format:'MP3', size:'4MB', downloads:18000, likes:1300, thumb:'https://picsum.photos/seed/mu2/200/200', downloadUrl:'#', featured:false },
  { id:23, title:'Engagement Invitation Card', category:'wedding', tags:['new','hd'], format:'PNG', size:'3.5MB', downloads:4800, likes:360, thumb:'https://picsum.photos/seed/wed2/400/600', downloadUrl:'#', featured:false },
  { id:24, title:'Animated Status Video', category:'animated', tags:['animated','trending'], format:'MP4', size:'8MB', downloads:13400, likes:940, thumb:'https://picsum.photos/seed/anim1/360/640', downloadUrl:'#', featured:false },
];

// Music samples
var MUSIC_SAMPLES = [
  { id:1, title:'Chill Lofi Study', duration:'3:24', genre:'Lofi', bpm:72, downloads:22100 },
  { id:2, title:'Epic Cinematic Rise', duration:'2:48', genre:'Cinematic', bpm:120, downloads:18500 },
  { id:3, title:'Upbeat Corporate Vibe', duration:'2:15', genre:'Corporate', bpm:128, downloads:14200 },
  { id:4, title:'Romantic Acoustic Guitar', duration:'4:10', genre:'Acoustic', bpm:80, downloads:9800 },
  { id:5, title:'Hip Hop Trap Beat', duration:'3:02', genre:'Hip Hop', bpm:140, downloads:31000 },
  { id:6, title:'Meditation Ambient', duration:'5:30', genre:'Ambient', bpm:60, downloads:7600 },
];

// Trending search terms
var TRENDING_SEARCHES = [
  'Instagram Templates', 'Wedding Cards', '4K Wallpapers',
  'YouTube Thumbnails', 'Free Music', 'Diwali Greetings',
  'Birthday Invitation', 'Lofi Beats', 'PNG Stickers', 'Meme Templates'
];
