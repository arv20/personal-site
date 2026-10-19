import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildRoom } from './buildRoom';

interface Props {
  onStatus: (status: 'ready' | 'fallback') => void;
}

export default function RoomScene({ onStatus }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onStatus });
  useEffect(() => { callbacks.current = { onStatus }; }, [onStatus]);

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
    renderer.domElement.setAttribute('aria-label', 'A college dorm room with a twin bed, study desk, posters and string lights. Drag or use the arrow keys to rotate; Home resets the view.');
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.tabIndex = 0;
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const envTarget = pmrem.fromScene(environment, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.28;
    environment.dispose(); pmrem.dispose();
    const { room } = buildRoom(); scene.add(room);
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

    const hemi = new THREE.HemisphereLight('#e8e5da', '#59533c', 1.45); scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff0d2', 2.2);
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
    const invalidate = () => { dirty = true; };
    controls.addEventListener('change', invalidate);
    let frame = 0;
    let disposed = false;
    let contextAvailable = true;
    function resize() {
      if (disposed) return;
      const width = host!.clientWidth, height = host!.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      const viewHeight = Math.max(10.8, 13.0 / aspect);
      camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix(); renderer.setSize(width, height); dirty = true;
    }
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    function reset() {
      const damping = controls.enableDamping;
      controls.enableDamping = false; controls.update(); controls.reset();
      controls.enableDamping = damping; dirty = true;
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Home') { event.preventDefault(); reset(); return; }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (event.key === 'ArrowLeft') spherical.theta -= 0.1;
      if (event.key === 'ArrowRight') spherical.theta += 0.1;
      if (event.key === 'ArrowUp') spherical.phi -= 0.08;
      if (event.key === 'ArrowDown') spherical.phi += 0.08;
      spherical.theta = THREE.MathUtils.clamp(spherical.theta, controls.minAzimuthAngle, controls.maxAzimuthAngle);
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
      camera.position.setFromSpherical(spherical).add(controls.target);
      controls.update(); dirty = true;
    }
    function contextLost(event: Event) {
      event.preventDefault(); contextAvailable = false; cancelAnimationFrame(frame);
      callbacks.current.onStatus('fallback');
    }
    function visibility() { if (!document.hidden) { dirty = true; frame = requestAnimationFrame(render); } else cancelAnimationFrame(frame); }
    function motionChanged() { controls.enableDamping = !reducedMotion.matches; dirty = true; }
    renderer.domElement.addEventListener('keydown', keyboard);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', visibility);
    reducedMotion.addEventListener('change', motionChanged);
    let ready = false;
    function render() {
      if (disposed || document.hidden || !contextAvailable) return;
      const changed = controls.update();
      if (dirty || changed) {
        renderer.shadowMap.needsUpdate = !ready;
        renderer.render(scene, camera);
        if (!ready) { ready = true; callbacks.current.onStatus('ready'); }
        dirty = false;
      }
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.removeEventListener('change', invalidate); controls.dispose();
      renderer.domElement.removeEventListener('keydown', keyboard);
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
      sun.shadow.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);

  return <div className="room-canvas" ref={hostRef} />;
}
