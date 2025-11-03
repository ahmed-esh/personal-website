document.addEventListener('DOMContentLoaded', function() {
  let openApp = null;
  let galleryModal = null;
  let themeAudio = null;
  let gameAudio = null;
  let appRefs = [];
  let animationStarted = false;
  let animationComplete = false;

  const apps = [
    { key: "video", label: "Video", emoji: "🎥", icon: "src/assets/website layout/visuals/video app.png", x: 618, y: 233 },
    { key: "contact", label: "Contact", emoji: "✉️", icon: "src/assets/website layout/visuals/contact app.png", x: 755, y: 234 },
    { key: "instagram", label: "Socials", emoji: "📷", icon: "src/assets/website layout/visuals/socails app.png", x: 612, y: 326 },
    { key: "game", label: "Game", emoji: "🎮", icon: "src/assets/website layout/visuals/game app.png", x: 751, y: 333 },
    { key: "frames", label: "Frames", emoji: "🖼️", icon: "src/assets/website layout/visuals/frames app.png", x: 610, y: 428 },
    { key: "about", label: "About", emoji: "ℹ️", icon: "src/assets/website layout/visuals/about app.png", x: 754, y: 426 },
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
      openApp = null;
      render();
    }
  }

  function render() {
    const root = document.getElementById('root');
    if (!root) return;

    root.innerHTML = `
      <div class="layout-container" id="layout-container">
        <!-- Background -->
        <img src="src/assets/website layout/visuals/background.png" alt="Background" class="layout-bg" />
        
        <!-- Closed Phone (only visible before animation) -->
        <img src="src/assets/phone animation/closed.png" alt="Closed Phone" class="layout-closed-phone ${animationStarted ? 'hidden' : ''}" />
        
        <!-- Initial Text (only visible before animation) -->
        <div class="layout-text-container ${animationStarted ? 'hidden' : ''}">
          <div class="layout-time-text" id="time-text"></div>
          <div class="layout-location-text">New York, NY</div>
        </div>
        
        <!-- Animation frames -->
        <img src="src/assets/phone animation/animation 1.png" alt="Animation 1" class="layout-animation layout-animation-1" />
        <img src="src/assets/phone animation/animation 2.png" alt="Animation 2" class="layout-animation layout-animation-2" />
        
        <!-- Open Phone (only visible after animation) -->
        <img src="src/assets/phone animation/phone 1 open.png" alt="Open Phone" class="layout-open-phone ${animationComplete ? 'visible' : 'hidden'}" />
        
        <!-- Phone Screen Content (only visible after animation) -->
        <div class="layout-phone-screen ${animationComplete && !openApp ? 'visible' : 'hidden'}">
          ${!openApp ? renderHomeGrid() : renderAppScreen()}
        </div>
        
        ${galleryModal !== null ? renderGalleryModal() : ''}
      </div>
    `;

    // Update time if not animated yet
    if (!animationStarted) {
      updateInitialTime();
    }

    attachEventListeners();
  }

  function updateInitialTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const timeElement = document.getElementById('time-text');
    if (timeElement) {
      timeElement.textContent = timeString;
    }
  }

  function startAnimation() {
    if (animationStarted) return;
    animationStarted = true;
    
    // Hide initial elements instantly
    render();
    
    // Step 2: Show animation 1 for 0.3s
    setTimeout(() => {
      const anim1 = document.querySelector('.layout-animation-1');
      if (anim1) anim1.classList.add('visible');
      
      // Step 3: Show animation 2 for 0.3s (after 0.3s)
      setTimeout(() => {
        if (anim1) anim1.classList.remove('visible');
        const anim2 = document.querySelector('.layout-animation-2');
        if (anim2) anim2.classList.add('visible');
        
        // Step 4: Show open phone for 0.4s and keep visible (after another 0.3s)
        setTimeout(() => {
          if (anim2) anim2.classList.remove('visible');
          animationComplete = true;
          render();
        }, 300);
      }, 300);
    }, 0);
  }

  function renderHomeGrid() {
    // Render app icons at absolute positions (relative to phone screen area)
    // Phone screen starts at (90, 45) in the 1440x1440 layout (shifted 400px left from 490)
    // So we need to offset the app positions
    const phoneScreenOffsetX = 90;
    const phoneScreenOffsetY = 45;
    
    return apps.map((app) => `
      <div class="app-icon-wrapper" style="position: absolute; left: ${app.x - phoneScreenOffsetX}px; top: ${app.y - phoneScreenOffsetY}px;">
        <button
          class="app-icon-button"
          data-app="${app.key}"
          style="position: relative; display: block; border: none; background: none; padding: 0; cursor: pointer;"
        >
          <img src="${app.icon}" alt="${app.label}" class="app-icon-image" />
          <div class="app-hover-overlay"></div>
        </button>
      </div>
    `).join('');
  }

  function renderAppScreen() {
    switch (openApp) {
      case "video":
        return renderVideoApp();
      case "frames":
        return renderFramesApp();
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
            Ahmed Shuwehdi, a multimedia artist specializing in Virtual Reality (VR), Augmented Reality (AR), and video art. My work encompasses animations, motion graphics, and captured videos that engage with political issues, particularly those from my home country, Libya.
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
          <p class="text-sm text-gray-400 mb-4">Multimedia Artist</p>
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
          <p class="text-sm text-gray-400 mb-4">Multimedia Artist</p>
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
    
    // Click anywhere to start animation (only if not started)
    if (!animationStarted) {
      const container = document.getElementById('layout-container');
      if (container) {
        container.addEventListener('click', function(e) {
          // Don't trigger if clicking on app icons or other interactive elements
          if (!e.target.closest('.app-icon-button') && !e.target.closest('.layout-phone-screen')) {
            startAnimation();
            startThemeMusicIfNeeded();
          }
        }, { once: true });
      }
    }
    
    // Hover effects for app icons
    document.querySelectorAll('.app-icon-button').forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        const overlay = this.querySelector('.app-hover-overlay');
        if (overlay) overlay.classList.add('visible');
      });
      btn.addEventListener('mouseleave', function() {
        const overlay = this.querySelector('.app-hover-overlay');
        if (overlay) overlay.classList.remove('visible');
      });
    });
    
    document.querySelectorAll('.app-icon-button').forEach(btn => {
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
        }
        
        openApp = appToOpen;
        render();
        
        if (openApp === 'game') {
          initGame();
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


    document.querySelectorAll('.open-video-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        galleryModal = parseInt(this.dataset.index);
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