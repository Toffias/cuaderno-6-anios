/**
 * Interactive 3D Brushed-Gold & Glass Hourglass powered by Three.js
 * - Real 3D LatheGeometry glass bulbs, metallic antique-gold frame & pillars
 * - Animated draining top sand cone, rising bottom sand mound & falling golden particles
 * - Periodic graceful 180° flip when sand finishes draining + pointer drag/hover tilt
 * - Graceful Canvas2D fallback if offline / WebGL unavailable
 */
(function () {
  let activeInstance = null;

  function mountFallback2D(container) {
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 400;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let rafId = null;
    let t = 0;

    function draw() {
      t += 0.012;
      const progress = (t * 0.14) % 1;
      ctx.clearRect(0, 0, 360, 400);
      ctx.save();
      ctx.translate(180, 200);
      ctx.rotate(Math.sin(t * 0.7) * 0.05);

      // Gold frame caps & pillars
      ctx.fillStyle = '#c89e52';
      ctx.fillRect(-74, -144, 148, 16);
      ctx.fillRect(-74, 128, 148, 16);
      ctx.fillStyle = '#b4893e';
      ctx.fillRect(-62, -128, 7, 256);
      ctx.fillRect(55, -128, 7, 256);

      // Glass outline
      ctx.beginPath();
      ctx.moveTo(-48, -126);
      ctx.bezierCurveTo(-48, -42, -8, -14, -6, 0);
      ctx.bezierCurveTo(-8, 14, -48, 42, -48, 126);
      ctx.lineTo(48, 126);
      ctx.bezierCurveTo(48, 42, 8, 14, 6, 0);
      ctx.bezierCurveTo(8, -14, 48, -42, 48, -126);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 250, 240, 0.45)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(180, 140, 88, 0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Top sand
      const topH = Math.max(0, 92 * (1 - progress));
      ctx.fillStyle = '#d9a452';
      ctx.beginPath();
      ctx.moveTo(-40 * (1 - progress * 0.7), -16 - topH);
      ctx.lineTo(40 * (1 - progress * 0.7), -16 - topH);
      ctx.lineTo(0, -6);
      ctx.closePath();
      ctx.fill();

      // Bottom sand mound
      const botH = 12 + 86 * progress;
      ctx.beginPath();
      ctx.moveTo(-44, 124);
      ctx.quadraticCurveTo(0, 124 - botH * 1.5, 44, 124);
      ctx.closePath();
      ctx.fill();

      // Stream
      ctx.strokeStyle = '#e5b867';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, 120);
      ctx.stroke();

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    }
    draw();

    return {
      destroy() {
        if (rafId) cancelAnimationFrame(rafId);
        container.innerHTML = '';
      }
    };
  }

  function mountThreeJS(container) {
    const THREE = window.THREE;
    const width = container.clientWidth || 210;
    const height = container.clientHeight || 235;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 6.4);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return mountFallback2D(container);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm studio lights
    scene.add(new THREE.AmbientLight(0xfff4e4, 0.95));

    const keyLight = new THREE.DirectionalLight(0xffe5b8, 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xe07a68, 2.0, 14);
    rimLight.position.set(-4, 1.5, 3);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xd9e8ff, 0.9);
    fillLight.position.set(0, -4, 4);
    scene.add(fillLight);

    const root = new THREE.Group();
    scene.add(root);

    // Materials
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd9ad5b,
      metalness: 0.84,
      roughness: 0.24
    });

    const darkGoldMat = new THREE.MeshStandardMaterial({
      color: 0xb08238,
      metalness: 0.78,
      roughness: 0.34
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6d4bc,
      transparent: true,
      opacity: 0.24,
      roughness: 0.08,
      metalness: 0.08,
      reflectivity: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xc87a28,
      emissive: 0x3d1f06,
      emissiveIntensity: 0.28,
      roughness: 0.68,
      metalness: 0.16
    });

    // Top & Bottom ornamental pedestals
    const capGeo = new THREE.CylinderGeometry(1.02, 1.08, 0.16, 40);
    const rimGeo = new THREE.TorusGeometry(0.96, 0.055, 16, 48);

    const topCap = new THREE.Mesh(capGeo, goldMat);
    topCap.position.y = 1.62;
    root.add(topCap);

    const topRim = new THREE.Mesh(rimGeo, darkGoldMat);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = 1.52;
    root.add(topRim);

    const botCap = new THREE.Mesh(capGeo, goldMat);
    botCap.rotation.x = Math.PI;
    botCap.position.y = -1.62;
    root.add(botCap);

    const botRim = new THREE.Mesh(rimGeo, darkGoldMat);
    botRim.rotation.x = Math.PI / 2;
    botRim.position.y = -1.52;
    root.add(botRim);

    // 3 Slender antique brass pillars
    const pillarGeo = new THREE.CylinderGeometry(0.042, 0.042, 3.12, 16);
    const beadGeo = new THREE.SphereGeometry(0.085, 16, 16);
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 + Math.PI / 6;
      const px = Math.cos(angle) * 0.88;
      const pz = Math.sin(angle) * 0.88;
      const pillar = new THREE.Mesh(pillarGeo, goldMat);
      pillar.position.set(px, 0, pz);
      root.add(pillar);

      const midBead = new THREE.Mesh(beadGeo, darkGoldMat);
      midBead.position.set(px, 0, pz);
      root.add(midBead);
    }

    // Center collar around waist
    const waistRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.032, 12, 32), goldMat);
    waistRing.rotation.x = Math.PI / 2;
    root.add(waistRing);

    // Blown glass hourglass profile via LatheGeometry
    const glassPts = [];
    const steps = 44;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps; // 0..1 from bottom to top
      const y = (u - 0.5) * 2.96; // -1.48 .. +1.48
      const absY = Math.abs(y) / 1.48; // 0 at center, 1 at caps
      // Smooth pinched waist flaring into rounded bulbs
      const bulge = Math.pow(Math.sin(absY * Math.PI * 0.88), 0.72) * 0.66;
      const r = 0.095 + bulge;
      glassPts.push(new THREE.Vector2(r, y));
    }
    const glassGeo = new THREE.LatheGeometry(glassPts, 48);
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    root.add(glassMesh);

    // Upper Sand (inverted cone sitting above neck)
    const upperSandGeo = new THREE.ConeGeometry(0.62, 1.12, 36);
    upperSandGeo.rotateX(Math.PI); // tip pointing down
    upperSandGeo.translate(0, 0.56, 0); // base at y=1.12, tip at y=0
    const upperSand = new THREE.Mesh(upperSandGeo, sandMat);
    upperSand.position.y = 0.08;
    root.add(upperSand);

    // Lower Sand Mound (growing cone at bottom)
    const lowerSandGeo = new THREE.ConeGeometry(0.66, 1.05, 36);
    lowerSandGeo.translate(0, 0.525, 0); // base at y=0, peak at y=1.05
    const lowerSand = new THREE.Mesh(lowerSandGeo, sandMat);
    lowerSand.position.y = -1.46;
    root.add(lowerSand);

    // Thin golden-amber sand stream from waist to bottom mound
    const streamGeo = new THREE.CylinderGeometry(0.028, 0.034, 1.42, 10);
    const streamMat = new THREE.MeshBasicMaterial({ color: 0xd48628, transparent: true, opacity: 0.95 });
    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    streamMesh.position.y = -0.72;
    root.add(streamMesh);

    // Falling golden sand grains + subtle amber shimmer motes (NormalBlending so they pop on cream paper!)
    const PARTICLE_COUNT = 78;
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pSpeeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isStream = i < 56;
      pPositions[i * 3] = isStream ? (Math.random() - 0.5) * 0.065 : (Math.random() - 0.5) * 2.1;
      pPositions[i * 3 + 1] = isStream ? -Math.random() * 1.42 : (Math.random() - 0.5) * 2.6;
      pPositions[i * 3 + 2] = isStream ? (Math.random() - 0.5) * 0.065 : (Math.random() - 0.5) * 1.5;
      pSpeeds[i] = isStream ? (0.85 + Math.random() * 0.7) : (0.12 + Math.random() * 0.2);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xc97b22,
      size: 0.072,
      transparent: true,
      opacity: 0.88,
      depthWrite: false
    });
    const particles = new THREE.Points(pGeo, pMat);
    root.add(particles);

    // Interactive pointer drag to spin the hourglass!
    let dragging = false, lastX = 0, lastY = 0;
    let userRotY = 0, userRotX = 0.14;
    let velY = 0;

    function onPointerDown(e) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      container.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      userRotY += dx * 0.012;
      userRotX = Math.max(-0.55, Math.min(0.55, userRotX + dy * 0.008));
      velY = dx * 0.004;
    }
    function onPointerUp() {
      dragging = false;
    }

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    // Animation loop: 12s smooth draining + 1.4s graceful 180° flip!
    const DRAIN_DURATION = 12.0;
    const FLIP_DURATION = 1.4;
    const CYCLE = DRAIN_DURATION + FLIP_DURATION;
    let rafId = null;
    let prevTs = performance.now();
    let elapsed = 2.5; // Start partially filled so it looks immediately alive

    function animate(ts) {
      const dt = Math.min(0.05, (ts - prevTs) / 1000);
      prevTs = ts;
      elapsed += dt;

      const phase = elapsed % CYCLE;
      let flipZ = 0;
      let fill = 0; // 0 = full top, 1 = full bottom

      if (phase < DRAIN_DURATION) {
        fill = phase / DRAIN_DURATION;
        streamMesh.visible = true;
        streamMat.opacity = 0.85 + Math.sin(elapsed * 18) * 0.12;
      } else {
        // Smooth ease-in-out 180° flip
        const fp = (phase - DRAIN_DURATION) / FLIP_DURATION;
        const eased = fp < 0.5 ? 2 * fp * fp : 1 - Math.pow(-2 * fp + 2, 2) / 2;
        flipZ = eased * Math.PI;
        fill = 1;
        streamMesh.visible = false;
      }

      // Scale upper & lower sand volumes realistically
      const topRemain = Math.max(0.001, 1 - fill);
      const topScale = Math.pow(topRemain, 0.48);
      upperSand.scale.set(topScale, Math.max(0.001, topRemain), topScale);

      const botAmount = Math.max(0.08, fill);
      const botRadius = 0.32 + 0.68 * Math.pow(botAmount, 0.42);
      lowerSand.scale.set(botRadius, botAmount, botRadius);

      // Animate falling sand stream grains + outer sparkles
      const posAttr = pGeo.attributes.position;
      const arr = posAttr.array;
      const moundTopY = -1.46 + botAmount * 0.92;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (i < 56) {
          if (streamMesh.visible) {
            arr[i * 3 + 1] -= pSpeeds[i] * dt * 1.4;
            if (arr[i * 3 + 1] < moundTopY) {
              arr[i * 3] = (Math.random() - 0.5) * 0.045;
              arr[i * 3 + 1] = 0.02;
              arr[i * 3 + 2] = (Math.random() - 0.5) * 0.045;
            }
          }
        } else {
          arr[i * 3 + 1] += pSpeeds[i] * dt * 0.35;
          if (arr[i * 3 + 1] > 1.7) arr[i * 3 + 1] = -1.7;
        }
      }
      posAttr.needsUpdate = true;

      // Gentle levitation + slow showcase spin + user momentum
      if (!dragging) {
        userRotY += 0.36 * dt + velY;
        velY *= 0.92;
      }
      root.position.y = Math.sin(elapsed * 1.8) * 0.06;
      root.rotation.y = userRotY;
      root.rotation.x = userRotX + Math.sin(elapsed * 0.9) * 0.04;
      root.rotation.z = flipZ;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    return {
      destroy() {
        if (rafId) cancelAnimationFrame(rafId);
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('pointercancel', onPointerUp);
        renderer.dispose();
        container.innerHTML = '';
      }
    };
  }

  window.Hourglass3D = {
    mount(container) {
      this.unmount();
      if (!container) return;
      if (window.THREE) {
        activeInstance = mountThreeJS(container);
      } else {
        activeInstance = mountFallback2D(container);
      }
    },
    unmount() {
      if (activeInstance) {
        activeInstance.destroy();
        activeInstance = null;
      }
    }
  };
})();
