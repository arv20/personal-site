import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildRoom } from '../scene/buildRoom';
import { lighting } from '../scene/dorm/lighting';
import { postprocessing } from '../scene/dorm/post';

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.autoUpdate = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x171815, 0);
    renderer.domElement.setAttribute('aria-label', 'A college dorm room with a twin bed, study desk, posters and string lights. Drag or use the arrow keys to rotate; Home resets the view.');
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.tabIndex = 0;
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#20252a');
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const envTarget = pmrem.fromScene(environment, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.30;
    environment.dispose(); pmrem.dispose();
    const model = buildRoom(renderer.capabilities.getMaxAnisotropy());
    const { room, assetsReady, disposeAssets } = model; scene.add(room);
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
    const initialPosition = new THREE.Vector3(4.8, 4.5, 6);
    camera.position.copy(initialPosition);
    const target = new THREE.Vector3(0, 1.03, 0);
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

    const lights = lighting(scene, model);
    const post = postprocessing(renderer, scene, camera);
    let lastInteraction = performance.now();
    const interact = () => { lastInteraction = performance.now(); };
    controls.addEventListener('start', interact);
    const started = performance.now();
    const cursor = new THREE.Mesh(new THREE.PlaneGeometry(.004,.012), new THREE.MeshStandardMaterial({ color:'#9babaf', emissive:'#a9c5d8', emissiveIntensity:.7, roughness:.6 }));
    cursor.position.set(.20,.975,-.163); model.desk.add(cursor);
    const dustMap = document.createElement('canvas'); dustMap.width=dustMap.height=32;
    const dustContext=dustMap.getContext('2d')!;const dustGradient=dustContext.createRadialGradient(16,16,0,16,16,16);dustGradient.addColorStop(0,'#e6d8b54d');dustGradient.addColorStop(1,'#e6d8b500');dustContext.fillStyle=dustGradient;dustContext.fillRect(0,0,32,32);
    const dustTexture=new THREE.CanvasTexture(dustMap);dustTexture.colorSpace=THREE.SRGBColorSpace;
    const dustMaterial=new THREE.SpriteMaterial({map:dustTexture,transparent:true,opacity:.24,depthWrite:false});
    const dust=Array.from({length:7},(_,i)=>{const s=new THREE.Sprite(dustMaterial);s.position.set(-1.7+(i%3)*.17,.8+i*.12,-.35+(i%4)*.09);s.scale.setScalar(.012);scene.add(s);return s;});

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
      const viewHeight = Math.max(4.9, 5.9 / aspect);
      camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix(); renderer.setSize(width, height); post.composer.setSize(width,height); dirty = true;
    }
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    function reset() {
      const damping = controls.enableDamping;
      controls.enableDamping = false; controls.update(); controls.reset();
      controls.enableDamping = damping; dirty = true;
    }
    function keyboard(event: KeyboardEvent) {
      interact();
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
    let assetsLoaded = false;
    void assetsReady.then(() => { if (!disposed) { assetsLoaded = true; dirty = true; } });
    function render() {
      if (disposed || document.hidden || !contextAvailable) return;
      const changed = controls.update();
      const seconds=(performance.now()-started)/1000;
      const animate=!reducedMotion.matches;
      const savedPosition=camera.position.clone();
      if(animate){
        lights.update(seconds);
        cursor.visible=Math.floor(seconds*1.5)%2===0;
        model.windowView.position.x=Math.sin(seconds*.15)*.003;
        dust.forEach((s,i)=>{s.position.y=.8+i*.12+Math.sin(seconds*.13+i)*.015;});
        if(performance.now()-lastInteraction>4500){
          const offset=camera.position.clone().sub(controls.target);const spherical=new THREE.Spherical().setFromVector3(offset);
          spherical.theta=THREE.MathUtils.clamp(spherical.theta+Math.sin(seconds*.12)*.0087,controls.minAzimuthAngle,controls.maxAzimuthAngle);
          camera.position.setFromSpherical(spherical).add(controls.target);camera.lookAt(controls.target);
        }
      } else { cursor.visible=true; }
      if (dirty || changed || animate) {
        renderer.shadowMap.needsUpdate = !ready;
        post.composer.render();
        camera.position.copy(savedPosition); camera.lookAt(controls.target);
        if (!ready && assetsLoaded) { ready = true; callbacks.current.onStatus('ready'); }
        dirty = false;
      }
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true; disposeAssets(); cancelAnimationFrame(frame); observer.disconnect(); controls.removeEventListener('change', invalidate); controls.removeEventListener('start',interact); controls.dispose();
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
      lights.dispose(); post.dispose(); dustTexture.dispose(); dustMaterial.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);

  return <div className="room-canvas" ref={hostRef} />;
}
