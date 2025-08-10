import React, { useState, useEffect, useRef } from "react";

export default function GlitchPhonePortfolio() {
  const [openApp, setOpenApp] = useState(null);
  const [galleryModal, setGalleryModal] = useState(null);

  const themeAudio = useRef(null);

  // Real time clock state
  const [time, setTime] = useState(new Date());

  // Refs for keyboard nav on app icons
  const appRefs = useRef([]);
  const apps = [
    { key: "video", label: "Video", emoji: "🎥" },
    { key: "xr", label: "XR", emoji: "🌐" },
    { key: "frames", label: "Frames", emoji: "🖼️" },
    { key: "game", label: "Game", emoji: "🎮" },
    { key: "contact", label: "Contact", emoji: "✉️" },
    { key: "about", label: "About", emoji: "ℹ️" },
  ];
  const numCols = 3;

  useEffect(() => {
    themeAudio.current = new Audio("/sounds/theme.mp3");
    themeAudio.current.loop = true;
    themeAudio.current.volume = 0.35;
    themeAudio.current.play().catch(() => {});
    return () => themeAudio.current && themeAudio.current.pause();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpenApp(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keyboard navigation between app icons on home screen
  function onAppGridKeyDown(e) {
    const currentIndex = appRefs.current.findIndex(el => el === document.activeElement);
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
    appRefs.current[nextIndex].focus();
    e.preventDefault();
  }

  const sampleVideos = [
    { title: "Project A - Short Demo", src: "/videos/sample1.mp4" },
    { title: "Project B - Scene Reel", src: "/videos/sample2.mp4" },
    { title: "Project C - Test", src: "/videos/sample3.mp4" },
  ];

  const sampleXR = [
    { title: "XR Scene 1", desc: "Placeholder 3D scene (replace with A-Frame/GLB embed)" },
    { title: "XR Scene 2", desc: "Placeholder interaction demo" },
  ];

  const frames = [
    { title: "Still 1", caption: "Child's perspective drawing", src: "" },
    { title: "Still 2", caption: "Family scene (placeholder)", src: "" },
    { title: "Still 3", caption: "Cars (placeholder)", src: "" },
  ];

  const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black animate-gradient text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* subtle glitch overlay */}
      <div className="absolute inset-0 pointer-events-none glitch-overlay" />

      <div className="relative z-10 flex flex-col items-center max-w-xs sm:max-w-md overflow-hidden mx-auto">
        <h1 className="mb-6 tracking-widest text-sm text-gray-400">AHMED E — PORTFOLIO</h1>

        <div className="phone-outer w-80 md:w-96 bg-black/90 border border-zinc-800 rounded-3xl shadow-2xl p-4">
          <div className="notch w-24 h-3 bg-zinc-900 rounded-b-xl mx-auto mb-2" />

          <div className="phone-screen bg-[#020202] rounded-2xl p-4 h-96 md:h-[540px] overflow-hidden relative">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                <span>Libyana network</span>
              </div>
              <div className="opacity-60">{formattedTime}</div>
            </div>

            {/* Home grid */}
            {!openApp && (
              <div
                className="h-full flex flex-col items-center justify-center"
                tabIndex={0}
                onKeyDown={onAppGridKeyDown}
              >
                <div className="grid grid-cols-3 gap-4 place-items-center">
                  {apps.map(({ key, label, emoji }, i) => (
                    <AppIcon
                      key={key}
                      label={label}
                      emoji={emoji}
                      onClick={() => setOpenApp(key)}
                      ref={(el) => (appRefs.current[i] = el)}
                      tabIndex={-1}
                    />
                  ))}
                </div>
                <div className="mt-6 text-gray-500 text-xs">Hover icons • Click or tap to open</div>
              </div>
            )}

            {/* App screens */}
            {openApp === "video" && (
              <VideoApp sampleVideos={sampleVideos} setGalleryModal={setGalleryModal} setOpenApp={setOpenApp} />
            )}
            {openApp === "xr" && <XRApp sampleXR={sampleXR} setOpenApp={setOpenApp} />}
            {openApp === "frames" && <FramesApp frames={frames} setOpenApp={setOpenApp} />}
            {openApp === "contact" && <ContactApp setOpenApp={setOpenApp} />}
            {openApp === "game" && <GameApp setOpenApp={setOpenApp} />}
            {openApp === "about" && <AboutApp setOpenApp={setOpenApp} />}
          </div>

          <div className="mt-3 flex justify-center">
            <div className="w-10 h-2 bg-zinc-800 rounded-full" />
          </div>
        </div>

        <div className="mt-6 text-gray-500 text-xs">Prototype — click apps to open. Press ESC to close.</div>
      </div>

      {galleryModal !== null && (
        <GalleryModal video={sampleVideos[galleryModal]} onClose={() => setGalleryModal(null)} />
      )}

      <style>{`
        @keyframes gradient {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        .glitch-overlay {
          background: repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.00) 2px);
          animation: flicker 3s linear infinite;
        }
        @keyframes flicker {
          0%,100%{opacity:0.1} 50%{opacity:0.05}
        }
        button:focus {
          outline: 2px solid #38bdf8;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

const AppIcon = React.forwardRef(({ label, emoji, onClick }, ref) => (
  <button
    onClick={onClick}
    className="w-20 h-20 bg-zinc-900/70 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform"
    ref={ref}
  >
    <div className="text-2xl">{emoji}</div>
    <div className="text-xs text-gray-300">{label}</div>
  </button>
));

function SnakeGame({ width = 260, height = 220 }) {
  const canvasRef = useRef(null);
  const foodSound = useRef(null);
  const dirRef = useRef({ x: 1, y: 0 }); // use ref to keep direction persistent
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    foodSound.current = new Audio("/sounds/collect.mp3");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scale = 10;
    const cols = Math.floor(width / scale);
    const rows = Math.floor(height / scale);

    let snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    let food = placeFood();

    function placeFood() {
      return { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    }

    function loop() {
      if (!alive) return;
      const dir = dirRef.current;
      const head = { x: (snake[0].x + dir.x + cols) % cols, y: (snake[0].y + dir.y + rows) % rows };
      for (let s of snake) if (s.x === head.x && s.y === head.y) {
        setAlive(false);
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        food = placeFood();
        if (foodSound.current) foodSound.current.play().catch(() => {});
      } else {
        snake.pop();
      }

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#00ffff";
      ctx.fillRect(food.x * scale, food.y * scale, scale, scale);
      ctx.fillStyle = "#bb86fc";
      for (let s of snake) ctx.fillRect(s.x * scale, s.y * scale, scale - 1, scale - 1);
      setTimeout(loop, 120);
    }

    loop();

    function onKey(e) {
      const dir = dirRef.current;
      if (e.key === "ArrowUp" && dir.y === 0) dirRef.current = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && dir.y === 0) dirRef.current = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && dir.x === 0) dirRef.current = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && dir.x === 0) dirRef.current = { x: 1, y: 0 };
    }
    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [width, height, alive]);

  // Touch controls
  const handleTouch = (direction) => {
    const dir = dirRef.current;
    switch (direction) {
      case "up":
        if (dir.y === 0) dirRef.current = { x: 0, y: -1 };
        break;
      case "down":
        if (dir.y === 0) dirRef.current = { x: 0, y: 1 };
        break;
      case "left":
        if (dir.x === 0) dirRef.current = { x: -1, y: 0 };
        break;
      case "right":
        if (dir.x === 0) dirRef.current = { x: 1, y: 0 };
        break;
      default:
        break;
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ borderRadius: 8, background: "#000" }}
      />
      {alive ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10, gap: 10 }}>
          <button onClick={() => handleTouch("up")}>⬆️</button>
          <button onClick={() => handleTouch("left")}>⬅️</button>
          <button onClick={() => handleTouch("down")}>⬇️</button>
          <button onClick={() => handleTouch("right")}>➡️</button>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: 10, color: "#fff" }}>Game Over - Refresh page</div>
      )}
    </>
  );
}

// The rest of your sub apps remain mostly unchanged...

function VideoApp({ sampleVideos, setGalleryModal, setOpenApp }) {
  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <button className="text-sm text-cyan-300" onClick={() => setOpenApp(null)}>
          Back
        </button>
        <div className="text-xs text-gray-400">Video Gallery</div>
        <div />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {sampleVideos.map((v, i) => (
          <div
            key={i}
            className="bg-zinc-900 rounded p-3 flex gap-3 items-center"
          >
            <div className="w-20 h-12 bg-zinc-800 rounded flex items-center justify-center text-xs">
              Thumb
            </div>
            <div className="flex-1">
              <div className="font-medium">{v.title}</div>
              <div className="text-xs text-gray-400">
                Sample description — replace with your project details
              </div>
            </div>
            <button
              className="text-sm text-sky-400"
              onClick={() => setGalleryModal(i)}
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function XRApp({ sampleXR, setOpenApp }) {
  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <button className="text-sm text-cyan-300" onClick={() => setOpenApp(null)}>
          Back
        </button>
        <div className="text-xs text-gray-400">XR / VR Samples</div>
        <div />
      </div>
      <div className="space-y-3">
        {sampleXR.map((x, i) => (
          <div key={i} className="bg-zinc-900 rounded p-3">
            <div className="font-medium">{x.title}</div>
            <div className="text-xs text-gray-400 mb-2">{x.desc}</div>
            <div className="w-full h-36 bg-black/40 rounded flex items-center justify-center text-xs">
              Placeholder for A-Frame / Three.js viewer
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FramesApp({ frames, setOpenApp }) {
  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <button className="text-sm text-cyan-300" onClick={() => setOpenApp(null)}>
          Back
        </button>
        <div className="text-xs text-gray-400">Stills / Frames</div>
        <div />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {frames.map((f, i) => (
          <div key={i} className="bg-zinc-900 rounded p-2">
            <div className="w-full h-32 bg-black/40 rounded mb-2 flex items-center justify-center text-xs">
              Image {i + 1}
            </div>
            <div className="text-sm">{f.title}</div>
            <div className="text-xs text-gray-400">{f.caption}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactApp({ setOpenApp }) {
  return (
    <div className="h-full overflow-auto px-1">
      <div className="flex items-center justify-between mb-3">
        <button className="text-sm text-cyan-300" onClick={() => setOpenApp(null)}>
          Back
        </button>
        <div className="text-xs text-gray-400">Contact</div>
        <div />
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <strong>Email:</strong> yourname@example.com
        </div>
        <div>
          <strong>Instagram:</strong> @yourhandle
        </div>
        <div>
          <strong>Location:</strong> New York, NY
        </div>
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Replace with real form handler");
          }}
        >
          <input
            className="w-full bg-zinc-900 p-2 rounded text-sm"
            placeholder="Name"
          />
          <input
            className="w-full bg-zinc-900 p-2 rounded text-sm"
            placeholder="Email"
          />
          <textarea
            className="w-full bg-zinc-900 p-2 rounded text-sm"
            placeholder="Message"
            rows={4}
          />
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 rounded p-2 text-white"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function AboutApp({ setOpenApp }) {
  return (
    <div className="h-full overflow-auto px-1 text-sm text-gray-400">
      <div className="flex items-center justify-between mb-3">
        <button className="text-sm text-cyan-300" onClick={() => setOpenApp(null)}>
          Back
        </button>
        <div className="text-xs text-gray-400">About</div>
        <div />
      </div>
      <p>
        This portfolio website was made by Ahmed E. It features a game, videos,
        XR demos, and more.
      </p>
    </div>
  );
}

function GalleryModal({ video, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50"
      onClick={onClose}
    >
      <video
        src={video.src}
        controls
        autoPlay
        className="max-w-full max-h-full rounded"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white bg-red-600 rounded-full w-8 h-8 flex justify-center items-center"
      >
        ✕
      </button>
    </div>
  );
}

function GameApp({ setOpenApp }) {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <button className="text-sm text-cyan-300" onClick={() => setOpenApp(null)}>
          Back
        </button>
        <div className="text-xs text-gray-400">Snake Game</div>
        <div />
      </div>
      <div className="flex justify-center">
        <SnakeGame />
      </div>
    </div>
  );
}
