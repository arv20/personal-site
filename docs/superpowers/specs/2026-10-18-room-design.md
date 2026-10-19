# Aarav's room

## Brief and direction
Replace the current wireframe portfolio with a furnished, interactive 3D room. The user's reference is the OVO / Drake storefront, with a desk and personal wall objects, and without the prominent identity card. The user authorized implementation, commit, push, and production build verification.

Reference: https://drakerelated.com/ (room exploration, object-led discovery) and https://octobersveryown.com/ (restrained storefront navigation). No brand assets are copied.

A fully rendered Three.js room is preferred over another flat illustration or a first-person game: it gives actual depth, responsive lighting and object interaction without requiring visitors to learn movement controls. Use a fixed, gently orbitable three-quarter camera, with open front walls so the desk and wall archive are visible together.

## Visual system
- Background: charcoal #171815; plaster: limestone #ada596; wood: smoked walnut #513e2c; trim: brass #b49a65; paper: ivory #eee9dc; artwork: scarlet #a73132 and Chelsea blue #214995.
- Typography: compact Arial/Helvetica for navigation, Georgia for small room caption, monospace only for incidental labels inside the scene.
- Signature: a solid, warmly lit personal studio floating on a dark backdrop. Timber floor, cream rug, walnut desk, computer, chair, lamp, framed posters, books, camera, turntable and plant.
- UI: small AK monogram; Work, About, Shelf navigation; social links; a restrained bottom room caption and lighting/reset controls. No name card, progress bars, radar, grid or fake telemetry.

## Implementation
Keep React, TypeScript and Vite. Use imperative Three.js inside a lifecycle-managed RoomScene component. Separate scene textures, model construction, scene/camera lifecycle, and React content panels. Load the 3D bundle separately. Make a static rendered room image the loading and WebGL-failure fallback, with HTML navigation always available.

Scene clicks use raycasting. Drag rotates within limits; scroll and pinch do not hijack the page. A reset button returns to the default view. A lighting toggle changes the actual scene. Respect reduced motion and suspend rendering while hidden. Cap device pixel ratio; dispose GPU resources on unmount. Use native dialogs with keyboard containment, Escape dismissal, and focus restoration.

## Content
Preserve existing public profile links, Ohio State CSE, Chelsea, 2011 Elantra, Hades II, Jujutsu Kaisen, and the Spandrift/driving projects from the repository. Do not show invented live match scores, experience details, or fabricated GitHub counts. The desk's contribution panel uses the existing checked-in data and displays its date; failures show an honest unavailable state.

## Verification and deployment
Typecheck, lint, build. Browser checks cover modal navigation and focus, Escape, lighting, reset, mobile layout, real canvas rendering and unavailable WebGL. Visually inspect desktop and mobile screenshots and iterate. Push to the connected repository's main branch as requested, watch its GitHub Pages workflow, and inspect the deployed URL. Preserve the custom domain.
