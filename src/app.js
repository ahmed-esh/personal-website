import { renderXRApp, initXRScene } from './xr.js';

document.addEventListener('DOMContentLoaded', function() {
  let openApp = null;
  let galleryModal = null;
  let interactiveModal = false;
  let interactivePage = 0;
  let themeAudio = null;
  let gameAudio = null;
  let time = new Date();
  let appRefs = [];

  const apps = [
    { key: "video", label: "Video", emoji: "🎥" },
    { key: "xr", label: "XR", emoji: "🌐" },
    { key: "frames", label: "Frames", emoji: "🖼️" },
    { key: "interactives", label: "Interactives", emoji: "🎨" },
    { key: "instagram", label: "Socials", emoji: "📷" },
    { key: "game", label: "Game", emoji: "🎮" },
    { key: "contact", label: "Contact", emoji: "✉️" },
    { key: "about", label: "About", emoji: "ℹ️" },
  ];
  const numCols = 3;

  const sampleVideos = [
    { 
      title: "Chiedo Asilo", 
      yearType: "2025, Animation",
      description: "Following the story of a young boy in a trafficking scene",
      src: "https://www.youtube.com/watch?v=NVqyyPoi4xs&t=110s",
      thumbnail: "src/assets/images/chiedo.webp"
    },
    { 
      title: "SHAR", 
      yearType: "2024, Animation, Digital Drawing",
      description: "young Ahmed embarks on a personal journey into Libya's colonial past, guided by a poignant conversation with his grandfather.",
      src: "https://drive.google.com/file/d/1_UNxKK8as9O3TVvWt76Y5bf7LJMN4JY2/view?usp=sharing",
      thumbnail: "src/assets/images/SHAR.png"
    },
    { 
      title: "Ciarat AL-hosh", 
      yearType: "2024, Film, Digital Drawing",
      description: "an experimental project that combines live-action footage with digitally illustrated cars, serving as a visual metaphor for the intersections of life choices, family dynamics, and societal class structures",
      src: "https://www.youtube.com/watch?v=v4nr08ajLZY",
      thumbnail: "src/assets/images/Ciarat.png"
    },
    { 
      title: "Benghazi 101", 
      yearType: "2023, Motion Graphic",
      description: "Honing in on the 2012 attacks in Benghazi through a personal lens. This motion graphic intertwines a kid's lived experience.",
      src: "https://www.youtube.com/watch?v=UjZEar7cqBo&t=5s",
      thumbnail: "src/assets/images/Benghazi.png"
    },
  ];

  function initAudio() {
    try {
      themeAudio = new Audio("src/assets/sounds/theme.mp3");
      themeAudio.loop = true;
      themeAudio.volume = 0.35;
      
      gameAudio = new Audio("src/assets/sounds/game app.mp3");
      gameAudio.loop = true;
      gameAudio.volume = 0.35;
      
      themeAudio.addEventListener('loadeddata', () => {
        console.log("Theme audio loaded successfully");
      });
      
      gameAudio.addEventListener('loadeddata', () => {
        console.log("Game audio loaded successfully");
      });
      
      console.log("Audio initialized - waiting for user interaction to start");
    } catch (e) {
      console.log("Audio not available:", e);
    }
  }

  function startThemeMusic() {
    if (themeAudio && themeAudio.paused) {
      themeAudio.play().catch((e) => {
        console.log("Theme audio failed to play:", e);
      });
    }
  }

  function switchToGameMusic() {
    console.log("Switching to game music");
    if (themeAudio && gameAudio) {
      themeAudio.pause();
      gameAudio.play().catch((e) => {
        console.log("Game audio failed to play:", e);
      });
    }
  }

  function switchToThemeMusic() {
    console.log("Switching back to theme music");
    if (themeAudio && gameAudio) {
      gameAudio.pause();
      themeAudio.play().catch((e) => {
        console.log("Theme audio failed to play:", e);
      });
    }
  }

  function pauseThemeMusic() {
    console.log("Pausing theme music for video");
    if (themeAudio && !themeAudio.paused) {
      themeAudio.pause();
    }
  }

  function updateTime() {
    time = new Date();
    const timeElement = document.querySelector('.time-display');
    if (timeElement) {
      timeElement.textContent = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  // keybord navigation
  function onAppGridKeyDown(e) {
    const currentIndex = appRefs.findIndex(el => el === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    switch (e.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % apps.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + apps.length) % apps.length;
        break;
      case "ArrowDown":
        nextIndex = (currentIndex + numCols) % apps.length;
        break;
      case "ArrowUp":
        nextIndex = (currentIndex - numCols + apps.length) % apps.length;
        break;
      default:
        return;
    }
    if (appRefs[nextIndex]) {
      appRefs[nextIndex].focus();
    }
    e.preventDefault();
  }

  function onKey(e) {
    if (e.key === "Escape") {
      if (openApp === "game") {
        switchToThemeMusic();
      }
      if (galleryModal !== null) {
        if (themeAudio && !openApp) {
          themeAudio.play().catch(() => {});
        }
        galleryModal = null;
      }
      if (interactiveModal) {
        if (themeAudio && !openApp) {
          themeAudio.play().catch(() => {});
        }
        interactiveModal = false;
        interactivePage = 0; // Reset page when closing with ESC
      }
      openApp = null;
      render();
    }
  }

  function render() {
    const root = document.getElementById('root');
    if (!root) return;

    const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    root.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black animate-gradient text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none glitch-overlay"></div>

        <div class="relative z-10 flex flex-col items-center max-w-xs sm:max-w-md overflow-hidden mx-auto">
          <h1 class="mb-6 tracking-widest text-sm text-gray-400">AHMED ESH Phone</h1>

          <div class="phone-outer w-80 md:w-96 bg-black/90 border border-zinc-800 rounded-3xl shadow-2xl p-4" onclick="startThemeMusicIfNeeded()">
            <div class="notch w-24 h-3 bg-zinc-900 rounded-b-xl mx-auto mb-2"></div>

            <div class="phone-screen bg-[#020202] rounded-2xl p-4 h-96 md:h-[540px] overflow-hidden relative">
              <div class="flex justify-between items-center text-xs text-gray-500 mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-emerald-400/80"></div>
                  <span>Libyana network</span>
                </div>
                <div class="opacity-60 time-display">${formattedTime}</div>
              </div>

              ${!openApp ? renderHomeGrid() : renderAppScreen()}
            </div>

            <div class="mt-3 flex justify-center">
              <div class="w-10 h-2 bg-zinc-800 rounded-full"></div>
            </div>
          </div>

          <div class="mt-6 text-gray-500 text-xs">Click apps to open. Press ESC to close.</div>
        </div>

        ${galleryModal !== null ? renderGalleryModal() : ''}
        ${interactiveModal ? renderInteractiveModal() : ''}
      </div>
    `;

    attachEventListeners();
  }

  function renderHomeGrid() {
    return `
      <div class="h-full flex flex-col items-center justify-center" tabindex="0">
        <div class="grid grid-cols-3 gap-4 place-items-center">
          ${apps.map(({ key, label, emoji }, i) => `
            <button
              class="app-icon w-20 h-20 bg-zinc-900/70 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform"
              data-app="${key}"
              tabindex="-1"
            >
              <div class="text-2xl">${emoji}</div>
              <div class="text-xs text-gray-300">${label}</div>
            </button>
          `).join('')}
        </div>
        <div class="mt-6 text-gray-500 text-xs">Hover icons • Click or tap to open</div>
      </div>
    `;
  }

  function renderAppScreen() {
    switch (openApp) {
      case "video":
        return renderVideoApp();
      case "xr":
        console.log("Rendering XR app with imported function...");
        return renderXRApp();
      case "frames":
        return renderFramesApp();
      case "interactives":
        return renderInteractivesApp();
      case "instagram":
        return renderInstagramApp();
      case "contact":
        return renderContactApp();
      case "game":
        return renderGameApp();
      case "about":
        return renderAboutApp();
      default:
        return renderHomeGrid();
    }
  }

  function renderVideoApp() {

    return `
      <div class="h-full overflow-auto">
        <div class="flex items-center justify-between mb-3">
          <button class="back-btn text-sm text-cyan-300">Back</button>
          <div class="text-xs text-gray-400">Video Gallery</div>
          <div></div>
        </div>
        <div class="space-y-4">
          ${sampleVideos.map((v, i) => `
            <div class="bg-zinc-900 rounded-lg p-4 flex gap-4 items-center hover:bg-zinc-800 transition-colors">
              <img src="${v.thumbnail}" alt="${v.title} thumbnail" class="w-24 h-16 object-cover rounded-lg">
              <div class="flex-1">
                <div class="font-semibold text-lg mb-1">${v.title}</div>
                <div class="text-sm text-gray-400">${v.yearType}</div>
              </div>
              <button class="open-video-btn px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors" data-index="${i}">
                Open
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderGalleryModal() {
    if (galleryModal === null) return '';
    const video = sampleVideos[galleryModal];

    let mediaContent = '';
    let videoSrc = video.src;

    if (videoSrc.includes("youtube.com/watch?v=")) {
      const videoId = videoSrc.split('v=')[1].split('&')[0];
      mediaContent = `<iframe class="w-full h-full" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (videoSrc.includes("drive.google.com/file/d/")) {
      const fileId = videoSrc.split('/d/')[1].split('/view')[0];
      mediaContent = `<iframe class="w-full h-full" src="https://docs.google.com/file/d/${fileId}/preview" frameborder="0" allowfullscreen></iframe>`;
    } else {
      mediaContent = `<video controls autoplay class="w-full h-full"><source src="${videoSrc}" type="video/mp4">Your browser does not support the video tag.</video>`;
    }

    return `
      <div class="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50 gallery-modal">
        <div class="w-11/12 h-3/4 max-w-5xl max-h-[80vh] bg-black flex items-center justify-center rounded-lg overflow-hidden">
          ${mediaContent}
        </div>
        <button
          class="close-modal absolute top-6 right-6 text-white bg-red-600 rounded-full w-8 h-8 flex justify-center items-center hover:bg-red-700 transition-colors"
        >
          ✕
        </button>
        <div class="text-center mt-6 max-w-3xl">
          <h3 class="text-white text-2xl font-bold mb-2">${video.title}</h3>
          <p class="text-sky-400 text-lg mb-4">${video.yearType}</p>
          <p class="text-gray-300 text-base leading-relaxed">${video.description}</p>
        </div>
      </div>
    `;
  }

  function renderInteractiveModal() {
    const interactivePages = [
      {
        title: "Welcome to My Interactive Portfolio",
        content: `
          <div class="text-center">
            <h1 class="text-4xl font-bold text-white mb-6">Ahmed Shuwehdi</h1>
            <p class="text-xl text-gray-300 mb-8">Multimedia Artist & XR Creator</p>
            <p class="text-lg text-gray-400 max-w-2xl mx-auto">
              Explore my journey as a multimedia artist specializing in Extended Reality (XR), 
              Virtual Reality (VR), and immersive digital experiences that engage with political 
              issues from my home country, Libya.
            </p>
          </div>
        `
      },
      {
        title: "About My Work",
        content: `
          <div class="text-center">
            <h2 class="text-3xl font-bold text-white mb-6">My Artistic Journey</h2>
            <p class="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
              My work encompasses animations, motion graphics, and captured videos that engage 
              with political issues, particularly those from Libya. Through my creations, I strive 
              to bring awareness and provoke thought about the complexities and challenges faced by Libyans.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div class="bg-white/10 rounded-lg p-6">
                <div class="text-4xl mb-4">🎨</div>
                <h3 class="text-xl font-semibold mb-2">Digital Art</h3>
                <p class="text-gray-300">Immersive digital experiences</p>
              </div>
              <div class="bg-white/10 rounded-lg p-6">
                <div class="text-4xl mb-4">🌐</div>
                <h3 class="text-xl font-semibold mb-2">XR Projects</h3>
                <p class="text-gray-300">Virtual Reality experiences</p>
              </div>
              <div class="bg-white/10 rounded-lg p-6">
                <div class="text-4xl mb-4">🎬</div>
                <h3 class="text-xl font-semibold mb-2">Video Art</h3>
                <p class="text-gray-300">Political narratives</p>
              </div>
            </div>
          </div>
        `
      },
      {
        title: "Featured Projects",
        content: `
          <div class="text-center">
            <h2 class="text-3xl font-bold text-white mb-8">My Recent Work</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-white/10 rounded-lg p-6">
                <div class="h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4 flex items-center justify-center">
                  <span class="text-4xl">🎨</span>
                </div>
                <h3 class="text-xl font-semibold mb-2">Robert Frost VR Experience</h3>
                <p class="text-gray-300 mb-3">Immersive virtual environment at the Robert Frost House</p>
                <span class="inline-block bg-purple-500 text-white px-3 py-1 rounded-full text-sm">VR</span>
              </div>
              <div class="bg-white/10 rounded-lg p-6">
                <div class="h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg mb-4 flex items-center justify-center">
                  <span class="text-4xl">🎬</span>
                </div>
                <h3 class="text-xl font-semibold mb-2">Chiedo Asilo</h3>
                <p class="text-gray-300 mb-3">Animation following a young boy in a trafficking scene</p>
                <span class="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Animation</span>
              </div>
              <div class="bg-white/10 rounded-lg p-6">
                <div class="h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg mb-4 flex items-center justify-center">
                  <span class="text-4xl">🌐</span>
                </div>
                <h3 class="text-xl font-semibold mb-2">SHAR</h3>
                <p class="text-gray-300 mb-3">Personal journey into Libya's colonial past</p>
                <span class="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">Digital Drawing</span>
              </div>
              <div class="bg-white/10 rounded-lg p-6">
                <div class="h-32 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg mb-4 flex items-center justify-center">
                  <span class="text-4xl">🎭</span>
                </div>
                <h3 class="text-xl font-semibold mb-2">Ciarat AL-hosh</h3>
                <p class="text-gray-300 mb-3">Experimental project combining live-action and digital illustration</p>
                <span class="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">Film</span>
              </div>
            </div>
          </div>
        `
      },
      {
        title: "Education & Exhibitions",
        content: `
          <div class="text-center">
            <h2 class="text-3xl font-bold text-white mb-8">My Journey</h2>
            <div class="max-w-4xl mx-auto">
              <div class="bg-white/10 rounded-lg p-8 mb-6">
                <h3 class="text-2xl font-semibold mb-4">Education</h3>
                <p class="text-lg text-gray-300">Currently studying at Bennington College, Vermont</p>
              </div>
              <div class="bg-white/10 rounded-lg p-8">
                <h3 class="text-2xl font-semibold mb-4">Recent Exhibitions</h3>
                <div class="text-left space-y-4">
                  <div class="flex items-start">
                    <span class="text-2xl mr-4">🏛️</span>
                    <div>
                      <p class="font-semibold text-white">Wild & Newfangled Art Museum</p>
                      <p class="text-gray-300">Long Island City, NY • October 2024 - January 2025</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <span class="text-2xl mr-4">🏠</span>
                    <div>
                      <p class="font-semibold text-white">Robert Frost Stone House VR Experience</p>
                      <p class="text-gray-300">Bennington, Vermont • May 2024 - October 2024</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <span class="text-2xl mr-4">🎨</span>
                    <div>
                      <p class="font-semibold text-white">Hello Brooklyn—Group Exhibition</p>
                      <p class="text-gray-300">Kingsborough Art Museum, Brooklyn, NY • August 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      },
      {
        title: "Get In Touch",
        content: `
          <div class="text-center">
            <h2 class="text-3xl font-bold text-white mb-8">Connect With Me</h2>
            <div class="max-w-2xl mx-auto">
              <div class="bg-white/10 rounded-lg p-8 mb-6">
                <h3 class="text-2xl font-semibold mb-6">Contact Information</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-center">
                    <span class="text-2xl mr-4">📧</span>
                    <span class="text-lg">info@ahmedesh.com</span>
                  </div>
                  <div class="flex items-center justify-center">
                    <span class="text-2xl mr-4">🎓</span>
                    <span class="text-lg">Bennington College, Vermont</span>
                  </div>
                </div>
              </div>
              <div class="bg-white/10 rounded-lg p-8">
                <h3 class="text-2xl font-semibold mb-6">Social Media</h3>
                <div class="space-y-4">
                  <a href="https://www.instagram.com/ahmed.eshhh/" target="_blank" class="flex items-center justify-center text-purple-300 hover:text-purple-200 transition-colors">
                    <span class="text-2xl mr-4">📷</span>
                    <span class="text-lg">@ahmed.eshhh</span>
                  </a>
                  <a href="https://www.linkedin.com/in/ahmed-shuwehdi-5130a819b/" target="_blank" class="flex items-center justify-center text-blue-300 hover:text-blue-200 transition-colors">
                    <span class="text-2xl mr-4">💼</span>
                    <span class="text-lg">LinkedIn Profile</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ];

    return `
      <div class="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50 interactive-modal">
        <div class="w-11/12 h-3/4 max-w-5xl max-h-[80vh] bg-black flex items-center justify-center rounded-lg overflow-hidden">
          <div id="interactive-content" class="w-full h-full flex items-center justify-center p-8">
            ${interactivePages[0].content}
          </div>
        </div>
        <button
          class="close-interactive-modal absolute top-6 right-6 text-white bg-red-600 rounded-full w-8 h-8 flex justify-center items-center hover:bg-red-700 transition-colors"
        >
          ✕
        </button>
        <div class="text-center mt-6 max-w-3xl">
          <h3 class="text-white text-2xl font-bold mb-2" id="interactive-title">${interactivePages[0].title}</h3>
          <div class="flex justify-center space-x-4 mt-4">
            <button id="prev-interactive" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors" disabled>
              ← Previous
            </button>
            <button id="next-interactive" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>
    `;
  }



  function renderFramesApp() {
    const frames = [
      { title: "Shas", src: "src/assets/picsforstils/Shas.png" },
      { title: "Italian Kids", src: "src/assets/picsforstils/Italian Kids.png" },
      { title: "SHAR 4", src: "src/assets/picsforstils/SHAR 4.png" },
      { title: "Soldiers", src: "src/assets/picsforstils/soilders.png" },
      { title: "Woke Up Like This", src: "src/assets/picsforstils/Woke up like this.png" },
      { title: "For Instagram 2", src: "src/assets/picsforstils/for instgram 2.png" },
      { title: "Dodge 1", src: "src/assets/picsforstils/Dodge 1.png" },
      { title: "The Fight After Prayer", src: "src/assets/picsforstils/the fight after prayer.png" },
      { title: "Friday", src: "src/assets/picsforstils/Friday.png" },
      { title: "Bozaid", src: "src/assets/picsforstils/Bozaid.png" },
    ];

    return `
      <div class="h-full overflow-auto">
        <div class="flex items-center justify-between mb-3">
          <button class="back-btn text-sm text-cyan-300">Back</button>
          <div class="text-xs text-gray-400">Stills / Frames</div>
          <div></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${frames.map((f, i) => `
            <div class="bg-zinc-900 rounded p-2">
              <a href="${f.src}" target="_blank" class="block">
                <img src="${f.src}" alt="${f.title}" class="w-full h-32 object-cover rounded mb-2 cursor-pointer hover:opacity-80 transition-opacity">
              </a>
              <div class="text-sm font-semibold">${f.title}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderInteractivesApp() {
    return `
      <div class="h-full overflow-auto">
        <div class="flex items-center justify-between mb-3">
          <button class="back-btn text-sm text-cyan-300">Back</button>
          <div class="text-xs text-gray-400">Interactives</div>
          <div></div>
        </div>
        <div class="h-full flex flex-col items-center justify-center bg-zinc-900 rounded-lg p-6">
          <div class="text-center">
            <div class="text-6xl mb-6">🎨</div>
            <h3 class="text-2xl font-bold text-white mb-4">Interactive Portfolio</h3>
            <p class="text-gray-400 mb-6 max-w-sm">
              Explore my interactive portfolio with immersive experiences and multimedia projects.
            </p>
            <button 
              class="open-interactive-btn inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Open Interactive Portfolio
            </button>
            <p class="text-xs text-gray-500 mt-4">
              Opens in full-screen overlay
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function renderContactApp() {
    return `
      <div class="h-full overflow-auto px-1">
        <div class="flex items-center justify-between mb-3">
          <button class="back-btn text-sm text-cyan-300">Back</button>
          <div class="text-xs text-gray-400">Contact</div>
          <div></div>
        </div>
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="text-4xl mb-4">✉️</div>
            <div class="text-lg font-semibold text-white mb-2">Get in Touch</div>
            <div class="text-cyan-300 text-xl font-mono">info@ahmedesh.com</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAboutApp() {
    return `
      <div class="h-full overflow-auto px-1 text-sm text-gray-400">
        <div class="flex items-center justify-between mb-3">
          <button class="back-btn text-sm text-cyan-300">Back</button>
          <div class="text-xs text-gray-400">About</div>
          <div></div>
        </div>
        <div class="space-y-4">
          <p>
            Ahmed Shuwehdi, a multimedia artist specializing in Extended Reality (XR), Virtual Reality (VR), Augmented Reality (AR), and video art. My work encompasses animations, motion graphics, and captured videos that engage with political issues, particularly those from my home country, Libya.
          </p>
          
          <p>
            My artistic journey has been deeply influenced by the political landscape and the stories of my homeland. Through my creations, I strive to bring awareness and provoke thought about the complexities and challenges faced by Libyans.
          </p>
          
          <p>
            In addition to my video work, I create immersive VR art experiences. These experiences are not traditional video games but rather artistic explorations in virtual environments. One of my recent projects involved a VR experience at the Robert Frost House, where I designed an immersive environment that allows visitors to live in the house and experience the atmosphere and era when Frost penned his poems.
          </p>
          
          <p>
            Currently, I am a student at Bennington College in Vermont, where I continue to expand my skills and artistic vision. My roots in Libya and my experiences in the United States profoundly shape my artistic perspective, driving me to create work that bridges cultural divides and fosters understanding.
          </p>
          
          <div class="space-y-3">
            <h3 class="font-semibold text-cyan-300">Exhibitions and interviews:</h3>
            
            <p>
              Techspressioism | Featured Artist - <a href="https://techspressionism.com/artists/" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Link</a>
            </p>
            
            <p>
              Bennington banner | Interview - <a href="https://www.benningtonbanner.com/local-news/installation-brings-celebrated-robert-frost-poem-to-virtual-reality/article_6a12b21e-80dc-11ef-b11b-cf55304afe7b.html" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Link</a>
            </p>
            
            <p>
              James Dawson | Interview - <a href="https://techspressionism.com/brooklyn/media/video/" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Link</a>
            </p>
            
            <p>
              Wild & Newfangled Art Museum - <a href="https://www.mowna.org/museum/techspressionism" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Link</a><br>
              <span class="text-xs text-gray-500">Long Island City, NY<br>October 3, 2024 - January 26, 2025</span>
            </p>
            
            <p>
              Robert Frost Stone House Virtual Reality Experience | Solo Exhibition - <a href="https://www.bennington.edu/news-and-features/landscape-and-literature" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Link</a><br>
              <span class="text-xs text-gray-500">Bennington, Vermont<br>May 2024 – October 2024</span>
            </p>
            
            <p>
              Hello Brooklyn—Group Exhibition - <a href="https://techspressionism.com/brooklyn/" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Link</a><br>
              <span class="text-xs text-gray-500">Kingsborough Art Museum, Brooklyn, NY<br>August 7 – September 25, 2024</span>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function renderInstagramApp() {
  return `
    <div class="h-full overflow-auto px-1 text-sm text-gray-400">
      <div class="flex items-center justify-between mb-3">
        <button class="back-btn text-sm text-cyan-300">Back</button>
        <div class="text-xs text-gray-400">Socials</div>
        <div></div>
      </div>
      <div class="space-y-4">
        <div class="bg-zinc-900 rounded-lg p-6 text-center">
          <div class="text-4xl mb-4">📷</div>
          <h4 class="text-lg font-semibold text-white mb-2">@ahmed.eshhh</h4>
          <p class="text-sm text-gray-400 mb-4">Multimedia Artist & XR Creator</p>
          <a 
            href="https://www.instagram.com/ahmed.eshhh/" 
            target="_blank" 
            class="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            View Instagram Profile
          </a>
        </div>
        
        <div class="bg-zinc-900 rounded-lg p-6 text-center">
          <div class="text-4xl mb-4">💼</div>
          <h4 class="text-lg font-semibold text-white mb-2">Ahmed Shuwehdi</h4>
          <p class="text-sm text-gray-400 mb-4">Multimedia Artist & XR Creator</p>
          <a 
            href="https://www.linkedin.com/in/ahmed-shuwehdi-5130a819b/" 
            target="_blank" 
            class="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            View LinkedIn Profile
          </a>
        </div>
      </div>
      </div>
    `;
  }

  function renderGameApp() {
    return `
      <div class="h-full flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <button class="back-btn text-sm text-cyan-300">Back</button>
          <div class="text-xs text-gray-400">Snake Game</div>
          <div></div>
        </div>
        <div class="flex justify-center">
          <div class="game-container">
            <canvas id="gameCanvas" width="260" height="220" style="border-radius: 8px; background: #000;"></canvas>
            <div id="gameControls" style="display: flex; justify-content: center; margin-top: 10px; gap: 10px;">
              <button class="game-btn" data-direction="up">⬆️</button>
              <button class="game-btn" data-direction="left">⬅️</button>
              <button class="game-btn" data-direction="down">⬇️</button>
              <button class="game-btn" data-direction="right">➡️</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }



  function attachEventListeners() {
    let musicStarted = false;
    
    document.addEventListener('xrBackButton', (event) => {
      console.log("XR back button event received:", event.detail);
      if (event.detail.action === 'close') {
        console.log("Closing XR app...");
        openApp = null;
        render();
      }
    });
    
    document.querySelectorAll('.app-icon').forEach(btn => {
      btn.addEventListener('click', function() {
        if (!musicStarted && !openApp) {
          startThemeMusic();
          musicStarted = true;
        }
        
        const appToOpen = this.dataset.app;
        console.log("Opening app:", appToOpen);
        
        if (appToOpen === 'game') {
          console.log("Game app opened, switching music");
          switchToGameMusic();
        } else if (appToOpen === 'video') {
          console.log("Video app opened, pausing theme music");
          pauseThemeMusic();
        } else if (appToOpen === 'xr') {
          console.log("XR app opened, initializing XR scene");
        }
        
        openApp = appToOpen;
        render();
        
        if (openApp === 'game') {
          initGame();
        } else if (openApp === 'xr') {
          console.log("About to call initXRScene...");
          setTimeout(() => {
            console.log("Calling initXRScene now...");
            initXRScene();
          }, 100);
        }
      });
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (openApp === "game") {
          switchToThemeMusic();
        }
        openApp = null;
        render();
      });
    });

    document.addEventListener('click', function(event) {
      if (event.target.classList.contains('back-btn') && openApp === 'xr') {
        console.log("XR back button clicked, closing XR app");
        openApp = null;
        render();
      }
    });

    document.querySelectorAll('.open-video-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        galleryModal = parseInt(this.dataset.index);
        pauseThemeMusic();
        render();
      });
    });

    document.querySelectorAll('.open-interactive-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        interactiveModal = true;
        interactivePage = 0; // Reset to first page
        pauseThemeMusic();
        render();
      });
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', function() {
        galleryModal = null;
        if (themeAudio && !openApp) {
          themeAudio.play().catch(() => {});
        }
        render();
      });
    });

    document.querySelectorAll('.close-interactive-modal').forEach(btn => {
      btn.addEventListener('click', function() {
        interactiveModal = false;
        interactivePage = 0; // Reset page when closing
        if (themeAudio && !openApp) {
          themeAudio.play().catch(() => {});
        }
        render();
      });
    });

    // Interactive modal navigation
    document.querySelectorAll('#next-interactive').forEach(btn => {
      btn.addEventListener('click', function() {
        const interactivePages = [
          {
            title: "Welcome to My Interactive Portfolio",
            content: `
              <div class="text-center">
                <h1 class="text-4xl font-bold text-white mb-6">Ahmed Shuwehdi</h1>
                <p class="text-xl text-gray-300 mb-8">Multimedia Artist & XR Creator</p>
                <p class="text-lg text-gray-400 max-w-2xl mx-auto">
                  Explore my journey as a multimedia artist specializing in Extended Reality (XR), 
                  Virtual Reality (VR), and immersive digital experiences that engage with political 
                  issues from my home country, Libya.
                </p>
              </div>
            `
          },
          {
            title: "About My Work",
            content: `
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-6">My Artistic Journey</h2>
                <p class="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
                  My work encompasses animations, motion graphics, and captured videos that engage 
                  with political issues, particularly those from Libya. Through my creations, I strive 
                  to bring awareness and provoke thought about the complexities and challenges faced by Libyans.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="text-4xl mb-4">🎨</div>
                    <h3 class="text-xl font-semibold mb-2">Digital Art</h3>
                    <p class="text-gray-300">Immersive digital experiences</p>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="text-4xl mb-4">🌐</div>
                    <h3 class="text-xl font-semibold mb-2">XR Projects</h3>
                    <p class="text-gray-300">Virtual Reality experiences</p>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="text-4xl mb-4">🎬</div>
                    <h3 class="text-xl font-semibold mb-2">Video Art</h3>
                    <p class="text-gray-300">Political narratives</p>
                  </div>
                </div>
              </div>
            `
          },
          {
            title: "Featured Projects",
            content: `
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-8">My Recent Work</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4 flex items-center justify-center">
                      <span class="text-4xl">🎨</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Robert Frost VR Experience</h3>
                    <p class="text-gray-300 mb-3">Immersive virtual environment at the Robert Frost House</p>
                    <span class="inline-block bg-purple-500 text-white px-3 py-1 rounded-full text-sm">VR</span>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg mb-4 flex items-center justify-center">
                      <span class="text-4xl">🎬</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Chiedo Asilo</h3>
                    <p class="text-gray-300 mb-3">Animation following a young boy in a trafficking scene</p>
                    <span class="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Animation</span>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg mb-4 flex items-center justify-center">
                      <span class="text-4xl">🌐</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">SHAR</h3>
                    <p class="text-gray-300 mb-3">Personal journey into Libya's colonial past</p>
                    <span class="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">Digital Drawing</span>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="h-32 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg mb-4 flex items-center justify-center">
                      <span class="text-4xl">🎭</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Ciarat AL-hosh</h3>
                    <p class="text-gray-300 mb-3">Experimental project combining live-action and digital illustration</p>
                    <span class="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">Film</span>
                  </div>
                </div>
              </div>
            `
          },
          {
            title: "Education & Exhibitions",
            content: `
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-8">My Journey</h2>
                <div class="max-w-4xl mx-auto">
                  <div class="bg-white/10 rounded-lg p-8 mb-6">
                    <h3 class="text-2xl font-semibold mb-4">Education</h3>
                    <p class="text-lg text-gray-300">Currently studying at Bennington College, Vermont</p>
                  </div>
                  <div class="bg-white/10 rounded-lg p-8">
                    <h3 class="text-2xl font-semibold mb-4">Recent Exhibitions</h3>
                    <div class="text-left space-y-4">
                      <div class="flex items-start">
                        <span class="text-2xl mr-4">🏛️</span>
                        <div>
                          <p class="font-semibold text-white">Wild & Newfangled Art Museum</p>
                          <p class="text-gray-300">Long Island City, NY • October 2024 - January 2025</p>
                        </div>
                      </div>
                      <div class="flex items-start">
                        <span class="text-2xl mr-4">🏠</span>
                        <div>
                          <p class="font-semibold text-white">Robert Frost Stone House VR Experience</p>
                          <p class="text-gray-300">Bennington, Vermont • May 2024 - October 2024</p>
                        </div>
                      </div>
                      <div class="flex items-start">
                        <span class="text-2xl mr-4">🎨</span>
                        <div>
                          <p class="font-semibold text-white">Hello Brooklyn—Group Exhibition</p>
                          <p class="text-gray-300">Kingsborough Art Museum, Brooklyn, NY • August 2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `
          },
          {
            title: "Get In Touch",
            content: `
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-8">Connect With Me</h2>
                <div class="max-w-2xl mx-auto">
                  <div class="bg-white/10 rounded-lg p-8 mb-6">
                    <h3 class="text-2xl font-semibold mb-6">Contact Information</h3>
                    <div class="space-y-4">
                      <div class="flex items-center justify-center">
                        <span class="text-2xl mr-4">📧</span>
                        <span class="text-lg">info@ahmedesh.com</span>
                      </div>
                      <div class="flex items-center justify-center">
                        <span class="text-2xl mr-4">🎓</span>
                        <span class="text-lg">Bennington College, Vermont</span>
                      </div>
                    </div>
                  </div>
                  <div class="bg-white/10 rounded-lg p-8">
                    <h3 class="text-2xl font-semibold mb-6">Social Media</h3>
                    <div class="space-y-4">
                      <a href="https://www.instagram.com/ahmed.eshhh/" target="_blank" class="flex items-center justify-center text-purple-300 hover:text-purple-200 transition-colors">
                        <span class="text-2xl mr-4">📷</span>
                        <span class="text-lg">@ahmed.eshhh</span>
                      </a>
                      <a href="https://www.linkedin.com/in/ahmed-shuwehdi-5130a819b/" target="_blank" class="flex items-center justify-center text-blue-300 hover:text-blue-200 transition-colors">
                        <span class="text-2xl mr-4">💼</span>
                        <span class="text-lg">LinkedIn Profile</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            `
          }
        ];

        if (interactivePage < interactivePages.length - 1) {
          interactivePage++;
          const contentDiv = document.getElementById('interactive-content');
          const titleDiv = document.getElementById('interactive-title');
          const prevBtn = document.getElementById('prev-interactive');
          const nextBtn = document.getElementById('next-interactive');
          
          if (contentDiv && titleDiv) {
            contentDiv.innerHTML = interactivePages[interactivePage].content;
            titleDiv.textContent = interactivePages[interactivePage].title;
          }
          
          if (prevBtn) prevBtn.disabled = false;
          if (nextBtn && interactivePage === interactivePages.length - 1) {
            nextBtn.disabled = true;
          }
        }
      });
    });

    document.querySelectorAll('#prev-interactive').forEach(btn => {
      btn.addEventListener('click', function() {
        const interactivePages = [
          {
            title: "Welcome to My Interactive Portfolio",
            content: `
              <div class="text-center">
                <h1 class="text-4xl font-bold text-white mb-6">Ahmed Shuwehdi</h1>
                <p class="text-xl text-gray-300 mb-8">Multimedia Artist & XR Creator</p>
                <p class="text-lg text-gray-400 max-w-2xl mx-auto">
                  Explore my journey as a multimedia artist specializing in Extended Reality (XR), 
                  Virtual Reality (VR), and immersive digital experiences that engage with political 
                  issues from my home country, Libya.
                </p>
              </div>
            `
          },
          {
            title: "About My Work",
            content: `
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-6">My Artistic Journey</h2>
                <p class="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
                  My work encompasses animations, motion graphics, and captured videos that engage 
                  with political issues, particularly those from Libya. Through my creations, I strive 
                  to bring awareness and provoke thought about the complexities and challenges faced by Libyans.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="text-4xl mb-4">🎨</div>
                    <h3 class="text-xl font-semibold mb-2">Digital Art</h3>
                    <p class="text-gray-300">Immersive digital experiences</p>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="text-4xl mb-4">🌐</div>
                    <h3 class="text-xl font-semibold mb-2">XR Projects</h3>
                    <p class="text-gray-300">Virtual Reality experiences</p>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="text-4xl mb-4">🎬</div>
                    <h3 class="text-xl font-semibold mb-2">Video Art</h3>
                    <p class="text-gray-300">Political narratives</p>
                  </div>
                </div>
              </div>
            `
          },
          {
            title: "Featured Projects",
            content: `
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-8">My Recent Work</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4 flex items-center justify-center">
                      <span class="text-4xl">🎨</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Robert Frost VR Experience</h3>
                    <p class="text-gray-300 mb-3">Immersive virtual environment at the Robert Frost House</p>
                    <span class="inline-block bg-purple-500 text-white px-3 py-1 rounded-full text-sm">VR</span>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg mb-4 flex items-center justify-center">
                      <span class="text-4xl">🎬</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Chiedo Asilo</h3>
                    <p class="text-gray-300 mb-3">Animation following a young boy in a trafficking scene</p>
                    <span class="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Animation</span>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg mb-4 flex items-center justify-center">
                      <span class="text-4xl">🌐</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">SHAR</h3>
                    <p class="text-gray-300 mb-3">Personal journey into Libya's colonial past</p>
                    <span class="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">Digital Drawing</span>
                  </div>
                  <div class="bg-white/10 rounded-lg p-6">
                    <div class="h-32 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg mb-4 flex items-center justify-center">
                      <span class="text-4xl">🎭</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Ciarat AL-hosh</h3>
                    <p class="text-gray-300 mb-3">Experimental project combining live-action and digital illustration</p>
                    <span class="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">Film</span>
                  </div>
                </div>
              </div>
            `
          },
          {
            title: "Education & Exhibitions",
            content: `
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-8">My Journey</h2>
                <div class="max-w-4xl mx-auto">
                  <div class="bg-white/10 rounded-lg p-8 mb-6">
                    <h3 class="text-2xl font-semibold mb-4">Education</h3>
                    <p class="text-lg text-gray-300">Currently studying at Bennington College, Vermont</p>
                  </div>
                  <div class="bg-white/10 rounded-lg p-8">
                    <h3 class="text-2xl font-semibold mb-4">Recent Exhibitions</h3>
                    <div class="text-left space-y-4">
                      <div class="flex items-start">
                        <span class="text-2xl mr-4">🏛️</span>
                        <div>
                          <p class="font-semibold text-white">Wild & Newfangled Art Museum</p>
                          <p class="text-gray-300">Long Island City, NY • October 2024 - January 2025</p>
                        </div>
                      </div>
                      <div class="flex items-start">
                        <span class="text-2xl mr-4">🏠</span>
                        <div>
                          <p class="font-semibold text-white">Robert Frost Stone House VR Experience</p>
                          <p class="text-gray-300">Bennington, Vermont • May 2024 - October 2024</p>
                        </div>
                      </div>
                      <div class="flex items-start">
                        <span class="text-2xl mr-4">🎨</span>
                        <div>
                          <p class="font-semibold text-white">Hello Brooklyn—Group Exhibition</p>
                          <p class="text-gray-300">Kingsborough Art Museum, Brooklyn, NY • August 2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `
          },
          {
            title: "Get In Touch",
            content: `
              <div class="text-center">
                <h2 class="text-3xl font-bold text-white mb-8">Connect With Me</h2>
                <div class="max-w-2xl mx-auto">
                  <div class="bg-white/10 rounded-lg p-8 mb-6">
                    <h3 class="text-2xl font-semibold mb-6">Contact Information</h3>
                    <div class="space-y-4">
                      <div class="flex items-center justify-center">
                        <span class="text-2xl mr-4">📧</span>
                        <span class="text-lg">info@ahmedesh.com</span>
                      </div>
                      <div class="flex items-center justify-center">
                        <span class="text-2xl mr-4">🎓</span>
                        <span class="text-lg">Bennington College, Vermont</span>
                      </div>
                    </div>
                  </div>
                  <div class="bg-white/10 rounded-lg p-8">
                    <h3 class="text-2xl font-semibold mb-6">Social Media</h3>
                    <div class="space-y-4">
                      <a href="https://www.instagram.com/ahmed.eshhh/" target="_blank" class="flex items-center justify-center text-purple-300 hover:text-purple-200 transition-colors">
                        <span class="text-2xl mr-4">📷</span>
                        <span class="text-lg">@ahmed.eshhh</span>
                      </a>
                      <a href="https://www.linkedin.com/in/ahmed-shuwehdi-5130a819b/" target="_blank" class="flex items-center justify-center text-blue-300 hover:text-blue-200 transition-colors">
                        <span class="text-2xl mr-4">💼</span>
                        <span class="text-lg">LinkedIn Profile</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            `
          }
        ];

        if (interactivePage > 0) {
          interactivePage--;
          const contentDiv = document.getElementById('interactive-content');
          const titleDiv = document.getElementById('interactive-title');
          const prevBtn = document.getElementById('prev-interactive');
          const nextBtn = document.getElementById('next-interactive');
          
          if (contentDiv && titleDiv) {
            contentDiv.innerHTML = interactivePages[interactivePage].content;
            titleDiv.textContent = interactivePages[interactivePage].title;
          }
          
          if (prevBtn && interactivePage === 0) {
            prevBtn.disabled = true;
          }
          if (nextBtn) nextBtn.disabled = false;
        }
      });
    });

    // Tab navigation for interactive modal
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const targetTab = this.dataset.tab;
        
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab').forEach(t => {
          t.classList.remove('active', 'text-purple-600', 'font-semibold', 'border-b-2', 'border-purple-600');
          t.classList.add('text-gray-600');
        });
        
        // Add active class to clicked tab
        this.classList.add('active', 'text-purple-600', 'font-semibold', 'border-b-2', 'border-purple-600');
        this.classList.remove('text-gray-600');
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.add('hidden');
        });
        
        // Show target tab content
        const targetContent = document.getElementById(`tab-${targetTab}`);
        if (targetContent) {
          targetContent.classList.remove('hidden');
        }
      });
    });

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert("Replace with real form handler");
      });
    }

    document.querySelectorAll('.game-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const direction = this.dataset.direction;
        handleGameInput(direction);
      });
    });

    const homeGrid = document.querySelector('[tabindex="0"]');
    if (homeGrid) {
      homeGrid.addEventListener('keydown', onAppGridKeyDown);
    }

    appRefs = Array.from(document.querySelectorAll('.app-icon'));
  }

  let gameInterval;
  let snake = [];
  let food = {};
  let direction = { x: 1, y: 0 };
  let gameAlive = true;

  function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scale = 10;
    const cols = Math.floor(260 / scale);
    const rows = Math.floor(220 / scale);

    snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    food = placeFood();
    direction = { x: 1, y: 0 };
    gameAlive = true;

    function placeFood() {
      return { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    }

    function gameLoop() {
      if (!gameAlive) return;

      const head = { 
        x: (snake[0].x + direction.x + cols) % cols, 
        y: (snake[0].y + direction.y + rows) % rows 
      };

      for (let s of snake) {
        if (s.x === head.x && s.y === head.y) {
          gameAlive = false;
          updateGameDisplay();
          return;
        }
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        food = placeFood();
      } else {
        snake.pop();
      }

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 260, 220);
      
      ctx.fillStyle = "#00ffff";
      ctx.fillRect(food.x * scale, food.y * scale, scale, scale);
      
      ctx.fillStyle = "#bb86fc";
      for (let s of snake) {
        ctx.fillRect(s.x * scale, s.y * scale, scale - 1, scale - 1);
      }
    }

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 120);

    function gameKeyHandler(e) {
      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) direction = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (direction.y === 0) direction = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          if (direction.x === 0) direction = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (direction.x === 0) direction = { x: 1, y: 0 };
          break;
      }
    }

    window.addEventListener('keydown', gameKeyHandler);

    return () => {
      if (gameInterval) clearInterval(gameInterval);
      window.removeEventListener('keydown', gameKeyHandler);
    };
  }

  function handleGameInput(directionStr) {
    switch (directionStr) {
      case "up":
        if (direction.y === 0) direction = { x: 0, y: -1 };
        break;
      case "down":
        if (direction.y === 0) direction = { x: 0, y: 1 };
        break;
      case "left":
        if (direction.x === 0) direction = { x: -1, y: 0 };
        break;
      case "right":
        if (direction.x === 0) direction = { x: 1, y: 0 };
        break;
    }
  }

  function updateGameDisplay() {
    const controls = document.getElementById('gameControls');
    if (controls) {
      if (!gameAlive) {
        controls.innerHTML = '<div style="text-align: center; margin-top: 10px; color: #fff;">Game Over - Refresh page</div>';
      }
    }
  }

  function init() {
    initAudio();
    render();
    
    setInterval(updateTime, 1000);
    
    window.addEventListener('keydown', onKey);
  }



  window.startThemeMusic = function() {
    if (themeAudio && themeAudio.paused) {
      themeAudio.play().catch((e) => {
        console.log("Theme audio failed to play:", e);
      });
    }
  };

  window.startThemeMusicIfNeeded = function() {
    if (!openApp && themeAudio && themeAudio.paused) {
      console.log("Starting theme music from phone click");
      startThemeMusic();
    }
  };

  init();
}); 