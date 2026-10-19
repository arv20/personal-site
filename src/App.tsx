import { useRef, useState, useEffect, useCallback } from 'react';
import { HOTSPOTS, type ActiveZone, type Hotspot } from './data/hotspots';
import { useCameraRig } from './hooks/useCameraRig';
import { HotspotNode } from './components/HotspotNode';
import { HudOverlay } from './components/HudOverlay';
import { ZoneModals } from './components/ZoneModals';
import { FallbackRoom } from './components/FallbackRoom';
import './index.css';

export default function App() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState<ActiveZone>('overview');
  const [currentScale, setCurrentScale] = useState(1);
  const [pulseAll, setPulseAll] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [roomImageLoaded, setRoomImageLoaded] = useState(false);
  const { zoomTo, resetCamera } = useCameraRig(sceneRef);

  // Check if room-bg.jpg exists in /public
  useEffect(() => {
    const img = new Image();
    img.onload = () => setRoomImageLoaded(true);
    img.onerror = () => setRoomImageLoaded(false);
    img.src = '/room-bg.jpg';
  }, []);

  // ═══ HOTSPOT ACTIVATION ═══
  const handleActivate = useCallback((hotspot: Hotspot) => {
    setActiveZone(hotspot.id as ActiveZone);
    zoomTo(hotspot, setCurrentScale);
  }, [zoomTo]);

  // ═══ RESET TO OVERVIEW ═══
  const handleReset = useCallback(() => {
    setActiveZone('overview');
    resetCamera(setCurrentScale);
  }, [resetCamera]);

  // ═══ ZONE PICK (from radar/keyboard) ═══
  const handleZonePick = useCallback((id: string) => {
    const hotspot = HOTSPOTS.find(h => h.id === id);
    if (hotspot) handleActivate(hotspot);
  }, [handleActivate]);

  // ═══ EXPLORE ROOM PULSE ═══
  const handleExploreRoom = useCallback(() => {
    setPulseAll(true);
    setTimeout(() => setPulseAll(false), 2000);
  }, []);

  // ═══ KEYBOARD NAVIGATION (1-4, 0, Escape, Shift+D) ═══
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Toggle Dev Mode: Shift + D
      if (e.key === 'D' && e.shiftKey) {
        setDevMode(prev => !prev);
        return;
      }

      // Escape key resets to overview
      if (e.key === 'Escape' && activeZone !== 'overview') {
        handleReset();
        return;
      }

      // Number keys 1-4 for direct hotspot navigation
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4) {
        const hotspot = HOTSPOTS[num - 1];
        if (hotspot) handleActivate(hotspot);
      }

      // 0 key resets to overview
      if (e.key === '0') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeZone, handleActivate, handleReset]);

  // ═══ DEV MODE: Log coordinates on room click ═══
  useEffect(() => {
    if (!devMode || !sceneRef.current) return;

    const handler = (e: MouseEvent) => {
      const rect = sceneRef.current!.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      console.log(
        `%c[DEV] Hotspot Coordinate: x: ${xPct.toFixed(1)}, y: ${yPct.toFixed(1)}`,
        'color: #22c55e; font-weight: bold; font-size: 13px;'
      );
    };

    const el = sceneRef.current;
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [devMode]);

  const isZoomed = activeZone !== 'overview';

  return (
    <div className="w-screen h-screen overflow-hidden bg-black select-none relative">
      {/* ═══ DEV MODE INDICATOR (Shift+D) ═══ */}
      {devMode && (
        <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 bg-green-500/20 border border-green-500/50 rounded-full font-mono-hud text-[11px] text-green-400 tracking-wider flex items-center gap-2 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          DEV MODE ACTIVE — Click anywhere on room image to log exact (x%, y%) to console
        </div>
      )}

      {/* ═══ LAYER 1: CAMERA RIG & SCENE (z-10) ═══ */}
      <div className="w-screen h-screen overflow-hidden flex items-center justify-center z-10 relative">
        <div
          ref={sceneRef}
          className="relative will-change-transform"
          style={{
            width: '1920px',
            height: '1080px',
            maxWidth: '177.78vh', // Maintain 16:9 aspect ratio
            maxHeight: '56.25vw',
            transformOrigin: '50% 50%',
          }}
        >
          {/* Room Background: /room-bg.jpg or Procedural Wireframe Fallback */}
          {roomImageLoaded ? (
            <img
              src="/room-bg.jpg"
              alt="Isometric dark-mode bedroom"
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <FallbackRoom />
          )}

          {/* ═══ LAYER 2: INTERACTIVE SVG RETICLE HOTSPOTS (z-20) ═══ */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {HOTSPOTS.map((hotspot) => (
              <HotspotNode
                key={hotspot.id}
                hotspot={hotspot}
                isActive={activeZone === hotspot.id}
                isZoomed={isZoomed}
                onActivate={handleActivate}
                pulseAll={pulseAll}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ LAYER 3: FOREGROUND IDENTITY CARD & TELEMETRY HUD (z-30) ═══ */}
      <HudOverlay
        activeZone={activeZone}
        currentScale={currentScale}
        onReset={handleReset}
        onZonePick={handleZonePick}
        onExploreRoom={handleExploreRoom}
      />

      {/* ═══ LAYER 4: ZOOMED-IN INTERACTIVE MODALS (z-40) ═══ */}
      <ZoneModals
        activeZone={activeZone}
        onClose={handleReset}
      />

      {/* ═══ SUBTLE CINEMATIC OVERLAYS (z-15) ═══ */}
      <div
        className="fixed inset-0 z-[15] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div
        className="fixed inset-0 z-[15] pointer-events-none opacity-10 mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
