// Vanilla JavaScript version of the portfolio app
document.addEventListener('DOMContentLoaded', function() {
  let openApp = null;
  let galleryModal = null;
  let themeAudio = null;
  let time = new Date();
  let appRefs = [];

  const apps = [
    { key: "video", label: "Video", emoji: "🎥" },
    { key: "xr", label: "XR", emoji: "🌐" },
    { key: "frames", label: "Frames", emoji: "🖼️" },
    { key: "game", label: "Game", emoji: "🎮" },
    { key: "contact", label: "Contact", emoji: "✉️" },
    { key: "about", label: "About", emoji: "ℹ️" },
  ];
  const numCols = 3;

  // Video projects data
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
      src: "assets/videos/Ciarat AL-hosh.mp4",
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

  // Initialize audio
  function initAudio() {
    try {
      themeAudio = new Audio("assets/sounds/theme.mp3");
      themeAudio.loop = true;
      themeAudio.volume = 0.35;
      themeAudio.play().catch(() => {});
    } catch (e) {
      console.log("Audio not available");
    }
  }

  // Update time
  function updateTime() {
    time = new Date();
    const timeElement = document.querySelector('.time-display');
    if (timeElement) {
      timeElement.textContent = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  // Keyboard navigation
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

  // Global keyboard handler
  function onKey(e) {
    if (e.key === "Escape") {
      openApp = null;
      render();
    }
  }

  // Render the app
  function render() {
    const root = document.getElementById('root');
    if (!root) return;

    const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    root.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black animate-gradient text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none glitch-overlay"></div>

        <div class="relative z-10 flex flex-col items-center max-w-xs sm:max-w-md overflow-hidden mx-auto">
          <h1 class="mb-6 tracking-widest text-sm text-gray-400">AHMED E — PORTFOLIO</h1>

          <div class="phone-outer w-80 md:w-96 bg-black/90 border border-zinc-800 rounded-3xl shadow-2xl p-4">
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

          <div class="mt-6 text-gray-500 text-xs">Prototype — click apps to open. Press ESC to close.</div>
        </div>

        ${galleryModal !== null ? renderGalleryModal() : ''}
      </div>
    `;

    // Re-attach event listeners
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
        return renderXRApp();
      case "frames":
        return renderFramesApp();
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
      // Assume local video file
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

  function renderXRApp() {
    const sampleXR = [
      { title: "XR Scene 1", desc: "Placeholder 3D scene (replace with A-Frame/GLB embed)" },
      { title: "XR Scene 2", desc: "Placeholder interaction demo" },
    ];

    return `
      <div class="h-full overflow-auto">
        <div class="flex items-center justify-between mb-3">
          <button class="back-btn text-sm text-cyan-300">Back</button>
          <div class="text-xs text-gray-400">XR / VR Samples</div>
          <div></div>
        </div>
        <div class="space-y-3">
          ${sampleXR.map((x, i) => `
            <div class="bg-zinc-900 rounded p-3">
              <div class="font-medium">${x.title}</div>
              <div class="text-xs text-gray-400 mb-2">${x.desc}</div>
              <div class="w-full h-36 bg-black/40 rounded flex items-center justify-center text-xs">
                Placeholder for A-Frame / Three.js viewer
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderFramesApp() {
    const frames = [
      { title: "Still 1", caption: "Child's perspective drawing", src: "assets/images/frame1.jpg" },
      { title: "Still 2", caption: "Family scene (placeholder)", src: "assets/images/frame2.jpg" },
      { title: "Still 3", caption: "Cars (placeholder)", src: "assets/images/frame3.jpg" },
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
              <div class="w-full h-32 bg-black/40 rounded mb-2 flex items-center justify-center text-xs">
                Image ${i + 1}
              </div>
              <div class="text-sm">${f.title}</div>
              <div class="text-xs text-gray-400">${f.caption}</div>
            </div>
          `).join('')}
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
        <div class="space-y-3 text-sm">
          <div>
            <strong>Email:</strong> yourname@example.com
          </div>
          <div>
            <strong>Instagram:</strong> @yourhandle
          </div>
          <div>
            <strong>Location:</strong> New York, NY
          </div>
          <form class="mt-3 space-y-2 contact-form">
            <input
              class="w-full bg-zinc-900 p-2 rounded text-sm"
              placeholder="Name"
            />
            <input
              class="w-full bg-zinc-900 p-2 rounded text-sm"
              placeholder="Email"
            />
            <textarea
              class="w-full bg-zinc-900 p-2 rounded text-sm"
              placeholder="Message"
              rows="4"
            ></textarea>
            <button
              type="submit"
              class="w-full bg-cyan-600 hover:bg-cyan-700 rounded p-2 text-white"
            >
              Send
            </button>
          </form>
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
              <a href="https://techspressionism.com/artists/" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Techspressioism | Featured Artist</a>
            </p>
            
            <p>
              <a href="https://www.benningtonbanner.com/local-news/installation-brings-celebrated-robert-frost-poem-to-virtual-reality/article_6a12b21e-80dc-11ef-b11b-cf55304afe7b.html" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Bennington banner | Interview</a>
            </p>
            
            <p>
              <a href="https://techspressionism.com/brooklyn/media/video/" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">James Dawson | Interview</a>
            </p>
            
            <p>
              <a href="https://www.mowna.org/museum/techspressionism" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Wild & Newfangled Art Museum</a><br>
              <span class="text-xs text-gray-500">Long Island City, NY<br>October 3, 2024 - January 26, 2025</span>
            </p>
            
            <p>
              <a href="https://www.bennington.edu/news-and-features/landscape-and-literature" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Robert Frost Stone House Virtual Reality Experience | Solo Exhibition</a><br>
              <span class="text-xs text-gray-500">Bennington, Vermont<br>May 2024 – October 2024</span>
            </p>
            
            <p>
              <a href="https://techspressionism.com/brooklyn/" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">Hello Brooklyn—Group Exhibition</a><br>
              <span class="text-xs text-gray-500">Kingsborough Art Museum, Brooklyn, NY<br>August 7 – September 25, 2024</span>
            </p>
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
    // App icon clicks
    document.querySelectorAll('.app-icon').forEach(btn => {
      btn.addEventListener('click', function() {
        openApp = this.dataset.app;
        render();
        if (openApp === 'game') {
          initGame();
        }
      });
    });

    // Back button clicks
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        openApp = null;
        render();
      });
    });

    // Open video buttons
    document.querySelectorAll('.open-video-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        galleryModal = parseInt(this.dataset.index);
        render();
      });
    });

    // Close modal
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', function() {
        galleryModal = null;
        render();
      });
    });

    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert("Replace with real form handler");
      });
    }

    // Game controls
    document.querySelectorAll('.game-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const direction = this.dataset.direction;
        handleGameInput(direction);
      });
    });

    // Keyboard navigation
    const homeGrid = document.querySelector('[tabindex="0"]');
    if (homeGrid) {
      homeGrid.addEventListener('keydown', onAppGridKeyDown);
    }

    // Store app refs for keyboard navigation
    appRefs = Array.from(document.querySelectorAll('.app-icon'));
  }

  // Game variables
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

      // Check collision with self
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

      // Draw
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 260, 220);
      
      ctx.fillStyle = "#00ffff";
      ctx.fillRect(food.x * scale, food.y * scale, scale, scale);
      
      ctx.fillStyle = "#bb86fc";
      for (let s of snake) {
        ctx.fillRect(s.x * scale, s.y * scale, scale - 1, scale - 1);
      }
    }

    // Clear previous interval
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 120);

    // Keyboard controls
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

    // Cleanup function
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

  // Initialize
  function init() {
    initAudio();
    render();
    
    // Start time updates
    setInterval(updateTime, 1000);
    
    // Global keyboard handler
    window.addEventListener('keydown', onKey);
  }

  // Start the app
  init();
}); 