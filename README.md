# Aarav’s dorm room

A full-screen, interactive 3D college dorm. The room is the entire page: no cards, navigation, social links, hotspot markers, or pop-up panels.

A study desk, raised twin bed, rumpled bedding, Ohio State and Chelsea posters, a corkboard, string lights, mini-fridge, laundry, backpack, sneakers, and books make up the scene. All geometry and artwork are created locally with Three.js and canvas textures.

## Controls

Drag with a mouse or touch to rotate. Keyboard users can focus the scene, use the arrow keys to rotate, and press **Home** to restore the original view. There are no visible overlay controls.

## Development

Node 22+ recommended.

```sh
npm ci
npm run dev
npm run lint
npm run build
npm test
```

Local browser tests use installed Google Chrome. CI installs Chromium and tests the production build. Tests cover the room-only layout, pointer/keyboard camera controls, mobile sizing, and the still-image fallback when WebGL is unavailable.

## Scene files

- `src/scene/buildRoom.ts`: dorm architecture, furniture, and belongings.
- `src/scene/textures.ts`: original posters and material textures.
- `src/components/RoomScene.tsx`: renderer, camera, lighting, and resource lifecycle.
- `src/App.tsx` and `src/index.css`: full-screen scene and accessible fallback.
- `public/room-preview.png`: actual scene render used while loading or without WebGL.

The renderer is lazy-loaded, caps pixel ratio, respects reduced motion, only draws changed frames, suspends while the tab is hidden, and disposes GPU resources on unmount.

## Deployment

Pushing to `main` runs typechecking, the production build, lint, and browser smoke tests before publishing to GitHub Pages. `public/CNAME` preserves **aaravkolgaonkar.dev**.

The earlier driving experiment remains archived in `index.driving-backup.html`.
