import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ── NASA Texture URLs (Locally Bundled) ───────────────────────────────────
const TEX_DAY   = '/textures/earth_day.jpg';
const TEX_NIGHT = '/textures/earth_night.png';
const TEX_CLOUDS = '/textures/earth_clouds.png';

// ── Custom Day/Night Terminator Shader ─────────────────────────────────────
const VERT = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAG = `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform vec3 sunDir;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    float light = dot(normalize(vNormal), normalize(sunDir));
    float t = smoothstep(-0.25, 0.25, light);
    vec4 day = texture2D(dayMap, vUv);
    vec4 night = texture2D(nightMap, vUv);
    night.rgb *= 1.8;
    gl_FragColor = mix(night, day, t);
    float terminator = smoothstep(-0.1, 0.35, light) * 0.18;
    gl_FragColor.rgb += vec3(0.08, 0.18, 0.45) * terminator;
  }
`;

// ── Compute real-time solar position ──────────────────────────────────────
function getSunDirection(now) {
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now - start) / 86400000);
  const decl = -23.45 * Math.cos((2 * Math.PI / 365) * (day + 10)) * (Math.PI / 180);
  const ha = (now.getUTCHours() + now.getUTCMinutes() / 60 - 12) * 15 * (Math.PI / 180);
  return new THREE.Vector3(
    Math.cos(decl) * Math.cos(-ha),
    Math.sin(decl),
    Math.cos(decl) * Math.sin(-ha)
  ).normalize();
}

// ── UTC clock formatter ───────────────────────────────────────────────────
function fmtUTC(d) {
  return d.toUTCString().replace('GMT', 'UTC');
}

