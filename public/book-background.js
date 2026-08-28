(() => {
  const theme = document.body.dataset.bookTheme;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!theme || reducedMotion) return;

  if (theme === 'core' || theme === 'keeper') {
    import('/assets/vendor/three.module.min.js')
      .then((THREE) => startCinematicBackground(THREE, theme))
      .catch(() => console.warn('VeilFarers cinematic book background unavailable; using static artwork.'));
    return;
  }

  if (theme === 'rust' || theme === 'hearts') startParticleBackground(theme);

  function startCinematicBackground(THREE, selectedTheme) {
    const canvas = document.createElement('canvas');
    canvas.className = 'book-atmosphere book-atmosphere-webgl';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: innerWidth > 760,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true
      });
    } catch (error) {
      canvas.remove();
      console.warn('VeilFarers cinematic book background unavailable; using static artwork.');
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.2 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = selectedTheme === 'core' ? 1.02 : 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, .1, 100);
    camera.position.set(0, 0, 15);
    const clock = new THREE.Clock();
    const animated = [];
    let frameId = 0;

    scene.add(createStarfield(THREE, selectedTheme === 'keeper' ? 5200 : 3300));
    if (selectedTheme === 'core') createPlanetScene(THREE, scene, animated);
    else createGalaxyScene(THREE, scene, animated);

    function resize() {
      const width = innerWidth;
      const height = innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    }

    function render() {
      const elapsed = clock.getElapsedTime();
      for (const update of animated) update(elapsed);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    }

    addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(frameId);
      if (!document.hidden) {
        clock.getDelta();
        frameId = requestAnimationFrame(render);
      }
    });
    resize();
    frameId = requestAnimationFrame(render);
  }

  function createStarfield(THREE, count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      positions[offset] = (Math.random() - .5) * 52;
      positions[offset + 1] = (Math.random() - .5) * 30;
      positions[offset + 2] = -4 - Math.random() * 36;
      const warm = Math.random() < .12;
      colors[offset] = warm ? 1 : .62 + Math.random() * .28;
      colors[offset + 1] = warm ? .78 + Math.random() * .18 : .75 + Math.random() * .2;
      colors[offset + 2] = warm ? .42 + Math.random() * .28 : 1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: .045, vertexColors: true, transparent: true, opacity: .76, depthWrite: false });
    return new THREE.Points(geometry, material);
  }

  function createPlanetScene(THREE, scene, animated) {
    const group = new THREE.Group();
    const surface = loadPlanetTexture(THREE);
    const cityMap = loadTexture(THREE, '/assets/books/core-planet-city-lights.webp', false);
    const cloudTexture = createCloudTexture(THREE);
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, innerWidth < 760 ? 52 : 72, innerWidth < 760 ? 36 : 52),
      new THREE.MeshStandardMaterial({
        map: surface,
        roughness: .92,
        metalness: .02
      })
    );
    planet.rotation.z = -.15;
    group.add(planet);

    const cityMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: cityMap },
        uLightDirection: { value: new THREE.Vector3(-8, 4, 3).normalize() }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec2 vUv;varying vec3 vWorldNormal;void main(){vUv=uv;vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform sampler2D uMap;uniform vec3 uLightDirection;varying vec2 vUv;varying vec3 vWorldNormal;void main(){float lights=texture2D(uMap,vUv).r;float night=1.0-smoothstep(-.12,.24,dot(normalize(vWorldNormal),uLightDirection));float strength=lights*night;vec3 city=mix(vec3(1.0,.49,.12),vec3(1.0,.91,.62),lights);gl_FragColor=vec4(city*strength*1.35,strength*.9);}'
    });
    const cityLights = new THREE.Mesh(
      new THREE.SphereGeometry(4.207, innerWidth < 760 ? 52 : 72, innerWidth < 760 ? 36 : 52),
      cityMaterial
    );
    cityLights.rotation.z = -.15;
    group.add(cityLights);

    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: .48,
      depthWrite: false,
      roughness: 1
    });
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(4.225, innerWidth < 760 ? 48 : 64, innerWidth < 760 ? 34 : 44),
      cloudMaterial
    );
    clouds.rotation.z = -.15;
    group.add(clouds);
    const highClouds = new THREE.Mesh(
      new THREE.SphereGeometry(4.248, innerWidth < 760 ? 44 : 60, innerWidth < 760 ? 30 : 40),
      new THREE.MeshStandardMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: .18,
        depthWrite: false,
        roughness: 1
      })
    );
    highClouds.rotation.set(0, 1.7, .08);
    group.add(highClouds);

    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uOpacity: { value: .42 } },
      vertexShader: 'varying vec3 vNormal;void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec3 vNormal;uniform float uOpacity;void main(){float rim=pow(1.0-abs(vNormal.z),5.6);vec3 c=mix(vec3(.12,.48,.72),vec3(1.0,.84,.5),rim*.16);gl_FragColor=vec4(c,rim*uOpacity);}'
    });
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(4.31, innerWidth < 760 ? 48 : 64, innerWidth < 760 ? 34 : 44),
      atmosphereMaterial
    );
    group.add(atmosphere);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(.245, 40, 28),
      new THREE.MeshStandardMaterial({
        map: loadTexture(THREE, '/assets/books/core-moon-albedo.webp'),
        color: 0xf2f1ed,
        roughness: 1,
        metalness: 0
      })
    );
    moon.position.set(6.7, 1.1, .35);
    const moonPivot = new THREE.Group();
    moonPivot.rotation.z = -.22;
    moonPivot.add(moon);
    group.add(moonPivot);

    group.position.set(innerWidth < 760 ? 2.2 : 4.75, 1.5, -1.1);
    scene.add(group);
    scene.add(new THREE.AmbientLight(0x526473, .055));
    const key = new THREE.DirectionalLight(0xffe6b3, 3.5);
    key.position.set(-8, 4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x79c8ee, .65);
    rim.position.set(7, -2, 1);
    scene.add(rim);

    animated.push((time) => {
      planet.rotation.y = time * .035;
      cityLights.rotation.y = time * .035;
      clouds.rotation.y = time * .047;
      highClouds.rotation.y = 1.7 - time * .019;
      moon.rotation.y = time * .018;
      moonPivot.rotation.y = time * .085;
      group.position.y = 1.5 + Math.sin(time * .1) * .08;
    });
  }

  function loadPlanetTexture(THREE) {
    return loadTexture(THREE, '/assets/books/core-planet-albedo.webp');
  }

  function loadTexture(THREE, path, srgb = true) {
    const texture = new THREE.TextureLoader().load(path, undefined, undefined, () => {
      console.warn('VeilFarers cinematic texture unavailable; retaining static backdrop.');
    });
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
    return texture;
  }

  function createCloudTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const image = context.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const n = Math.sin(x * .035 + Math.sin(y * .029) * 4.1) * .6 +
          Math.sin(x * .094 - y * .061) * .34 +
          Math.cos(y * .071 + Math.sin(x * .018)) * .28 +
          Math.sin(x * .19 + y * .13) * .13;
        const alpha = Math.max(0, Math.min(148, (n - .18) * 118));
        const offset = (y * canvas.width + x) * 4;
        image.data[offset] = 220;
        image.data[offset + 1] = 232;
        image.data[offset + 2] = 235;
        image.data[offset + 3] = alpha;
      }
    }
    context.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function createGalaxyScene(THREE, scene, animated) {
    const count = innerWidth < 760 ? 12000 : 28000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const radius = Math.pow(Math.random(), .58) * 10.5;
      const arm = index % 5;
      const angle = arm / 5 * Math.PI * 2 + radius * .83 + (Math.random() - .5) * (.28 + radius * .025);
      const scatter = (Math.random() - .5) * (.22 + radius * .1);
      positions[offset] = Math.cos(angle) * radius + scatter;
      positions[offset + 1] = (Math.random() - .5) * (.18 + radius * .065);
      positions[offset + 2] = Math.sin(angle) * radius + scatter;
      const core = 1 - Math.min(1, radius / 4.8);
      if (core > .45 || Math.random() < .2) color.setRGB(1, .67 + core * .25, .31 + core * .5);
      else color.setRGB(.34 + Math.random() * .2, .58 + Math.random() * .25, .9 + Math.random() * .1);
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: innerWidth < 760 ? .055 : .042,
      map: createStarSprite(THREE),
      vertexColors: true,
      transparent: true,
      opacity: .88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      alphaTest: .015
    });
    const galaxy = new THREE.Points(geometry, material);
    galaxy.position.set(innerWidth < 760 ? .3 : -3.1, 1.5, -5.5);
    galaxy.rotation.set(1.08, -.08, -.18);
    galaxy.scale.setScalar(1.18);
    scene.add(galaxy);

    const streamCount = innerWidth < 760 ? 1800 : 5600;
    const streamPositions = new Float32Array(streamCount * 3);
    const streamColors = new Float32Array(streamCount * 3);
    for (let index = 0; index < streamCount; index += 1) {
      const offset = index * 3;
      const radius = 5.8 + Math.pow(Math.random(), .72) * 9.8;
      const arm = index % 5;
      const angle = arm / 5 * Math.PI * 2 + radius * .79 + (Math.random() - .5) * (.18 + radius * .04);
      const drift = (Math.random() - .5) * (.3 + radius * .08);
      streamPositions[offset] = Math.cos(angle) * radius + drift;
      streamPositions[offset + 1] = (Math.random() - .5) * (.25 + radius * .055);
      streamPositions[offset + 2] = Math.sin(angle) * radius + drift;
      const warm = Math.random() < .24;
      streamColors[offset] = warm ? 1 : .48 + Math.random() * .2;
      streamColors[offset + 1] = warm ? .71 + Math.random() * .18 : .67 + Math.random() * .2;
      streamColors[offset + 2] = warm ? .36 + Math.random() * .25 : .95;
    }
    const streamGeometry = new THREE.BufferGeometry();
    streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
    streamGeometry.setAttribute('color', new THREE.BufferAttribute(streamColors, 3));
    const streamMaterial = new THREE.PointsMaterial({
      size: innerWidth < 760 ? .085 : .07,
      map: createStarSprite(THREE),
      vertexColors: true,
      transparent: true,
      opacity: .58,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      alphaTest: .012
    });
    const streams = new THREE.Points(streamGeometry, streamMaterial);
    streams.position.copy(galaxy.position);
    streams.rotation.copy(galaxy.rotation);
    streams.scale.copy(galaxy.scale);
    scene.add(streams);

    const coreLight = new THREE.PointLight(0xf5c477, 5, 18, 1.65);
    coreLight.position.set(-3.1, 1.2, -3.5);
    scene.add(coreLight);
    animated.push((time) => {
      galaxy.rotation.z = -.18 + time * .008;
      galaxy.rotation.y = -.08 + Math.sin(time * .035) * .025;
      material.opacity = .84 + Math.sin(time * .31) * .04;
      streams.rotation.z = -.22 + time * .014;
      streams.rotation.y = -.08 + Math.sin(time * .027) * .04;
      streamMaterial.opacity = .5 + Math.sin(time * .23) * .08;
    });
  }

  function createStarSprite(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    const glow = context.createRadialGradient(32, 32, 0, 32, 32, 31);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(.13, 'rgba(255,248,226,.94)');
    glow.addColorStop(.42, 'rgba(174,211,255,.28)');
    glow.addColorStop(1, 'rgba(110,170,255,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  function startParticleBackground(selectedTheme) {
    const canvas = document.createElement('canvas');
    canvas.className = 'book-atmosphere';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const context = canvas.getContext('2d', { alpha: true });
    const particles = [];
    let width = 0;
    let height = 0;
    let ratio = 1;
    let frameId = 0;

    function resize() {
      width = innerWidth;
      height = innerHeight;
      ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      seed();
    }

    function seed() {
      particles.length = 0;
      const count = width < 720 ? 62 : 115;
      for (let index = 0; index < count; index += 1) particles.push(makeParticle(true));
    }

    function makeParticle(initial = false) {
      if (selectedTheme === 'rust') {
        const edge = Math.random() < .62;
        return { x: edge ? (Math.random() < .5 ? Math.random() * width * .16 : width * (.84 + Math.random() * .16)) : Math.random() * width, y: initial ? Math.random() * height : height + 12, vx: (Math.random() - .5) * .42, vy: -(.42 + Math.random() * 1.45), life: Math.random(), size: .7 + Math.random() * 2.2 };
      }
      return { x: initial ? Math.random() * width : width * (.19 + Math.random() * .08), y: initial ? Math.random() * height : height * (.44 + Math.random() * .17), vx: .16 + Math.random() * .48, vy: -.08 + (Math.random() - .5) * .2, life: Math.random(), size: .5 + Math.random() * 1.9, phase: Math.random() * Math.PI * 2 };
    }

    function reset(particle) { Object.assign(particle, makeParticle(false)); }

    function drawRust() {
      context.globalCompositeOperation = 'lighter';
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy -= .002;
        particle.life += .006;
        if (particle.y < -20 || particle.life > 1.2) reset(particle);
        const alpha = Math.max(0, 1 - particle.life / 1.2) * .75;
        context.strokeStyle = `rgba(255,179,72,${alpha})`;
        context.lineWidth = particle.size;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(particle.x - particle.vx * 4, particle.y - particle.vy * 5);
        context.stroke();
      }
      context.globalCompositeOperation = 'source-over';
    }

    function drawHearts(time) {
      context.globalCompositeOperation = 'lighter';
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy + Math.sin(time * .001 + particle.phase) * .035;
        particle.life += .0028;
        if (particle.x > width + 15 || particle.y < -15 || particle.life > 1.25) reset(particle);
        const becomingStar = Math.min(1, Math.max(0, (particle.x / width - .34) * 2.4));
        const alpha = (.28 + becomingStar * .55) * Math.max(0, 1 - particle.life * .48);
        context.fillStyle = `rgba(${220 + Math.round(becomingStar * 35)},${205 + Math.round(becomingStar * 40)},${170 + Math.round(becomingStar * 80)},${alpha})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * (1 - becomingStar * .35), 0, Math.PI * 2);
        context.fill();
        if (becomingStar > .7 && particle.size > 1.1) {
          context.strokeStyle = `rgba(238,226,196,${alpha * .45})`;
          context.lineWidth = .6;
          context.beginPath();
          context.moveTo(particle.x - 4, particle.y);
          context.lineTo(particle.x + 4, particle.y);
          context.moveTo(particle.x, particle.y - 4);
          context.lineTo(particle.x, particle.y + 4);
          context.stroke();
        }
      }
      context.globalCompositeOperation = 'source-over';
    }

    function frame(time) {
      context.clearRect(0, 0, width, height);
      if (selectedTheme === 'rust') drawRust();
      else drawHearts(time);
      frameId = requestAnimationFrame(frame);
    }

    addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(frameId);
      if (!document.hidden) frameId = requestAnimationFrame(frame);
    });
    resize();
    frameId = requestAnimationFrame(frame);
  }
})();
