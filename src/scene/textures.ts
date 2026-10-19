import * as THREE from 'three';

export function canvasTexture(width: number, height: number, paint: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas textures unavailable');
  paint(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function screenTexture() {
  return canvasTexture(1200, 700, ctx => {
    ctx.fillStyle = '#171e1c'; ctx.fillRect(0, 0, 1200, 700);
    ctx.fillStyle = '#222c28'; ctx.fillRect(0, 0, 1200, 56); ctx.fillRect(0, 56, 220, 644);
    ['#a96957', '#beab6b', '#819a7c'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(26 + i * 24, 27, 7, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#d3d9ca'; ctx.font = '22px monospace'; ctx.fillText('aarav / workspace', 424, 37);
    ctx.fillStyle = '#859687'; ctx.font = '20px monospace';
    ['EXPLORER', '↓ portfolio', '   room.ts', '   ideas.md', '↓ spandrift', '   traces.py', '   agents.py'].forEach((s, i) => ctx.fillText(s, 24, 110 + i * 44));
    ctx.fillStyle = '#e6e3cd'; ctx.font = '48px monospace'; ctx.fillText('Always building.', 280, 158);
    ctx.font = '23px monospace'; ctx.fillStyle = '#8e9d8d'; ctx.fillText('// software, systems & side quests', 280, 216);
    const code = ['const aarav = {', '  studying: "CSE @ Ohio State",', '  building: ["Spandrift", "this room"],', '  curiosity: Infinity,', '};', '', 'export default keepMakingThings();'];
    code.forEach((s, i) => { ctx.fillStyle = i === 0 || i === 6 ? '#bcaa78' : '#b4c5ac'; ctx.fillText(s, 280, 298 + i * 39); });
    ctx.fillStyle = '#77836c'; ctx.fillRect(0, 658, 1200, 42);
    ctx.fillStyle = '#eff0dd'; ctx.font = '19px monospace'; ctx.fillText('main*    TypeScript                                     made with curiosity', 24, 686);
  });
}