export default function LiveEarthView({ onClose }) {
  const mountRef = useRef(null);
  const isPausedRef = useRef(false);
  const rotSpeedRef = useRef(0.08);
  const earthRef = useRef(null);
  const cloudRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);
  const matRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [rotSpeed, setRotSpeed] = useState(8);
  const [epicData, setEpicData] = useState(null);
  const [utcTime, setUtcTime] = useState(new Date());

  // Keep refs in sync with state (avoids stale closures in animation loop)
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { rotSpeedRef.current = rotSpeed / 1000; }, [rotSpeed]);

  // Real-time UTC clock
  useEffect(() => {
    const t = setInterval(() => setUtcTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // NASA EPIC API — latest Earth photo from DSCOVR satellite
  useEffect(() => {
    fetch('https://epic.gsfc.nasa.gov/api/natural/images?limit=1')
      .then(r => r.json())
      .then(data => {
        if (data?.[0]) {
          const img = data[0];
          const d = img.date.split(' ')[0].replace(/-/g, '/');
          setEpicData({
            url: `https://epic.gsfc.nasa.gov/archive/natural/${d}/png/${img.image}.png`,
            date: img.date,
          });
        }
      })
      .catch(() => {});
  }, []);

  // ── Three.js Scene Setup ─────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth;
    const H = el.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000004);
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 2000);
    camera.position.z = 3.4;

    // ── Star Field ──────────────────────────────────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(15000 * 3);
    const starCol = new Float32Array(15000 * 3);
    for (let i = 0; i < 15000 * 3; i += 3) {
      const r = 400 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i + 2] = r * Math.cos(phi);
      const bright = 0.5 + Math.random() * 0.5;
      starCol[i] = bright; starCol[i + 1] = bright; starCol[i + 2] = bright + Math.random() * 0.2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.55, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true,
    })));

    // ── Earth Sphere ────────────────────────────────────────────────────────
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    let loaded = 0;
    const checkLoaded = () => {
      loaded++;
      setLoadProgress(Math.round((loaded / 3) * 100));
      if (loaded >= 3) setIsLoading(false);
    };

    const dayTex   = loader.load(TEX_DAY, checkLoaded);
    const nightTex = loader.load(TEX_NIGHT, checkLoaded);
    dayTex.colorSpace = THREE.SRGBColorSpace;

    const sunDir = getSunDirection(new Date());
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        dayMap:   { value: dayTex },
        nightMap: { value: nightTex },
        sunDir:   { value: sunDir },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
    });
    matRef.current = earthMat;

    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 80, 80), earthMat);
    earth.rotation.y = -Math.PI / 2;
    scene.add(earth);
    earthRef.current = earth;

    // ── Cloud Layer ─────────────────────────────────────────────────────────
    const cloudTex = loader.load(TEX_CLOUDS, checkLoaded);
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.018, 64, 64),
      new THREE.MeshLambertMaterial({
        map: cloudTex, transparent: true, opacity: 0.48,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    scene.add(clouds);
    cloudRef.current = clouds;

    // ── Atmosphere Layers ───────────────────────────────────────────────────
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.06, 64, 64),
      new THREE.MeshLambertMaterial({
        color: new THREE.Color(0.15, 0.4, 1.0), transparent: true, opacity: 0.1,
        side: THREE.FrontSide, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    ));
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 64, 64),
      new THREE.MeshLambertMaterial({
        color: new THREE.Color(0.08, 0.28, 0.85), transparent: true, opacity: 0.065,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    ));

    // ── Lighting ────────────────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight(0xfff8f0, 2.2);
    sunLight.position.copy(sunDir.clone().multiplyScalar(10));
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x10101a, 0.6));

    // ── Manual drag-to-rotate ───────────────────────────────────────────────
    let dragging = false, prev = { x: 0, y: 0 };
    const onDown = (e) => { dragging = true; prev = { x: e.clientX || e.touches?.[0]?.clientX, y: e.clientY || e.touches?.[0]?.clientY }; };
    const onUp = () => { dragging = false; };
    const onMove = (e) => {
      if (!dragging) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      const dx = (cx - prev.x) * 0.004;
      const dy = (cy - prev.y) * 0.004;
      if (earthRef.current) {
        earthRef.current.rotation.y += dx;
        earthRef.current.rotation.x = Math.max(-1.2, Math.min(1.2, earthRef.current.rotation.x + dy));
      }
      if (cloudRef.current) {
        cloudRef.current.rotation.y = earthRef.current.rotation.y + 0.01;
        cloudRef.current.rotation.x = earthRef.current.rotation.x;
      }
      prev = { x: cx, y: cy };
    };

    // ── Mouse-wheel zoom ────────────────────────────────────────────────────
    const onWheel = (e) => {
      camera.position.z = Math.max(1.5, Math.min(7, camera.position.z + e.deltaY * 0.005));
    };

    el.addEventListener('mousedown', onDown);
    el.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: true });

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Animation Loop ───────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      if (!isPausedRef.current) {
        if (earthRef.current) earthRef.current.rotation.y += rotSpeedRef.current * dt;
        if (cloudRef.current) cloudRef.current.rotation.y += rotSpeedRef.current * 1.12 * dt;
      }
      // Update sun direction in real-time
      if (matRef.current) {
        matRef.current.uniforms.sunDir.value = getSunDirection(new Date());
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('touchstart', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="live-earth-overlay">
      {/* Top HUD */}
      <div className="earth-hud-top">
        <div className="earth-hud-brand">
          <span className="earth-hud-icon">🛸</span>
          <div>
            <div className="earth-hud-title">Live Earth — NASA View</div>
            <div className="earth-hud-sub">Real-time day/night terminator · Drag to rotate · Scroll to zoom</div>
          </div>
        </div>
        <div className="earth-hud-clock">
          <div className="earth-clock-label">UTC</div>
          <div className="earth-clock-time">{utcTime.toUTCString().split(' ').slice(1, 5).join(' ')}</div>
        </div>
        <button className="earth-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Canvas mount */}
      <div ref={mountRef} className="earth-canvas-mount" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="earth-loading">
          <div className="earth-loading-ring"></div>
          <div className="earth-loading-text">Loading NASA 4K Textures… {loadProgress}%</div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="earth-hud-bottom">
        <div className="earth-controls-row">
          <button
            className={`earth-ctrl-btn ${isPaused ? 'active' : ''}`}
            onClick={() => setIsPaused(p => !p)}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          <div className="earth-speed-wrap">
            <span className="earth-ctrl-label">Speed</span>
            <input
              type="range" min="1" max="80" value={rotSpeed}
              onChange={e => setRotSpeed(Number(e.target.value))}
              className="earth-speed-slider"
            />
            <span className="earth-ctrl-val">{rotSpeed}×</span>
          </div>

          <div className="earth-info-chip">
            🌍 Blue Marble · DSCOVR/EPIC Satellite
          </div>
        </div>
      </div>

      {/* NASA EPIC Latest Photo Panel */}
      {epicData && (
        <div className="epic-panel glass-panel-heavy">
          <div className="epic-panel-title">📡 NASA EPIC — Latest Earth Photo</div>
          <img src={epicData.url} alt="NASA EPIC Earth" className="epic-img" loading="lazy" />
          <div className="epic-date">{epicData.date} UTC</div>
          <div className="epic-caption">DSCOVR spacecraft · L1 Lagrange point · 1.5M km from Earth</div>
        </div>
      )}
    </div>
  );
}
