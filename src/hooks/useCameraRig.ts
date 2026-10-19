import { useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import type { Hotspot, ActiveZone } from '../data/hotspots';

interface CameraState {
  activeZone: ActiveZone;
  currentScale: number;
}

export function useCameraRig(sceneRef: React.RefObject<HTMLDivElement | null>) {
  const stateRef = useRef<CameraState>({ activeZone: 'overview', currentScale: 1 });
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const scaleTweenRef = useRef<gsap.core.Tween | null>(null);
  const parallaxX = useRef<gsap.QuickToFunc | null>(null);
  const parallaxY = useRef<gsap.QuickToFunc | null>(null);
  const scaleProxy = useRef({ value: 1 });

  // Initialize parallax quickTo targets
  useEffect(() => {
    if (!sceneRef.current) return;
    parallaxX.current = gsap.quickTo(sceneRef.current, 'x', { duration: 0.6, ease: 'power3' });
    parallaxY.current = gsap.quickTo(sceneRef.current, 'y', { duration: 0.6, ease: 'power3' });

    return () => {
      tweenRef.current?.kill();
      scaleTweenRef.current?.kill();
    };
  }, [sceneRef]);

  // Idle mouse parallax (only active during overview)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (stateRef.current.activeZone !== 'overview') return;
    if (!parallaxX.current || !parallaxY.current) return;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = ((e.clientX - cx) / cx) * -18;
    const dy = ((e.clientY - cy) / cy) * -18;

    parallaxX.current(dx);
    parallaxY.current(dy);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Exact Camera Zoom Math:
  // dx = ((50 - hotspot.x) / 100) * sceneWidth * hotspot.scale
  // dy = ((50 - hotspot.y) / 100) * sceneHeight * hotspot.scale
  const zoomTo = useCallback((hotspot: Hotspot, onScaleUpdate: (s: number) => void) => {
    if (!sceneRef.current) return;

    const el = sceneRef.current;
    const sceneWidth = el.offsetWidth;
    const sceneHeight = el.offsetHeight;

    const dx = ((50 - hotspot.x) / 100) * sceneWidth * hotspot.scale;
    const dy = ((50 - hotspot.y) / 100) * sceneHeight * hotspot.scale;

    tweenRef.current?.kill();
    scaleTweenRef.current?.kill();
    scaleProxy.current.value = stateRef.current.currentScale;

    stateRef.current.activeZone = hotspot.id;

    // Animate scale proxy for live HUD readout
    scaleTweenRef.current = gsap.to(scaleProxy.current, {
      value: hotspot.scale,
      duration: 1.15,
      ease: 'expo.inOut',
      onUpdate: () => onScaleUpdate(scaleProxy.current.value),
    });

    // 60fps translate3d and scale matrix camera transform
    tweenRef.current = gsap.to(el, {
      x: dx,
      y: dy,
      scale: hotspot.scale,
      duration: 1.15,
      ease: 'expo.inOut',
      force3D: true,
      onComplete: () => {
        stateRef.current.currentScale = hotspot.scale;
      },
    });

    return hotspot.id;
  }, [sceneRef]);

  // Reset back to overview (scale: 1, x: 0, y: 0)
  const resetCamera = useCallback((onScaleUpdate: (s: number) => void) => {
    if (!sceneRef.current) return;

    tweenRef.current?.kill();
    scaleTweenRef.current?.kill();
    scaleProxy.current.value = stateRef.current.currentScale;

    stateRef.current.activeZone = 'overview';

    scaleTweenRef.current = gsap.to(scaleProxy.current, {
      value: 1,
      duration: 1.15,
      ease: 'expo.inOut',
      onUpdate: () => onScaleUpdate(scaleProxy.current.value),
    });

    tweenRef.current = gsap.to(sceneRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 1.15,
      ease: 'expo.inOut',
      force3D: true,
      onComplete: () => {
        stateRef.current.currentScale = 1;
      },
    });
  }, [sceneRef]);

  const getState = useCallback(() => stateRef.current, []);

  return { zoomTo, resetCamera, handleMouseMove, getState };
}
