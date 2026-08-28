const STORAGE_KEY = 'vf-home-visuals';
const body = document.body;
const mount = document.getElementById('space-webgl');
const announcer = document.querySelector('[data-visual-announcer]');
const visualButtons = [...document.querySelectorAll('[data-visual-choice]')];
const sceneLabels = [...document.querySelectorAll('[data-scene]')];
const header = document.querySelector('[data-site-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const forceReducedMotion = new URLSearchParams(location.search).get('vf-motion') === 'reduce';

let controller = null;
let effectiveMode = 'static';
let storedChoice = readChoice();
let requestToken = 0;

function readChoice() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'cinematic' || value === 'static' ? value : null;
  } catch (_) {
    return null;
  }
}

function saveChoice(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch (_) { /* preference remains session-only */ }
}

function clearlyLowCapability() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const veryLowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;
  const veryLowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2;
  return window.innerWidth < 700 || veryLowMemory || veryLowCpu || Boolean(connection && connection.saveData);
}

function initialPreference() {
  if (storedChoice) return { mode: storedChoice, explicit: true, reason: 'saved-preference' };
  if (forceReducedMotion || reduceMotion.matches) return { mode: 'static', explicit: false, reason: 'reduced-motion' };
  if (clearlyLowCapability()) return { mode: 'static', explicit: false, reason: 'device-capability' };
  return { mode: 'cinematic', explicit: false, reason: 'automatic' };
}

function setButtonState(mode, busy) {
  visualButtons.forEach((button) => {
    const selected = button.dataset.visualChoice === mode;
    button.setAttribute('aria-pressed', String(selected));
    button.disabled = Boolean(busy);
  });
}

function announce(message) {
  if (announcer) announcer.textContent = message;
}

