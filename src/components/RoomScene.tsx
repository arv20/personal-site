import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildRoom } from '../scene/buildRoom';
import { lighting } from '../scene/dorm/lighting';
import { postprocessing } from '../scene/dorm/post';

interface Props {
  onStatus: (status: 'ready' | 'fallback') => void;
  onProgress?: (fraction: number) => void;
  onHotspot?: (id: string) => void;
  focusId?: string | null;
  nightMode?: boolean;
}

export interface RoomHandle {
  focus: (id: string | null) => void;
  petCat: () => void;
}

const HOTSPOTS: { id: string; label: string; pos: [number, number, number]; size: [number, number] }[] = [
  { id: 'monitor', label: 'About', pos: [-0.92, 1.08, -1.15], size: [0.55, 0.35] },
  { id: 'posters', label: 'Projects', pos: [-0.9, 1.7, -1.38], size: [1.3, 0.6] },
  { id: 'corkboard', label: 'Experience', pos: [0.1, 1.64, -1.38], size: [0.5, 0.5] },
  { id: 'bookshelf', label: 'Reading', pos: [1.27, 1.5, -1.25], size: [1.1, 0.4] },
  { id: 'desk', label: 'Résumé', pos: [-1.15, 0.88, -1.0], size: [0.9, 0.4] },
  { id: 'phone', label: 'Contact', pos: [-0.5, 0.75, -0.9], size: [0.25, 0.2] },
  { id: 'window', label: 'Columbus', pos: [-1.9, 1.4, -0.25], size: [1.3, 1.4] },
  { id: 'bed', label: 'Off-hours', pos: [1.37, 0.6, 0.17], size: [1.0, 2.1] },
  { id: 'fridge', label: 'Favorites', pos: [0.43, 0.6, -1.1], size: [0.5, 1.2] },
  { id: 'spandrift', label: 'Spandrift', pos: [1.5, 1.55, -1.25], size: [0.22, 0.22] },
  { id: 'lightswitch', label: 'Night mode', pos: [-1.92, 1.2, 1.0], size: [0.12, 0.18] },
  { id: 'cat', label: 'Pet me', pos: [1.3, 0.55, 0.5], size: [0.25, 0.2] },
];

const FOCUS: Record<string, { cam: [number, number, number]; target: [number, number, number] }> = {
  monitor: { cam: [-1.6, 1.2, -0.4], target: [-0.9, 1.05, -1.2] },
  posters: { cam: [-0.4, 1.7, -0.2], target: [-0.9, 1.7, -1.4] },
  corkboard: { cam: [0.6, 1.7, -0.2], target: [0.1, 1.65, -1.4] },
  bookshelf: { cam: [1.8, 1.6, -0.4], target: [1.2, 1.5, -1.3] },
  desk: { cam: [-1.6, 1.0, -0.3], target: [-1.1, 0.85, -1.0] },
  phone: { cam: [-1.0, 1.0, -0.2], target: [-0.5, 0.75, -0.9] },
  window: { cam: [-1.0, 1.5, 0.6], target: [-1.9, 1.4, -0.25] },
  bed: { cam: [2.0, 1.0, 0.8], target: [1.37, 0.6, 0.17] },
  fridge: { cam: [1.0, 1.0, -0.3], target: [0.43, 0.6, -1.1] },
  spandrift: { cam: [1.8, 1.6, -0.4], target: [1.5, 1.55, -1.25] },
  default: { cam: [4.8, 4.5, 6], target: [0, 1.03, 0] },
};

