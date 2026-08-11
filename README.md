# arv20 / personal-site

3d driving portfolio site built with vanilla HTML, CSS, and Three.js. no frameworks, no build tools, no npm install—just a single index.html loading everything off CDN.

## what's in here

- **the driving part**: 1000-unit catmull-rom spline road through procedural terrain, draco-compressed ferrari GLB (with steering, brake lights, night headlights, and body roll), trees/boulders, and tire skids if you cut corners too hard.
- **audio**: engine hum generated on the fly with web audio api oscillators (pitch changes with speed, mute button in HUD).
- **github activity**: bottom right link pulls contribution stats automatically using a daily github action that dumps data to `data/github-contributions.json`.
- **controls**: WASD / Arrow keys or touch controls on mobile. mouse parallax for camera.

## tech stack

- Three.js (r160 via importmap)
- Web Audio API
- Vanilla JS / CSS
- GitHub GraphQL API + Actions (for the activity widget)

## running it

since it fetches local JSON and uses ES modules, opening index.html directly via file:// won't work due to CORS. you need to serve it:

```bash
git clone https://github.com/arv20/personal-site.git
cd personal-site
npx serve .
```

then just open http://localhost:3000.

## tweaking things

all the scene variables (road length, tree density, car physics, audio frequencies, sky colors) are right at the top of the `<script>` tag in index.html. CSS variables for colors/styling are at the top of the `<style>` block.

## license

MIT
