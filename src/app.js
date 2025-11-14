document.addEventListener('DOMContentLoaded', function() {
  let openApp = null;
  let galleryModal = null;
  let currentVideoIndex = null; // Track which video is playing in video app
  let themeAudio = null;
  let gameAudio = null;
  let appRefs = [];
  let animationStarted = false;
  let animationComplete = false;
  let gameCarouselIndex = 0; // Track current carousel panel index
  let framesCarouselIndex = 0; // Track current frame index

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

  const framesProjects = [
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
    const framesPanelsHtml = framesProjects
      .map(
        (frame) => `
          <div class="frames-project-panel">
            <a href="${frame.src}" target="_blank" class="frames-project-image-link">
              <img src="${frame.src}" alt="${frame.title}" class="frames-project-image" />
            </a>
            <div class="frames-project-info">
              <h3 class="frames-project-title app-panel-text-lg text-white">${frame.title}</h3>
              <p class="app-panel-text-sm app-primary-text">Click image to view full resolution</p>
            </div>
          </div>
        `
      )
      .join("");

    return `
      <div class="app-fullscreen-panel">
        <div class="app-panel-header">
          <button class="app-panel-close-btn app-panel-text-sm app-primary-text">Close</button>
          <div class="app-panel-text-xs text-white">Stills / Frames</div>
          <div></div>
        </div>
        <div class="app-panel-content frames-app-content">
          <div class="frames-carousel-container">
            <button class="game-carousel-arrow left-arrow" id="frames-left-arrow">←</button>
            <div class="frames-carousel-track" id="frames-carousel-track">
              ${framesPanelsHtml}
            </div>
            <button class="game-carousel-arrow right-arrow" id="frames-right-arrow">→</button>
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
              Ahmed Shuwehdi
            </p>
            
            <p style="margin-bottom: 3rem;">
             Game Designer & Multimedia Artist
            </p>
            
            <p style="margin-bottom: 3rem;">
             MFA Game Design, NYU Tisch Game Center 2027
            </p>

             <pstyle="margin-bottom: 3rem;">
             Bennington College, Bachelors of Arts, 2025
            </p>


            <p style="margin-bottom: 3rem;">
             I create games that revolve around systems, tension, and play that doesn't quite behave the way it should. I'm drawn to weird mechanics the kind that make players question what a "game" is supposed to feel like. Sometimes my work exists on a screen; sometimes it lives in the real world through physical games and shared play.
            </p>
            
            <p style="margin-bottom: 3rem;">
             Beyond games, my multimedia work blends animation, motion graphics, and found or captured footage. Much of it traces back to Libya, the place that shaped my sense of storytelling and contradiction. I use moving images as a way to hold memory, politics, and emotion in the same frame to turn the everyday chaos of a country in flux into something human, something that lingers.
            </p>
            
            <p>
             In much of my work, I explore the world through the lens of childhood, presenting these issues as if narrating them to children or having a child tell the story. This approach helps me make sense of these themes for audiences unfamiliar with them, distilling them in ways that resonate universally. If a child can understand the message, I believe, then so can adults.
            </p>
            
            <div>
              <h3 class="font-semibold app-panel-text-lg app-primary-text" style="margin-bottom: 3rem; margin-top: 2rem;">Exhibitions and interviews:</h3>
              
              <p style="margin-bottom: 3rem;">
                Techspressioism | Featured Artist - <a href="https://techspressionism.com/artists/" target="_blank" class="app-primary-text underline">Link</a>
              </p>
              
              <p style="margin-bottom: 3rem;">
                Bennington banner | Interview - <a href="https://www.benningtonbanner.com/local-news/installation-brings-celebrated-robert-frost-poem-to-virtual-reality/article_6a12b21e-80dc-11ef-b11b-cf55304afe7b.html" target="_blank" class="app-primary-text underline">Link</a>
              </p>
              
              <p style="margin-bottom: 3rem;">
                James Dawson | Interview - <a href="https://techspressionism.com/brooklyn/media/video/" target="_blank" class="app-primary-text underline">Link</a>
              </p>
              
              <p style="margin-bottom: 3rem;">
                Wild & Newfangled Art Museum - <a href="https://www.mowna.org/museum/techspressionism" target="_blank" class="app-primary-text underline">Link</a><br>
                <span class="app-panel-text-xs text-white">Long Island City, NY<br>October 3, 2024 - January 26, 2025</span>
              </p>
              
              <p style="margin-bottom: 3rem;">
                Robert Frost Stone House Virtual Reality Experience | Solo Exhibition - <a href="https://www.bennington.edu/news-and-features/landscape-and-literature" target="_blank" class="app-primary-text underline">Link</a><br>
                <span class="app-panel-text-xs text-white">Bennington, Vermont<br>May 2024 – October 2024</span>
              </p>
              
              <p style="margin-bottom: 3rem;">
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
          <div class="socials-list app-panel-text-sm text-white">
            <!-- Social cards list with generous vertical spacing -->
            <div class="bg-zinc-900 rounded-lg p-12 text-center">
              <div class="app-panel-text-4xl mb-8">📷</div>
              <h4 class="app-panel-text-lg font-semibold text-white mb-8">@ahmed.eshhh</h4>
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
              <h4 class="app-panel-text-lg font-semibold text-white mb-8">Ahmed Shuwehdi</h4>
              <a 
                href="https://www.linkedin.com/in/ahmed-shuwehdi-5130a819b/" 
                target="_blank" 
                class="inline-block app-panel-btn-large app-primary-btn-bg text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                View LinkedIn Profile
              </a>
            </div>
            
            <div class="bg-zinc-900 rounded-lg p-12 text-center">
              <div class="app-panel-text-4xl mb-8">🎮</div>
              <h4 class="app-panel-text-lg font-semibold text-white mb-8">Ahmedesh</h4>
              <a 
                href="https://ahmedesh.itch.io/" 
                target="_blank" 
                class="inline-block app-panel-btn-large app-primary-btn-bg text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                View itch.io Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Game projects data
  const gameProjects = [
    {
      title: "Cadman Plaza Playful Intervention",
      visuals: [
        "src/assets/gamesapp/cadmen.png",
        "src/assets/gamesapp/cadmen2.png",
        "src/assets/gamesapp/cadmen 3.png",
      ],
      medium: "Physical Game / Public Play Installation",
      description: `Cadman Plaza Playful Intervention is a public installation game designed to reconnect people with their environment through play. Participants use newspaper-style "windows" that frame scenes in the park and respond to playful prompts written as headlines. The goal is to make the invisible visible—encouraging curiosity, laughter, and new forms of social interaction in a familiar public space. The project was designed through site observations, prototyping, and public playtesting at Cadman Plaza Park. It emphasizes accessibility, lightness, and humor, inviting visitors to reimagine the ordinary through play.`,
    },
    {
      title: "Scare Traffic Control",
      visuals: [
        "src/assets/gamesapp/Scaretrafficcontrol1.png",
        "src/assets/gamesapp/cursecard.png",
        "src/assets/gamesapp/Scaretrafficcontrol2.png",
        "src/assets/gamesapp/Scaretrafficcontrol3.png",
      ],
      medium: "Digital / Hybrid Board Game",
      description: `Scare Traffic Control is a two-player cooperative board game where teams of witches and dispatchers coordinate broomstick deliveries across a haunted airspace. Each player takes on a unique role: Couriers navigate a maze of magical curses, while Dispatchers use sigil cards to break those curses through communication and pattern recognition. The team that completes the most deliveries before time runs out wins. The game mixes chaotic teamwork, quick thinking, and Halloween humor to create an energetic, replayable experience.`,
    },
    {
      title: "Sweet and Sour Reunion",
      visuals: [
        "src/assets/gamesapp/sweetandsour3.png",
        "src/assets/gamesapp/menusideup.png",
        "src/assets/gamesapp/sweetandsour4.png",
        "src/assets/gamesapp/sweetandsour5.png",
        "src/assets/gamesapp/sweetandsour1.png",
        "src/assets/gamesapp/sweetandsour2.png",
       
      ],
      medium: "Narrative Social Game",
      description: ` Work In Progress: Sweet and Sour Reunion is a narrative roleplaying game set at a chaotic family dinner in a fictional Chinese restaurant. Players embody family members reuniting after years apart, each with hidden objectives, personal constraints, and emotional baggage. Through timed "courses" representing different dishes, players must navigate secrets, alliances, and awkward conversations to meet as many goals as possible before dessert. The game balances humor and tension, using improvisation and empathy to explore family dynamics, miscommunication, and love.`,
    },
    {
      title: "Robert Frost Stone House VR Experience",
      visuals: [
        "src/assets/gamesapp/Robert Frost Stone House VR Experience 1.png",
        "src/assets/gamesapp/Robert Frost Stone House VR Experience 2.png",
        "src/assets/gamesapp/Robert Frost Stone House VR Experience 3.png",
      ],
      link: {
        text: "More Information",
        url: "https://www.benningtonbanner.com/local-news/installation-brings-celebrated-robert-frost-poem-to-virtual-reality/article_6a12b21e-80dc-11ef-b11b-cf55304afe7b.html",
      },
      description: `The Robert Frost Stone House VR Experience is an immersive project created for children in the local area, inviting them to virtually explore the home of poet Robert Frost. Through VR, children can engage with the world of Frost, connecting with the environment that inspired much of his work. This project was developed with the belief that VR can offer a unique and engaging way for young users to experience history and poetry, making Frost's life and writings accessible and meaningful.

Through VR, children aren't just hearing or reading about Frost—they're stepping into his environment, seeing firsthand the inspiration behind his work. I interviewed the director of the Robert Frost House Stone House Museum to understand how Frost lived, referencing his writings about the farm, the horse, the bonfire, and the hut—all key design elements.`,
      exhibition: "May 2024 - October 2024",
      medium: "VR | Unity 3D",
      press: [{ text: "YouTube", url: "https://youtu.be/4N4h6-egdr8" }],
    },
    {
      title: "Dream Garden",
      visuals: [
        "src/assets/gamesapp/Dream Garden 1.png",
        "src/assets/gamesapp/Dream Garden 2.png",
        "src/assets/gamesapp/Dream Garden 3.png",
      ],
      link: {
        text: "More Information",
        url: "https://www.youtube.com/watch?v=Hy7jHhNJ7sU",
      },
      description: `Dream Garden was an imaginative outdoor installation of light, sound, and movement in Hiland Hall Garden, North Bennington. The event invited audiences of all ages to experience a multi-sensory transformation of the garden at night.

My contribution focused on projection mapping, where I used MadMapper to bring dynamic visuals to life across natural surfaces and sculptural forms. Through light and projection, I created immersive textures that responded to the environment, weaving together organic imagery with abstract movement.

Working closely with the lead artists, I aligned my visuals with the soundscapes and installations so the audience felt fully enveloped by the experience. It was both a technical and artistic challenge—mapping across irregular outdoor surfaces while enhancing the garden's natural beauty.`,
      exhibition: "November 2023",
      medium: "Projection Mapping",
      video: [{ text: "YouTube", url: "https://www.youtube.com/watch?v=Hy7jHhNJ7sU" }],
    },
    {
      title: "NICK Mayer Under the Water Gallery",
      visuals: [
        "src/assets/gamesapp/NICK Mayer under the water gallery 1.png",
        "src/assets/gamesapp/NICK Mayer under the water gallery 2.png",
      ],
      link: {
        text: "More Information",
        url: "https://ahmed-esh.github.io/BLKWTRGallery/",
      },
      description: `"BLKWTR Gallery" is a digital exhibition space designed to immerse visitors in an underwater art experience.
Created for artist Nick Mayer, this interactive gallery showcases his work in a setting that mirrors the fluidity and depth of the ocean.
The project blends web-based interactivity with artistic storytelling, offering a unique way to engage with Mayer's marine-inspired pieces in a visually captivating digital environment—literally where his art comes from: the water.`,
      medium: "Website | Javascript three.js",
      year: "2025",
      visitGallery: { text: "Visit Gallery", url: "https://ahmed-esh.github.io/BLKWTRGallery/" },
    },
    {
      title: "Roshen Al-Hosh",
      visuals: [
        "src/assets/gamesapp/Roshen AL-Hosh 1.png",
        "src/assets/gamesapp/Roshen AL-Hosh 2 .png",
      ],
      description: `Roshen Al-Hosh is an immersive installation that uses an Xbox 360 camera to track participants' movements in real life, mirrored in the digital space of the installation. On-screen, users look through a window, with their movement enabling navigation in a 2m x 1m confined space.

This piece captures the nostalgic essence of childhood moments spent gazing out a window, curious about the world outside—a reflection of my own memories. By blending technology with introspection, it invites viewers to reconnect with their sense of wonder.`,
      medium: "Installation",
      year: "2024",
      link: {
        text: "Project Folder",
        url: "https://drive.google.com/drive/folders/15Dt543Cwvgh6aNEAu5bn5EAElJ6wmkaH?usp=sharing",
      },
    },
    {
      title: "Shug Life",
      visuals: [
        "src/assets/gamesapp/Shug Life 1.jpg",
        "src/assets/gamesapp/Shug Life 2.jpg",
      ],
      link: {
        text: "Video",
        url: "https://youtu.be/thAZV2Km4b4",
      },
      description: `Shug Life is a VR music video experience created for the track "Шуг Скриптонит" by Skryptonite, a prominent Kazakh rapper. It reimagines the concept of a music video by placing it inside an unconventional VR space, challenging how music and visuals interact.

When I was young, I always imagined what a music video scene might feel like if the environment itself became a character. This project explores that question through immersive space and user perspective.`,
      medium: "VR | Unity 3D",
      year: "2024",
    },
    {
      title: "Flappy Bird Interactive Game",
      visuals: [
        "src/assets/gamesapp/Flappy Bird Interactive Game 2.jpg",
        "src/assets/gamesapp/Flappy Bird Interactive Game 3.jpg",
        "src/assets/gamesapp/Flappy Bird Interactive Game 1 .jpg",
        
      ],
      link: {
        text: "More Information",
        url: "https://drive.google.com/drive/folders/1MRodq0rNDg6rJIsDcVdoHe6I1quaorTB?usp=sharing",
      },
      description: `A reimagining of the classic *Flappy Bird*, this interactive game focuses on playful engagement and highlights how tactile, physical feedback can deepen digital experiences.`,
      medium: "Haptic Media",
      year: "2023",
    },
  ];

  function renderGameAppFullscreen() {
    let currentProjectIndex = 0;

    const renderProjectPanel = (project, index) => {
      const visualsHtml = project.visuals
        .map(
          (src) =>
            `<img src="${src}" alt="${project.title}" class="game-project-visual" style="max-height: 400px; object-fit: contain; margin-bottom: 2rem;">`
        )
        .join("");

      const linkHtml = project.link
        ? `<p class="app-panel-text-base text-white" style="margin-bottom: 1rem;"><span class="font-semibold app-primary-text">Link:</span> <a href="${project.link.url}" target="_blank" class="app-primary-text underline">${project.link.text}</a></p>`
        : "";

      const descriptionHtml = project.description
        .split("\n\n")
        .map(
          (paragraph) =>
            `<p class="app-panel-text-base text-white" style="margin-bottom: 1.5rem; line-height: 1.8;">${paragraph}</p>`
        )
        .join("");

      const exhibitionHtml = project.exhibition
        ? `<p class="app-panel-text-base text-white" style="margin-bottom: 1rem;"><span class="font-semibold app-primary-text">Exhibition:</span> <span class="text-white">${project.exhibition}</span></p>`
        : "";

      const mediumHtml = project.medium
        ? `<p class="app-panel-text-base text-white" style="margin-bottom: 1rem;"><span class="font-semibold app-primary-text">Medium:</span> <span class="text-white">${project.medium}</span></p>`
        : "";

      const yearHtml = project.year
        ? `<p class="app-panel-text-base text-white" style="margin-bottom: 1rem;"><span class="font-semibold app-primary-text">Year:</span> <span class="text-white">${project.year}</span></p>`
        : "";

      const pressHtml = project.press
        ? `<p class="app-panel-text-base text-white" style="margin-bottom: 1rem;"><span class="font-semibold app-primary-text">Press:</span> ${project.press
            .map(
              (item) =>
                `<a href="${item.url}" target="_blank" class="app-primary-text underline">${item.text}</a>`
            )
            .join(", ")}</p>`
        : "";

      const videoHtml = project.video
        ? `<p class="app-panel-text-base text-white" style="margin-bottom: 1rem;"><span class="font-semibold app-primary-text">Video:</span> ${project.video
            .map(
              (item) =>
                `<a href="${item.url}" target="_blank" class="app-primary-text underline">${item.text}</a>`
            )
            .join(", ")}</p>`
        : "";

      const visitGalleryHtml = project.visitGallery
        ? `<p class="app-panel-text-base text-white" style="margin-bottom: 1rem;"><span class="font-semibold app-primary-text">Link:</span> <a href="${project.visitGallery.url}" target="_blank" class="app-primary-text underline">${project.visitGallery.text}</a></p>`
        : "";

    return `
        <div class="game-project-panel">
          <div class="game-project-visuals-container">
            ${visualsHtml}
          </div>
          <div class="game-project-info">
            <h2 class="font-bold app-panel-text-4xl app-primary-text" style="margin-top: 3rem; margin-bottom: 2rem;">${project.title}</h2>
            ${linkHtml}
            ${exhibitionHtml}
            ${mediumHtml}
            ${yearHtml}
            <div class="game-project-description">
              <h3 class="font-semibold app-panel-text-lg app-primary-text" style="margin-bottom: 1rem;">Description:</h3>
              ${descriptionHtml}
            </div>
            ${pressHtml}
            ${videoHtml}
            ${visitGalleryHtml}
          </div>
        </div>
      `;
    };

    const gameAppContent = `
      <div class="app-panel-header">
        <button class="app-panel-back-btn app-panel-btn app-primary-text">Back</button>
        <h2 class="app-panel-title app-panel-text-2xl app-primary-text">Digital and Physical Games</h2>
        <div></div>
      </div>
      <div class="app-panel-content game-app-content">
        <div class="game-carousel-container">
          <button class="game-carousel-arrow left-arrow" id="game-left-arrow">←</button>
          <div class="game-carousel-track" id="game-carousel-track">
            ${gameProjects.map((project, index) => renderProjectPanel(project, index)).join("")}
          </div>
          <button class="game-carousel-arrow right-arrow" id="game-right-arrow">→</button>
        </div>
      </div>
    `;

    return `
      <div class="app-fullscreen-panel game-app-fullscreen">
        ${gameAppContent}
      </div>
    `;
  }

  function resizeGameProjectImages(targetWidth = 350) {
    const images = document.querySelectorAll('.game-project-visual');
    images.forEach((img) => {
      img.style.width = `${targetWidth}px`;
      img.style.height = 'auto';
    });
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
        if (appToOpen === 'game') {
          gameCarouselIndex = 0; // Reset carousel to first project
        }
        if (appToOpen === 'frames') {
          framesCarouselIndex = 0; // Reset frames carousel
        }
        render();
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

    // App panel back buttons
    document.querySelectorAll('.app-panel-back-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        // For video app: go back to gallery
        if (openApp === 'video' && currentVideoIndex !== null) {
          currentVideoIndex = null;
          render();
        } 
        // For game app: close the app (same as close button)
        else if (openApp === 'game') {
          switchToThemeMusic();
          openApp = null;
          currentVideoIndex = null;
          gameCarouselIndex = 0; // Reset carousel index
          if (themeAudio && !openApp) {
            themeAudio.play().catch(() => {});
          }
          render();
        }
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

    // Game app: carousel navigation
    const gameCarouselTrack = document.querySelector('#game-carousel-track');
    const gameLeftArrow = document.querySelector('#game-left-arrow');
    const gameRightArrow = document.querySelector('#game-right-arrow');
    
    if (gameCarouselTrack && gameLeftArrow && gameRightArrow && openApp === 'game') {
      const maxIndex = gameProjects.length - 1;

      const updateCarousel = () => {
        const panelWidth = 1440; // Fixed width for each panel
        gameCarouselTrack.style.transform = `translateX(-${gameCarouselIndex * panelWidth}px)`;
        
        // Get fresh references after potential re-renders
        const leftArrow = document.querySelector('#game-left-arrow');
        const rightArrow = document.querySelector('#game-right-arrow');
        if (leftArrow && rightArrow) {
          // Update opacity and pointer events for disabled state
          if (gameCarouselIndex === 0) {
            leftArrow.style.opacity = "0.5";
            leftArrow.style.pointerEvents = "none";
            leftArrow.style.cursor = "not-allowed";
          } else {
            leftArrow.style.opacity = "1";
            leftArrow.style.pointerEvents = "auto";
            leftArrow.style.cursor = "pointer";
          }
          
          if (gameCarouselIndex === maxIndex) {
            rightArrow.style.opacity = "0.5";
            rightArrow.style.pointerEvents = "none";
            rightArrow.style.cursor = "not-allowed";
          } else {
            rightArrow.style.opacity = "1";
            rightArrow.style.pointerEvents = "auto";
            rightArrow.style.cursor = "pointer";
          }
        }

        resizeGameProjectImages();
      };

      // Remove existing listeners by cloning
      const newLeftArrow = gameLeftArrow.cloneNode(true);
      const newRightArrow = gameRightArrow.cloneNode(true);
      gameLeftArrow.parentNode.replaceChild(newLeftArrow, gameLeftArrow);
      gameRightArrow.parentNode.replaceChild(newRightArrow, gameRightArrow);

      newLeftArrow.addEventListener("click", () => {
        if (gameCarouselIndex > 0) {
          gameCarouselIndex--;
          updateCarousel();
        }
      });

      newRightArrow.addEventListener("click", () => {
        if (gameCarouselIndex < maxIndex) {
          gameCarouselIndex++;
          updateCarousel();
        }
      });

      // Initialize
      updateCarousel();
    }

    // Frames app: carousel navigation
    const framesCarouselTrack = document.querySelector('#frames-carousel-track');
    const framesLeftArrow = document.querySelector('#frames-left-arrow');
    const framesRightArrow = document.querySelector('#frames-right-arrow');

    if (framesCarouselTrack && framesLeftArrow && framesRightArrow && openApp === 'frames') {
      const maxIndex = framesProjects.length - 1;

      const updateFramesCarousel = () => {
        const panelWidth = 1440; // Fixed width for each panel
        framesCarouselTrack.style.transform = `translateX(-${framesCarouselIndex * panelWidth}px)`;

        const leftArrow = document.querySelector('#frames-left-arrow');
        const rightArrow = document.querySelector('#frames-right-arrow');
        if (leftArrow && rightArrow) {
          if (framesCarouselIndex === 0) {
            leftArrow.style.opacity = "0.5";
            leftArrow.style.pointerEvents = "none";
            leftArrow.style.cursor = "not-allowed";
          } else {
            leftArrow.style.opacity = "1";
            leftArrow.style.pointerEvents = "auto";
            leftArrow.style.cursor = "pointer";
          }

          if (framesCarouselIndex === maxIndex) {
            rightArrow.style.opacity = "0.5";
            rightArrow.style.pointerEvents = "none";
            rightArrow.style.cursor = "not-allowed";
          } else {
            rightArrow.style.opacity = "1";
            rightArrow.style.pointerEvents = "auto";
            rightArrow.style.cursor = "pointer";
          }
        }
      };

      const newFramesLeftArrow = framesLeftArrow.cloneNode(true);
      const newFramesRightArrow = framesRightArrow.cloneNode(true);
      framesLeftArrow.parentNode.replaceChild(newFramesLeftArrow, framesLeftArrow);
      framesRightArrow.parentNode.replaceChild(newFramesRightArrow, framesRightArrow);

      newFramesLeftArrow.addEventListener('click', () => {
        if (framesCarouselIndex > 0) {
          framesCarouselIndex--;
          updateFramesCarousel();
        }
      });

      newFramesRightArrow.addEventListener('click', () => {
        if (framesCarouselIndex < maxIndex) {
          framesCarouselIndex++;
          updateFramesCarousel();
        }
      });

      updateFramesCarousel();
    }

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