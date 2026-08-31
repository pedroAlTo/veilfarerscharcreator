(() => {
  const modal = document.querySelector('[data-release-modal]');
  const inbox = document.querySelector('[data-cta-inbox]');
  if (!(modal instanceof HTMLDialogElement) || !(inbox instanceof HTMLButtonElement)) return;

  const minimizeButton = modal.querySelector('[data-release-minimize]');
  const deleteButton = modal.querySelector('[data-release-delete]');
  const card = modal.querySelector('.vf-release-card');
  const sparkCanvas = modal.querySelector('[data-release-sparks]');
  const portraitImage = modal.querySelector('.vf-release-portrait img');
  const shelvedKey = 'vf-rust-download-fix-shelved-v1';
  const deletedKey = 'vf-rust-download-fix-deleted-v1';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let closing = false;
  let closeTimer = 0;
  let closeMode = 'shelve';
  let switchTarget = '';
  let sparkFrame = 0;
  let sparkWidth = 0;
  let sparkHeight = 0;
  let sparkRatio = 1;
  let sparks = [];
  let nextSparkBurst = 0;
  let energyStart = 0;
  let lastEnergyCycle = -1;

  function readStorage(storage, key) {
    try { return storage.getItem(key) === '1'; }
    catch { return false; }
  }

  function writeStorage(storage, key) {
    try { storage.setItem(key, '1'); }
    catch { /* The notice remains usable when browser storage is unavailable. */ }
  }

  function isDeleted() { return readStorage(localStorage, deletedKey); }
  function isShelved() { return readStorage(sessionStorage, shelvedKey); }

  function portraitGeometry() {
    const sourceWidth = portraitImage?.naturalWidth || 1138;
    const sourceHeight = portraitImage?.naturalHeight || 1382;
    const scale = Math.max(sparkWidth / sourceWidth, sparkHeight / sourceHeight);
    const drawnWidth = sourceWidth * scale;
    const drawnHeight = sourceHeight * scale;
    const offsetX = (sparkWidth - drawnWidth) * .5;
    const offsetY = (sparkHeight - drawnHeight) * .44;
    return { scale, offsetX, offsetY };
  }

  function mapPortraitPoint(point) {
    const { scale, offsetX, offsetY } = portraitGeometry();
    return { x: offsetX + point.x * scale, y: offsetY + point.y * scale };
  }

  function sparkAnchors() {
    return [
      { x: 1001, y: 1149 },
      { x: 837, y: 1243 },
      { x: 611, y: 1335 }
    ].map(mapPortraitPoint);
  }

  function sizeSparkCanvas() {
    if (!(sparkCanvas instanceof HTMLCanvasElement)) return false;
    const width = sparkCanvas.clientWidth;
    const height = sparkCanvas.clientHeight;
    if (!width || !height) return false;
    if (width === sparkWidth && height === sparkHeight) return true;
    sparkWidth = width;
    sparkHeight = height;
    sparkRatio = Math.min(devicePixelRatio || 1, 1.5);
    sparkCanvas.width = Math.round(width * sparkRatio);
    sparkCanvas.height = Math.round(height * sparkRatio);
    sparkCanvas.getContext('2d')?.setTransform(sparkRatio, 0, 0, sparkRatio, 0, 0);
    sparks = [];
    return true;
  }

  function makeSpark(anchor, settled = false) {
    const angle = Math.random() * Math.PI * 2;
    const speed = .65 + Math.random() * 2.15;
    const maxAge = 18 + Math.random() * 28;
    const age = settled ? Math.random() * maxAge * .72 : 0;
    return {
      x: anchor.x + Math.cos(angle) * speed * age,
      y: anchor.y + Math.sin(angle) * speed * age + age * age * .006,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age,
      maxAge,
      length: 2.5 + Math.random() * 8
    };
  }

  function emitSparkBurst(settled = false) {
    const anchors = sparkAnchors();
    const count = settled ? 8 : 4 + Math.floor(Math.random() * 5);
    for (const anchor of anchors) {
      for (let index = 0; index < count; index += 1) sparks.push(makeSpark(anchor, settled));
    }
  }

  function emitCableSpark() {
    const anchor = sparkAnchors()[2];
    for (let index = 0; index < 18; index += 1) sparks.push(makeSpark(anchor));
  }

  function pointAlongPath(points, progress) {
    const lengths = [];
    let total = 0;
    for (let index = 1; index < points.length; index += 1) {
      const length = Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
      lengths.push(length);
      total += length;
    }
    let remaining = Math.max(0, Math.min(1, progress)) * total;
    for (let index = 0; index < lengths.length; index += 1) {
      if (remaining <= lengths[index]) {
        const ratio = lengths[index] ? remaining / lengths[index] : 0;
        return {
          x: points[index].x + (points[index + 1].x - points[index].x) * ratio,
          y: points[index].y + (points[index + 1].y - points[index].y) * ratio
        };
      }
      remaining -= lengths[index];
    }
    return points[points.length - 1];
  }

  function drawCableEnergy(context, time, animate) {
    const cablePath = [
      { x: 628, y: 971 }, { x: 646, y: 992 }, { x: 663, y: 1022 },
      { x: 673, y: 1055 }, { x: 676, y: 1092 }, { x: 668, y: 1125 },
      { x: 650, y: 1158 }, { x: 639, y: 1190 }, { x: 642, y: 1225 },
      { x: 655, y: 1255 }, { x: 662, y: 1284 }, { x: 651, y: 1311 },
      { x: 632, y: 1328 }, { x: 611, y: 1335 }
    ].map(mapPortraitPoint);
    const duration = 1900;
    const elapsed = Math.max(0, time - energyStart);
    const cycle = Math.floor(elapsed / duration);
    const progress = animate ? (elapsed % duration) / duration : 1;
    if (animate && cycle !== lastEnergyCycle) {
      if (lastEnergyCycle >= 0) emitCableSpark();
      lastEnergyCycle = cycle;
    }
    const trailStart = Math.max(0, progress - .18);
    const samples = 18;
    const tail = pointAlongPath(cablePath, trailStart);
    const head = pointAlongPath(cablePath, progress);
    const gradient = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
    gradient.addColorStop(0, 'rgba(72,205,255,0)');
    gradient.addColorStop(.55, 'rgba(72,205,255,.42)');
    gradient.addColorStop(1, 'rgba(150,247,255,.98)');
    const trail = [];
    for (let index = 0; index <= samples; index += 1) {
      trail.push(pointAlongPath(cablePath, trailStart + (progress - trailStart) * index / samples));
    }
    context.save();
    context.globalCompositeOperation = 'lighter';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'rgba(70,215,255,.22)';
    context.lineWidth = 15;
    context.shadowBlur = 22;
    context.shadowColor = '#69efff';
    context.beginPath();
    for (let index = 0; index < trail.length; index += 1) {
      const point = trail[index];
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.stroke();
    context.strokeStyle = gradient;
    context.lineWidth = 8;
    context.shadowBlur = 14;
    context.beginPath();
    for (let index = 0; index < trail.length; index += 1) {
      const point = trail[index];
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.stroke();
    context.fillStyle = 'rgba(180,252,255,.98)';
    context.beginPath();
    context.arc(head.x, head.y, 3.1, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawSparks(time, animate = true) {
    if (!(sparkCanvas instanceof HTMLCanvasElement) || !sizeSparkCanvas()) return;
    const context = sparkCanvas.getContext('2d');
    if (!context) return;
    if (animate && time >= nextSparkBurst) {
      emitSparkBurst();
      if (Math.random() < .2) emitSparkBurst();
      nextSparkBurst = time + 420 + Math.random() * 780;
    }
    context.clearRect(0, 0, sparkWidth, sparkHeight);
    drawCableEnergy(context, time, animate);
    context.globalCompositeOperation = 'lighter';
    for (let index = sparks.length - 1; index >= 0; index -= 1) {
      const spark = sparks[index];
      if (animate) {
        spark.age += 1;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += .018;
      }
      if (spark.age >= spark.maxAge) {
        sparks.splice(index, 1);
        continue;
      }
      const alpha = (1 - spark.age / spark.maxAge) * .92;
      const color = `rgba(105,239,255,${alpha})`;
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = spark.age < 3 ? 1.5 : .75;
      context.shadowBlur = 12;
      context.shadowColor = '#69efff';
      context.beginPath();
      context.moveTo(spark.x, spark.y);
      context.lineTo(spark.x - spark.vx * spark.length, spark.y - spark.vy * spark.length);
      context.stroke();
      context.beginPath();
      context.arc(spark.x, spark.y, spark.age < 4 ? 1.45 : .75, 0, Math.PI * 2);
      context.fill();
    }
    context.shadowBlur = 0;
    context.globalCompositeOperation = 'source-over';
  }

  function sparkLoop(time) {
    if (!modal.open || modal.classList.contains('is-closing')) {
      sparkFrame = 0;
      return;
    }
    drawSparks(time, true);
    sparkFrame = requestAnimationFrame(sparkLoop);
  }

  function startSparks() {
    cancelAnimationFrame(sparkFrame);
    sparks = [];
    nextSparkBurst = 0;
    energyStart = performance.now();
    lastEnergyCycle = -1;
    if (reducedMotion.matches) {
      if (sizeSparkCanvas()) emitSparkBurst(true);
      drawSparks(performance.now(), false);
      return;
    }
    sparkFrame = requestAnimationFrame(sparkLoop);
  }

  function stopSparks() {
    cancelAnimationFrame(sparkFrame);
    sparkFrame = 0;
    sparks = [];
  }

  function reportInbox(active, animate = false) {
    const deleted = isDeleted();
    window.dispatchEvent(new CustomEvent('vf:cta-inbox-update', { detail: {
      target: 'release', active: active && !deleted, deleted, open: modal.open, animate
    } }));
  }

  function rememberShelved() { writeStorage(sessionStorage, shelvedKey); }

  function rememberDeleted() {
    writeStorage(localStorage, deletedKey);
    try { sessionStorage.removeItem(shelvedKey); }
    catch { /* Nothing else is required. */ }
    reportInbox(false);
  }

  function releaseBetaQueue() {
    delete document.documentElement.dataset.vfReleaseNoticeBlocking;
    window.dispatchEvent(new CustomEvent('vf:release-notice-resolved'));
  }

  function finishClose() {
    clearTimeout(closeTimer);
    stopSparks();
    modal.classList.remove('is-closing');
    if (modal.open) modal.close();
    const switching = closeMode === 'switch';
    const shelved = (closeMode === 'shelve' || switching) && !isDeleted();
    reportInbox(shelved, shelved);
    if (shelved && !switching) inbox.focus({ preventScroll: true });
    closing = false;
    if (switching && switchTarget) {
      const target = switchTarget;
      switchTarget = '';
      window.setTimeout(() => window.dispatchEvent(new CustomEvent('vf:cta-open', { detail: { target } })), 80);
    } else {
      releaseBetaQueue();
    }
  }

  function closeNotice(mode = 'shelve', target = '') {
    if (closing || !modal.open) return;
    closing = true;
    closeMode = mode;
    switchTarget = target;
    if (mode === 'delete') rememberDeleted();
    else if (mode === 'shelve') rememberShelved();
    if (reducedMotion.matches) {
      finishClose();
      return;
    }
    modal.classList.add('is-closing');
    card?.addEventListener('animationend', finishClose, { once: true });
    closeTimer = window.setTimeout(finishClose, 850);
  }

  function openNotice() {
    if (isDeleted() || modal.open || closing) return;
    try { modal.showModal(); }
    catch {
      releaseBetaQueue();
      return;
    }
    reportInbox(false);
    minimizeButton?.focus({ preventScroll: true });
    if (portraitImage?.complete) startSparks();
    else portraitImage?.addEventListener('load', startSparks, { once: true });
  }

  minimizeButton?.addEventListener('click', () => closeNotice('shelve'));
  deleteButton?.addEventListener('click', () => closeNotice('delete'));
  window.addEventListener('vf:cta-switch-request', event => {
    const { from, to } = event.detail || {};
    if (from === 'release' && to) closeNotice('switch', to);
  });
  window.addEventListener('vf:cta-open', event => {
    if (event.detail?.target === 'release') openNotice();
  });
  window.addEventListener('vf:cta-state-request', () => reportInbox(isShelved() && !modal.open));
  modal.addEventListener('cancel', event => {
    event.preventDefault();
    closeNotice('shelve');
  });
  modal.addEventListener('click', event => {
    if (event.target === modal) closeNotice('shelve');
  });

  if (isDeleted()) {
    reportInbox(false);
    return;
  }
  if (isShelved()) {
    reportInbox(true);
    return;
  }

  document.documentElement.dataset.vfReleaseNoticeBlocking = 'true';
  reportInbox(false);
  const scheduleOpen = () => window.setTimeout(openNotice, 650);
  if (document.readyState === 'complete') scheduleOpen();
  else window.addEventListener('load', scheduleOpen, { once: true });
})();
