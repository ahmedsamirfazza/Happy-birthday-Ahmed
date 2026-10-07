/**
 * Three.js 3D Rotating Birthday Cake
 * Interactive, smooth auto-rotation, drag-to-spin, dynamic topper with name,
 * and realistic glowing candle flames that can be blown out!
 */

class BirthdayCake3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cakeGroup = null;
    this.flames = [];
    this.candleLights = [];
    this.particles = null;
    this.topperMesh = null;
    this.nameCanvas = null;
    this.nameTexture = null;

    this.isCandlesLit = true;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.rotationVelocity = 0.007;
    this.damping = 0.95;
    this.clock = new THREE.Clock();

    this.currentName = "أحمد";

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const safeW = width || 800;
    const safeH = height || 500;
    this.camera = new THREE.PerspectiveCamera(45, safeW / safeH, 0.1, 1000);
    this.camera.position.set(0, 5.8, 13.5);
    this.camera.lookAt(0, 2.3, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(safeW, safeH);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    this.renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Update responsive camera distance and aspect
    this.updateCameraAspect(safeW, safeH);

    // 4. Lighting
    this.setupLighting();

    // 5. Cake Group
    this.cakeGroup = new THREE.Group();
    this.scene.add(this.cakeGroup);

    // 6. Build Cake Models
    this.buildPlate();
    this.buildBottomTier();
    this.buildTopTier();
    this.buildCandles();
    this.buildNameBanner();
    this.buildMagicalSparkles();

    // 7. Event Listeners (Drag & Resize)
    this.setupInteractions();

    // 8. Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient light for soft overall illumination
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.7);
    this.scene.add(ambientLight);

    // Main directional key light
    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.1);
    dirLight.position.set(8, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // Warm rim light from back
    const rimLight = new THREE.DirectionalLight(0xf72585, 0.6);
    rimLight.position.set(-8, 6, -8);
    this.scene.add(rimLight);

    // Golden accent light from below
    const bottomGlow = new THREE.PointLight(0xffb703, 0.4, 20);
    bottomGlow.position.set(0, -2, 4);
    this.scene.add(bottomGlow);
  }

  buildPlate() {
    // Elegant ceramic/golden cake plate
    const plateGeo = new THREE.CylinderGeometry(4.6, 4.4, 0.25, 48);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x1f2438,
      metalness: 0.4,
      roughness: 0.2,
      emissive: 0x0f1322
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -0.5;
    plate.receiveShadow = true;
    this.cakeGroup.add(plate);

    // Golden edge trim
    const trimGeo = new THREE.TorusGeometry(4.55, 0.08, 16, 64);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      metalness: 0.8,
      roughness: 0.2,
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.rotation.x = Math.PI / 2;
    trim.position.y = -0.4;
    this.cakeGroup.add(trim);
  }

  buildBottomTier() {
    // Bottom Cake Tier (Rich velvety base)
    const baseGeo = new THREE.CylinderGeometry(3.6, 3.7, 2.0, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x4a2818, // Rich chocolate/velvet tone
      roughness: 0.5,
      metalness: 0.1
    });
    const bottomCake = new THREE.Mesh(baseGeo, baseMat);
    bottomCake.position.y = 0.5;
    bottomCake.castShadow = true;
    bottomCake.receiveShadow = true;
    this.cakeGroup.add(bottomCake);

    // Vanilla/strawberry drip icing on bottom tier
    const dripGeo = new THREE.CylinderGeometry(3.68, 3.68, 0.45, 48);
    const dripMat = new THREE.MeshStandardMaterial({
      color: 0xffe8d6,
      roughness: 0.3,
      metalness: 0.1
    });
    const drip = new THREE.Mesh(dripGeo, dripMat);
    drip.position.y = 1.3;
    this.cakeGroup.add(drip);

    // Cream piping pearls around bottom base
    const numPearls = 28;
    const pearlRadius = 3.68;
    const pearlGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const pearlMat = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      roughness: 0.2
    });

    for (let i = 0; i < numPearls; i++) {
      const angle = (i / numPearls) * Math.PI * 2;
      const pearl = new THREE.Mesh(pearlGeo, pearlMat);
      pearl.position.set(
        Math.cos(angle) * pearlRadius,
        -0.35,
        Math.sin(angle) * pearlRadius
      );
      this.cakeGroup.add(pearl);
    }
  }

  buildTopTier() {
    // Top Cake Tier (Pastel celebratory cream)
    const topGeo = new THREE.CylinderGeometry(2.3, 2.4, 1.8, 48);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0xffcbf2, // Soft celebratory pastel berry
      roughness: 0.4,
      metalness: 0.05
    });
    const topCake = new THREE.Mesh(topGeo, topMat);
    topCake.position.y = 2.4;
    topCake.castShadow = true;
    topCake.receiveShadow = true;
    this.cakeGroup.add(topCake);

    // Top glossy frosting cap
    const capGeo = new THREE.CylinderGeometry(2.34, 2.34, 0.25, 48);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 3.25;
    this.cakeGroup.add(cap);

    // Colorful Sprinkles on top
    const sprinkleColors = [0xffb703, 0xf72585, 0x4cc9f0, 0x06d6a0, 0xffbe0b];
    const sprinkleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8);
    
    for (let i = 0; i < 45; i++) {
      const r = Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const sMat = new THREE.MeshStandardMaterial({
        color: sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)],
        roughness: 0.3
      });
      const sprinkle = new THREE.Mesh(sprinkleGeo, sMat);
      sprinkle.position.set(Math.cos(theta) * r, 3.39, Math.sin(theta) * r);
      sprinkle.rotation.x = Math.PI / 2;
      sprinkle.rotation.z = Math.random() * Math.PI;
      this.cakeGroup.add(sprinkle);
    }

    // Cream rosettes & cherries around top perimeter
    const numRosettes = 10;
    const rosetteRadius = 2.1;
    const cherryGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const cherryMat = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      roughness: 0.15,
      metalness: 0.2
    });

    for (let i = 0; i < numRosettes; i++) {
      const angle = (i / numRosettes) * Math.PI * 2;
      const cherry = new THREE.Mesh(cherryGeo, cherryMat);
      cherry.position.set(
        Math.cos(angle) * rosetteRadius,
        3.45,
        Math.sin(angle) * rosetteRadius
      );
      this.cakeGroup.add(cherry);
    }
  }

  buildCandles() {
    // 5 Birthday Candles arranged symmetrically on the top tier
    const candleCount = 5;
    const candleRadius = 1.25;
    const candleHeight = 1.3;

    const candleColors = [0xffb703, 0x4cc9f0, 0xf72585, 0x7209b7, 0x06d6a0];

    for (let i = 0; i < candleCount; i++) {
      const angle = (i / candleCount) * Math.PI * 2;
      const x = Math.cos(angle) * candleRadius;
      const z = Math.sin(angle) * candleRadius;
      const y = 3.38;

      // Candle Stick
      const stickGeo = new THREE.CylinderGeometry(0.08, 0.08, candleHeight, 16);
      const stickMat = new THREE.MeshStandardMaterial({
        color: candleColors[i % candleColors.length],
        roughness: 0.3
      });
      const stick = new THREE.Mesh(stickGeo, stickMat);
      stick.position.set(x, y + candleHeight / 2, z);
      stick.castShadow = true;
      this.cakeGroup.add(stick);

      // Wick
      const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.set(x, y + candleHeight + 0.1, z);
      this.cakeGroup.add(wick);

      // Flame Mesh (Glowing teardrop shape)
      const flameGroup = new THREE.Group();
      flameGroup.position.set(x, y + candleHeight + 0.32, z);

      const flameOuterGeo = new THREE.ConeGeometry(0.12, 0.35, 16);
      flameOuterGeo.translate(0, 0.15, 0);
      const flameOuterMat = new THREE.MeshBasicMaterial({
        color: 0xff9f1c,
        transparent: true,
        opacity: 0.88
      });
      const flameOuter = new THREE.Mesh(flameOuterGeo, flameOuterMat);
      flameGroup.add(flameOuter);

      const flameInnerGeo = new THREE.ConeGeometry(0.06, 0.22, 16);
      flameInnerGeo.translate(0, 0.1, 0);
      const flameInnerMat = new THREE.MeshBasicMaterial({
        color: 0xffffff
      });
      const flameInner = new THREE.Mesh(flameInnerGeo, flameInnerMat);
      flameGroup.add(flameInner);

      this.cakeGroup.add(flameGroup);
      this.flames.push(flameGroup);

      // Point Light for each candle
      const candleLight = new THREE.PointLight(0xffb703, 0.9, 4.5);
      candleLight.position.set(x, y + candleHeight + 0.4, z);
      this.cakeGroup.add(candleLight);
      this.candleLights.push(candleLight);
    }
  }

  buildNameBanner() {
    // Dynamic 3D Topper with Name using an HTML Canvas Texture
    this.nameCanvas = document.createElement('canvas');
    this.nameCanvas.width = 512;
    this.nameCanvas.height = 256;
    this.renderNameTexture(this.currentName);

    this.nameTexture = new THREE.CanvasTexture(this.nameCanvas);
    this.nameTexture.needsUpdate = true;

    // Topper acrylic / golden board
    const bannerGeo = new THREE.PlaneGeometry(3.4, 1.7);
    const bannerMat = new THREE.MeshBasicMaterial({
      map: this.nameTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    // Double-sided topper: readable from both front and back!
    const bannerGroup = new THREE.Group();
    bannerGroup.position.set(0, 5.2, 0);

    // Front face
    const frontPlane = new THREE.Mesh(bannerGeo, bannerMat);
    frontPlane.position.z = 0.02;
    bannerGroup.add(frontPlane);

    // Back face with flipped UV so text is never backwards
    const backGeo = bannerGeo.clone();
    const uvs = backGeo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
      uvs.setX(i, 1 - uvs.getX(i));
    }
    uvs.needsUpdate = true;
    const backPlane = new THREE.Mesh(backGeo, bannerMat);
    backPlane.rotation.y = Math.PI;
    backPlane.position.z = -0.02;
    bannerGroup.add(backPlane);

    this.topperMesh = bannerGroup;
    this.cakeGroup.add(bannerGroup);

    // Two golden acrylic sticks holding the topper
    const stickGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.8, 12);
    const stickMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      metalness: 0.8,
      roughness: 0.2
    });

    const leftStick = new THREE.Mesh(stickGeo, stickMat);
    leftStick.position.set(-1.0, 4.2, 0);
    this.cakeGroup.add(leftStick);

    const rightStick = new THREE.Mesh(stickGeo, stickMat);
    rightStick.position.set(1.0, 4.2, 0);
    this.cakeGroup.add(rightStick);
  }

  renderNameTexture() {
    const ctx = this.nameCanvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 256);

    // Decorative golden badge with luxury glow
    ctx.save();
    ctx.shadowColor = 'rgba(255, 183, 3, 0.7)';
    ctx.shadowBlur = 20;

    const grad = ctx.createLinearGradient(20, 20, 492, 236);
    grad.addColorStop(0, '#fff3b0');
    grad.addColorStop(0.4, '#ffd166');
    grad.addColorStop(1, '#f7b05b');

    ctx.fillStyle = grad;
    roundRect(ctx, 24, 20, 464, 216, 26);
    ctx.fill();

    // Inner gold border
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Subtitle
    ctx.fillStyle = '#0c0f1d';
    ctx.font = 'bold 20px "Cinzel", "Outfit", sans-serif';
    ctx.fillText('★ HAPPY BIRTHDAY ★', 256, 68);

    // Main English Name
    ctx.font = '900 32px "Outfit", sans-serif';
    ctx.fillStyle = '#0c0f1d';
    ctx.fillText('Engineer Ahmed Samir', 256, 126);

    // Arabic title
    ctx.font = 'bold 28px "Cairo", sans-serif';
    ctx.fillStyle = '#5c3d00';
    ctx.fillText('بشمهندس أحمد سمير', 256, 182);

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }
  }

  updateName(newName) {
    this.currentName = newName;
    this.renderNameTexture(newName);
    if (this.nameTexture) {
      this.nameTexture.needsUpdate = true;
    }
  }

  buildMagicalSparkles() {
    // Floating tiny golden star dust particles around the cake
    const particleCount = 80;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2.5 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = Math.random() * 6.5;
      positions[i + 2] = Math.sin(angle) * radius;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffe169,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setupInteractions() {
    const dom = this.renderer.domElement;

    const onStart = (clientX) => {
      this.isDragging = true;
      this.previousMousePosition = { x: clientX };
      this.rotationVelocity = 0;
    };

    const onMove = (clientX) => {
      if (!this.isDragging) return;
      const deltaX = clientX - this.previousMousePosition.x;
      this.cakeGroup.rotation.y += deltaX * 0.007;
      // Clamp velocity so fast swipes don't cause wild erratic spinning
      this.rotationVelocity = Math.max(-0.035, Math.min(0.035, deltaX * 0.0012));
      this.previousMousePosition = { x: clientX };
    };

    const onEnd = () => {
      this.isDragging = false;
    };

    // Mouse drag
    dom.addEventListener('mousedown', (e) => {
      onStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      onMove(e.clientX);
    });

    window.addEventListener('mouseup', onEnd);

    // Touch drag for Mobile / Tablet
    dom.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        onStart(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches && e.touches.length === 1) {
        onMove(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    // Window Resize
    window.addEventListener('resize', () => {
      if (!this.container) return;
      this.updateCameraAspect(this.container.clientWidth, this.container.clientHeight);
    });
  }

  updateCameraAspect(width, height) {
    if (!this.camera || !this.renderer) return;
    const w = width || (this.container ? this.container.clientWidth : 0) || window.innerWidth || 800;
    const h = height || (this.container ? this.container.clientHeight : 0) || 500;
    const aspect = w / h;
    this.camera.aspect = aspect;
    if (aspect < 0.85) {
      // Mobile portrait - move camera back for complete view
      this.camera.position.set(0, 5.8, 17.5);
    } else if (aspect < 1.15) {
      // Tablet portrait / square
      this.camera.position.set(0, 5.8, 15.2);
    } else {
      // Desktop / Landscape
      this.camera.position.set(0, 5.8, 13.5);
    }
    this.camera.lookAt(0, 2.3, 0);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  blowOutCandles() {
    this.isCandlesLit = false;

    // Shrink flames and dim lights
    this.flames.forEach(f => {
      f.visible = false;
    });
    this.candleLights.forEach(l => {
      l.intensity = 0;
    });
  }

  relightCandles() {
    this.isCandlesLit = true;

    this.flames.forEach(f => {
      f.visible = true;
      f.scale.set(1, 1, 1);
    });
    this.candleLights.forEach(l => {
      l.intensity = 0.9;
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Precise delta time for uniform smooth speed across all screens (60Hz, 90Hz, 120Hz)
    const delta = Math.min(this.clock.getDelta(), 0.08);
    const timeScale = delta * 60; // normalized to 60fps base

    // Continuous auto-rotation with gentle damping back to cruising speed
    if (!this.isDragging) {
      this.cakeGroup.rotation.y += this.rotationVelocity * timeScale;
      const normalSpeed = 0.006;
      this.rotationVelocity += (normalSpeed - this.rotationVelocity) * Math.min(1, delta * 2.2);
    }

    // Flame flicker animation when candles are lit
    if (this.isCandlesLit) {
      const elapsed = this.clock.getElapsedTime();
      this.flames.forEach((flame, index) => {
        const flicker = Math.sin(elapsed * 10 + index * 1.5) * 0.12 + 1;
        flame.scale.y = flicker;
        flame.scale.x = 1 + Math.cos(elapsed * 12 + index) * 0.08;
        flame.rotation.z = Math.sin(elapsed * 8 + index) * 0.08;
      });
    }

    // Subtle particle floating
    if (this.particles) {
      this.particles.rotation.y += 0.0012 * timeScale;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.BirthdayCake3D = BirthdayCake3D;
