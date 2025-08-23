// XR.js
import * as THREE from '../node_modules/three/build/three.module.js';

export function renderXRApp() {
  // Container fills screen (1920x1080 world)
  return `
    <div class="h-full w-full">
      <button class="back-btn text-sm text-cyan-300 absolute top-4 left-4 z-10">Back</button>
      <div id="xr-container" style="width:100%; height:100%;"></div>
    </div>
  `;
}

// Function to initialize Three.js after DOM render
export function initXRScene() {
  const container = document.getElementById('xr-container');
  if (!container) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 2, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  // Ground (forest floor)
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x223311 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Simple “trees”
  const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x116611 });
  for (let i = 0; i < 30; i++) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2), new THREE.MeshPhongMaterial({ color: 0x5c3a21 }));
    trunk.position.set((Math.random() - 0.5) * 40, 1, (Math.random() - 0.5) * 40);
    scene.add(trunk);

    const leaves = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), treeMaterial);
    leaves.position.set(trunk.position.x, 2.2, trunk.position.z);
    scene.add(leaves);
  }

  // Flying screens with YouTube videos
  function createVideoPlane(videoId, x, y, z) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    iframe.width = "560";
    iframe.height = "315";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    const div = document.createElement('div');
    div.style.width = "560px";
    div.style.height = "315px";
    div.appendChild(iframe);

    // Use CSS3DObject for embedding
    return { element: div, position: new THREE.Vector3(x, y, z) };
  }

  // Screens with text under them
  const videos = [
    { id: "4N4h6-egdr8", pos: [-3, 3, -5], text: "Screen 1: YouTube Video" },
    { id: "thAZV2Km4b4", pos: [3, 3, -5], text: "Screen 2: YouTube Video" }
  ];

  videos.forEach(v => {
    const geometry = new THREE.PlaneGeometry(4, 2.25);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const screen = new THREE.Mesh(geometry, material);
    screen.position.set(...v.pos);
    scene.add(screen);

    // Text below
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      const textGeo = new THREE.TextGeometry(v.text, {
        font: font,
        size: 0.3,
        height: 0.01
      });
      const textMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const mesh = new THREE.Mesh(textGeo, textMat);
      mesh.position.set(v.pos[0] - 1.5, v.pos[1] - 1.5, v.pos[2]);
      scene.add(mesh);
    });
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}
