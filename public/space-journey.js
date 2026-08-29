const body = document.body;
const mount = document.getElementById('space-webgl');
const announcer = document.querySelector('[data-visual-announcer]');
const sceneLabels = [...document.querySelectorAll('[data-scene]')];
const journeyScroll = document.querySelector('[data-journey-scroll]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const forceReducedMotion = new URLSearchParams(location.search).get('vf-motion') === 'reduce';

let controller = null;
let effectiveMode = 'static';
let requestToken = 0;

function clearlyLowCapability() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const veryLowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;
  const veryLowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2;
  return veryLowMemory || veryLowCpu || Boolean(connection && connection.saveData);
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const attributes = { failIfMajorPerformanceCaveat: true, powerPreference: 'high-performance' };
    const context = canvas.getContext('webgl2', attributes) || canvas.getContext('webgl', attributes);
    if (!context) return false;
    const loseContext = context.getExtension('WEBGL_lose_context');
    if (loseContext) loseContext.loseContext();
    return true;
  } catch (_) {
    return false;
  }
}

function initialPreference() {
  if (forceReducedMotion || reduceMotion.matches) return { mode: 'static', reason: 'reduced-motion' };
  if (clearlyLowCapability()) return { mode: 'static', reason: 'device-capability' };
  if (!supportsWebGL()) return { mode: 'static', reason: 'webgl-unavailable' };
  return { mode: 'cinematic', reason: 'automatic' };
}

function announce(message) {
  if (announcer) announcer.textContent = message;
}

function publishMode(mode, reason) {
  effectiveMode = mode;
  body.dataset.visualMode = mode;
  body.dataset.visualReason = reason;
  window.dispatchEvent(new CustomEvent('vf:visual-mode', { detail: { mode, reason } }));
}

function showStatic(reason, options) {
  const settings = options || {};
  requestToken += 1;
  if (controller) {
    controller.dispose();
    controller = null;
  }
  body.dataset.webglReady = 'false';
  delete body.dataset.visualFps;
  publishMode('static', reason);
  if (!settings.silent) announce('Static visuals enabled.');
}

async function showCinematic(reason) {
  const token = ++requestToken;
  body.dataset.visualReason = 'loading';
  try {
    if (new URLSearchParams(location.search).get('vf-webgl') === 'fail') {
      throw new Error('Simulated WebGL initialization failure');
    }
    const THREE = await import('/assets/vendor/three.module.min.js');
    if (token !== requestToken) return;
    controller = new SpaceJourneyController(THREE, mount, {
      onScene: updateSceneReadout,
      onFallback: (fallbackReason) => {
        console.warn('[VeilFarers] Cinematic visuals unavailable; using Static mode.');
        showStatic(fallbackReason, { silent: true });
        announce('Cinematic visuals became unavailable. Static visuals enabled.');
      }
    });
    controller.start();
    if (token !== requestToken) {
      controller.dispose();
      controller = null;
      return;
    }
    body.dataset.webglReady = 'true';
    publishMode('cinematic', reason);
    announce('Cinematic visuals enabled.');
  } catch (error) {
    if (token !== requestToken) return;
    console.warn('[VeilFarers] Cinematic visuals unavailable; using Static mode.');
    showStatic('webgl-unavailable', { silent: true });
    announce('Cinematic visuals are unavailable. Static visuals enabled.');
  }
}

function updateSceneReadout(sceneName) {
  sceneLabels.forEach((label) => label.classList.toggle('is-active', label.dataset.scene === sceneName));
}

reduceMotion.addEventListener('change', (event) => {
  if (event.matches) showStatic('reduced-motion');
  else {
    const preference = initialPreference();
    if (preference.mode === 'cinematic') showCinematic(preference.reason);
    else showStatic(preference.reason, { silent: true });
  }
});

class SpaceJourneyController {
  constructor(THREE, target, options) {
    this.THREE = THREE;
    this.target = target;
    this.options = options;
    this.running = false;
    this.raf = 0;
    this.elapsed = 0;
    this.debugScene = new URLSearchParams(location.search).get('vf-scene');
    this.debugProgress = { starfield: 0.08, planet: 0.92 }[this.debugScene];
    this.targetProgress = typeof this.debugProgress === 'number' ? this.debugProgress : 0;
    this.currentProgress = this.targetProgress;
    this.lastFrame = performance.now();
    this.performanceStart = this.lastFrame;
    this.performanceFrames = 0;
    this.performanceWindows = 0;
    this.lowWindows = 0;
    this.latestFps = 60;
    this.pointer = { x: 0, y: 0 };
    this.cameraOffset = { x: 0, y: 0 };
    this.currentScene = '';
    this.onResize = this.resize.bind(this);
    this.onScroll = this.syncScrollProgress.bind(this);
    this.onPointerMove = this.pointerMove.bind(this);
    this.onVisibility = this.visibilityChange.bind(this);
    this.onContextLost = this.contextLost.bind(this);
    this.frame = this.frame.bind(this);
    this.init();
  }

