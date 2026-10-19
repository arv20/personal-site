# Dorm room audit — 2026-10-19

Baseline: `7e3a663`, React 19 + TypeScript 6 + Vite 8, imperative Three.js 0.186. No new framework needed.

## Scene map
- `src/components/RoomScene.tsx`: renderer, orthographic camera, OrbitControls, lighting, resize, motion preference and disposal.
- `src/scene/buildRoom.ts`: all procedural furniture/architecture/props. No GLB, GLTF, Draco, Meshopt or KTX2 loaders/assets.
- `src/scene/textures.ts`: canvas wood, plaster, rug, monitor, and approximated artwork.
- `src/App.tsx`: loading/error fallback. `public/room-preview.png`: still. `public/og-image.jpg`: older social image.
- No hotspot/click handlers exist in this baseline. Removed by the preceding room-only request. Drag/touch rotate; arrow keys rotate; Home resets. Preserve this behavior, rather than resurrecting removed cards.

## Renderer
ACESFilmicToneMapping, exposure 1.12. Output color space defaults to Three's SRGBColorSpace (not explicit). Antialias true, alpha true, low-power preference. Pixel ratio capped at 1.5. PCFShadowMap, 2048² directional shadow, normalBias .035, bias -.0002, radius 4; static shadows. PMREM RoomEnvironment, environmentIntensity .28. Orthographic viewHeight max(10.8,13/aspect), camera (10,10,12), target (0,2.05,0). Azimuth .22–1.18, polar .78–1.18. Zoom/pan disabled.

## Every light
| Light | Color / ground | Intensity | Shadow |
|---|---|---:|---|
| Hemisphere | #e8e5da / #59533c | 1.45 | No |
| Directional sun | #fff0d2 | 2.2 | Yes |
| Directional window fill | #b5cce0 | 1.2 | No |
| Point desk lamp | #ffca7d | 4 | No |
| Point shelf | #ffc67c | 3 | No |
| Point wall | #ffe2ab | 3 | No |

## Materials and geometry
Most meshes use MeshStandardMaterial. MeshBasicMaterial is used for bulbs/lamp diffuser, monitor, window view and floating foundation shadow. No Lambert or Phong. No Physical materials. Wood/walls/rug/bedding use canvas color maps; remaining props generally use a flat color and constant roughness. No roughness, normal or AO maps. Most boxes have sharp edges; selected furniture is heavily rounded. Everything is procedural.

The room is 9.3 × 6.6 × 4.3 units; desk 4.8 × 1.65 × 1.37 and mattress 2.08 × 4.32 × .27. There is no consistent meter scale. Dark plank flooring, bright global fill and simplified cloth dominate the toy appearance.

## Baseline measurements
Production bundle: app 222.05 kB (69.67 gzip), room/Three 595.86 kB (151.14 gzip), CSS 1.18 kB (.57 gzip), HTML 2.04 kB. Still image 487,303 bytes. Browser transferred 708,098 bytes at both viewports.

Cold first room frame: **8,540 ms desktop (1440×900), 4,023 ms mobile viewport (390×844)**. Measured locally in headless Chrome with SwiftShader software rendering, reduced motion; these are not hardware/mobile performance claims. Zero uncaught page errors. Screenshots and raw metrics are in the linked review directory below.

## Assets and links
No supplied poster/photo files or résumé found. New scene must use neutral placeholders until provided; no generated crests. Existing generated art is retained only inside the frozen legacy scene.
GitHub `arv20` and `arv20/spandrift` verified via GitHub CLI. Trove has no matching public repo in the returned inventory; do not invent its URL. Existing LinkedIn returns HTTP 999 (automated requests blocked), not a demonstrated 404; retain existing URL and flag human verification. Email: aarav.kolgaonkar@gmail.com.
Blender not found on PATH or at /Applications/Blender.app: optional Phase 5 bake unavailable.

## Accepted implementation direction
Follow the user's supplied phased specification: meter-scale 3.9 × 2.9 × 2.4 m cutaway, off-white CMU, warm gray VCT, navy plaid bedding, asymmetric personal belongings, dusk window with warm practicals. Retain the original scene at `?legacy=1`. Use existing Three addons, procedural mapped materials and baked AO/contact masks. No new framework. One unobtrusive simple-page link is explicitly requested by the new brief; no portfolio cards return to the room.

Review images: `/Users/aaravk/.codex/visualizations/2026/10/19/01a1522a-dc43-7752-9468-f9f836f60551/dorm-rebuild/phase-0/`.

## Phase 1 review
Real-scale shell, VCT floor, CMU bump, actual window opening, 1.2 × 1.3 m glazing, uneven blind, dusk skyline, explicit sRGB/ACES and soft window shadows. Desktop/mobile screenshots in `dorm-rebuild/phase-1/`. Window projects a physically positioned light patch and framing fits both sizes. Still weak: empty room, broad fill; furniture and practical lights come in subsequent phases. Baseline/after comparison: room width now 3.9 m versus 9.3 arbitrary units; texture variation replaces wood planks. Production build/lint pass; no page errors.

## Phase 2 review
Added measured 1.067 × .610 × .813 m desk, .914 × 2.032 × .203 m Twin XL mattress, 2.08 m bed frame, .32 m storage clearance, wardrobe, microfridge/microwave and angled padded chair. All furniture boxes use millimeter bevels. Added mapped roughness, laminate grain, metal hardware, fabric weave/sheens, dented pillows, wrinkled plaid, hanging hoodie sleeve, storage, and a 1.524 × 2.438 m rug. Corrected an initially over-wavy rug and overly noisy plastic after screenshot review. Compare Phase 1/2 in the review directory. Still weak: walls and shelves lack belongings; practical lighting and contact AO are pending. Build/lint pass, zero browser errors.

## Phase 3 review
Preserved personal props and added asymmetry in more than ten places: angled chair, open drawer, plaid fold, two crooked/dented pillows, hoodie over edge, protruding bin, staggered books, tilted laptop/notebook, overlapping corkboard papers, rotated taped posters, loose cables, mismatched shoe angles, backpack lean, sock, drooping string lights and garment hangers. New `posters.ts` loads only local JPEGs, preserves aspect ratio/mipmaps/max anisotropy, handles failures without broken textures, and labels missing art only in development. The missing/supplied-image browser test passes. Removed unused approximated artwork from the new scene's source; frozen legacy retains its original look. Phase 2/3 comparisons saved at both viewports. Still weak: actual artwork absent; lighting remains broad until Phase 4. Build/lint pass; zero uncaught page errors.

## Phase 4 review
Added physically located desk spotlight, four weak steady string-light points, cool monitor spill, dim cool hemisphere, warm window key; static second-UV floor AO, wall-contact gradient and support-specific contact shadows. High tier uses Three EffectComposer with thresholded light bloom and subtle vignette; no chromatic aberration or depth-of-field blur. Added reduced-motion-aware ±0.5° idle drift, window parallax, steady light color evolution, blinking cursor, and seven radial-texture dust sprites. Phase 3/4 captures show clear practical pools and darker contacts. Still weak: monitor specular hotspot too bright; software-rendered cold start 20.9 s desktop / 14.1 s phone viewport, so Phase 6 must implement lower-quality rendering and genuine progress. These are SwiftShader timings, not real Android measurements. No uncaught errors. Build and lint pass.

## Phase 5
Optional Blender lightmap bake not run: Blender is not installed. Static AO/contact masks provide a lightweight alternative, but do not claim Blender path-traced lighting or photographic fidelity.
