import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { Hotspot } from '../data/hotspots';

interface HotspotNodeProps {
  hotspot: Hotspot;
  isActive: boolean;
  isZoomed: boolean;
  onActivate: (hotspot: Hotspot) => void;
  pulseAll: boolean;
}

export function HotspotNode({ hotspot, isActive, isZoomed, onActivate, pulseAll }: HotspotNodeProps) {
  const [hovered, setHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<SVGSVGElement>(null);

  // Explore Room button triggers GSAP pulse on all hotspots
  useEffect(() => {
    if (!nodeRef.current) return;
    if (pulseAll) {
      gsap.fromTo(
        nodeRef.current,
        { scale: 1 },
        { scale: 1.35, duration: 0.5, ease: 'power2.inOut', yoyo: true, repeat: 3 }
      );
    }
  }, [pulseAll]);

  // Hover scale & opacity animation on the reticle
  useEffect(() => {
    if (!reticleRef.current) return;
    if (hovered || isActive) {
      gsap.to(reticleRef.current, { scale: 1.25, opacity: 1, duration: 0.25, ease: 'power2.out' });
    } else {
      gsap.to(reticleRef.current, { scale: 1, opacity: 0.55, duration: 0.25, ease: 'power2.out' });
    }
  }, [hovered, isActive]);

  if (isZoomed) return null;

  const isPC = hotspot.id === 'pc-workstation';
  const isTV = hotspot.id === 'wall-tv';
  const isPosters = hotspot.id === 'wall-posters';
  const isShelf = hotspot.id === 'corner-shelf';

  // Dynamic accent color based on target
  const accentColor = isPC ? '#22c55e' : isTV ? '#3b82f6' : isPosters ? '#ef4444' : '#a855f7';

  return (
    <div
      ref={nodeRef}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onActivate(hotspot)}
      role="button"
      tabIndex={0}
      aria-label={`${hotspot.label} — click to zoom`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate(hotspot);
        }
      }}
    >
      {/* Active Glowing Halo */}
      {isActive && (
        <div
          className="absolute inset-0 -m-3 rounded-full opacity-60 animate-ping pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* SVG Crosshair Reticle */}
      <svg
        ref={reticleRef}
        width="68"
        height="68"
        viewBox="0 0 68 68"
        className="opacity-60 transition-opacity"
        style={{
          filter: hovered || isActive
            ? `drop-shadow(0 0 10px ${accentColor})`
            : 'drop-shadow(0 0 4px rgba(255,255,255,0.4))',
        }}
      >
        {/* Outer dashed spinning ring */}
        <circle
          cx="34"
          cy="34"
          r="30"
          fill="none"
          stroke={hovered ? accentColor : 'rgba(255,255,255,0.35)'}
          strokeWidth="1"
          strokeDasharray="4 6"
          style={{
            animation: 'reticle-spin 9s linear infinite',
            transformOrigin: '34px 34px',
          }}
        />

        {/* Inner pulsing ring */}
        <circle
          cx="34"
          cy="34"
          r="19"
          fill="none"
          stroke={hovered ? accentColor : 'rgba(255,255,255,0.65)'}
          strokeWidth="1.5"
          style={{ animation: 'reticle-pulse 2s ease-in-out infinite' }}
        />

        {/* Crosshair lines with gaps for center */}
        <line x1="34" y1="4" x2="34" y2="18" stroke={hovered ? accentColor : 'white'} strokeWidth="1" opacity="0.8" />
        <line x1="34" y1="50" x2="34" y2="64" stroke={hovered ? accentColor : 'white'} strokeWidth="1" opacity="0.8" />
        <line x1="4" y1="34" x2="18" y2="34" stroke={hovered ? accentColor : 'white'} strokeWidth="1" opacity="0.8" />
        <line x1="50" y1="34" x2="64" y2="34" stroke={hovered ? accentColor : 'white'} strokeWidth="1" opacity="0.8" />

        {/* Center dot */}
        <circle cx="34" cy="34" r="2.5" fill={hovered ? accentColor : 'white'} />

        {/* Corner HUD brackets */}
        <path d="M10,16 L10,10 L16,10" fill="none" stroke={hovered ? accentColor : 'white'} strokeWidth="1.5" opacity="0.8" />
        <path d="M52,10 L58,10 L58,16" fill="none" stroke={hovered ? accentColor : 'white'} strokeWidth="1.5" opacity="0.8" />
        <path d="M58,52 L58,58 L52,58" fill="none" stroke={hovered ? accentColor : 'white'} strokeWidth="1.5" opacity="0.8" />
        <path d="M16,58 L10,58 L10,52" fill="none" stroke={hovered ? accentColor : 'white'} strokeWidth="1.5" opacity="0.8" />
      </svg>

      {/* Keyboard Shortcut Number Badge */}
      <div
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full border flex items-center justify-center font-mono-hud text-[8px] font-bold transition-colors"
        style={{
          background: hovered ? accentColor : 'rgba(0,0,0,0.8)',
          borderColor: hovered ? accentColor : 'rgba(255,255,255,0.4)',
          color: hovered ? '#000000' : 'rgba(255,255,255,0.8)',
        }}
      >
        {hotspot.key}
      </div>

      {/* ═══ TACTICAL HUD TOOLTIP ═══ */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full mt-2.5 whitespace-nowrap
          font-mono-hud text-[10px] tracking-[0.16em] uppercase
          bg-black/90 backdrop-blur-md border rounded-xl
          p-2.5 text-white/90 shadow-2xl
          transition-all duration-300 pointer-events-none z-30
          ${hovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}
        style={{
          borderColor: hovered ? `${accentColor}66` : 'rgba(255,255,255,0.2)',
          boxShadow: hovered ? `0 8px 30px rgba(0,0,0,0.8), 0 0 15px ${accentColor}33` : 'none',
        }}
      >
        {/* Tactical bracket title */}
        <div className="flex items-center gap-1.5 font-bold">
          <span style={{ color: accentColor }}>[</span>
          <span>{hotspot.label}</span>
          <span className="text-white/40 text-[9px]">
            {hovered ? '// CLICK TO ZOOM' : `[${hotspot.scale}X]`}
          </span>
          <span style={{ color: accentColor }}>]</span>
        </div>

        {/* Sub-label */}
        <div className="text-[9px] text-white/50 tracking-widest mt-0.5 lowercase">
          {hotspot.subtitle}
        </div>

        {/* ═══ MINI GITHUB CONTRIBUTION GRID FOR PC WORKSTATION ═══ */}
        {isPC && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-[8px] text-white/40 mb-1">
              <span>CONTRIBUTIONS</span>
              <span className="text-green-400">github.dev/arv20</span>
            </div>
            {/* 7 rows x 16 cols mini heatmap preview */}
            <div className="grid grid-cols-[repeat(16,1fr)] gap-[2px]">
              {Array.from({ length: 112 }, (_, i) => {
                const seed = (i * 37) % 100;
                const level = seed < 40 ? 0 : seed < 65 ? 1 : seed < 85 ? 2 : seed < 95 ? 3 : 4;
                const cellColors = [
                  'bg-white/10',
                  'bg-green-900/60',
                  'bg-green-600/70',
                  'bg-green-500',
                  'bg-green-400 shadow-[0_0_4px_#22c55e]',
                ];
                return (
                  <div
                    key={i}
                    className={`w-[5px] h-[5px] rounded-[1px] ${cellColors[level]}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Mini Preview for Wall TV */}
        {isTV && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[8px] text-blue-400/80">
            • Spandrift OTel • 3D Driving • Matchday
          </div>
        )}

        {/* Mini Preview for Posters */}
        {isPosters && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[8px] text-red-400/80">
            • OSU Buckeyes • Chelsea FC • '11 Elantra
          </div>
        )}

        {/* Mini Preview for Shelf */}
        {isShelf && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[8px] text-purple-400/80">
            • Hades II • Jujutsu Kaisen • Gear
          </div>
        )}
      </div>
    </div>
  );
}
