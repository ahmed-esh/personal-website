document.addEventListener('DOMContentLoaded', function () {
  let openApp = null;

  const apps = [
    { key: "video", label: "Video", emoji: "🎥" },
    { key: "frames", label: "Frames", emoji: "🖼️" },
    { key: "instagram", label: "Socials", emoji: "📷" },
    { key: "game", label: "Game", emoji: "🎮" },
    { key: "contact", label: "Contact", emoji: "✉️" },
    { key: "about", label: "About", emoji: "ℹ️" },
  ];

  const sampleVideos = [
    {
      title: "Chiedo Asilo",
      yearType: "2025, Animation",
      description: "Following the story of a young boy in a trafficking scene",
      src: "https://www.youtube.com/watch?v=NVqyyPoi4xs&t=110s",
      thumbnail: "src/assets/images/chiedo.webp",
    },
    {
      title: "SHAR",
      yearType: "2024, Animation, Digital Drawing",
      description:
        "Young Ahmed embarks on a personal journey into Libya's colonial past.",
      src: "https://drive.google.com/file/d/1_UNxKK8as9O3TVvWt76Y5bf7LJMN4JY2/view?usp=sharing",
      thumbnail: "src/assets/images/SHAR.png",
    },
  ];

  function render() {
    const root = document.getElementById('root');
    if (!root) return;

    if (!openApp) {
      root.innerHTML = `
        <div class="center min-h-screen">
          <div class="phone-container">
            <img src="src/assets/phone animation/phone 1 open.png" alt="Phone" class="phone-sprite">
            <div class="phone-screen-content">
              <div class="app-grid">
                ${apps.map(app => `
                  <button class="app-icon" data-app="${app.key}">
                    <div class="text-2xl">${app.emoji}</div>
                    <div class="text-xs">${app.label}</div>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
          <p style="color:#9ca3af; font-size:0.75rem; margin-top:1rem;">Tap any app</p>
        </div>
      `;
    } else {
      renderFullApp(openApp);
    }

    attachListeners();
  }

  function renderFullApp(appKey) {
    const root = document.getElementById('root');

    switch (appKey) {
      case 'video':
        root.innerHTML = `
          <div class="fullscreen-app">
            <header>
              <button class="back-btn">← Back</button>
              <h2>Video Gallery</h2>
            </header>
            ${sampleVideos.map(v => `
              <div class="video-card">
                <img src="${v.thumbnail}" alt="${v.title}">
                <div>
                  <div class="text-lg text-white">${v.title}</div>
                  <div class="text-gray-400">${v.yearType}</div>
                  <p class="text-gray-400" style="margin-top:0.5rem;">${v.description}</p>
                  <a href="${v.src}" target="_blank" class="text-sky-400">Watch →</a>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'about':
        root.innerHTML = `
          <div class="fullscreen-app">
            <header>
              <button class="back-btn">← Back</button>
              <h2>About</h2>
            </header>
            <p>Ahmed Shuwehdi is a multimedia artist working with film, animation, and interactive media exploring Libyan identity, memory, and place.</p>
            <p style="margin-top:1rem;">His works span from hand-drawn animation to immersive digital experiences, merging technology and storytelling.</p>
          </div>
        `;
        break;

      case 'contact':
        root.innerHTML = `
          <div class="fullscreen-app center">
            <header>
              <button class="back-btn">← Back</button>
              <h2>Contact</h2>
            </header>
            <p class="text-lg">📧 info@ahmedesh.com</p>
          </div>
        `;
        break;

      case 'game':
        root.innerHTML = `
          <div class="fullscreen-app center">
            <header>
              <button class="back-btn">← Back</button>
              <h2>Snake Game</h2>
            </header>
            <p>Game coming soon...</p>
          </div>
        `;
        break;

      default:
        root.innerHTML = `<div class="fullscreen-app"><button class="back-btn">← Back</button><p>Coming soon</p></div>`;
    }

    attachListeners();
  }

  function attachListeners() {
    document.querySelectorAll('.app-icon').forEach(btn => {
      btn.addEventListener('click', e => {
        openApp = e.currentTarget.dataset.app;
        render();
      });
    });

    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        openApp = null;
        render();
      });
    }
  }

  render();
});