const RoomScene = forwardRef<RoomHandle, Props>(function RoomScene({ onStatus, onProgress, onHotspot, focusId, nightMode }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onStatus, onProgress, onHotspot });
  useEffect(() => { callbacks.current = { onStatus, onProgress, onHotspot }; }, [onStatus, onProgress, onHotspot]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false, contextAvailable = true;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      callbacks.current.onStatus('fallback');
      return;
    }
    const choice = new URLSearchParams(location.search).get('quality');
    let low = choice === 'low';
    let probing = choice !== 'low' && choice !== 'high';
    host.dataset.quality = probing ? 'sampling' : low ? 'low' : 'high';
    renderer.setPixelRatio(low ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.autoUpdate = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-label', 'A college dorm room. Drag to rotate; click objects to explore; Home resets.');
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.tabIndex = 0;
    host.prepend(renderer.domElement);
    callbacks.current.onProgress?.(.1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#20252a');
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const envTarget = pmrem.fromScene(environment, .04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = .30;
    environment.dispose(); pmrem.dispose();
    callbacks.current.onProgress?.(.25);
    const model = buildRoom(renderer.capabilities.getMaxAnisotropy(), fraction => {
      if (!disposed) callbacks.current.onProgress?.(.45 + fraction * .4);
    });
    scene.add(model.room);
    callbacks.current.onProgress?.(.45);
    const camera = new THREE.OrthographicCamera(-3, 3, 2.5, -2.5, .1, 30);
    camera.position.set(4.8, 4.5, 6);
    const controls = new OrbitControls(camera, renderer.domElement);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    controls.enableDamping = !reducedMotion.matches;
    controls.dampingFactor = .08;
    controls.target.set(0, 1.03, 0);
    controls.enableZoom = false; controls.enablePan = false;
    controls.minAzimuthAngle = .22; controls.maxAzimuthAngle = 1.18;
    controls.minPolarAngle = .78; controls.maxPolarAngle = 1.18;
    controls.rotateSpeed = .6;
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
    controls.update(); controls.saveState();
    const lights = lighting(scene, model);
    let post = low ? null : postprocessing(renderer, scene, camera);
    let shadowDirty = true;
    function lowerQuality() {
      low = true; post?.dispose(); post = null;
      renderer.setPixelRatio(1);
      for (const light of [lights.sun, lights.lamp]) {
        light.shadow.mapSize.multiplyScalar(.5);
        light.shadow.map?.dispose(); light.shadow.map = null;
      }
      shadowDirty = true; host!.dataset.quality = 'low';
      host!.dataset.pixelRatio = '1'; resize();
    }
    if (low) {
      lights.sun.shadow.mapSize.set(1024, 1024);
      lights.lamp.shadow.mapSize.set(512, 512);
    }
    host.dataset.pixelRatio = String(renderer.getPixelRatio());

    // ---- Hotspots ----
    const hotspotMeshes: THREE.Mesh[] = [];
    const hotspotLabels: { id: string; sprite: THREE.Sprite; baseScale: number }[] = [];
    const hotspotById = new Map<string, THREE.Vector3>();
    for (const h of HOTSPOTS) {
      const geo = new THREE.PlaneGeometry(h.size[0] * 1.8, h.size[1] * 1.8);
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(h.pos[0], h.pos[1], h.pos[2]);
      // face the camera-ish (toward viewer); keep world-aligned for raycasting ease
      mesh.userData.id = h.id;
      scene.add(mesh);
      hotspotMeshes.push(mesh);
      hotspotById.set(h.id, new THREE.Vector3(h.pos[0], h.pos[1], h.pos[2]));

      // label sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.roundRect(4, 4, 248, 56, 12); ctx.fill();
      ctx.fillStyle = '#e8e3d6';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(h.label, 128, 32);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(h.pos[0], h.pos[1] + h.size[1] / 2 + 0.08, h.pos[2]);
      sprite.scale.set(0.45, 0.11, 1);
      sprite.visible = false;
      scene.add(sprite);
      hotspotLabels.push({ id: h.id, sprite, baseScale: 1 });
    }

    // ---- Cat ----
    const cat = new THREE.Group();
    cat.position.set(1.3, 0.48, 0.5);
    const catMat = new THREE.MeshStandardMaterial({ color: '#c9a27a', roughness: .85 });
    const catDark = new THREE.MeshStandardMaterial({ color: '#8a6a4a', roughness: .9 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.30), catMat);
    body.position.set(0, 0.06, 0); cat.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), catMat);
    head.position.set(0, 0.15, 0.12); cat.add(head);
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 4), catDark);
    earL.position.set(-0.04, 0.24, 0.12); earL.rotation.z = 0.3; cat.add(earL);
    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 4), catDark);
    earR.position.set(0.04, 0.24, 0.12); earR.rotation.z = -0.3; cat.add(earR);
    for (const x of [-0.06, 0.06]) for (const z of [-0.1, 0.1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), catMat);
      leg.position.set(x, -0.02, z); cat.add(leg);
    }
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), catMat);
    tail.position.set(0, 0.1, -0.2); tail.rotation.x = 0.6; cat.add(tail);
    scene.add(cat);
    let catPetTime = 0;

    // ---- Light switch ----
    const switchMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.09, 0.02),
      new THREE.MeshStandardMaterial({ color: '#d8d3c5', roughness: .7 })
    );
    switchMesh.position.set(-1.92, 1.2, 1.0);
    scene.add(switchMesh);

    // ---- Spandrift orb ----
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 12),
      new THREE.MeshStandardMaterial({ color: '#7dd3fc', emissive: '#38bdf8', emissiveIntensity: 1.2, roughness: .3 })
    );
    orb.position.set(1.5, 1.55, -1.25);
    scene.add(orb);

    // ---- GitHub contribution frame ----
    const ghFrame = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.24),
      new THREE.MeshStandardMaterial({ color: '#2a2f33', roughness: .6 })
    );
    ghFrame.position.set(0.6, 1.62, -1.41);
    scene.add(ghFrame);
    fetch(`${import.meta.env.BASE_URL}data/github-contributions.json`)
      .then(r => r.json())
      .then((data: { total?: number; contributions: { date: string; count: number }[] }) => {
        const c = document.createElement('canvas');
        c.width = 420; c.height = 240;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#1e2428'; ctx.fillRect(0, 0, 420, 240);
        ctx.fillStyle = '#d3c8b6'; ctx.font = 'bold 16px monospace'; ctx.fillText('github contributions', 12, 22);
        const days = data.contributions.slice(-84);
        const cell = 4;
        const gap = 2;
        const startX = 12, startY = 36;
        for (let i = 0; i < days.length; i++) {
          const col = Math.floor(i / 7);
          const row = i % 7;
          const cnt = days[i].count;
          const level = cnt === 0 ? 0 : cnt < 3 ? 1 : cnt < 8 ? 2 : cnt < 15 ? 3 : 4;
          const colors = ['#1e2428', '#1a3a2a', '#2d6a4f', '#40916c', '#52b788', '#74c69d'];
          ctx.fillStyle = colors[level];
          ctx.fillRect(startX + col * (cell + gap), startY + row * (cell + gap), cell, cell);
        }
        ctx.fillStyle = '#9aa0a6'; ctx.font = '12px monospace';
        ctx.fillText(`${data.total} total`, 12, 230);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        (ghFrame.material as THREE.MeshStandardMaterial).map = tex;
        (ghFrame.material as THREE.MeshStandardMaterial).needsUpdate = true;
      })
      .catch(() => {});

    // ---- Ceiling stars ----
    const starCount = 200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = -1.9 + Math.random() * 3.8;
      starPos[i * 3 + 1] = 2.32;
      starPos[i * 3 + 2] = -1.4 + Math.random() * 2.8;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: '#fff7e6', size: 0.02, transparent: true, opacity: 0.8, sizeAttenuation: true });
    const stars = new THREE.Points(starGeo, starMat);
    stars.visible = false;
    scene.add(stars);

    // ---- Dust (existing) ----
    const dustCanvas = document.createElement('canvas'); dustCanvas.width = dustCanvas.height = 32;
    const ctx2 = dustCanvas.getContext('2d')!;
    const gradient = ctx2.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, '#e6d8b54d'); gradient.addColorStop(1, '#e6d8b500');
    ctx2.fillStyle = gradient; ctx2.fillRect(0, 0, 32, 32);
    const dustTexture = new THREE.CanvasTexture(dustCanvas); dustTexture.colorSpace = THREE.SRGBColorSpace;
    const dustMaterial = new THREE.SpriteMaterial({ map: dustTexture, transparent: true, opacity: .24, depthWrite: false });
    const dust = Array.from({ length: 7 }, (_, i) => {
      const sprite = new THREE.Sprite(dustMaterial);
      sprite.position.set(-1.7 + (i % 3) * .17, .8 + i * .12, -.35 + (i % 4) * .09);
      sprite.scale.setScalar(.012); scene.add(sprite); return sprite;
    });

    const cursorMaterial = new THREE.MeshStandardMaterial({ color: '#9babaf', emissive: '#a9c5d8', emissiveIntensity: .7, roughness: .6, roughnessMap: model.screenMat.roughnessMap });
    const cursor = new THREE.Mesh(new THREE.PlaneGeometry(.004, .012), cursorMaterial);
    cursor.position.set(.20, .975, -.163); model.desk.add(cursor);

    // ---- Raycasting ----
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredId: string | null = null;
    let downPos: { x: number; y: number } | null = null;
    let dragging = false;

    const onPointerDown = (e: PointerEvent) => { downPos = { x: e.clientX, y: e.clientY }; };
    const onPointerUp = (e: PointerEvent) => {
      if (downPos) {
        const dx = e.clientX - downPos.x, dy = e.clientY - downPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 6 && hoveredId) {
          callbacks.current.onHotspot?.(hoveredId);
        }
      }
      downPos = null;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (dragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hotspotMeshes, false);
      hoveredId = hits.length ? (hits[0].object.userData.id as string) : null;
      for (const lab of hotspotLabels) lab.sprite.visible = lab.id === hoveredId;
      renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'grab';
      // update labels
      for (const lab of hotspotLabels) {
        lab.sprite.visible = lab.id === hoveredId;
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    controls.addEventListener('start', () => { dragging = true; });
    controls.addEventListener('end', () => { dragging = false; });

    // ---- Focus ----
    let focusTween: { fromCam: THREE.Vector3; toCam: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; start: number } | null = null;
    const focusOn = (id: string | null) => {
      const key = id && FOCUS[id] ? id : 'default';
      const f = FOCUS[key];
      focusTween = {
        fromCam: camera.position.clone(),
        toCam: new THREE.Vector3(...f.cam),
        fromTarget: controls.target.clone(),
        toTarget: new THREE.Vector3(...f.target),
        start: performance.now(),
      };
      controls.enabled = false;
      dirty = true;
    };
    const focusRef = { current: focusOn };
    (window as any).__roomFocus = focusOn;
    focusRef.current = focusOn;
    // expose via closure for useImperativeHandle — we'll store on a ref object
    (host as any).__focus = focusOn;

    const petCat = () => { catPetTime = performance.now(); };
    (host as any).__petCat = petCat;

    let dirty = true, frame = 0, ready = false, assetsLoaded = false;
    let probeStart = 0, probeFrames = 0, animationTime = 0, previousFrame = 0, lastAmbientFrame = 0;
    const invalidate = () => { dirty = true; };
    controls.addEventListener('change', invalidate);
    function resize() {
      if (disposed) return;
      const width = host!.clientWidth, height = host!.clientHeight;
      if (!width || !height) return;
      const aspect = width / height, viewHeight = Math.max(4.9, 5.9 / aspect);
      camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix(); renderer.setSize(width, height);
      post?.composer.setPixelRatio(renderer.getPixelRatio()); post?.composer.setSize(width, height);
      dirty = true;
    }
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    function moveTo(to: THREE.Vector3) {
      const damping = controls.enableDamping; controls.enableDamping = false; controls.update(); controls.enableDamping = damping;
      if (reducedMotion.matches) { camera.position.copy(to); controls.update(); }
      else {
        // reuse focusTween with same target
        focusTween = { fromCam: camera.position.clone(), toCam: to, fromTarget: controls.target.clone(), toTarget: controls.target.clone(), start: performance.now() };
      }
      dirty = true;
    }
    function keyboard(event: KeyboardEvent) {
      if (!['Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault(); interact();
      if (event.key === 'Home') { controls.reset(); dirty = true; return; }
      const s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (event.key === 'ArrowLeft') s.theta -= .1;
      if (event.key === 'ArrowRight') s.theta += .1;
      if (event.key === 'ArrowUp') s.phi -= .08;
      if (event.key === 'ArrowDown') s.phi += .08;
      s.theta = THREE.MathUtils.clamp(s.theta, controls.minAzimuthAngle, controls.maxAzimuthAngle);
      s.phi = THREE.MathUtils.clamp(s.phi, controls.minPolarAngle, controls.maxPolarAngle);
      moveTo(new THREE.Vector3().setFromSpherical(s).add(controls.target));
    }
    function contextLost(event: Event) {
      event.preventDefault(); contextAvailable = false; cancelAnimationFrame(frame);
      callbacks.current.onStatus('fallback');
    }
    function visibility() {
      cancelAnimationFrame(frame); previousFrame = 0;
      if (!document.hidden && contextAvailable) { dirty = true; probeStart = 0; probeFrames = 0; frame = requestAnimationFrame(render); }
    }
    function motionChanged() { controls.enableDamping = !reducedMotion.matches; dirty = true; }
    renderer.domElement.addEventListener('keydown', keyboard);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', visibility);
    reducedMotion.addEventListener('change', motionChanged);
    void model.assetsReady.then(() => { if (!disposed) { assetsLoaded = true; dirty = true; } });

    function interact() { lastInteraction = performance.now(); focusTween = null; controls.enabled = true; }

    // night mode apply
    function applyNight(isNight: boolean) {
      if (isNight) {
        lights.sun.intensity = 0.35;
        lights.lamp.intensity = 2.2;
        scene.background = new THREE.Color('#0b1016');
        stars.visible = true;
        windowViewEmissive(true);
      } else {
        lights.sun.intensity = 1.65;
        lights.lamp.intensity = 1.2;
        scene.background = new THREE.Color('#20252a');
        stars.visible = false;
        windowViewEmissive(false);
      }
      dirty = true;
    }
    function windowViewEmissive(on: boolean) {
      const wv = model.windowView as THREE.Mesh;
      if (wv && wv.material) {
        const mat = wv.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = on ? 0.15 : 0.55;
      }
    }

    let lastInteraction = performance.now();
    controls.addEventListener('start', interact);

    function render(now: number) {
      if (disposed || document.hidden || !contextAvailable) return;
      if (previousFrame && !reducedMotion.matches) animationTime += Math.min((now - previousFrame) / 1000, .1);
      previousFrame = now;
      const changed = controls.update();
      if (focusTween) {
        const t = Math.min((now - focusTween.start) / 750, 1), eased = t * t * (3 - 2 * t);
        camera.position.lerpVectors(focusTween.fromCam, focusTween.toCam, eased);
        controls.target.lerpVectors(focusTween.fromTarget, focusTween.toTarget, eased);
        camera.lookAt(controls.target);
        dirty = true;
        if (t === 1) { focusTween = null; controls.enabled = true; }
      }
      if (ready && probing) {
        if (!probeStart) { probeStart = now; probeFrames = 0; }
        else probeFrames++;
        if (now - probeStart >= 2000) {
          const fps = probeFrames * 1000 / (now - probeStart); probing = false;
          host!.dataset.sampleFps = fps.toFixed(1);
          if (fps < 40) lowerQuality(); else host!.dataset.quality = 'high';
        }
      }
      const animate = !reducedMotion.matches;
      const ambientDue = animate && now - lastAmbientFrame >= (low ? 1000 / 30 : 1000 / 60);
      if (dirty || changed || probing || focusTween || ambientDue) {
        const saved = camera.position.clone();
        if (animate) {
          lights.update(animationTime);
          cursor.visible = Math.floor(animationTime * 1.5) % 2 === 0;
          model.windowView.position.x = Math.sin(animationTime * .15) * .003;
          dust.forEach((s, i) => { s.visible = !low; s.position.y = .8 + i * .12 + Math.sin(animationTime * .13 + i) * .015; });
          // cat tail wag when petted
          if (now - catPetTime < 2000) {
            tail.rotation.z = Math.sin((now - catPetTime) * 0.02) * 0.4;
          } else {
            tail.rotation.z = 0;
          }
          // idle drift
          if (!focusTween && now - lastInteraction > 4500) {
            const s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
            const entrance = Math.min((now - lastInteraction - 4500) / 750, 1);
            s.theta = THREE.MathUtils.clamp(s.theta + Math.sin(animationTime * .12) * .0087 * entrance, controls.minAzimuthAngle, controls.maxAzimuthAngle);
            camera.position.setFromSpherical(s).add(controls.target); camera.lookAt(controls.target);
          }
          // orb pulse
          orb.scale.setScalar(1 + Math.sin(animationTime * 2) * 0.1);
        } else {
          cursor.visible = true; dust.forEach(s => { s.visible = !low; });
        }
        renderer.shadowMap.needsUpdate = shadowDirty || !ready;
        if (post) post.composer.render(); else renderer.render(scene, camera);
        camera.position.copy(saved); camera.lookAt(controls.target);
        if (!ready && assetsLoaded) {
          ready = true; performance.mark('dorm-first-frame');
          callbacks.current.onProgress?.(1); callbacks.current.onStatus('ready');
        }
        shadowDirty = false; dirty = false; lastAmbientFrame = now;
      }
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);

    // apply initial night mode
    applyNight(!!nightMode);

    // store handlers on host for imperative access
    (host as any).__focus = focusOn;
    (host as any).__petCat = petCat;
    (host as any).__applyNight = applyNight;

    // oxlint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      disposed = true; model.disposeAssets(); cancelAnimationFrame(frame); observer.disconnect();
      controls.removeEventListener('change', invalidate); controls.removeEventListener('start', interact); controls.dispose();
      renderer.domElement.removeEventListener('keydown', keyboard);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      document.removeEventListener('visibilitychange', visibility); reducedMotion.removeEventListener('change', motionChanged);
      const materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
      scene.traverse(o => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m); } });
      for (const m of materials) { for (const value of Object.values(m)) if (value instanceof THREE.Texture) textures.add(value); m.dispose(); }
      textures.forEach(t => t.dispose()); envTarget.dispose(); lights.dispose(); post?.dispose();
      dustTexture.dispose(); dustMaterial.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    focus: (id) => {
      const host = hostRef.current as any;
      host?.__focus?.(id ?? null);
    },
    petCat: () => {
      const host = hostRef.current as any;
      host?.__petCat?.();
    },
  }), []);

  // react to focusId prop
  useEffect(() => {
    const host = hostRef.current as any;
    host?.__focus?.(focusId ?? null);
  }, [focusId]);

  // react to nightMode prop
  useEffect(() => {
    const host = hostRef.current as any;
    // applyNight is internal; re-trigger by setting a data attribute and calling a stored function
    host?.__applyNight?.(!!nightMode);
  }, [nightMode]);

  return <div className="room-canvas" ref={hostRef} />;
});

export default RoomScene;