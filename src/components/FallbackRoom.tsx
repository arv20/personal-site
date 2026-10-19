import type { ReactNode } from 'react';

/**
 * FallbackRoom — procedural dark isometric wireframe blueprint
 * Renders when /room-bg.jpg is not placed in /public yet.
 * Visually represents the 2.5D room layout with illuminated zones.
 */
export function FallbackRoom() {
  const gridLines: ReactNode[] = [];
  const w = 1920;
  const h = 1080;

  // Floor isometric tile grid
  for (let i = -10; i <= 35; i++) {
    const x = i * 80;
    // Diagonal 1
    gridLines.push(
      <line
        key={`d1-${i}`}
        x1={x}
        y1={h * 0.38}
        x2={x - 600}
        y2={h}
        stroke="rgba(255,255,255,0.035)"
        strokeWidth="1"
      />
    );
    // Diagonal 2
    gridLines.push(
      <line
        key={`d2-${i}`}
        x1={x}
        y1={h * 0.38}
        x2={x + 600}
        y2={h}
        stroke="rgba(255,255,255,0.035)"
        strokeWidth="1"
      />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-full select-none"
      style={{ background: '#070709' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Ambient room gradients */}
        <radialGradient id="deskGlow" cx="34%" cy="46%" r="25%">
          <stop offset="0%" stopColor="rgba(34,197,94,0.12)" />
          <stop offset="70%" stopColor="rgba(34,197,94,0.02)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="tvGlow" cx="72%" cy="40%" r="25%">
          <stop offset="0%" stopColor="rgba(59,130,246,0.12)" />
          <stop offset="70%" stopColor="rgba(59,130,246,0.02)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="roomGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="wallLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
        </linearGradient>
      </defs>

      {/* Ambient background glows */}
      <rect width={w} height={h} fill="url(#roomGlow)" />
      <rect width={w} height={h} fill="url(#deskGlow)" />
      <rect width={w} height={h} fill="url(#tvGlow)" />

      {/* Isometric Floor Base */}
      <path
        d={`M180,${h * 0.38} L960,${h * 0.22} L1740,${h * 0.38} L960,${h * 0.96} Z`}
        fill="rgba(12,12,16,0.95)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1.5"
      />

      {/* Floor Grid Lines */}
      <g opacity="0.75">{gridLines}</g>

      {/* Room Walls */}
      {/* Back Corner Apex */}
      <line
        x1={960}
        y1={60}
        x2={960}
        y2={h * 0.22}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
      />
      {/* Left Wall Top Edge */}
      <line
        x1={180}
        y1={h * 0.2}
        x2={960}
        y2={60}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
      />
      {/* Right Wall Top Edge */}
      <line
        x1={960}
        y1={60}
        x2={1740}
        y2={h * 0.2}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
      />
      {/* Left Wall Left Edge */}
      <line
        x1={180}
        y1={h * 0.2}
        x2={180}
        y2={h * 0.38}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1.5"
      />
      {/* Right Wall Right Edge */}
      <line
        x1={1740}
        y1={h * 0.2}
        x2={1740}
        y2={h * 0.38}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1.5"
      />

      {/* ═══════════════════════════════════
          ZONE 3: WALL POSTERS (x: 29%, y: 24%)
          ═══════════════════════════════════ */}
      <g transform="translate(480, 210) skewY(12)">
        {/* Poster 1: OSU Buckeyes Pennant / Banner */}
        <rect
          x="0"
          y="0"
          width="110"
          height="140"
          fill="rgba(187, 0, 0, 0.15)"
          stroke="rgba(187, 0, 0, 0.45)"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x="55"
          y="45"
          fill="#ef4444"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
          letterSpacing="0.1em"
        >
          OHIO STATE
        </text>
        <text
          x="55"
          y="65"
          fill="rgba(255,255,255,0.6)"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          BUCKEYES CSE
        </text>
        <circle cx="55" cy="98" r="16" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="1" />
        <text x="55" y="103" fill="#ef4444" fontSize="14" textAnchor="middle">🌰</text>

        {/* Poster 2: Chelsea FC Banner */}
        <rect
          x="130"
          y="-15"
          width="95"
          height="125"
          fill="rgba(37, 99, 235, 0.15)"
          stroke="rgba(59, 130, 246, 0.45)"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x="177"
          y="25"
          fill="#60a5fa"
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
          letterSpacing="0.1em"
        >
          CHELSEA FC
        </text>
        <text
          x="177"
          y="42"
          fill="rgba(255,255,255,0.5)"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
        >
          KTBFFH • 2012
        </text>
        <circle cx="177" cy="75" r="16" fill="none" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
        <text x="177" y="80" fill="#60a5fa" fontSize="14" textAnchor="middle">🦁</text>

        {/* Poster 3: 2011 Hyundai Elantra Spec Sheet */}
        <rect
          x="245"
          y="-30"
          width="110"
          height="135"
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x="300"
          y="5"
          fill="#ffffff"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          2011 ELANTRA
        </text>
        <text
          x="300"
          y="20"
          fill="rgba(255,255,255,0.4)"
          fontSize="7"
          fontFamily="monospace"
          textAnchor="middle"
        >
          LIMITED SPEC SHEET
        </text>
        <line x1="260" y1="30" x2="340" y2="30" stroke="rgba(255,255,255,0.15)" />
        <text x="260" y="48" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="monospace">ENG: 1.8L I4</text>
        <text x="260" y="62" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="monospace">PWR: 148 HP</text>
        <text x="260" y="76" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="monospace">MPG: 29/40</text>
        <text x="300" y="98" fill="#ffffff" fontSize="16" textAnchor="middle">🚗</text>
      </g>

      {/* ═══════════════════════════════════
          ZONE 4: CORNER SHELF (x: 52%, y: 20%)
          ═══════════════════════════════════ */}
      <g transform="translate(930, 150)">
        {/* Upper Shelf Beam */}
        <path
          d="M0,40 L160,-20 L240,10 L80,70 Z"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Hades II Game Box */}
        <rect
          x="30"
          y="0"
          width="35"
          height="45"
          fill="rgba(234, 88, 12, 0.25)"
          stroke="rgba(249, 115, 22, 0.6)"
          strokeWidth="1"
          rx="2"
        />
        <text x="47" y="26" fill="#f97316" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">HADES II</text>

        {/* JJK Manga Volumes */}
        <rect
          x="75"
          y="-8"
          width="28"
          height="45"
          fill="rgba(168, 85, 247, 0.25)"
          stroke="rgba(192, 132, 252, 0.6)"
          strokeWidth="1"
          rx="2"
        />
        <text x="89" y="18" fill="#c084fc" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">JJK</text>

        {/* Camera Gear silhouette */}
        <rect
          x="115"
          y="-12"
          width="36"
          height="24"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1"
          rx="3"
        />
        <circle cx="133" cy="0" r="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />

        {/* Lower Shelf Beam */}
        <path
          d="M0,110 L160,50 L240,80 L80,140 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
        />
      </g>

      {/* ═══════════════════════════════════
          ZONE 1: PC WORKSTATION (x: 34%, y: 46%)
          ═══════════════════════════════════ */}
      <g transform="translate(520, 420)">
        {/* Isometric Desk Top */}
        <polygon
          points="0,90 280,-20 440,40 160,150"
          fill="rgba(18,22,25,0.95)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Desk Front Edge */}
        <polygon
          points="0,90 160,150 160,165 0,105"
          fill="rgba(10,12,15,0.95)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        {/* Desk Legs */}
        <line x1="0" y1="105" x2="0" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <line x1="160" y1="165" x2="160" y2="290" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <line x1="440" y1="55" x2="440" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

        {/* Desk Mat with green outline */}
        <polygon
          points="60,85 220,20 310,55 150,120"
          fill="rgba(34,197,94,0.06)"
          stroke="rgba(34,197,94,0.4)"
          strokeWidth="1"
        />

        {/* Monitor 1 (Main - Ultrawide curved) */}
        <g transform="translate(110, 0)">
          <rect
            x="0"
            y="-40"
            width="130"
            height="75"
            fill="rgba(8,12,10,0.95)"
            stroke="rgba(34,197,94,0.7)"
            strokeWidth="1.5"
            rx="4"
          />
          {/* Simulated IDE / Terminal code lines */}
          <line x1="12" y1="-26" x2="50" y2="-26" stroke="#22c55e" strokeWidth="2" />
          <line x1="12" y1="-14" x2="90" y2="-14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <line x1="20" y1="-4" x2="105" y2="-4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="20" y1="6" x2="70" y2="6" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="12" y1="16" x2="40" y2="16" stroke="#22c55e" strokeWidth="1.5" />
          {/* Stand */}
          <line x1="65" y1="35" x2="65" y2="55" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
          <ellipse cx="65" cy="55" rx="16" ry="6" fill="rgba(255,255,255,0.2)" />
        </g>

        {/* Monitor 2 (Vertical secondary) */}
        <g transform="translate(250, -30)">
          <rect
            x="0"
            y="-45"
            width="55"
            height="95"
            fill="rgba(8,10,14,0.95)"
            stroke="rgba(59,130,246,0.6)"
            strokeWidth="1.5"
            rx="3"
          />
          {/* Activity heatmap lines */}
          <line x1="8" y1="-30" x2="47" y2="-30" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="8" y1="-18" x2="40" y2="-18" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="8" y1="-8" x2="45" y2="-8" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="8" y1="2" x2="35" y2="2" stroke="#22c55e" strokeWidth="1" />
          {/* Stand */}
          <line x1="27" y1="50" x2="27" y2="65" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
        </g>

        {/* Keyboard & Mouse */}
        <polygon
          points="130,95 200,65 225,75 155,105"
          fill="rgba(255,255,255,0.15)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />
        <ellipse cx="245" cy="85" rx="7" ry="11" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </g>

      {/* ═══════════════════════════════════
          ZONE 2: WALL TV (x: 72%, y: 40%)
          ═══════════════════════════════════ */}
      <g transform="translate(1250, 310) skewY(-12)">
        {/* Wall TV Frame */}
        <rect
          x="0"
          y="0"
          width="260"
          height="160"
          fill="rgba(8,12,20,0.96)"
          stroke="rgba(59,130,246,0.55)"
          strokeWidth="2"
          rx="6"
        />
        {/* Screen inner border */}
        <rect
          x="8"
          y="8"
          width="244"
          height="144"
          fill="rgba(12,18,30,0.9)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        {/* TV Header telemetry */}
        <text
          x="20"
          y="30"
          fill="#60a5fa"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          letterSpacing="0.15em"
        >
          [TELEMETRY & BUILDS]
        </text>
        <circle cx="236" cy="26" r="3" fill="#22c55e" />

        {/* Spandrift Telemetry preview box */}
        <rect
          x="20"
          y="42"
          width="105"
          height="95"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.15)"
          rx="4"
        />
        <text x="28" y="58" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">SPANDRIFT</text>
        <text x="28" y="70" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">OTel Multi-Agent</text>
        <line x1="28" y1="80" x2="105" y2="80" stroke="#22c55e" strokeWidth="1.5" />
        <line x1="28" y1="92" x2="85" y2="92" stroke="#3b82f6" strokeWidth="1.5" />
        <line x1="28" y1="104" x2="98" y2="104" stroke="#a855f7" strokeWidth="1.5" />

        {/* 3D WebGL Driving preview box */}
        <rect
          x="135"
          y="42"
          width="105"
          height="95"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.15)"
          rx="4"
        />
        <text x="143" y="58" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">3D DRIVING</text>
        <text x="143" y="70" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">Three.js Ferrari</text>
        <path
          d="M145,115 Q185,85 225,105"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
        />
        <circle cx="185" cy="98" r="4" fill="#ef4444" />
      </g>

      {/* Decorative Blueprint Corner Markings */}
      <text
        x="60"
        y="80"
        fill="rgba(255,255,255,0.3)"
        fontSize="10"
        fontFamily="monospace"
        letterSpacing="0.25em"
      >
        ISOMETRIC CAD OVERLAY // GRID 0.8
      </text>
      <text
        x={w - 60}
        y="80"
        fill="rgba(255,255,255,0.3)"
        fontSize="10"
        fontFamily="monospace"
        textAnchor="end"
        letterSpacing="0.25em"
      >
        AARAVKOLGAONKAR.DEV // PATH A
      </text>

      <text
        x={w / 2}
        y={h - 30}
        textAnchor="middle"
        fill="rgba(255,255,255,0.22)"
        fontSize="10"
        fontFamily="monospace"
        letterSpacing="0.3em"
      >
        [PROCEDURAL WIREFRAME ACTIVE — PLACE ROOM-BG.JPG IN /PUBLIC TO OVERRIDE]
      </text>
    </svg>
  );
}
