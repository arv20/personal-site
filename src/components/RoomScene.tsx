import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildRoom } from '../scene/buildRoom';
import { lighting } from '../scene/dorm/lighting';
import { postprocessing } from '../scene/dorm/post';

interface Props {
  onStatus: (status: 'ready' | 'fallback') => void;
  onProgress?: (fraction: number) => void;
}

export default function RoomScene({ onStatus, onProgress }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onStatus, onProgress });
  useEffect(() => { callbacks.current = { onStatus, onProgress }; }, [onStatus, onProgress]);

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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.autoUpdate = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-label', 'A college dorm room with a twin bed, study desk, posters and string lights. Drag or use the arrow keys to rotate; Home resets the view.');
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
    const initialPosition = camera.position.clone();
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

    let lastInteraction = performance.now();
    let tween: { from: THREE.Vector3; to: THREE.Vector3; start: number } | null = null;
    const interact = () => { lastInteraction = performance.now(); tween = null; };
    controls.addEventListener('start', interact);
    const cursorMaterial = new THREE.MeshStandardMaterial({ color: '#9babaf', emissive: '#a9c5d8', emissiveIntensity: .7, roughness: .6, roughnessMap: model.screenMat.roughnessMap });
    const cursor = new THREE.Mesh(new THREE.PlaneGeometry(.004, .012), cursorMaterial);
    cursor.position.set(.20, .975, -.163); model.desk.add(cursor);
    const dustCanvas = document.createElement('canvas'); dustCanvas.width = dustCanvas.height = 32;
    const ctx = dustCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16,16,0,16,16,16);
    gradient.addColorStop(0, '#e6d8b54d'); gradient.addColorStop(1, '#e6d8b500');
    ctx.fillStyle = gradient; ctx.fillRect(0,0,32,32);
    const dustTexture = new THREE.CanvasTexture(dustCanvas); dustTexture.colorSpace = THREE.SRGBColorSpace;
    const dustMaterial = new THREE.SpriteMaterial({map: dustTexture, transparent: true, opacity: .24, depthWrite: false});
    const dust = Array.from({length: 7}, (_, i) => {
      const sprite = new THREE.Sprite(dustMaterial);
      sprite.position.set(-1.7+(i%3)*.17, .8+i*.12, -.35+(i%4)*.09);
      sprite.scale.setScalar(.012); scene.add(sprite); return sprite;
    });

    let dirty = true, frame = 0, ready = false, assetsLoaded = false;
    let probeStart = 0, probeFrames = 0, animationTime = 0, previousFrame = 0, lastAmbientFrame = 0;
    const invalidate = () => { dirty = true; };
    controls.addEventListener('change', invalidate);
    function resize() {
      if (disposed) return;
      const width = host!.clientWidth, height = host!.clientHeight;
      if (!width || !height) return;
      const aspect = width / height, viewHeight = Math.max(4.9, 5.9 / aspect);
      camera.left = -viewHeight*aspect/2; camera.right = viewHeight*aspect/2;
      camera.top = viewHeight/2; camera.bottom = -viewHeight/2;
      camera.updateProjectionMatrix(); renderer.setSize(width, height);
      post?.composer.setPixelRatio(renderer.getPixelRatio()); post?.composer.setSize(width, height);
      dirty = true;
    }
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    function moveTo(to: THREE.Vector3) {
      const damping = controls.enableDamping; controls.enableDamping = false; controls.update(); controls.enableDamping = damping;
      if (reducedMotion.matches) { camera.position.copy(to); controls.update(); }
      else tween = {from: camera.position.clone(), to, start: performance.now()};
      dirty = true;
    }
    function keyboard(event: KeyboardEvent) {
      if (!['Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault(); interact();
      if (event.key === 'Home') { moveTo(initialPosition.clone()); return; }
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
    function motionChanged() { controls.enableDamping = !reducedMotion.matches; tween = null; dirty = true; }
    renderer.domElement.addEventListener('keydown', keyboard);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', visibility);
    reducedMotion.addEventListener('change', motionChanged);
    void model.assetsReady.then(() => { if (!disposed) { assetsLoaded = true; dirty = true; } });
    function render(now: number) {
      if (disposed || document.hidden || !contextAvailable) return;
      if (previousFrame && !reducedMotion.matches) animationTime += Math.min((now-previousFrame)/1000, .1);
      previousFrame = now;
      const changed = controls.update();
      if (tween) {
        const t = Math.min((now-tween.start)/750, 1), eased = t*t*(3-2*t);
        camera.position.lerpVectors(tween.from, tween.to, eased); camera.lookAt(controls.target); dirty = true;
        if (t === 1) tween = null;
      }
      // Probe actual rendered frames for two seconds, excluding initial shader/asset setup.
      if (ready && probing) {
        if (!probeStart) { probeStart = now; probeFrames = 0; }
        else probeFrames++;
        if (now-probeStart >= 2000) {
          const fps = probeFrames*1000/(now-probeStart); probing = false;
          host!.dataset.sampleFps = fps.toFixed(1);
          if (fps < 40) lowerQuality(); else host!.dataset.quality = 'high';
        }
      }
      const animate = !reducedMotion.matches;
      const ambientDue = animate && now-lastAmbientFrame >= (low ? 1000/30 : 1000/60);
      if (dirty || changed || probing || tween || ambientDue) {
        const saved = camera.position.clone();
        if (animate) {
          lights.update(animationTime); cursor.visible = Math.floor(animationTime*1.5)%2 === 0;
          model.windowView.position.x = Math.sin(animationTime*.15)*.003;
          dust.forEach((s,i) => { s.visible = !low; s.position.y = .8+i*.12+Math.sin(animationTime*.13+i)*.015; });
          if (!tween && now-lastInteraction > 4500) {
            const s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
            const entrance = Math.min((now-lastInteraction-4500)/750,1);
            s.theta = THREE.MathUtils.clamp(s.theta+Math.sin(animationTime*.12)*.0087*entrance, controls.minAzimuthAngle, controls.maxAzimuthAngle);
            camera.position.setFromSpherical(s).add(controls.target); camera.lookAt(controls.target);
          }
        } else { cursor.visible = true; dust.forEach(s => { s.visible = !low; }); }
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
    return () => {
      disposed = true; model.disposeAssets(); cancelAnimationFrame(frame); observer.disconnect();
      controls.removeEventListener('change', invalidate); controls.removeEventListener('start', interact); controls.dispose();
      renderer.domElement.removeEventListener('keydown', keyboard);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      document.removeEventListener('visibilitychange', visibility); reducedMotion.removeEventListener('change', motionChanged);
      const materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
      scene.traverse(o => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); for(const m of Array.isArray(o.material)?o.material:[o.material]) materials.add(m); } });
      for (const m of materials) { for(const value of Object.values(m)) if(value instanceof THREE.Texture) textures.add(value); m.dispose(); }
      textures.forEach(t => t.dispose()); envTarget.dispose(); lights.dispose(); post?.dispose();
      dustTexture.dispose(); dustMaterial.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);
  return <div className="room-canvas" ref={hostRef} />;
}
