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

  if (theme === 'rust' || theme === 'hearts' || theme === 'alien') startParticleBackground(theme);

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
    document.body.classList.add('book-cinematic-ready');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, .1, 100);
    camera.position.set(0, 0, 15);
    const clock = new THREE.Clock();
    const animated = [];
    let frameId = 0;

    scene.add(createStarfield(THREE, selectedTheme === 'keeper' ? 5200 : 3300));
    if (selectedTheme === 'core') createPlanetScene(THREE, scene, camera, animated);
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

  function createPlanetScene(THREE, scene, camera, animated) {
    const group = new THREE.Group();
    const planetRadius = 5.55;
    const surface = loadPlanetTexture(THREE);
    const cloudTexture = createCloudTexture(THREE);
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius, innerWidth < 760 ? 52 : 72, innerWidth < 760 ? 36 : 52),
      new THREE.MeshStandardMaterial({
        map: surface,
        roughness: .92,
        metalness: .02
      })
    );
    planet.rotation.z = -.15;
    group.add(planet);

    const cityCount = innerWidth < 760 ? 430 : 1050;
    const cityPositions = new Float32Array(cityCount * 3);
    const cityColors = new Float32Array(cityCount * 3);
    for (let index = 0; index < cityCount; index += 1) {
      const cluster = index % 26;
      const clusterLongitude = ((cluster * 2.399963) % (Math.PI * 2)) - Math.PI;
      const clusterLatitude = Math.sin(cluster * 1.71) * .86;
      const longitude = clusterLongitude + (Math.random() - .5) * .28;
      const latitude = clusterLatitude + (Math.random() - .5) * .15;
      const radius = planetRadius + .014;
      const offset = index * 3;
      cityPositions[offset] = radius * Math.cos(latitude) * Math.cos(longitude);
      cityPositions[offset + 1] = radius * Math.sin(latitude);
      cityPositions[offset + 2] = radius * Math.cos(latitude) * Math.sin(longitude);
      const warm = Math.random();
      cityColors[offset] = 1;
      cityColors[offset + 1] = .58 + warm * .34;
      cityColors[offset + 2] = .2 + warm * .5;
    }
    const cityGeometry = new THREE.BufferGeometry();
    cityGeometry.setAttribute('position', new THREE.BufferAttribute(cityPositions, 3));
    cityGeometry.setAttribute('color', new THREE.BufferAttribute(cityColors, 3));
    const cityMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uLightDirection: { value: new THREE.Vector3(-4, 4, -14).normalize() },
        uPointSize: { value: innerWidth < 760 ? 2.25 : 2.7 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader: 'uniform float uPointSize;uniform vec3 uLightDirection;varying vec3 vColor;varying float vNight;void main(){vec4 world=modelMatrix*vec4(position,1.0);vec3 worldNormal=normalize(mat3(modelMatrix)*normalize(position));vNight=1.0-smoothstep(-.04,.2,dot(worldNormal,uLightDirection));vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=uPointSize*(18.0/-mv.z);gl_Position=projectionMatrix*mv;}',
      fragmentShader: 'varying vec3 vColor;varying float vNight;void main(){vec2 p=gl_PointCoord-.5;float glow=smoothstep(.5,0.0,length(p));float core=smoothstep(.18,0.0,length(p));float alpha=(glow*.62+core)*vNight;if(alpha<.025)discard;gl_FragColor=vec4(vColor*(.75+core*1.8),alpha);}'
    });
    const cityLights = new THREE.Points(cityGeometry, cityMaterial);
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
      new THREE.SphereGeometry(planetRadius + .028, innerWidth < 760 ? 48 : 64, innerWidth < 760 ? 34 : 44),
      cloudMaterial
    );
    clouds.rotation.z = -.15;
    group.add(clouds);
    const highClouds = new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius + .054, innerWidth < 760 ? 44 : 60, innerWidth < 760 ? 30 : 40),
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
      new THREE.SphereGeometry(planetRadius + .12, innerWidth < 760 ? 48 : 64, innerWidth < 760 ? 34 : 44),
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
    moon.position.set(7.85, 1.1, .35);
    const moonPivot = new THREE.Group();
    moonPivot.rotation.z = -.22;
    moonPivot.add(moon);
    group.add(moonPivot);

    group.position.set(0, 1.15, -1.1);
    scene.add(group);
    scene.add(new THREE.AmbientLight(0x526473, .002));
    const key = new THREE.DirectionalLight(0xd8eeff, 6.2);
    key.position.set(-4, 4, -14);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x79c8ee, .035);
    rim.position.set(6, -3, -10);
    scene.add(rim);

    animated.push((time) => {
      const cameraDistance = camera.position.z - group.position.z;
      const visibleHalfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * cameraDistance * camera.aspect;
      group.position.x = visibleHalfWidth + (innerWidth < 760 ? .18 : .35);
      planet.rotation.y = time * .035;
      cityLights.rotation.y = time * .035;
      clouds.rotation.y = time * .047;
      highClouds.rotation.y = 1.7 - time * .019;
      moon.rotation.y = time * .018;
      moonPivot.rotation.y = time * .085;
      group.position.y = 1.15 + Math.sin(time * .1) * .08;
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
        const u = x / canvas.width * Math.PI * 2;
        const v = y / canvas.height * Math.PI * 2;
        const n = Math.sin(u * 3 + Math.sin(v * 2) * 2.1) * .48 +
          Math.sin(u * 7 - v * 3) * .31 +
          Math.cos(v * 5 + Math.sin(u * 2) * 1.4) * .25 +
          Math.sin(u * 13 + v * 7) * .12;
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
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
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
      size: innerWidth < 760 ? .062 : .052,
      map: createStarSprite(THREE),
      vertexColors: true,
      transparent: true,
      opacity: .88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      alphaTest: .015
    });
    const galaxy = new THREE.Points(geometry, material);
    galaxy.position.set(innerWidth < 760 ? .3 : 3.2, .6, -6.5);
    galaxy.rotation.set(1.38, -.04, -.12);
    galaxy.scale.setScalar(innerWidth < 760 ? .72 : .82);
    scene.add(galaxy);

    const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: createStarSprite(THREE),
      color: 0xffd49a,
      transparent: true,
      opacity: .7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    coreGlow.position.copy(galaxy.position);
    coreGlow.scale.setScalar(innerWidth < 760 ? 2.4 : 3.2);
    coreGlow.renderOrder = 1;
    scene.add(coreGlow);

    const streamCount = innerWidth < 760 ? 2600 : 8200;
    const streamPositions = new Float32Array(streamCount * 3);
    const streamColors = new Float32Array(streamCount * 3);
    const streamPhases = new Float32Array(streamCount);
    for (let index = 0; index < streamCount; index += 1) {
      const offset = index * 3;
      const arm = index % 5;
      const pointAlongArm = Math.floor(index / 5) / Math.max(1, Math.floor(streamCount / 5) - 1);
      const radius = 1.15 + Math.pow(pointAlongArm, .84) * 11.4;
      const angle = arm / 5 * Math.PI * 2 + radius * .88 + (Math.random() - .5) * (.07 + radius * .016);
      const drift = (Math.random() - .5) * (.08 + radius * .022);
      streamPositions[offset] = Math.cos(angle) * radius + drift;
      streamPositions[offset + 1] = (Math.random() - .5) * (.12 + radius * .022);
      streamPositions[offset + 2] = Math.sin(angle) * radius + drift;
      const warm = Math.random() < .24;
      streamColors[offset] = warm ? 1 : .48 + Math.random() * .2;
      streamColors[offset + 1] = warm ? .71 + Math.random() * .18 : .67 + Math.random() * .2;
      streamColors[offset + 2] = warm ? .36 + Math.random() * .25 : .95;
      streamPhases[index] = (1 - pointAlongArm + arm * .137) % 1;
    }
    const streamGeometry = new THREE.BufferGeometry();
    streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
    streamGeometry.setAttribute('color', new THREE.BufferAttribute(streamColors, 3));
    streamGeometry.setAttribute('aPhase', new THREE.BufferAttribute(streamPhases, 1));
    const streamMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: .9 },
        uSize: { value: innerWidth < 760 ? .82 : .76 }
      },
      vertexShader: `
        attribute vec3 color;
        attribute float aPhase;
        uniform float uTime;
        uniform float uSize;
        varying vec3 vColor;
        varying float vLife;
        void main(){
          float life=fract(aPhase+uTime*.034);
          float turn=life*.44;
          float c=cos(turn),s=sin(turn);
          mat2 rotation=mat2(c,-s,s,c);
          vec3 animatedPosition=position;
          animatedPosition.xz=rotation*animatedPosition.xz*(1.0+life*.14);
          animatedPosition.y+=sin(aPhase*31.4159+uTime*.7)*.09;
          vec4 mvPosition=modelViewMatrix*vec4(animatedPosition,1.0);
          gl_Position=projectionMatrix*mvPosition;
          gl_PointSize=clamp(uSize*(150.0/-mvPosition.z),1.0,4.4);
          vColor=color;
          vLife=sin(life*3.14159265);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vLife;
        void main(){
          vec2 point=gl_PointCoord-vec2(.5);
          float distanceFromCenter=length(point);
          float star=smoothstep(.5,.04,distanceFromCenter);
          float core=smoothstep(.16,0.0,distanceFromCenter);
          float alpha=(star*.64+core*.42)*(.22+.78*vLife)*uOpacity;
          if(alpha<.018)discard;
          gl_FragColor=vec4(vColor*(1.08+core*.55),alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true
    });
    const streams = new THREE.Points(streamGeometry, streamMaterial);
    streams.position.copy(galaxy.position);
    streams.rotation.copy(galaxy.rotation);
    streams.scale.copy(galaxy.scale);
    streams.renderOrder = 2;
    scene.add(streams);

    const coreLight = new THREE.PointLight(0xf5c477, 5, 18, 1.65);
    coreLight.position.set(innerWidth < 760 ? .3 : 3.2, .6, -4.5);
    scene.add(coreLight);
    animated.push((time) => {
      galaxy.rotation.z = -.12 + time * .008;
      galaxy.rotation.y = -.04 + Math.sin(time * .035) * .025;
      material.opacity = .84 + Math.sin(time * .31) * .04;
      streams.rotation.z = -.16 + time * .014;
      streams.rotation.y = -.04 + Math.sin(time * .027) * .04;
      streamMaterial.uniforms.uTime.value = time;
      streamMaterial.uniforms.uOpacity.value = .86 + Math.sin(time * .23) * .06;
      coreGlow.material.opacity = .64 + Math.sin(time * .19) * .06;
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
      const count = selectedTheme === 'alien' ? (width < 720 ? 90 : 170) : (width < 720 ? 62 : 115);
      for (let index = 0; index < count; index += 1) particles.push(makeParticle(true));
    }

    function makeParticle(initial = false) {
      if (selectedTheme === 'alien') {
        const index = particles.length;
        const total = width < 720 ? 90 : 170;
        const pair = Math.floor(index / 2);
        const pairCount = Math.floor(total / 2);
        return {
          progress: pair / Math.max(1, pairCount - 1),
          strand: index % 2,
          bridge: pair % 7 === 0 || pair % 7 === 2 || pair % 7 === 5,
          size: .65 + Math.random() * 1.35,
          phase: Math.sin(pair * 12.9898) * .028
        };
      }
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

    function drawAlienDNA(time) {
      const centerX = width < 720 ? width * .72 : width * .76;
      const centerY = height * .5;
      const helixHeight = Math.min(height * .82, 790);
      const radius = Math.min(width * .075, 116);
      const rotation = time * .00016;
      const tilt = Math.tan(5 * Math.PI / 180);
      const projected = [];
      for (const particle of particles) {
        const y = centerY - helixHeight * .5 + particle.progress * helixHeight;
        const angle = particle.progress * Math.PI * 8 + rotation + particle.strand * Math.PI + particle.phase;
        const depth = Math.sin(angle);
        projected.push({
          x: centerX + (y - centerY) * tilt + Math.cos(angle) * radius * (.62 + (depth + 1) * .18),
          y,
          depth,
          bridge: particle.bridge,
          strand: particle.strand,
          progress: particle.progress,
          size: particle.size
        });
      }
      context.globalCompositeOperation = 'lighter';

      const railGradient = context.createLinearGradient(0, centerY - helixHeight * .5, 0, centerY + helixHeight * .5);
      railGradient.addColorStop(0, 'rgba(244,211,139,.12)');
      railGradient.addColorStop(.5, 'rgba(255,225,153,.5)');
      railGradient.addColorStop(1, 'rgba(202,145,54,.13)');
      for (let strand = 0; strand < 2; strand += 1) {
        const rail = projected.filter((point) => point.strand === strand).sort((a, b) => a.progress - b.progress);
        const segments = [];
        let cursor = 1 + strand * 2;
        while (cursor < rail.length - 1) {
          const gap = 2 + Math.floor(Math.abs(Math.sin(cursor * 4.173 + strand * 2.41)) * 8);
          cursor += gap;
          const length = 5 + Math.floor(Math.abs(Math.sin(cursor * 7.917 + strand * 1.73)) * 18);
          const end = Math.min(rail.length - 1, cursor + length);
          if (end > cursor) segments.push(rail.slice(cursor, end + 1));
          cursor = end;
        }
        for (const segment of segments) {
          context.beginPath();
          segment.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
          context.strokeStyle = 'rgba(214,157,66,.13)';
          context.lineWidth = width < 720 ? 3 : 4;
          context.stroke();
          context.strokeStyle = railGradient;
          context.lineWidth = width < 720 ? .75 : 1;
          context.stroke();
        }
      }

      const bridgeFlow = time * .00022;
      for (let index = 0; index < projected.length; index += 2) {
        const first = projected[index];
        const second = projected[index + 1];
        if (!first || !second || !first.bridge) continue;
        const alpha = .28 + (first.depth + 1) * .11;
        let bridgeCursor = 0;
        let bridgePart = 0;
        while (bridgeCursor < 1) {
          const gapWave = .5 + Math.sin(index * 3.17 + bridgePart * 5.83 + bridgeFlow) * .5;
          const lengthWave = .5 + Math.sin(index * 7.11 + bridgePart * 2.47 - bridgeFlow * .83) * .5;
          bridgeCursor += .025 + gapWave * .075;
          const bridgeEnd = Math.min(1, bridgeCursor + .035 + lengthWave * .14);
          if (bridgeEnd <= bridgeCursor) break;
          const startX = first.x + (second.x - first.x) * bridgeCursor;
          const startY = first.y + (second.y - first.y) * bridgeCursor;
          const endX = first.x + (second.x - first.x) * bridgeEnd;
          const endY = first.y + (second.y - first.y) * bridgeEnd;
          context.beginPath();
          context.moveTo(startX, startY);
          context.lineTo(endX, endY);
          context.strokeStyle = `rgba(198,135,40,${alpha * .28})`;
          context.lineWidth = width < 720 ? 2.5 : 3.5;
          context.stroke();
          context.strokeStyle = `rgba(244,210,137,${alpha})`;
          context.lineWidth = width < 720 ? .7 : .9;
          context.stroke();
          bridgeCursor = bridgeEnd;
          bridgePart += 1;
        }
      }
      projected.sort((a, b) => a.depth - b.depth);
      for (const point of projected) {
        const front = (point.depth + 1) * .5;
        const alpha = .24 + front * .68;
        const size = point.size * (.75 + front * 1.35);
        const glowRadius = size * 4.2;
        const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, glowRadius);
        glow.addColorStop(0, `rgba(255,247,215,${alpha})`);
        glow.addColorStop(.2, `rgba(242,202,118,${alpha * .82})`);
        glow.addColorStop(1, 'rgba(198,137,42,0)');
        context.fillStyle = glow;
        context.beginPath();
        context.arc(point.x, point.y, glowRadius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalCompositeOperation = 'source-over';
    }

    function frame(time) {
      context.clearRect(0, 0, width, height);
      if (selectedTheme === 'rust') drawRust();
      else if (selectedTheme === 'hearts') drawHearts(time);
      else drawAlienDNA(time);
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
