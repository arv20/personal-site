# ak. — Personal Portfolio

> **Engineer · Builder · Creator**

An interactive 3D driving experience built with vanilla HTML, CSS, and Three.js. No frameworks, no build tools — just a single `index.html` that loads in seconds and leaves a lasting impression.

---

## ✨ Features

### The Drive
- **Procedural winding road** — a seamless 1,000-unit CatmullRom spline (sine-envelope tapered so it loops perfectly) carved through rolling terrain, with the ground flattened to the exact spline distance
- **3D Ferrari GLB** — Draco-compressed, with a lightweight `car.glb` fallback; steering front wheels, dynamic body roll, brake lights, and headlights that come on at dusk
- **Living environment** — 600 instanced pines, 150 boulders, 35 kilometer posts, and a flock of flapping birds
- **Time-of-day cycle** — the sky eases from morning → sunset → twilight as you drive, and tire skid marks appear on the corners you cut

### Interaction
- **Keyboard** — `W` / `▲` accelerate, `S` / `▼` brake
- **Touch** — on-screen GAS / BRAKE buttons, or tap the upper / lower half of the screen
- **Mouse parallax** — the chase camera leans with your cursor
- **Engine sound** — a procedural Web Audio dual-oscillator hum, pitch-shifted by speed, with a HUD mute toggle
- **GitHub activity popup** — hover the *github* link in the bottom-right corner to see a live contribution heatmap with total, current streak, and best streak

### Atmosphere
- Film grain + CRT vignette + bottom scrim overlays
- Glassmorphism HUD with live speed / distance telemetry and an animated speed gauge
- Staggered entrance animations, `prefers-reduced-motion` support

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 3D Rendering | [Three.js r160](https://threejs.org/) (CDN via import map) |
| Model Loading | GLTFLoader + DRACOLoader |
| Effects | Vanilla WebGL (Three.js) + CSS overlays |
| Audio | Web Audio API (procedural synthesis) |
| Typography | DM Sans, DM Mono, Space Grotesk |
| Build | None — zero build step |
| Automation | GitHub Actions (daily contribution sync) |

---

## 🚀 Getting Started

No installation required — just serve the folder (needed for the ES module script and the `data/github-contributions.json` fetch):

```bash
git clone https://github.com/arv20/portfolio.git
cd portfolio
npx serve .
# → http://localhost:3000
```

---

## 📁 Project Structure

```
portfolio/
├── index.html          # Entire site — styles, markup, and script in one file
├── ferrari.glb         # Main 3D car model (Draco-compressed)
├── car.glb             # Fallback car model
├── data/
│   └── github-contributions.json   # Contribution data (synced by CI)
├── scripts/
│   └── fetch-contributions.mjs     # GitHub GraphQL fetcher
└── .github/workflows/
    └── sync-contributions.yml      # Daily contribution sync job
```

---

## ⚙️ Configuration

The scene's key tuning values live at the top of the `<script>` block in `index.html`: road length/width, spline control points, tree/rock counts, base speed, FOV warp, sky colors, and the Web Audio engine parameters. Scene colors are centralized in the `:root` CSS variables.

---

## 🔗 Links

Update the HUD links in `index.html` to point to your own profiles:

```html
<a href="https://github.com/arv20"          target="_blank" rel="noopener">github ↗</a>
<a href="https://linkedin.com/in/YOUR_ID"   target="_blank" rel="noopener">linkedin ↗</a>
<a href="mailto:aarav.kolgaonkar@gmail.com">email ↗</a>
```

The GitHub activity popup reads `data/github-contributions.json` (falling back to a public contributions API if the file is missing), so it works out of the box.

---

## 📄 License

MIT — feel free to fork, remix, and make it your own.