  init() {
    const T = this.THREE;
    const canvas = document.createElement('canvas');
    canvas.className = 'vf-space-canvas';
    this.canvas = canvas;
    this.target.replaceChildren(canvas);

    this.renderer = new T.WebGLRenderer({
      canvas,
      antialias: window.innerWidth >= 900,
      alpha: false,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true
    });
    this.renderer.setClearColor(0x010307, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 1100 ? 1.2 : 1.5));
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;

    this.scene = new T.Scene();
    this.scene.fog = new T.FogExp2(0x02050a, 0.009);
    this.camera = new T.PerspectiveCamera(43, 1, 0.1, 240);
    this.camera.position.set(0, 0, 14);

    this.scene.add(new T.AmbientLight(0x526473, 0));
    const key = new T.DirectionalLight(0xd8eeff, 7);
    key.position.set(-4, 2, -30);
    this.scene.add(key);
    const rim = new T.DirectionalLight(0x79c8ee, 0.02);
    rim.position.set(6, -3, -12);
    this.scene.add(rim);

    const countScale = window.innerWidth < 1100 ? 0.58 : 1;
    this.starField = this.createStarField(Math.round(6200 * countScale));
    this.hyperspace = this.createHyperspace(Math.round(780 * countScale));
    this.planet = this.createPlanet();
    this.scene.add(this.starField.points, this.hyperspace.group, this.planet.group);

