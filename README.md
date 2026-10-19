# Aarav’s room

A personal portfolio built as an interactive 3D room. Inspired by the object-led exploration of Drake Related and the restrained storefront design of OVO, with original procedural geometry and artwork.

## The room

Walnut desk, monitor, custom wall prints, book shelves, a turntable, lounge chair, and a window overlooking a stylized skyline. Drag to look around, click objects to explore, or use **Work**, **About**, and **Shelf**. The lighting control switches to an evening scene; Reset view returns to the original camera.

- React + TypeScript + Vite
- Three.js, physically lit materials, soft shadows, procedural canvas textures
- Lazy-loaded renderer; local still-image fallback if WebGL is unavailable
- Native accessible dialogs; keyboard navigation and focus restoration
- Reduced motion support, capped pixel ratio, rendering only when the view changes, paused rendering in hidden tabs, GPU cleanup
- GitHub activity from the checked-in data, with a visible sync date and no fabricated fallback metrics

## Development

Node 22+ recommended.

```sh
npm ci
npm run dev
npm run lint
npm run build
npm test
```

Local browser tests use installed Google Chrome. CI installs Chromium. To use Playwright Chromium locally, change `channel` in `playwright.config.ts`, or run with `CI=1` after `npx playwright install chromium`. Browser tests cover navigation, focus restoration, mobile layout, lighting, and WebGL fallback.

## Editing the room

- `src/scene/buildRoom.ts`: furniture, architecture, and object hit targets.
- `src/scene/textures.ts`: original wall prints and surface textures.
- `src/components/RoomScene.tsx`: renderer, camera, lighting, and interaction lifecycle.
- `src/components/RoomPanel.tsx`: portfolio content and activity panel.
- `src/data/room.ts`: profile links and world-space anchor positions.
- `src/index.css`: responsive page and panel styling.
- `public/room-preview.png`: still rendered from the actual scene for loading/fallback.

## Deployment

A push to `main` runs typechecking, a production build, lint, and browser smoke tests before GitHub Pages deployment. `public/CNAME` preserves **aaravkolgaonkar.dev**. The daily contribution workflow updates the local activity data.

The previous driving experiment remains archived in `index.driving-backup.html`.
