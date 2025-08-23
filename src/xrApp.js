// XR App - Three.js Forest World with Flying Video Screens
class XRExperience {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.videoScreens = [];
    this.animationId = null;
    this.isInitialized = false;
  }

  // Initialize the Three.js scene
  init(container) {
    if (this.isInitialized) return;
    
    console.log("Starting XR Experience initialization...");
    console.log("Container:", container);
    console.log("THREE available:", typeof THREE !== 'undefined');
    
    if (typeof THREE === 'undefined') {
      console.error("THREE.js library not loaded!");
      return;
    }
    
    this.container = container;
    
    try {
      this.setupScene();
      this.setupCamera();
      this.setupRenderer();
      this.setupControls();
      this.createForestWorld();
      this.createVideoScreens();
      this.setupLighting();
      this.animate();
      
      this.isInitialized = true;
      console.log("XR Experience initialized successfully");
    } catch (error) {
      console.error("Error initializing XR Experience:", error);
      this.dispose();
    }
  }

  // Setup the Three.js scene
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200); // Sky blue fog
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
  }

  // Setup the camera
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near plane
      1000 // Far plane
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
  }

  // Setup the WebGL renderer
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(1920, 1080);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    this.container.appendChild(this.renderer.domElement);
  }

  // Setup orbit controls
  setupControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 50;
    this.controls.minDistance = 5;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  // Create the forest world
  createForestWorld() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x3a5f3a,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Trees
    this.createTrees();
    
    // Rocks and terrain
    this.createTerrain();
    
    // Ambient particles (fireflies)
    this.createFireflies();
  }

  // Create trees in the forest
  createTrees() {
    const treeCount = 25;
    const treePositions = [];
    
    for (let i = 0; i < treeCount; i++) {
      let x, z;
      let attempts = 0;
      
      // Generate random positions, avoiding center area
      do {
        x = (Math.random() - 0.5) * 80;
        z = (Math.random() - 0.5) * 80;
        attempts++;
      } while (
        Math.sqrt(x * x + z * z) < 15 && 
        attempts < 100
      );
      
      treePositions.push({ x, z });
    }

    treePositions.forEach(({ x, z }) => {
      this.createTree(x, z);
    });
  }

  // Create individual tree
  createTree(x, z) {
    const treeGroup = new THREE.Group();
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 8, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 4;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    // Tree foliage (multiple layers)
    const foliageColors = [0x228B22, 0x32CD32, 0x90EE90];
    const foliageSizes = [6, 4, 2];
    const foliageHeights = [8, 10, 12];
    
    foliageColors.forEach((color, index) => {
      const foliageGeometry = new THREE.SphereGeometry(foliageSizes[index], 8, 6);
      const foliageMaterial = new THREE.MeshLambertMaterial({ color });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = foliageHeights[index];
      foliage.castShadow = true;
      treeGroup.add(foliage);
    });
    
    treeGroup.position.set(x, 0, z);
    this.scene.add(treeGroup);
  }

  // Create terrain features
  createTerrain() {
    // Small hills
    for (let i = 0; i < 8; i++) {
      const hillGeometry = new THREE.SphereGeometry(
        Math.random() * 3 + 2, 
        8, 
        6
      );
      const hillMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x556B2F,
        transparent: true,
        opacity: 0.7
      });
      const hill = new THREE.Mesh(hillGeometry, hillMaterial);
      
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      hill.position.set(x, 1, z);
      hill.scale.y = 0.5;
      this.scene.add(hill);
    }
    
    // Rocks
    for (let i = 0; i < 15; i++) {
      const rockGeometry = new THREE.DodecahedronGeometry(
        Math.random() * 1 + 0.5
      );
      const rockMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x696969,
        transparent: true,
        opacity: 0.8
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      rock.position.set(x, 0.5, z);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.scene.add(rock);
    }
  }

  // Create firefly particles
  createFireflies() {
    const fireflyCount = 50;
    const fireflyGeometry = new THREE.SphereGeometry(0.05, 8, 6);
    const fireflyMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFFF00,
      transparent: true,
      opacity: 0.8
    });
    
    this.fireflies = [];
    
    for (let i = 0; i < fireflyCount; i++) {
      const firefly = new THREE.Mesh(fireflyGeometry, fireflyMaterial);
      firefly.position.set(
        (Math.random() - 0.5) * 60,
        Math.random() * 15 + 5,
        (Math.random() - 0.5) * 60
      );
      
      firefly.userData = {
        originalY: firefly.position.y,
        speed: Math.random() * 0.02 + 0.01,
        offset: Math.random() * Math.PI * 2
      };
      
      this.fireflies.push(firefly);
      this.scene.add(firefly);
    }
  }

  // Create video screens
  createVideoScreens() {
    const videoUrls = [
      'https://www.youtube.com/watch?v=4N4h6-egdr8&list=TLGGqNd87uf8tTQyMzA4MjAyNQ',
      'https://youtu.be/thAZV2Km4b4?list=TLGGAY39oFUHUVkyMzA4MjAyNQ'
    ];
    
    const screenPositions = [
      { x: -8, y: 8, z: -5, rotation: 0.3 },
      { x: 8, y: 8, z: -5, rotation: -0.3 }
    ];
    
    const screenTitles = [
      "XR Experience 1",
      "XR Experience 2"
    ];
    
    videoUrls.forEach((url, index) => {
      this.createVideoScreen(
        screenPositions[index],
        url,
        screenTitles[index]
      );
    });
  }

  // Create individual video screen
  createVideoScreen(position, videoUrl, title) {
    const screenGroup = new THREE.Group();
    
    // Create iframe container for YouTube video
    const iframe = document.createElement('iframe');
    iframe.src = this.getYouTubeEmbedUrl(videoUrl);
    iframe.width = '640';
    iframe.height = '360';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-place';
    iframe.allowFullscreen = true;
    
    // Create HTML canvas for the video
    const videoCanvas = document.createElement('canvas');
    videoCanvas.width = 640;
    videoCanvas.height = 360;
    const ctx = videoCanvas.getContext('2d');
    
    // Create video texture
    const videoTexture = new THREE.CanvasTexture(videoCanvas);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    // Video screen geometry
    const screenGeometry = new THREE.PlaneGeometry(6.4, 3.6);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
      map: videoTexture,
      transparent: true,
      opacity: 0.9
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.castShadow = true;
    screen.receiveShadow = true;
    
    // Screen frame
    const frameGeometry = new THREE.BoxGeometry(6.8, 4, 0.2);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x2C2C2C });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.z = -0.1;
    frame.castShadow = true;
    
    // Screen stand
    const standGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2, 8);
    const standMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.y = -3;
    stand.castShadow = true;
    
    // Add all parts to screen group
    screenGroup.add(screen);
    screenGroup.add(frame);
    screenGroup.add(stand);
    
    // Position and rotate the screen
    screenGroup.position.set(position.x, position.y, position.z);
    screenGroup.rotation.y = position.rotation;
    
    // Add floating animation
    screenGroup.userData = {
      originalY: position.y,
      floatSpeed: 0.01,
      floatOffset: Math.random() * Math.PI * 2
    };
    
    // Add title text below screen
    this.createTitleText(screenGroup, title, position);
    
    this.scene.add(screenGroup);
    this.videoScreens.push(screenGroup);
    
    // Store reference to texture for updates
    screen.userData.videoTexture = videoTexture;
    screen.userData.videoCanvas = videoCanvas;
    screen.userData.iframe = iframe;
  }

  // Create title text below video screen
  createTitleText(screenGroup, title, position) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    // Set background
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set text style
    context.fillStyle = 'white';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw text
    context.fillText(title, canvas.width / 2, canvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    const textGeometry = new THREE.PlaneGeometry(4, 1);
    const textMaterial = new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.9
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    // Position text below screen
    textMesh.position.set(0, -4, 0);
    textMesh.rotation.y = position.rotation;
    
    screenGroup.add(textMesh);
  }

  // Convert YouTube URL to embed URL
  getYouTubeEmbedUrl(url) {
    let videoId;
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
  }

  // Setup lighting
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);
    
    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0xffaa00, 0.5, 30);
    pointLight1.position.set(-20, 10, -20);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00aaff, 0.5, 30);
    pointLight2.position.set(20, 10, -20);
    this.scene.add(pointLight2);
  }

  // Animation loop
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Update controls
    if (this.controls) {
      this.controls.update();
    }
    
    // Animate fireflies
    if (this.fireflies) {
      this.fireflies.forEach((firefly, index) => {
        const time = Date.now() * 0.001;
        firefly.position.y = firefly.userData.originalY + 
          Math.sin(time * firefly.userData.speed + firefly.userData.offset) * 2;
        firefly.material.opacity = 0.5 + Math.sin(time * 2 + index) * 0.3;
      });
    }
    
    // Animate video screens (floating effect)
    this.videoScreens.forEach(screen => {
      const time = Date.now() * 0.001;
      screen.position.y = screen.userData.originalY + 
        Math.sin(time * screen.userData.floatSpeed + screen.userData.floatOffset) * 0.5;
    });
    
    // Render the scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Handle window resize
  onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  // Cleanup and dispose
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
    
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
    
    // Dispose geometries and materials only if scene exists
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      this.scene = null;
    }
    
    this.isInitialized = false;
    console.log("XR Experience disposed");
  }
}

// Export for use in main app
window.XRExperience = XRExperience; 