function publishMode(mode, reason) {
  effectiveMode = mode;
  body.dataset.visualMode = mode;
  body.dataset.visualReason = reason;
  setButtonState(mode, false);
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

async function showCinematic(reason, explicit) {
  const token = ++requestToken;
  setButtonState('cinematic', true);
  body.dataset.visualReason = 'loading';
  try {
    if (new URLSearchParams(location.search).get('vf-webgl') === 'fail') {
      throw new Error('Simulated WebGL initialization failure');
    }
    const THREE = await import('/assets/vendor/three.module.min.js');
    if (token !== requestToken) return;
    controller = new SpaceJourneyController(THREE, mount, {
      explicit: Boolean(explicit),
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

visualButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const choice = button.dataset.visualChoice;
    storedChoice = choice;
    saveChoice(choice);
    if (choice === 'static') showStatic('user-choice');
    else showCinematic('user-choice', true);
  });
});

if (navToggle && header) {
  navToggle.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('[data-public-nav] a').forEach((link) => link.addEventListener('click', () => {
    header.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      header.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

reduceMotion.addEventListener('change', (event) => {
  if (!storedChoice && event.matches) showStatic('reduced-motion');
  else if (!storedChoice && !event.matches && !clearlyLowCapability()) showCinematic('automatic', false);
});

class SpaceJourneyController {
  constructor(THREE, target, options) {
    this.THREE = THREE;
    this.target = target;
    this.options = options;
    this.running = false;
    this.raf = 0;
    this.elapsed = {
      planet: 16,
      'black-hole': 38,
      galaxy: 58,
      hyperspace: 0
    }[new URLSearchParams(location.search).get('vf-scene')] || 0;
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
      failIfMajorPerformanceCaveat: !this.options.explicit
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

    this.scene.add(new T.AmbientLight(0x526473, 0.055));
    const key = new T.DirectionalLight(0xffe6b3, 3.5);
    key.position.set(-8, 4, 3);
    this.scene.add(key);
    const rim = new T.DirectionalLight(0x79c8ee, 0.65);
    rim.position.set(7, -2, 1);
    this.scene.add(rim);

    const countScale = window.innerWidth < 1100 ? 0.58 : 1;
    this.starField = this.createStarField(Math.round(6200 * countScale));
    this.hyperspace = this.createHyperspace(Math.round(780 * countScale));
    this.planet = this.createPlanet();
    this.blackHole = this.createBlackHole();
    this.galaxy = this.createGalaxy(Math.round(13000 * countScale));
    this.scene.add(this.starField.points, this.hyperspace.group, this.planet.group, this.blackHole.group, this.galaxy.group);

    this.resize();
    this.renderer.render(this.scene, this.camera);
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    canvas.addEventListener('webglcontextlost', this.onContextLost, false);
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
    const surface = this.createPlanetTexture();
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
    group.position.set(-4.75, 1.5, -1.1);
    group.userData.fade = [
      { material: surfaceMaterial, base: 1 },
      { material: cloudMaterial, base: 0.34 },
      { material: atmosphereMaterial, base: 0.42, uniform: true }
    ];
    return { group, planet, cloudLayer };
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
        const n = Math.sin(x * 0.035 + Math.sin(y * 0.029) * 4.1) * 0.6 +
          Math.sin(x * 0.094 - y * 0.061) * 0.34 +
          Math.cos(y * 0.071 + Math.sin(x * 0.018)) * 0.28 +
          Math.sin(x * 0.19 + y * 0.13) * 0.13;
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
    return texture;
  }

  createBlackHole() {
    const T = this.THREE;
    const group = new T.Group();
    const coreMaterial = new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const core = new T.Mesh(new T.SphereGeometry(1.76, 64, 48), coreMaterial);
    group.add(core);

    const diskMaterial = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      blending: T.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: [
        'varying vec2 vUv;uniform float uTime;uniform float uOpacity;',
        'void main(){',
        ' vec2 p=(vUv-.5)*2.0;float r=length(p);float a=atan(p.y,p.x);',
        ' float edge=smoothstep(.22,.31,r)*(1.0-smoothstep(.9,1.0,r));',
        ' float lanes=.32+.68*pow(.5+.5*sin(a*17.0-r*42.0-uTime*1.45),5.0);',
        ' float hot=pow(1.0-r,2.1);',
        ' vec3 color=mix(vec3(.31,.09,.018),vec3(.92,.55,.18),hot+lanes*.28);',
        ' gl_FragColor=vec4(color,edge*(.18+lanes*.72)*uOpacity);',
        '}'
      ].join('\n')
    });
    const disk = new T.Mesh(new T.RingGeometry(1.7, 5.8, 160, 6), diskMaterial);
    disk.rotation.x = 1.28;
    disk.rotation.z = -0.13;
    group.add(disk);

    const innerMaterial = new T.MeshBasicMaterial({ color: 0xb96f25, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending, toneMapped: false });
    const inner = new T.Mesh(new T.TorusGeometry(1.83, 0.055, 10, 128), innerMaterial);
    inner.rotation.x = 1.28;
    inner.rotation.z = -0.13;
    group.add(inner);

    const lensMaterial = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: T.BackSide,
      blending: T.AdditiveBlending,
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: 'varying vec3 vNormal;void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec3 vNormal;uniform float uOpacity;void main(){float r=pow(1.0-abs(vNormal.z),6.5);gl_FragColor=vec4(vec3(.7,.3,.055),r*uOpacity);}'
    });
    const lens = new T.Mesh(new T.SphereGeometry(1.98, 64, 40), lensMaterial);
    group.add(lens);
    group.position.set(1.6, 3.35, -1.1);
    group.userData.fade = [
      { material: coreMaterial, base: 1 },
      { material: diskMaterial, base: 1, uniform: true },
      { material: innerMaterial, base: 0.5 },
      { material: lensMaterial, base: 0.14, uniform: true }
    ];
    return { group, disk, diskMaterial };
  }

  createGalaxy(count) {
    const T = this.THREE;
    const random = seededRandom(77913);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const coreColor = new T.Color(0xffdf9b);
    const armColor = new T.Color(0xaedbff);
    const edgeColor = new T.Color(0x5f7fa8);
    for (let i = 0; i < count; i += 1) {
      const radius = Math.pow(random(), 0.58) * 7.7;
      const arm = i % 5;
      const scatter = (random() - 0.5) * (0.35 + radius * 0.085);
      const angle = arm * Math.PI * 0.4 + radius * 1.1 + scatter;
      positions[i * 3] = Math.cos(angle) * radius + (random() - 0.5) * 0.28;
      positions[i * 3 + 1] = Math.sin(angle) * radius + (random() - 0.5) * 0.28;
      positions[i * 3 + 2] = (random() - 0.5) * (0.22 + (7.7 - radius) * 0.09);
      const color = radius < 1.8 ? coreColor : (random() > 0.38 ? armColor : edgeColor);
      colors.set([color.r, color.g, color.b], i * 3);
      sizes[i] = radius < 1.7 ? 2.1 + random() * 2.5 : 0.65 + random() * 1.7;
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new T.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new T.BufferAttribute(sizes, 1));
    const material = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: T.AdditiveBlending,
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: [
        'attribute float aSize;varying vec3 vColor;uniform float uOpacity;varying float vOpacity;',
        'void main(){vColor=color;vOpacity=uOpacity;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*(34.0/-mv.z),.45,2.8);}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vColor;varying float vOpacity;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);if(d>.5)discard;float a=smoothstep(.5,.02,d)*vOpacity;gl_FragColor=vec4(vColor,a);}'
      ].join('\n')
    });
    const group = new T.Group();
    const points = new T.Points(geometry, material);
    group.add(points);

    const coreTexture = this.createGalaxyTexture();
    const spriteMaterial = new T.SpriteMaterial({ map: coreTexture, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending });
    const core = new T.Sprite(spriteMaterial);
    core.scale.set(16.5, 10.8, 1);
    group.add(core);
    group.rotation.x = 1.02;
    group.rotation.z = -0.28;
    group.position.set(0.8, 3.0, -2.2);
    group.userData.fade = [
      { material, base: 0.76, uniform: true },
      { material: spriteMaterial, base: 0.62 }
    ];
    return { group, points, spriteMaterial };
  }

  createGalaxyTexture() {
    const T = this.THREE;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 170);
    gradient.addColorStop(0, 'rgba(255,246,213,.96)');
    gradient.addColorStop(0.08, 'rgba(255,215,137,.78)');
    gradient.addColorStop(0.28, 'rgba(218,154,69,.22)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    context.globalCompositeOperation = 'lighter';
    const random = seededRandom(88619);
    for (let i = 0; i < 5200; i += 1) {
      const radius = Math.pow(random(), 0.68) * 235;
      const arm = i % 5;
      const angle = arm * Math.PI * 0.4 + radius * 0.039 + (random() - 0.5) * (0.18 + radius * 0.0016);
      const flatten = 0.61;
      const x = 256 + Math.cos(angle) * radius + (random() - 0.5) * (2 + radius * 0.026);
      const y = 256 + Math.sin(angle) * radius * flatten + (random() - 0.5) * (2 + radius * 0.02);
      const alpha = Math.max(0.025, (1 - radius / 260) * (0.1 + random() * 0.3));
      const size = radius < 55 ? 0.8 + random() * 1.9 : 0.35 + random() * 1.15;
      context.fillStyle = random() > 0.24 ? 'rgba(164,207,241,' + alpha + ')' : 'rgba(241,191,103,' + alpha + ')';
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    return texture;
  }

  start() {
    if (this.running) return;
    this.running = true;
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
    const cycle = time % 76;
    const planetWeight = windowWeight(cycle, 7, 13, 26, 32);
    const blackWeight = windowWeight(cycle, 29, 35, 45, 51);
    const galaxyWeight = windowWeight(cycle, 48, 54, 68, 75.8);
    const hyperspaceWeight = Math.max(
      cycle < 13 ? 1 - smoothstep(7, 13, cycle) : 0,
      pulse(cycle, 25.5, 35.5),
      pulse(cycle, 44.5, 54.5),
      smoothstep(67.5, 76, cycle)
    );

    this.starField.material.uniforms.uTime.value = time;
    this.starField.material.uniforms.uSpeed.value = 1 + hyperspaceWeight * 15;
    this.starField.material.uniforms.uTravel.value += delta * (1.3 + hyperspaceWeight * 31);
    this.starField.points.rotation.z = time * 0.003;
    this.hyperspace.material.opacity = hyperspaceWeight * 0.68;
    this.hyperspace.group.scale.z = 1 + hyperspaceWeight * 8;
    this.hyperspace.group.position.z = Math.sin(time * 0.8) * 2;

    fadeGroup(this.planet.group, planetWeight);
    fadeGroup(this.blackHole.group, blackWeight);
    fadeGroup(this.galaxy.group, galaxyWeight);

    this.planet.planet.rotation.y += delta * 0.035;
    this.planet.cloudLayer.rotation.y += delta * 0.047;
    this.planet.group.position.y = 1.5 + Math.sin(time * 0.1) * 0.08;
    this.blackHole.diskMaterial.uniforms.uTime.value = time;
    this.blackHole.disk.rotation.z = -0.13 + time * 0.018;
    this.blackHole.group.rotation.z = Math.sin(time * 0.075) * 0.045;
    this.blackHole.group.position.x = 1.6 + Math.sin(time * 0.08) * 0.18;
    this.galaxy.group.rotation.z = -0.28 + time * 0.012;
    this.galaxy.group.position.y = 3.0 + Math.sin(time * 0.055) * 0.13;
    this.galaxy.spriteMaterial.rotation = -0.16 + time * 0.006;

    this.cameraOffset.x += (this.pointer.x * 0.16 - this.cameraOffset.x) * 0.018;
    this.cameraOffset.y += (-this.pointer.y * 0.1 - this.cameraOffset.y) * 0.018;
    this.camera.position.x = this.cameraOffset.x;
    this.camera.position.y = this.cameraOffset.y;
    this.camera.lookAt(0, 0, 0);

    const weights = [
      ['hyperspace', hyperspaceWeight],
      ['planet', planetWeight],
      ['black-hole', blackWeight],
      ['galaxy', galaxyWeight]
    ].sort((a, b) => b[1] - a[1]);
    if (weights[0][0] !== this.currentScene) {
      this.currentScene = weights[0][0];
      this.options.onScene(this.currentScene);
    }
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
    if (!this.options.explicit && this.performanceWindows >= 4 && this.lowWindows >= 4) {
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
  setMode: (mode) => {
    if (mode !== 'cinematic' && mode !== 'static') return;
    storedChoice = mode;
    saveChoice(mode);
    if (mode === 'cinematic') showCinematic('user-choice', true);
    else showStatic('user-choice');
  },
  simulateFailure: () => {
    if (controller) controller.options.onFallback('simulated-failure');
    else showStatic('simulated-failure');
  }
};

const preference = initialPreference();
if (preference.mode === 'cinematic') showCinematic(preference.reason, preference.explicit);
else showStatic(preference.reason, { silent: true });
