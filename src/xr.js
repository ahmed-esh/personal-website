// XR.js (refactored with CSS3DRenderer for working YouTube screens)
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { CSS3DRenderer, CSS3DObject } from "https://unpkg.com/three@0.160.0/examples/jsm/renderers/CSS3DRenderer.js?module";


export function renderXRApp() {
  // Container fills screen with 3D scene
  return `
    <div class="h-full w-full relative">
      <button class="back-btn text-sm text-cyan-300 absolute top-4 left-4 z-50">Back</button>
      <div id="xr-container" style="width:100%; height:100%; background: #000; padding-top: 60px;"></div>
      <div class="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded z-40">
        📱 Touch & drag to look around • 📱 Pinch to zoom • 📱 Touch to move
      </div>
      <div class="absolute top-4 right-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded z-40">
        🌲 3D Forest Environment • 📺 Interactive Screens
      </div>
    </div>
  `;
}

export function initXRScene() {
  console.log("Initializing XR scene...");
  const container = document.getElementById('xr-container');
  if (!container) {
    console.error("XR container not found!");
    return;
  }

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Light blue sky

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // Adjusted camera for better fit inside phone
  const camera = new THREE.PerspectiveCamera(50, containerWidth / containerHeight, 0.1, 2000);
  camera.position.set(0, 7, 25);

  // WebGL renderer for 3D world
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(containerWidth, containerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // CSS3DRenderer for embedding iframes
  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(containerWidth, containerHeight);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = '0';
  cssRenderer.domElement.style.zIndex = '10'; // Lower z-index than UI elements

  // Append both renderers
  container.appendChild(renderer.domElement);
  container.appendChild(cssRenderer.domElement);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  // Ground
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x8FBC8F });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Trees
  const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
  for (let i = 0; i < 30; i++) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2), new THREE.MeshPhongMaterial({ color: 0x8B4513 }));
    trunk.position.set((Math.random() - 0.5) * 40, 1, (Math.random() - 0.5) * 40);
    scene.add(trunk);

    const leaves = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), treeMaterial);
    leaves.position.set(trunk.position.x, 2.2, trunk.position.z);
    scene.add(leaves);
  }

  // Function to create CSS3D YouTube video planes
  function createVideoPlane(videoId, x, y, z) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    iframe.style.width = "560px";
    iframe.style.height = "315px";
    iframe.style.border = "0";
    const object = new CSS3DObject(iframe);
    object.position.set(x, y, z);
    object.scale.set(0.014, 0.014, 0.014); // Scale up 2x from 0.007 to 0.014
    return object;
  }

  // Add YouTube screens
  const screen1 = createVideoPlane("4N4h6-egdr8", -6, 5, -10);
  const screen2 = createVideoPlane("thAZV2Km4b4", 6, 5, -10);

  scene.add(screen1);
  scene.add(screen2);

  // Camera controls
  let isMouseDown = false;
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;

  // Touch controls
  let isTouching = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let lastTouchDistance = 0;
  let initialCameraZ = camera.position.z;

  // Mouse controls (for desktop)
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
      targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));

      mouseX = event.clientX;
      mouseY = event.clientY;
    }
  });

  // Touch controls (for mobile)
  container.addEventListener('touchstart', (event) => {
    event.preventDefault();
    isTouching = true;
    
    if (event.touches.length === 1) {
      // Single touch - look around
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      // Two touches - pinch to zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      lastTouchDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    }
  });

  container.addEventListener('touchmove', (event) => {
    event.preventDefault();
    
    if (event.touches.length === 1 && isTouching) {
      // Single touch - look around
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      targetRotationY += deltaX * 0.02; // Slightly more sensitive for touch
      targetRotationX += deltaY * 0.02;
      targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    } else if (event.touches.length === 2 && isTouching) {
      // Two touches - pinch to zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (lastTouchDistance > 0) {
        const zoomDelta = (lastTouchDistance - currentDistance) * 0.01;
        camera.position.z += zoomDelta;
        camera.position.z = Math.max(5, Math.min(40, camera.position.z));
      }
      
      lastTouchDistance = currentDistance;
    }
  });

  container.addEventListener('touchend', (event) => {
    isTouching = false;
    lastTouchDistance = 0;
  });

  // Keyboard controls (for desktop)
  const keys = {};
  document.addEventListener('keydown', (event) => { keys[event.code] = true; });
  document.addEventListener('keyup', (event) => { keys[event.code] = false; });

  // Zoom (mouse wheel for desktop)
  container.addEventListener('wheel', (event) => {
    const zoomSpeed = 0.1;
    const delta = event.deltaY > 0 ? 1 : -1;
    camera.position.z += delta * zoomSpeed;
    camera.position.z = Math.max(5, Math.min(40, camera.position.z));
  });

  // Animate
  function animate() {
    requestAnimationFrame(animate);

    currentRotationX += (targetRotationX - currentRotationX) * 0.1;
    currentRotationY += (targetRotationY - currentRotationY) * 0.1;

    camera.rotation.x = currentRotationX;
    camera.rotation.y = currentRotationY;

    const moveSpeed = 0.2;
    if (keys['KeyW'] || keys['ArrowUp']) camera.position.z -= moveSpeed;
    if (keys['KeyS'] || keys['ArrowDown']) camera.position.z += moveSpeed;
    if (keys['KeyA'] || keys['ArrowLeft']) camera.position.x -= moveSpeed;
    if (keys['KeyD'] || keys['ArrowRight']) camera.position.x += moveSpeed;

    camera.position.x = Math.max(-20, Math.min(20, camera.position.x));
    camera.position.z = Math.max(5, Math.min(40, camera.position.z));

    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
  }
  animate();
}
