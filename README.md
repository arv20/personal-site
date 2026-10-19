# Aarav’s dorm room

A meter-scale, interactive college dorm built in React, TypeScript, Vite and Three.js. The camera remains orthographic with mouse/touch orbit, arrow-key rotation and Home reset. The room has no cards or hotspot markers.

- Main room: `/`
- Frozen previous room: `/?legacy=1`
- Plain HTML portfolio (also works with JavaScript disabled): `/#/simple`
- Explicit quality choices for troubleshooting/review: `/?quality=low` and `/?quality=high`

## Development

```sh
npm ci
npm run dev
npm run build
npm run lint
npm test -- --workers=1
```

Local tests use installed Google Chrome; CI installs Playwright Chromium and tests the production bundle. The software GPU used in automated tests is considerably slower than a real GPU; tests allow its shader startup time.

## Add your artwork

Supply authorized JPEGs in `public/textures/posters/`:

- `osu-poster.jpg`
- `chelsea-poster.jpg`
- `car-poster.jpg`
- `osu-pennant.jpg`

Optional personal photos go in `public/textures/photos/corkboard-01.jpg` and `corkboard-02.jpg`. Use ≤2k images (<350 KB per poster, <100 KB per photo recommended). The loader preserves aspect ratio, sets sRGB/mipmaps/device anisotropy, and handles errors/timeouts with neutral paper. Development shows ADD IMAGE; production does not invent substitute art. Legacy artwork is retained only in the legacy scene.

There is no supplied résumé file; the HTML page currently offers an email request. Replace that anchor in `index.html` when a public file is available. Trove is listed without a fabricated URL. LinkedIn retains the existing profile URL because automated access returns 999, not a verified missing page.

## Implementation

- `src/components/RoomScene.tsx`: renderer, camera easing/orbit, motion preferences, frame-rate sampling, quality tier, asset progress and GPU cleanup.
- `src/scene/dorm/shell.ts`: 3.9 × 2.9 × 2.4 m CMU/VCT shell with actual window opening.
- `furniture.ts`, `cloth.ts`, `props.ts`: measured furniture, textile folds and belongings.
- `materials.ts`: deterministic color, roughness, bump and fabric maps.
- `posters.ts`: asynchronous local-art loader and curled/taped paper.
- `lighting.ts`: warm/cool practicals, contact masks and static second-UV AO.
- `post.ts`: restrained emissive bloom and vignette with Three's built-in addons.
- `src/legacy/`: unchanged prior scene, loaded only through the legacy query.
- `index.html`: real HTML portfolio/crawler content; canonical and social URLs preserved.
- `AUDIT.md`: baseline and phase reviews; `REVIEW.md`: final acceptance status and limitations.

No new framework, external asset service or runtime image hotlinks. There is no Blender bake (Blender unavailable); all scene geometry and non-art textures are procedural.

## Performance

The first two seconds of actual rendered frames after startup determine quality. Below 40 fps, rendering drops to pixel ratio 1, disables the bloom/composer and dust, and halves shadow-map dimensions. Static AO remains. Low-tier ambient animation is capped at 30 fps; input frames are not capped. Reduced motion stops idle drift, color evolution, cursor blink and dust movement; static frames redraw only on changes after the sample. Hidden tabs stop rendering. All texture/geometry/material/render-target resources are disposed on unmount.

Performance targets require actual-device verification; a 390×844 browser viewport is not an Android benchmark. No GLB or KTX2 loader is needed by this procedural asset pipeline.

## Visual review

With the production preview running on port 5173, `node scripts/capture-room.mjs test-results/review` captures both viewports and first-frame/quality metrics. Set `ROOM_QUERY='?quality=high'` to review the high tier. Phase captures are checked into `docs/review/`; open `docs/review/review.html` for the comparison gallery.

## Deployment

Pushes to `main` build, lint and run browser smoke tests before publishing through GitHub Pages. `public/CNAME` retains aaravkolgaonkar.dev. The legacy driving experiment remains in `index.driving-backup.html`.
