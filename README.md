# aaravkolgaonkar.dev — 2.5D Spatial Portfolio ("Path A")

Interactive 2.5D spatial portfolio inspired by spatial room explorations (Drake Related style). Built with a hardware-accelerated GSAP camera rig, tactical HUD reticles, live EST telemetry, and glassmorphic zone drawers.

## Features

- **2.5D Camera Rig**: Smooth 60fps `translate3d` and `scale` matrix transforms with inverse coordinate math centering room targets on zoom.
- **Idle Mouse Parallax**: Subtle `±18px` inverse cursor parallax using `gsap.quickTo` for spatial depth.
- **Interactive Hotspot Reticles**:
  - `[1]` **PC Workstation** (`x: 34, y: 46, zoom: 2.8`): Dual-monitor setup with hover contribution grid preview, terminal modal, full GitHub heatmap, tech stack, and experience.
  - `[2]` **Wall TV** (`x: 72, y: 40, zoom: 2.6`): Featured builds (Spandrift AI tracer, 3D WebGL Driving Portfolio) and live Chelsea FC Matchday Mode.
  - `[3]` **Wall Posters** (`x: 29, y: 24, zoom: 3.0`): Personal archive (OSU Buckeyes CSE, Chelsea FC, 2011 Hyundai Elantra Limited specs).
  - `[4]` **Corner Shelf** (`x: 52, y: 20, zoom: 3.0`): Rotation & hardware (Hades II, Jujutsu Kaisen, desk gear).
- **Tactical Identity Card & HUD**: Double-border glassmorphic card (`Aarav Kolgaonkar`), live cursor coordinates (`POS [X, Y] // COLUMBUS, OH // EST`), live EST daily progress bar (`%` elapsed + midnight countdown), and sweeping SVG radar mini-map.
- **Artwork Fallback**: Procedural dark isometric CAD wireframe room SVG renders out-of-the-box until `public/room-bg.jpg` is provided.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4
- **Animation**: GSAP 3 (`gsap.quickTo`, `expo.inOut` camera easing)
- **Icons**: Lucide React + Custom SVG Brand Icons
- **Fonts**: Playfair Display / Instrument Serif (italic), JetBrains Mono (tactical HUD)

## Development

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Build production bundle to /dist
npm run build

# Preview production build locally
npm run preview
```

## Navigation Controls

- **Hover/Click**: Hover over reticles to preview, click to zoom camera into target.
- **Keys `1`-`4`**: Hot-switch camera directly between room targets.
- **Key `0` / `Esc`**: Reset camera to room overview.
- **`Shift` + `D`**: Toggle developer mode (logs clicked `(x%, y%)` coordinates to console for fine-tuning room artwork).

## Previous Portfolio Backup

The earlier single-file Three.js driving portfolio is preserved at `index.driving-backup.html`.

## License

MIT
