document.addEventListener('DOMContentLoaded', function() {
  let openApp = null;
  let galleryModal = null;
  let currentVideoIndex = null; // Track which video is playing in video app
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
      if (galleryModal !== null) {
        galleryModal = null;
        render();
      } else if (currentVideoIndex !== null && openApp === 'video') {
        // If video is playing, go back to gallery
        currentVideoIndex = null;
        render();
      } else if (openApp) {
        // Close any open app panel
        if (openApp === "game") {
          switchToThemeMusic();
        }
        openApp = null;
        currentVideoIndex = null;
        if (themeAudio && !openApp) {
          themeAudio.play().catch(() => {});
        }
        render();
      }
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
        <div class="layout-phone-screen ${animationComplete ? 'visible' : 'hidden'}">
          ${!openApp ? renderHomeGrid() : renderAppScreen()}
        </div>

        ${galleryModal !== null ? renderGalleryModal() : ''}
        ${renderAppFullscreenPanels()}
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
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timeString = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${amPm}`;
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
    // Phone screen container is at (-10, -55) after moving 500px left and 100px up
    // Apps are at absolute coordinates (618, 755, etc.) in 1440x1440 space
    // Calculate relative position within the phone screen container to keep apps at their absolute positions
    const phoneScreenContainerX = -10; // Container left position (was 490px, moved 500px left)
    const phoneScreenContainerY = -55; // Container top position (was 45px, moved 100px up)
    
    return apps.map((app) => `
      <div class="app-icon-wrapper" style="position: absolute; left: ${app.x - phoneScreenContainerX}px; top: ${app.y - phoneScreenContainerY}px; z-index: 17;">
            <button
          class="app-icon-button"
          data-app="${app.key}"
          style="position: relative; display: block; border: none; background: none; padding: 0; cursor: pointer;"
        >
          <img src="${app.icon}" alt="${app.label}" class="app-icon-image" style="display: block;" />
          <div class="app-hover-overlay"></div>
            </button>
      </div>
    `).join('');
  }

  function renderAppScreen() {
    // All apps now render in fullscreen panels, not in phone screen
    return renderHomeGrid();
  }

  function renderAppFullscreenPanels() {
    if (!openApp) return '';
    
    switch (openApp) {
      case "video":
        return renderVideoAppFullscreen();
      case "frames":
        return renderFramesAppFullscreen();
      case "instagram":
        return renderInstagramAppFullscreen();
      case "contact":
        return renderContactAppFullscreen();
      case "game":
        return renderGameAppFullscreen();
      case "about":
        return renderAboutAppFullscreen();
      default:
        return '';
    }
  }

  function renderVideoAppFullscreen() {
    // If a video is playing, show the video player instead of gallery
    if (currentVideoIndex !== null) {
      const video = sampleVideos[currentVideoIndex];
      return `
        <div class="app-fullscreen-panel">
          <div class="app-panel-header">
            <button class="app-panel-back-btn app-panel-text-sm video-app-orange-text">Back to Gallery</button>
            <div class="app-panel-text-xs text-white">${video.title}</div>
            <button class="app-panel-close-btn app-panel-text-sm video-app-orange-text">Close</button>
          </div>
          <div class="app-panel-content">
            <div class="video-player-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
              ${renderVideoPlayer(video)}
            </div>
          </div>
        </div>
      `;
    }
    
    // Otherwise show the gallery
    return `
      <div class="app-fullscreen-panel">
        <div class="app-panel-header">
          <button class="app-panel-close-btn app-panel-text-sm video-app-orange-text">Close</button>
          <div class="app-panel-text-xs text-white">Video Gallery</div>
          <div></div>
        </div>
        <div class="app-panel-content">
          <div class="video-app-content">
            ${sampleVideos.map((v, i) => `
              <div class="bg-zinc-900 rounded-lg p-8 flex gap-8 items-center hover:bg-zinc-800 transition-colors">
                <img src="${v.thumbnail}" alt="${v.title} thumbnail" style="width: 480px; height: 270px; object-fit: cover; border-radius: 0.5rem;">
                <div class="flex-1">
                  <div class="font-semibold app-panel-text-lg mb-2 text-white">${v.title}</div>
                  <div class="app-panel-text-sm text-white">${v.yearType}</div>
                </div>
                <button class="open-video-in-app-btn app-panel-btn video-app-open-btn text-white rounded-lg transition-colors" data-index="${i}" style="margin-left: auto;">
                  Open
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderVideoPlayer(video) {
    // Check if it's a YouTube URL
    const isYouTube = video.src.includes('youtube.com');
    const isGoogleDrive = video.src.includes('drive.google.com');
    
    if (isYouTube) {
      // Extract video ID from YouTube URL
      const videoIdMatch = video.src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return `
        <div class="video-player-container">
          <iframe 
            src="${embedUrl}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="width: 100%; max-width: 1200px; height: 675px; border-radius: 0.5rem;"
          ></iframe>
          <div class="video-player-info" style="margin-top: 1rem; max-width: 1200px;">
            <h3 class="text-white app-panel-text-xl font-bold mb-2">${video.title}</h3>
            <p class="text-white app-panel-text-sm mb-2">${video.yearType}</p>
            <p class="text-white app-panel-text-sm">${video.description}</p>
          </div>
        </div>
      `;
    } else if (isGoogleDrive) {
      // For Google Drive, use the file ID to create an embed URL
      const fileIdMatch = video.src.match(/\/d\/([a-zA-Z0-9_-]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : '';
      const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      
      return `
        <div class="video-player-container">
          <iframe 
            src="${embedUrl}" 
            frameborder="0" 
            allow="autoplay"
            style="width: 100%; max-width: 1200px; height: 675px; border-radius: 0.5rem;"
          ></iframe>
          <div class="video-player-info" style="margin-top: 1rem; max-width: 1200px;">
            <h3 class="text-white app-panel-text-xl font-bold mb-2">${video.title}</h3>
            <p class="text-white app-panel-text-sm mb-2">${video.yearType}</p>
            <p class="text-white app-panel-text-sm">${video.description}</p>
              </div>
            </div>
      `;
    }
    
    return `
      <div class="video-player-container">
        <p class="text-white">Video format not supported</p>
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
          <p class="app-primary-text text-lg mb-4">${video.yearType}</p>
          <p class="text-white text-base leading-relaxed">${video.description}</p>
        </div>
      </div>
    `;
  }



  function renderFramesAppFullscreen() {
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
      <div class="app-fullscreen-panel">
        <div class="app-panel-header">
          <button class="app-panel-close-btn app-panel-text-sm app-primary-text">Close</button>
          <div class="app-panel-text-xs text-white">Stills / Frames</div>
          <div></div>
        </div>
        <div class="app-panel-content">
          <div class="grid grid-cols-2 gap-6">
            ${frames.map((f, i) => `
              <div class="bg-zinc-900 rounded p-4">
                <a href="${f.src}" target="_blank" class="block">
                  <img src="${f.src}" alt="${f.title}" class="w-full h-32 object-cover rounded mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                </a>
                <div class="app-panel-text-sm font-semibold">${f.title}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderContactAppFullscreen() {
    return `
      <div class="app-fullscreen-panel">
        <div class="app-panel-header">
          <button class="app-panel-close-btn app-panel-text-sm app-primary-text">Close</button>
          <div class="app-panel-text-xs text-white">Contact</div>
          <div></div>
        </div>
        <div class="app-panel-content">
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="app-panel-text-4xl mb-8">✉️</div>
              <div class="app-panel-text-lg font-semibold text-white mb-4">Get in Touch</div>
              <div class="app-primary-text app-panel-text-xl font-mono">info@ahmedesh.com</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAboutAppFullscreen() {
    return `
      <div class="app-fullscreen-panel">
        <div class="app-panel-header">
          <button class="app-panel-close-btn app-panel-text-sm app-primary-text">Close</button>
          <div class="app-panel-text-xs text-white">About</div>
          <div></div>
        </div>
        <div class="app-panel-content">
          <div class="space-y-8 app-panel-text-sm text-white">
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
              <h3 class="font-semibold app-panel-text-lg app-primary-text">Exhibitions and interviews:</h3>
              
              <p>
                Techspressioism | Featured Artist - <a href="https://techspressionism.com/artists/" target="_blank" class="app-primary-text underline">Link</a>
              </p>
              
              <p>
                Bennington banner | Interview - <a href="https://www.benningtonbanner.com/local-news/installation-brings-celebrated-robert-frost-poem-to-virtual-reality/article_6a12b21e-80dc-11ef-b11b-cf55304afe7b.html" target="_blank" class="app-primary-text underline">Link</a>
              </p>
              
              <p>
                James Dawson | Interview - <a href="https://techspressionism.com/brooklyn/media/video/" target="_blank" class="app-primary-text underline">Link</a>
              </p>
              
              <p>
                Wild & Newfangled Art Museum - <a href="https://www.mowna.org/museum/techspressionism" target="_blank" class="app-primary-text underline">Link</a><br>
                <span class="app-panel-text-xs text-white">Long Island City, NY<br>October 3, 2024 - January 26, 2025</span>
              </p>
              
              <p>
                Robert Frost Stone House Virtual Reality Experience | Solo Exhibition - <a href="https://www.bennington.edu/news-and-features/landscape-and-literature" target="_blank" class="app-primary-text underline">Link</a><br>
                <span class="app-panel-text-xs text-white">Bennington, Vermont<br>May 2024 – October 2024</span>
              </p>
              
              <p>
                Hello Brooklyn—Group Exhibition - <a href="https://techspressionism.com/brooklyn/" target="_blank" class="app-primary-text underline">Link</a><br>
                <span class="app-panel-text-xs text-white">Kingsborough Art Museum, Brooklyn, NY<br>August 7 – September 25, 2024</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderInstagramAppFullscreen() {
    return `
      <div class="app-fullscreen-panel">
        <div class="app-panel-header">
          <button class="app-panel-close-btn app-panel-text-sm app-primary-text">Close</button>
          <div class="app-panel-text-xs text-white">Socials</div>
          <div></div>
        </div>
        <div class="app-panel-content">
          <div class="space-y-8 app-panel-text-sm text-white">
            <div class="bg-zinc-900 rounded-lg p-12 text-center">
              <div class="app-panel-text-4xl mb-8">📷</div>
              <h4 class="app-panel-text-lg font-semibold text-white mb-4">@ahmed.eshhh</h4>
              <p class="app-panel-text-sm text-white mb-8">Multimedia Artist</p>
              <a 
                href="https://www.instagram.com/ahmed.eshhh/" 
                target="_blank" 
                class="inline-block app-panel-btn-large app-primary-btn-bg text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                View Instagram Profile
              </a>
            </div>
            
            <div class="bg-zinc-900 rounded-lg p-12 text-center">
              <div class="app-panel-text-4xl mb-8">💼</div>
              <h4 class="app-panel-text-lg font-semibold text-white mb-4">Ahmed Shuwehdi</h4>
              <p class="app-panel-text-sm text-white mb-8">Multimedia Artist</p>
              <a 
                href="https://www.linkedin.com/in/ahmed-shuwehdi-5130a819b/" 
                target="_blank" 
                class="inline-block app-panel-btn-large app-primary-btn-bg text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                View LinkedIn Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderGameAppFullscreen() {
    return `
      <div class="app-fullscreen-panel">
        <div class="app-panel-header">
          <button class="app-panel-close-btn app-panel-text-sm app-primary-text">Close</button>
          <div class="app-panel-text-xs text-white">Snake Game</div>
          <div></div>
        </div>
        <div class="app-panel-content">
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
          console.log("Video app opened, opening fullscreen");
          pauseThemeMusic();
        }
        
        openApp = appToOpen;
        currentVideoIndex = null; // Reset video when opening app
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

    // App panel close buttons
    document.querySelectorAll('.app-panel-close-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (openApp === "game") {
          switchToThemeMusic();
        }
        openApp = null;
        currentVideoIndex = null;
        if (themeAudio && !openApp) {
          themeAudio.play().catch(() => {});
        }
        render();
      });
    });

    // Video app: back to gallery button
    document.querySelectorAll('.app-panel-back-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        currentVideoIndex = null;
        render();
      });
    });

    // Video app: open video in panel (replaces gallery)
    document.querySelectorAll('.open-video-in-app-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        currentVideoIndex = index;
        render();
      });
    });

    // Keep old open-video-btn for gallery modal (if still used elsewhere)
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