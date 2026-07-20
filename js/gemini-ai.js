
const encryptedKey = "Replace_With_Encrypted_Key";

async function generateWallpaper() {
  const prompt = document.getElementById('prompt').value.trim();
  const ratio = document.getElementById('ratio').value;
  const gallery = document.getElementById('gallery');
  const loading = document.getElementById('loading');

  if (!prompt) {
    alert("Enter a prompt");
    return;
  }

  loading.classList.remove('hidden');

  try {
    const apiKey = localStorage.getItem('gemini_api_key') || decryptKey(encryptedKey);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a detailed AI wallpaper prompt for ${ratio} aspect ratio. Style: ${prompt}`
          }]
        }]
      })
    });

    const data = await response.json();

    let output = "AI Wallpaper";
    try {
      output = data.candidates[0].content.parts[0].text;
    } catch(e) {}

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(output)}?width=1920&height=1080&seed=${Date.now()}`;

    const card = document.createElement('div');
    card.className = "bg-zinc-900 p-4 rounded-2xl";

    card.innerHTML = `
      <img src="${imageUrl}" class="rounded-xl w-full mb-4"/>
      <p class="text-sm mb-4">${output}</p>
      <a href="${imageUrl}" download target="_blank" class="bg-blue-600 px-4 py-2 rounded-xl inline-block">Download</a>
    `;

    gallery.prepend(card);

    saveWallpaper({
      prompt,
      output,
      imageUrl,
      created: new Date().toISOString()
    });

  } catch(err) {
    console.error(err);
    alert("Error generating wallpaper");
  }

  loading.classList.add('hidden');
}

function saveWallpaper(item) {
  let wallpapers = JSON.parse(localStorage.getItem('ai_wallpapers') || '[]');
  wallpapers.unshift(item);
  localStorage.setItem('ai_wallpapers', JSON.stringify(wallpapers));
}

function decryptKey(key) {
  return key;
}
