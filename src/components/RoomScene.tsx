import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildRoom } from '../scene/buildRoom';
import { ROOM_ANCHORS, type RoomSection } from '../data/room';

interface Props {
  night: boolean;
  resetKey: number;
  onSelect: (section: RoomSection) => void;
  onStatus: (status: 'ready' | 'fallback') => void;
}

export default function RoomScene({ night, resetKey, onSelect, onStatus }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneApi = useRef<{ setNight: (value: boolean) => void; reset: () => void } | null>(null);
  const callbacks = useRef({ onSelect, onStatus });
  useEffect(() => { callbacks.current = { onSelect, onStatus }; }, [onSelect, onStatus]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      callbacks.current.onStatus('fallback');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(0x171815, 0);
    renderer.domElement.setAttribute('aria-label', 'A 3D room with a desk, framed posters, bookshelves and a lounge chair. Drag to rotate; use the navigation to explore.');
    renderer.domElement.setAttribute('role', 'img');
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const envTarget = pmrem.fromScene(environment, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.28;
    environment.dispose(); pmrem.dispose();
    const { room, interactive } = buildRoom(); scene.add(room);
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
    const initialPosition = new THREE.Vector3(10, 10, 12);
    camera.position.copy(initialPosition);
    const target = new THREE.Vector3(0, 2.05, 0);
    const controls = new OrbitControls(camera, renderer.domElement);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    controls.enableDamping = !reducedMotion.matches;
    controls.dampingFactor = 0.08;
    controls.target.copy(target);
    controls.enableZoom = false; controls.enablePan = false;
    controls.minAzimuthAngle = 0.22; controls.maxAzimuthAngle = 1.18;
    controls.minPolarAngle = 0.78; controls.maxPolarAngle = 1.18;
    controls.rotateSpeed = 0.6;
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
    controls.update(); controls.saveState();

    const hemi = new THREE.HemisphereLight('#e8e5da', '#59533c', 1.7); scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff0d2', 2.7);
    sun.position.set(-3, 9, 7); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
    sun.shadow.normalBias = 0.035; sun.shadow.bias = -0.0002; sun.shadow.radius = 4;
    scene.add(sun);
    const windowLight = new THREE.DirectionalLight('#b5cce0', 1.2); windowLight.position.set(-6, 4, 2); scene.add(windowLight);
    const lamp = new THREE.PointLight('#ffca7d', 4, 4, 2); lamp.position.set(0.26, 2.35, -2.0); scene.add(lamp);
    const shelfLight = new THREE.PointLight('#ffc67c', 3, 5, 2); shelfLight.position.set(3.1, 3.6, -2.3); scene.add(shelfLight);
    const wallLight = new THREE.PointLight('#ffe2ab', 3, 7, 2); wallLight.position.set(-2.5, 3.8, -1.8); scene.add(wallLight);
    // A soft grounding shadow below the floating foundation.
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 16, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0,0,0,0.48)'); gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.34; scene.add(ground);

    let dirty = true;
    let frame = 0;
    let disposed = false;
    let darkness = 0;
    let desiredDarkness = 0;
    let pointerStart: { x: number; y: number } | null = null;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const projected = new THREE.Vector3();
    const anchors = ROOM_ANCHORS.map(anchor => ({
      ...anchor,
      point: new THREE.Vector3(...anchor.position),
      element: host.querySelector<HTMLButtonElement>(`[data-anchor="${anchor.id}"]`)!,
    }));
    function resize() {
      if (disposed) return;
      const width = host!.clientWidth, height = host!.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      const viewHeight = Math.max(10, 13.0 / aspect);
      camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix(); renderer.setSize(width, height); dirty = true;
    }
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    function setNight(value: boolean) { desiredDarkness = value ? 1 : 0; dirty = true; }
    function reset() {
      const damping = controls.enableDamping;
      controls.enableDamping = false; controls.update(); controls.reset();
      controls.enableDamping = damping; dirty = true;
    }
    sceneApi.current = { setNight, reset };
    function pick(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactive, true)[0];
      let object: THREE.Object3D | null = hit?.object ?? null;
      while (object && !object.userData.section) object = object.parent;
      return object?.userData.section as RoomSection | undefined;
    }
    function pointerDown(event: PointerEvent) { pointerStart = { x: event.clientX, y: event.clientY }; }
    function pointerMove(event: PointerEvent) {
      if (event.buttons) { renderer.domElement.style.cursor = 'grabbing'; return; }
      renderer.domElement.style.cursor = pick(event) ? 'pointer' : 'grab';
    }
    function pointerUp(event: PointerEvent) {
      if (!pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6) { pointerStart = null; return; }
      pointerStart = null;
      const section = pick(event); if (section) callbacks.current.onSelect(section);
    }
    function pointerCancel() { pointerStart = null; }
    function contextLost(event: Event) { event.preventDefault(); cancelAnimationFrame(frame); callbacks.current.onStatus('fallback'); }
    function visibility() { if (!document.hidden) { dirty = true; frame = requestAnimationFrame(render); } else cancelAnimationFrame(frame); }
    function motionChanged() { controls.enableDamping = !reducedMotion.matches; dirty = true; }
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointermove', pointerMove);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    renderer.domElement.addEventListener('pointercancel', pointerCancel);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', visibility);
    reducedMotion.addEventListener('change', motionChanged);
    let ready = false;
    function render() {
      if (disposed || document.hidden) return;
      const changed = controls.update();
      const lightingChanged = Math.abs(darkness - desiredDarkness) > 0.001;
      if (lightingChanged) {
        darkness = reducedMotion.matches ? desiredDarkness : THREE.MathUtils.lerp(darkness, desiredDarkness, 0.065);
        hemi.intensity = THREE.MathUtils.lerp(1.7, 0.55, darkness);
        sun.intensity = THREE.MathUtils.lerp(2.7, 0.65, darkness);
        windowLight.intensity = THREE.MathUtils.lerp(1.2, 0.55, darkness);
        scene.environmentIntensity = THREE.MathUtils.lerp(0.28, 0.16, darkness);
        lamp.intensity = THREE.MathUtils.lerp(4, 9, darkness);
        shelfLight.intensity = THREE.MathUtils.lerp(3, 6, darkness);
        wallLight.intensity = THREE.MathUtils.lerp(3, 7, darkness);
      }
      if (dirty || changed || lightingChanged) {
        renderer.shadowMap.needsUpdate = !ready;
        renderer.render(scene, camera);
        for (const anchor of anchors) {
          projected.copy(anchor.point).project(camera);
          anchor.element.style.transform = `translate(${(projected.x * 0.5 + 0.5) * host!.clientWidth}px, ${(-projected.y * 0.5 + 0.5) * host!.clientHeight}px)`;
        }
        if (!ready) { ready = true; callbacks.current.onStatus('ready'); }
        dirty = false;
      }
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('pointercancel', pointerCancel);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      document.removeEventListener('visibilitychange', visibility);
      reducedMotion.removeEventListener('change', motionChanged);
      const materials = new Set<THREE.Material>(); const textures = new Set<THREE.Texture>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        }
      });
      for (const material of materials) {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        material.dispose();
      }
      textures.forEach(texture => texture.dispose()); envTarget.dispose();
      renderer.dispose(); renderer.domElement.remove(); sceneApi.current = null;
    };
  }, []);

  useEffect(() => { sceneApi.current?.setNight(night); }, [night]);
  useEffect(() => { sceneApi.current?.reset(); }, [resetKey]);

  return <div className="room-canvas" ref={hostRef}>
    {ROOM_ANCHORS.map(anchor => <button key={anchor.id} className="room-anchor" data-anchor={anchor.id} aria-label={`Explore ${anchor.label.toLowerCase()}`} onClick={() => onSelect(anchor.id)}>
      <span className="anchor-dot" aria-hidden="true">+</span><span className="anchor-label">{anchor.label}</span>
    </button>)}
  </div>;
}
