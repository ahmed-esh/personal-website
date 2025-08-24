// XR.js
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import CSS3DRenderer from "https://unpkg.com/three@0.160.0/examples/jsm/renderers/CSS3DRenderer.js";
export function renderXRApp() {
  // Container fills screen with 3D scene
  return `
    <div class="h-full w-full relative">
      <button class="back-btn text-sm text-cyan-300 absolute top-4 left-4 z-10">Back</button>
      <div id="xr-container" style="width:100%; height:100%; background: #000;"></div>
      <div class="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
        🖱️ Drag to look around • 🖱️ Scroll to zoom • ⌨️ WASD/Arrows to move
      </div>
      <div class="absolute top-4 right-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
        🌲 3D Forest Environment • 📺 Interactive Video Screens
      </div>
      <div class="absolute bottom-4 right-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
        📱 Touch to look around • 📱 Pinch to zoom
      </div>
    </div>
  `;
}

// Function to initialize Three.js after DOM render
export function initXRScene() {
  console.log("Initializing XR scene...");
  const container = document.getElementById('xr-container');
  if (!container) {
    console.error("XR container not found!");
    return;
  }
  console.log("XR container found, creating 3D scene...");

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Light blue sky

  // Get container dimensions and set proper aspect ratio
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  const camera = new THREE.PerspectiveCamera(60, containerWidth / containerHeight, 0.1, 1000);
  camera.position.set(0, 5, 15); // Start further back to see more of the world

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(containerWidth, containerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Create CSS3D renderer for HTML elements
  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(containerWidth, containerHeight);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = '0';
  cssRenderer.domElement.style.left = '0';
  cssRenderer.domElement.style.pointerEvents = 'none';
  container.appendChild(cssRenderer.domElement);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  // Ground (forest floor)
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x8FBC8F }); // Dark sea green
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Simple “trees”
  const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 }); // Forest green
  for (let i = 0; i < 30; i++) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2), new THREE.MeshPhongMaterial({ color: 0x8B4513 })); // Saddle brown
    trunk.position.set((Math.random() - 0.5) * 40, 1, (Math.random() - 0.5) * 40);
    scene.add(trunk);

    const leaves = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), treeMaterial);
    leaves.position.set(trunk.position.x, 2.2, trunk.position.z);
    scene.add(leaves);
  }



  // Create functional video screens integrated into 3D scene
  const videos = [
    { id: "4N4h6-egdr8", pos: [-3, 3, -5], text: "Screen 1: YouTube Video" },
    { id: "thAZV2Km4b4", pos: [3, 3, -5], text: "Screen 2: YouTube Video" }
  ];

  videos.forEach(v => {
    // Create screen frame (black border)
    const frameGeometry = new THREE.PlaneGeometry(4.2, 2.45);
    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(...v.pos);
    scene.add(frame);
    
    // Create video screen using CSS3D
    const videoContainer = document.createElement('div');
    videoContainer.style.width = '400px';
    videoContainer.style.height = '225px';
    videoContainer.style.border = '2px solid #0066ff';
    videoContainer.style.borderRadius = '8px';
    videoContainer.style.overflow = 'hidden';
    videoContainer.style.backgroundColor = '#000';
    videoContainer.style.boxShadow = '0 0 20px rgba(0, 102, 255, 0.6)';
    
    // Create YouTube iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${v.id}?autoplay=1&mute=1&controls=1&rel=0`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    
    videoContainer.appendChild(iframe);
    
    // Create CSS3D object for the video
    const videoObject = new THREE.CSS3DObject(videoContainer);
    videoObject.position.set(...v.pos);
    scene.add(videoObject);
    
    // Add text label as a separate CSS3D object below the video
    const textDiv = document.createElement('div');
    textDiv.textContent = v.text;
    textDiv.style.color = '#ffffff';
    textDiv.style.fontSize = '16px';
    textDiv.style.fontWeight = 'bold';
    textDiv.style.textAlign = 'center';
    textDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.9)';
    textDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    textDiv.style.padding = '10px 15px';
    textDiv.style.borderRadius = '8px';
    textDiv.style.border = '2px solid #0066ff';
    textDiv.style.whiteSpace = 'nowrap';
    textDiv.style.width = 'fit-content';
    
    const textObject = new THREE.CSS3DObject(textDiv);
    textObject.position.set(v.pos[0], v.pos[1] - 1.5, v.pos[2]);
    scene.add(textObject);
  });

  // Camera controls
  let isMouseDown = false;
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;

  // Mouse and touch event listeners
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching = false;

  // Mouse events
  container.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  container.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  container.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;
      
      // Limit vertical rotation
      targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    }
  });

  // Touch events for mobile
  container.addEventListener('touchstart', (event) => {
    event.preventDefault();
    isTouching = true;
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  });

  container.addEventListener('touchend', (event) => {
    event.preventDefault();
    isTouching = false;
  });

  container.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (isTouching && event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      targetRotationY += deltaX * 0.02; // Slightly more sensitive for touch
      targetRotationX += deltaY * 0.02;
      
      // Limit vertical rotation
      targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
      
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }
  });

  // Pinch to zoom for mobile
  let initialDistance = 0;
  container.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
      initialDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
    }
  });

  container.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2) {
      const currentDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      
      const delta = currentDistance - initialDistance;
      const zoomSpeed = 0.01;
      
      camera.position.z += delta * zoomSpeed;
      camera.position.z = Math.max(5, Math.min(30, camera.position.z));
      
      initialDistance = currentDistance;
    }
  });

  // Keyboard controls
  const keys = {};
  document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
  });
  
  document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
  });

  // Zoom with mouse wheel
  container.addEventListener('wheel', (event) => {
    const zoomSpeed = 0.1;
    const delta = event.deltaY > 0 ? 1 : -1;
    camera.position.z += delta * zoomSpeed;
    camera.position.z = Math.max(5, Math.min(30, camera.position.z)); // Limit zoom
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Smooth camera rotation
    currentRotationX += (targetRotationX - currentRotationX) * 0.1;
    currentRotationY += (targetRotationY - currentRotationY) * 0.1;
    
    // Apply rotation to camera
    camera.rotation.x = currentRotationX;
    camera.rotation.y = currentRotationY;
    
    // Keyboard movement
    const moveSpeed = 0.2;
    if (keys['KeyW'] || keys['ArrowUp']) {
      camera.position.z -= moveSpeed;
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
      camera.position.z += moveSpeed;
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
      camera.position.x -= moveSpeed;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
      camera.position.x += moveSpeed;
    }
    
    // Keep camera within bounds
    camera.position.x = Math.max(-20, Math.min(20, camera.position.x));
    camera.position.z = Math.max(5, Math.min(30, camera.position.z));
    
    // Render both WebGL and CSS3D scenes
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
  }
  animate();

  // Add instructions
  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); color: white; text-align: center; background: rgba(0,0,0,0.7); padding: 15px; border-radius: 10px; border: 2px solid #0066ff; z-index: 1000;">
      <h3 style="margin: 0 0 10px 0; color: #0066ff;">XR World Controls</h3>
      <p style="margin: 5px 0;"><strong>Mouse:</strong> Click and drag to look around</p>
      <p style="margin: 5px 0;"><strong>Touch:</strong> Swipe to look around, pinch to zoom</p>
      <p style="margin: 5px 0;"><strong>Keyboard:</strong> WASD or Arrow keys to move</p>
      <p style="margin: 5px 0;"><strong>Scroll:</strong> Zoom in/out</p>
    </div>
  `;
  container.appendChild(instructions);
}
