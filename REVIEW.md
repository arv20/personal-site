# Dorm rebuild review

## What is complete

- Real meter-scale shell (3.9 × 2.9 × 2.4 m), actual window opening, visible cut edges, CMU and VCT maps.
- OSU-sized desk and Twin XL mattress/frame, open storage wardrobe, microfridge/microwave.
- Small bevels on box furniture and closed cylindrical props. Woven/bump/roughness maps, metal hardware, laminate grain, fabric sheen.
- Dented pillows, rumpled plaid comforter, pulled corner, draped hoodie, towel/clothing and more than ten intentional asymmetries.
- Window, desk-lamp, string-light and monitor lighting; baked second-UV floor AO, wall contact shading and individual grounding masks.
- Local-image paper/felt system: aspect ratio, sRGB, mipmaps, max device anisotropy, tape, small curl, fallback, timeout and cleanup.
- Original drag/touch/keyboard controls and orbit limits. No current hotspots existed to preserve. No cards were reintroduced. Legacy scene remains at `?legacy=1`.
- Mild bloom/vignette, steady practical lights, subtle idle drift/window parallax, cursor blink, radial dust; reduced-motion and hidden-tab behavior.
- Automatic frame-rate quality tier plus explicit low/high overrides. Low tier uses pixel ratio 1, half shadow dimensions, no postprocessing or dust; static AO remains.
- Linked plain HTML portfolio at `/#/simple`, available without JavaScript or WebGL, with crawler-readable identity and real contact links.

## Explicit limitations / unmet acceptance items

1. **Real poster and photo images are not supplied.** Neutral placeholders are intentional. The real-art acceptance item cannot pass until the owner adds the documented local JPEGs. No team marks were invented or downloaded.
2. **No résumé file/URL is supplied.** “Request résumé” sends an email request. Trove has no verified public URL in the available repo inventory, so it is listed without a made-up link. LinkedIn returns an automation-blocking HTTP 999; its existing URL requires a human check.
3. **Photorealism is not claimed.** This is a more detailed procedural rendering with realistic proportions and local lighting; it still has a stylized appearance. Without real artwork and authored/scanned fabric/prop assets, it does not fully meet the brief's “looks photographed” ambition. The checkpoints make this visible rather than concealing it.
4. **Blender bake was optional and unavailable.** Blender is not installed. Static procedural AO/contact masks are implemented, not path-traced lightmaps.
5. **Physical Android testing is unavailable.** Desktop/phone-size screenshots and automated frame throttling verify adaptation, not the 30+ fps target on a real mid-range phone. Hardware and software-GPU measurements are reported separately below.

## Phase comparisons

Each phase was built and captured at 1440×900 and 390×844. Screenshots/metrics are under the local review directory:
`/Users/aaravk/.codex/visualizations/2026/10/19/01a1522a-dc43-7752-9468-f9f836f60551/dorm-rebuild/`

- Phase 0: baseline, unchanged.
- Phase 1: meter-scale shell, window shadows and mapped surfaces.
- Phase 2: measured furniture and fabric; corrected excessive rug waves/noisy plastic after review.
- Phase 3: personal clutter, cables, artwork loader; corrected overcurled paper and rectangular garments.
- Phase 4: practicals, contact/AO, restrained post and living details; identified excess monitor glare and slow software startup.
- Phase 5: optional Blender bake unavailable.
- Phase 6: reduced monitor glare, adaptive rendering, loading progress, HTML view and new previews.

The shell and furnishings remain visible at both sizes. On a narrow phone the full cutaway naturally occupies a smaller central area; zoom remains disabled as in the original interaction contract.

## Final verification

- Production build, TypeScript and lint pass.
- Full local browser suite: 10 passed. Includes pointer/keyboard/reset, responsive layout, original legacy route, local artwork success/failure, no-WebGL fallback, real HTML/no-JavaScript, forced low quality, and automatic downgrade under throttled frames. Touch drag was also checked through Chromium's real touch input dispatch.
- Native GPU: ANGLE Metal / Apple M3, Chrome, 1440 × 900, DPR 1. Initial render **8,436 ms**; actual two-second rendered-frame sample **60.0 fps**, high tier retained. A subsequent three-second animation frame sample was also ~60 fps. This is one local device, not a cross-device guarantee.
- SwiftShader: desktop first render **17,694 ms**, mobile viewport **13,131 ms**. Initial high-tier samples 1.3 / 2.1 fps correctly selected low quality. These figures demonstrate why software rendering needs a fallback, not mobile-device speed.
- Capture network transfer before refreshed still: 750,462 bytes. Refreshed still is ~590 KB; initial requested bundle + still remains under 1 MB transferred locally, well below the 5 MB budget. Main JS 223.30 kB (70.15 gzip), new room code 53.49 kB (18.12 gzip), shared Three/geometry 606.52 kB (151.52 gzip), CSS 3.20 kB (1.31 gzip). Legacy code is a separate lazy chunk.
- `public/og-image.jpg` regenerated directly from the new high-tier scene at **1200 × 630**, JPEG quality 88, with UI hidden. `public/room-preview.png` refreshed; legacy has its own still. Canonical, OpenGraph and Twitter domains remain aaravkolgaonkar.dev.
- Committed visual evidence lives in `docs/review/`, including desktop/mobile pairs for every implemented phase, measurements, the simple page, and `review.html` comparison gallery.