    this.resize();
    this.renderer.render(this.scene, this.camera);
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    canvas.addEventListener('webglcontextlost', this.onContextLost, false);
    this.syncScrollProgress();
  }

  createStarField(count) {
    const T = this.THREE;
    const random = seededRandom(94731);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (random() - 0.5) * 105;
      positions[i * 3 + 1] = (random() - 0.5) * 67;
      positions[i * 3 + 2] = random() * 150 - 130;
      sizes[i] = 0.55 + random() * 1.9;
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new T.BufferAttribute(sizes, 1));
    const material = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uTravel: { value: 0 }, uSpeed: { value: 1 } },
      vertexShader: [
        'attribute float aSize;',
        'uniform float uTime;',
        'uniform float uTravel;',
        'uniform float uSpeed;',
        'varying float vGlow;',
        'void main(){',
        ' vec3 p=position;',
        ' p.z=mod(p.z+uTravel,150.0)-130.0;',
        ' p.xy*=1.0+0.0018*uSpeed*(14.0-p.z);',
        ' vec4 mv=modelViewMatrix*vec4(p,1.0);',
        ' gl_Position=projectionMatrix*mv;',
        ' gl_PointSize=clamp(aSize*(180.0/-mv.z),0.7,5.0);',
        ' vGlow=.65+.35*sin(uTime*1.3+aSize*8.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying float vGlow;',
        'void main(){',
        ' vec2 p=gl_PointCoord-0.5;',
        ' float d=length(p);',
        ' if(d>.5) discard;',
        ' float a=smoothstep(.5,.03,d)*vGlow;',
        ' vec3 cool=vec3(.68,.84,1.0);',
        ' vec3 warm=vec3(1.0,.82,.46);',
        ' vec3 c=mix(cool,warm,smoothstep(.0,.45,p.x+p.y));',
        ' gl_FragColor=vec4(c,a);',
        '}'
      ].join('\n')
    });
    return { points: new T.Points(geometry, material), material };
  }

  createHyperspace(count) {
    const T = this.THREE;
    const random = seededRandom(2107);
    const positions = new Float32Array(count * 6);
    const colors = new Float32Array(count * 6);
    const cool = new T.Color(0xaedfff);
    const warm = new T.Color(0xf3c568);
    for (let i = 0; i < count; i += 1) {
      const z = -90 + random() * 92;
      const spread = 1.6 + (-z * 0.052);
      const x = (random() - 0.5) * spread * 10;
      const y = (random() - 0.5) * spread * 6;
      const length = 0.25 + random() * 2.3;
      positions.set([x, y, z, x, y, z + length], i * 6);
      const color = random() > 0.83 ? warm : cool;
      colors.set([color.r, color.g, color.b, color.r, color.g, color.b], i * 6);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new T.BufferAttribute(colors, 3));
    const material = new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending });
    const group = new T.Group();
    group.add(new T.LineSegments(geometry, material));
    return { group, material };
  }

  createPlanet() {
    const T = this.THREE;
    const group = new T.Group();
    const surface = this.loadTexture('/assets/books/core-planet-albedo.webp');
    const clouds = this.createCloudTexture();
    const geometry = new T.SphereGeometry(4.2, 72, 52);
    const surfaceMaterial = new T.MeshStandardMaterial({
      map: surface,
      roughness: 0.92,
      metalness: 0.02,
      transparent: true,
      opacity: 0
    });
    const planet = new T.Mesh(geometry, surfaceMaterial);
    planet.rotation.z = -0.16;
    group.add(planet);

    const cloudMaterial = new T.MeshStandardMaterial({
      map: clouds,
      alphaMap: clouds,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      roughness: 1
    });
    const cloudLayer = new T.Mesh(new T.SphereGeometry(4.225, 64, 44), cloudMaterial);
    group.add(cloudLayer);

    const atmosphereMaterial = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: T.BackSide,
      blending: T.AdditiveBlending,
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: 'varying vec3 vNormal;void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec3 vNormal;uniform float uOpacity;void main(){float rim=pow(1.0-abs(vNormal.z),5.6);vec3 c=mix(vec3(.12,.48,.72),vec3(1.0,.84,.5),rim*.16);gl_FragColor=vec4(c,rim*uOpacity);}'
    });
    const atmosphere = new T.Mesh(new T.SphereGeometry(4.31, 64, 44), atmosphereMaterial);
    group.add(atmosphere);

    const moonMaterial = new T.MeshStandardMaterial({
      map: this.loadTexture('/assets/books/core-moon-albedo.webp'),
      color: 0xf2f1ed,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0
    });
    const moonPivot = new T.Group();
    moonPivot.rotation.z = -0.22;
    const moon = new T.Mesh(new T.SphereGeometry(0.372, 36, 24), moonMaterial);
    moon.position.set(6.7, 1.1, 0.35);
    moonPivot.add(moon);
    group.add(moonPivot);
    group.position.set(-4.75, 1.5, -1.1);
    group.userData.fade = [
      { material: surfaceMaterial, base: 1 },
      { material: cloudMaterial, base: 0.34 },
      { material: atmosphereMaterial, base: 0.42, uniform: true },
      { material: moonMaterial, base: 1 }
    ];
    return { group, planet, cloudLayer, moon, moonPivot };
  }

  createMoonTexture() {
    const T = this.THREE;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const image = context.createImageData(canvas.width, canvas.height);
    const random = seededRandom(62114);
    const craters = Array.from({ length: 34 }, () => ({
      x: random() * canvas.width,
      y: random() * canvas.height,
      radius: 3 + random() * 16,
      depth: 0.12 + random() * 0.28
    }));
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        let shade = 0.52 + 0.1 * Math.sin(x * 0.13) * Math.cos(y * 0.09);
        craters.forEach((crater) => {
          const dx = Math.min(Math.abs(x - crater.x), canvas.width - Math.abs(x - crater.x));
          const distance = Math.hypot(dx, y - crater.y);
          if (distance < crater.radius) shade -= (1 - distance / crater.radius) * crater.depth;
        });
        const value = Math.max(48, Math.min(194, 86 + shade * 95));
        const index = (y * canvas.width + x) * 4;
        image.data[index] = value * 0.98;
        image.data[index + 1] = value * 0.96;
        image.data[index + 2] = value;
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    return texture;
  }

  loadTexture(path) {
    const T = this.THREE;
    const texture = new T.TextureLoader().load(path, undefined, undefined, () => {
      console.warn('[VeilFarers] Planet texture unavailable; retaining the cinematic fallback.');
    });
    texture.colorSpace = T.SRGBColorSpace;
    texture.wrapS = T.RepeatWrapping;
    texture.wrapT = T.ClampToEdgeWrapping;
    texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  createPlanetTexture() {
    const T = this.THREE;
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 384;
    const context = canvas.getContext('2d');
    const image = context.createImageData(canvas.width, canvas.height);
    const data = image.data;
    const hash = (x, y) => {
      const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
      return value - Math.floor(value);
    };
    const noise = (x, y) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const fx = x - ix;
      const fy = y - iy;
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      const a = hash(ix, iy);
      const b = hash(ix + 1, iy);
      const c = hash(ix, iy + 1);
      const d = hash(ix + 1, iy + 1);
      return (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy;
    };
    const fbm = (x, y) => {
      let total = 0;
      let amplitude = 0.52;
      let frequency = 1;
      for (let octave = 0; octave < 6; octave += 1) {
        total += noise(x * frequency, y * frequency) * amplitude;
        frequency *= 2.03;
        amplitude *= 0.49;
      }
      return total;
    };
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const nx = x / canvas.width;
        const ny = y / canvas.height;
        const lat = Math.abs(ny - 0.5) * 2;
        const continental = fbm(nx * 5.3, ny * 5.3);
        const detail = fbm(nx * 19.7 + 9.2, ny * 19.7 - 3.8);
        const n = continental * 0.78 + detail * 0.22;
        const coast = 0.51 + lat * 0.035;
        const land = n > coast;
        const elevation = Math.max(0, (n - coast) * 6.2);
        const ice = lat > 0.86 - detail * 0.045;
        let r;
        let g;
        let b;
        if (ice) {
          r = 152 + detail * 40; g = 171 + detail * 38; b = 178 + detail * 38;
        } else if (land) {
          const arid = Math.max(0, 1 - Math.abs(ny - 0.5) * 4.2) * detail;
          r = 37 + elevation * 38 + arid * 34;
          g = 49 + elevation * 28 + arid * 22;
          b = 38 + elevation * 17 + arid * 6;
        } else {
          const depth = Math.max(0, coast - n);
          r = 5 + detail * 8;
          g = 21 + detail * 16 - depth * 12;
          b = 34 + detail * 25 - depth * 18;
        }
        const index = (y * canvas.width + x) * 4;
        data[index] = Math.max(0, r);
        data[index + 1] = Math.max(0, g);
        data[index + 2] = Math.max(0, b);
        data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  createCloudTexture() {
    const T = this.THREE;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const image = context.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const u = x / canvas.width * Math.PI * 2;
        const v = y / canvas.height * Math.PI * 2;
        const n = Math.sin(u * 3 + Math.sin(v * 2) * 2.1) * 0.48 +
          Math.sin(u * 7 - v * 3) * 0.31 +
          Math.cos(v * 5 + Math.sin(u * 2) * 1.4) * 0.25 +
          Math.sin(u * 13 + v * 7) * 0.12;
        const alpha = Math.max(0, Math.min(88, (n - 0.48) * 82));
        const index = (y * canvas.width + x) * 4;
        image.data[index] = 220;
        image.data[index + 1] = 232;
        image.data[index + 2] = 235;
        image.data[index + 3] = alpha;
      }
    }
    context.putImageData(image, 0, 0);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    texture.wrapS = T.RepeatWrapping;
    texture.wrapT = T.ClampToEdgeWrapping;
    texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.syncScrollProgress();
    this.lastFrame = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  frame(now) {
    if (!this.running) return;
    const delta = Math.min(0.05, Math.max(0.001, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.elapsed += delta;
    this.update(this.elapsed, delta);
    this.renderer.render(this.scene, this.camera);
    this.measurePerformance(now);
    this.raf = requestAnimationFrame(this.frame);
  }

  update(time, delta) {
    this.currentProgress += (this.targetProgress - this.currentProgress) * Math.min(1, delta * 5.2);
    const progress = this.currentProgress;
    const planetWeight = smoothstep(0.53, 0.74, progress);
    const hyperspaceWeight = pulse(progress, 0.4, 0.7);

    this.starField.material.uniforms.uTime.value = time;
    this.starField.material.uniforms.uSpeed.value = 1 + hyperspaceWeight * 15;
    this.starField.material.uniforms.uTravel.value += delta * (1.3 + hyperspaceWeight * 31);
    this.starField.points.rotation.z = time * 0.003;
    this.hyperspace.material.opacity = hyperspaceWeight * 0.68;
    this.hyperspace.group.scale.z = 1 + hyperspaceWeight * 8;
    this.hyperspace.group.position.z = Math.sin(time * 0.8) * 2;

    fadeGroup(this.planet.group, planetWeight);

    this.planet.planet.rotation.y += delta * 0.035;
    this.planet.cloudLayer.rotation.y += delta * 0.047;
    this.planet.moon.rotation.y += delta * 0.018;
    this.planet.moonPivot.rotation.y = time * 0.085 + progress * 0.42;
    this.planet.group.position.y = 1.5 + Math.sin(time * 0.1) * 0.08;

    this.cameraOffset.x += (this.pointer.x * 0.16 - this.cameraOffset.x) * 0.018;
    this.cameraOffset.y += (-this.pointer.y * 0.1 - this.cameraOffset.y) * 0.018;
    this.camera.position.x = this.cameraOffset.x;
    this.camera.position.y = this.cameraOffset.y;
    this.camera.lookAt(0, 0, 0);

    body.style.setProperty('--vf-journey-progress', progress.toFixed(4));
    const weights = [['planet', planetWeight], ['starfield', 1 - planetWeight]].sort((a, b) => b[1] - a[1]);
    if (weights[0][0] !== this.currentScene) {
      this.currentScene = weights[0][0];
      body.dataset.visualScene = this.currentScene;
      this.options.onScene(this.currentScene);
    }
  }

  syncScrollProgress() {
    if (typeof this.debugProgress === 'number') {
      this.targetProgress = this.debugProgress;
      return;
    }
    if (!journeyScroll) {
      this.targetProgress = 0;
      return;
    }
    const bounds = journeyScroll.getBoundingClientRect();
    const distance = Math.max(1, journeyScroll.offsetHeight - window.innerHeight);
    this.targetProgress = Math.max(0, Math.min(1, -bounds.top / distance));
  }

  measurePerformance(now) {
    if (document.hidden || now - this.performanceStart < 5000) return;
    this.performanceFrames += 1;
    if (now - this.performanceStart < 7000) return;
    const seconds = (now - this.performanceStart - 5000) / 1000;
    this.latestFps = this.performanceFrames / Math.max(0.01, seconds);
    body.dataset.visualFps = this.latestFps.toFixed(1);
    this.performanceWindows += 1;
    if (this.latestFps < 24) this.lowWindows += 1;
    else if (this.latestFps > 28) this.lowWindows = 0;
    this.performanceStart = now - 5000;
    this.performanceFrames = 0;
    if (this.performanceWindows >= 4 && this.lowWindows >= 4) {
      this.options.onFallback('sustained-low-fps');
    }
  }

  pointerMove(event) {
    if (event.pointerType === 'touch') return;
    this.pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    this.pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  visibilityChange() {
    this.lastFrame = performance.now();
  }

  contextLost(event) {
    event.preventDefault();
    this.options.onFallback('webgl-context-lost');
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const width = Math.max(1, this.target.clientWidth || window.innerWidth);
    const height = Math.max(1, this.target.clientHeight || window.innerHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 1100 ? 1.2 : 1.5));
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('visibilitychange', this.onVisibility);
    if (this.canvas) this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    if (this.scene) {
      const textures = new Set();
      const materials = new Set();
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.filter(Boolean).forEach((material) => {
          materials.add(material);
          Object.values(material).forEach((value) => {
            if (value && value.isTexture) textures.add(value);
          });
        });
      });
      textures.forEach((texture) => texture.dispose());
      materials.forEach((material) => material.dispose());
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
    if (this.target) this.target.replaceChildren();
  }
}

function fadeGroup(group, weight) {
  group.visible = weight > 0.002;
  (group.userData.fade || []).forEach((entry) => {
    if (entry.uniform) entry.material.uniforms.uOpacity.value = entry.base * weight;
    else entry.material.opacity = entry.base * weight;
  });
}

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function windowWeight(value, fadeInStart, fullStart, fullEnd, fadeOutEnd) {
  if (value < fadeInStart || value > fadeOutEnd) return 0;
  if (value < fullStart) return smoothstep(fadeInStart, fullStart, value);
  if (value <= fullEnd) return 1;
  return 1 - smoothstep(fullEnd, fadeOutEnd, value);
}

function pulse(value, start, end) {
  if (value <= start || value >= end) return 0;
  const middle = (start + end) * 0.5;
  return value < middle ? smoothstep(start, middle, value) : 1 - smoothstep(middle, end, value);
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return function next() {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

window.VeilFarersVisuals = {
  getMode: () => effectiveMode,
  getReason: () => body.dataset.visualReason,
  getPerformance: () => controller ? { fps: controller.latestFps, lowWindows: controller.lowWindows } : null,
  simulateFailure: () => {
    if (controller) controller.options.onFallback('simulated-failure');
    else showStatic('simulated-failure');
  }
};

const preference = initialPreference();
if (preference.mode === 'cinematic') showCinematic(preference.reason);
else showStatic(preference.reason, { silent: true });
