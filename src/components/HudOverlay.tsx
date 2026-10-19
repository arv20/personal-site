import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Mail, Crosshair } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import type { ActiveZone } from '../data/hotspots';
import { HOTSPOTS } from '../data/hotspots';
import { useDailyProgress } from '../hooks/useDailyProgress';

interface HudOverlayProps {
  activeZone: ActiveZone;
  currentScale: number;
  onReset: () => void;
  onZonePick: (id: string) => void;
  onExploreRoom: () => void;
}

export function HudOverlay({
  activeZone,
  currentScale,
  onReset,
  onZonePick,
  onExploreRoom,
}: HudOverlayProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const progress = useDailyProgress();
  const isZoomed = activeZone !== 'overview';

  // Live mouse telemetry calculation
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = Math.round(((e.clientX / window.innerWidth) - 0.5) * 200);
      const y = Math.round(((e.clientY / window.innerHeight) - 0.5) * -200);
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Animate identity card down and fade it out on zoom; restore on overview
  useEffect(() => {
    if (!cardRef.current) return;
    if (isZoomed) {
      gsap.to(cardRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          if (cardRef.current) cardRef.current.style.pointerEvents = 'none';
        },
      });
    } else {
      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.25,
        onStart: () => {
          if (cardRef.current) cardRef.current.style.pointerEvents = 'auto';
        },
      });
    }
  }, [isZoomed]);

  const formatCoord = (v: number) =>
    v >= 0 ? `+${String(v).padStart(3, '0')}` : `-${String(Math.abs(v)).padStart(3, '0')}`;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* ═══════════════════════════════════
          VIEWFINDER CORNER BRACKETS
          ═══════════════════════════════════ */}
      {/* Top-Left */}
      <svg className="absolute top-5 left-5 w-8 h-8 opacity-40" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M0,14 L0,0 L14,0" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
      {/* Top-Right */}
      <svg className="absolute top-5 right-5 w-8 h-8 opacity-40" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M18,0 L32,0 L32,14" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
      {/* Bottom-Left */}
      <svg className="absolute bottom-5 left-5 w-8 h-8 opacity-40" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M0,18 L0,32 L14,32" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
      {/* Bottom-Right */}
      <svg className="absolute bottom-5 right-5 w-8 h-8 opacity-40" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M18,32 L32,32 L32,18" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>

      {/* ═══════════════════════════════════
          TOP-LEFT READOUT
          ═══════════════════════════════════ */}
      <div className="absolute top-6 left-16 font-mono-hud text-[10px] tracking-[0.18em] text-white/50 uppercase leading-relaxed select-none">
        <div>POS: [X: {formatCoord(mousePos.x)}, Y: {formatCoord(mousePos.y)}]</div>
        <div className="text-white/30 text-[9px] mt-0.5">COLUMBUS, OH // EST</div>
      </div>

      {/* ═══════════════════════════════════
          TOP-RIGHT READOUT
          ═══════════════════════════════════ */}
      <div className="absolute top-6 right-16 font-mono-hud text-[10px] tracking-[0.18em] text-white/50 uppercase text-right leading-relaxed select-none">
        <div>[ZOOM: {currentScale.toFixed(1)}x]</div>
        {isZoomed && (
          <button
            className="mt-1.5 pointer-events-auto text-white/70 hover:text-white transition-colors border border-white/20 hover:border-white/60 bg-black/40 hover:bg-white/10 rounded-full px-3.5 py-1 text-[9px] tracking-[0.15em] flex items-center gap-1.5 ml-auto"
            onClick={onReset}
          >
            <span>[ ← ESC // BACK TO OVERVIEW ]</span>
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════
          CENTRAL IDENTITY CARD (Aarav Kolgaonkar)
          ═══════════════════════════════════ */}
      <div
        ref={cardRef}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-transform select-none"
      >
        {/* Signature Double White Border Card */}
        <div
          className="relative pointer-events-auto transition-transform hover:scale-[1.01]"
          style={{
            padding: '4px',
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.65)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 255, 255, 0.05)',
          }}
        >
          <div
            className="px-12 py-8 text-center backdrop-blur-md"
            style={{
              background: 'rgba(8, 8, 8, 0.9)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.22)',
            }}
          >
            <span className="block font-mono-hud text-xs tracking-[0.28em] text-neutral-400 uppercase mb-3">
              SWE STUDENT @ OSU
            </span>
            <h1 className="block font-serif-display text-4xl md:text-5xl italic font-normal text-white tracking-tight">
              Aarav Kolgaonkar
            </h1>
          </div>
        </div>

        {/* 4 Action Pills */}
        <nav className="flex items-center gap-2.5 pointer-events-auto flex-wrap justify-center">
          <a
            href="https://github.com/arv20"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-white/20 hover:border-white/60 bg-black/40 hover:bg-white/10 rounded-full px-5 py-1.5 font-mono-hud text-xs text-white/70 hover:text-white transition-all shadow-sm"
          >
            <GithubIcon className="w-3.5 h-3.5" /> github ↗
          </a>
          <a
            href="https://www.linkedin.com/in/aarav-kolgaonkar-b1264b369/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-white/20 hover:border-white/60 bg-black/40 hover:bg-white/10 rounded-full px-5 py-1.5 font-mono-hud text-xs text-white/70 hover:text-white transition-all shadow-sm"
          >
            <LinkedinIcon className="w-3.5 h-3.5" /> linkedin ↗
          </a>
          <a
            href="mailto:aarav.kolgaonkar@gmail.com"
            className="flex items-center gap-2 border border-white/20 hover:border-white/60 bg-black/40 hover:bg-white/10 rounded-full px-5 py-1.5 font-mono-hud text-xs text-white/70 hover:text-white transition-all shadow-sm"
          >
            <Mail size={13} /> email ↗
          </a>
          <button
            onClick={onExploreRoom}
            className="flex items-center gap-2 border border-white/40 hover:border-white/90 bg-white/10 hover:bg-white/20 rounded-full px-5 py-1.5 font-mono-hud text-xs text-white font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            <Crosshair size={13} className="text-green-400" /> explore room ⌖
          </button>
        </nav>
      </div>

      {/* ═══════════════════════════════════
          BOTTOM LIVE DAILY PROGRESS BAR
          ═══════════════════════════════════ */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 pointer-events-auto select-none">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 font-mono-hud text-[10px] tracking-[0.16em] text-white/70 uppercase">
            <div
              className="w-2 h-2 rounded-full bg-green-500"
              style={{ animation: 'pulse-glow 2s infinite' }}
            />
            DAILY PROGRESS
          </div>
          <div className="font-mono-hud text-[10px] tracking-[0.12em] text-white/80 tabular-nums">
            <span className="font-semibold text-white">{progress.formatted}</span>
            <span className="text-white/40 ml-3">{progress.countdownFormatted}</span>
          </div>
        </div>

        {/* 3px Height Track */}
        <div className="relative w-full h-[3px] bg-white/15 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-white rounded-full transition-[width] duration-1000 ease-linear"
            style={{
              width: `${progress.percent}%`,
              boxShadow: '0 0 10px rgba(255,255,255,0.7)',
            }}
          />
        </div>

        {/* Sub-caption */}
        <div className="text-center mt-2.5 font-mono-hud text-[9px] tracking-[0.22em] text-white/30 uppercase">
          POS [0,0] // CLICK ANY HIGHLIGHTED OBJECT OR PRESS [1-4] TO ENTER ACTIVE CAMERA
        </div>
      </div>

      {/* ═══════════════════════════════════
          BOTTOM-RIGHT RADAR MINI-MAP
          ═══════════════════════════════════ */}
      <div className="absolute bottom-16 right-6 pointer-events-auto select-none">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 96 96" className="w-full h-full">
            {/* Background disc */}
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="rgba(5, 5, 8, 0.85)"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1"
            />
            {/* Range rings */}
            <circle cx="48" cy="48" r="30" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.75" />
            <circle cx="48" cy="48" r="16" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="0.75" />
            {/* Crosshairs */}
            <line x1="48" y1="4" x2="48" y2="92" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.75" />
            <line x1="4" y1="48" x2="92" y2="48" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.75" />

            {/* Sweeping scanline */}
            <line
              x1="48"
              y1="48"
              x2="48"
              y2="4"
              stroke="rgba(34, 197, 94, 0.55)"
              strokeWidth="1.5"
              style={{
                transformOrigin: '48px 48px',
                animation: 'radar-sweep 3.5s linear infinite',
              }}
            />

            {/* 4 Interactive Hotspot Dots */}
            {HOTSPOTS.map((h) => {
              const rx = 8 + (h.x / 100) * 80;
              const ry = 8 + (h.y / 100) * 80;
              const isActive = activeZone === h.id;
              return (
                <g key={h.id} className="cursor-pointer" onClick={() => onZonePick(h.id)}>
                  <circle
                    cx={rx}
                    cy={ry}
                    r={isActive ? '4.5' : '3'}
                    fill={isActive ? '#22c55e' : 'rgba(255, 255, 255, 0.65)'}
                    stroke={isActive ? '#ffffff' : 'rgba(0, 0, 0, 0.8)'}
                    strokeWidth="1"
                    style={{
                      filter: isActive ? 'drop-shadow(0 0 6px #22c55e)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                  <text
                    x={rx}
                    y={ry - 6}
                    fill={isActive ? '#22c55e' : 'rgba(255, 255, 255, 0.4)'}
                    fontSize="7"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {h.key}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="text-center font-mono-hud text-[8px] tracking-[0.2em] text-white/35 uppercase mt-1">
            NAVIGATION MAP
          </div>
        </div>
      </div>
    </div>
  );
}
