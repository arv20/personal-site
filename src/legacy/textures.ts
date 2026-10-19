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

// Seeded texture noise stays stable across renders and lighting changes.
function randomSource(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

export function woodTexture() {
  return canvasTexture(1024, 256, ctx => {
    const rand = randomSource(48);
    ctx.fillStyle = '#71543a'; ctx.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 1400; i++) {
      const y = rand() * 256;
      ctx.strokeStyle = `rgba(${rand() > 0.5 ? '30,16,8' : '174,132,85'},${rand() * 0.16})`;
      ctx.lineWidth = rand() * 2;
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.bezierCurveTo(300, y + rand() * 12, 700, y - rand() * 12, 1024, y + rand() * 6);
      ctx.stroke();
    }
  });
}

export function plasterTexture() {
  return canvasTexture(512, 512, ctx => {
    const rand = randomSource(73);
    ctx.fillStyle = '#c6bfb0'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 35000; i++) {
      const shade = rand() > 0.5 ? 255 : 35;
      ctx.fillStyle = `rgba(${shade},${shade},${shade},${rand() * 0.045})`;
      ctx.fillRect(rand() * 512, rand() * 512, 2, 2);
    }
    ctx.strokeStyle = '#aaa79e'; ctx.lineWidth = 2;
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
      for (let x = (y / 64 % 2) * 64; x < 512; x += 128) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 64); ctx.stroke();
      }
    }
  });
}

export function rugTexture() {
  return canvasTexture(1024, 768, ctx => {
    const rand = randomSource(12);
    ctx.fillStyle = '#b6ad99'; ctx.fillRect(0, 0, 1024, 768);
    for (let i = 0; i < 55000; i++) {
      ctx.fillStyle = rand() > 0.5 ? '#c3baa5' : '#a79d89';
      ctx.fillRect(rand() * 1024, rand() * 768, 1, 3);
    }
    ctx.strokeStyle = '#5a594f'; ctx.lineWidth = 3;
    ctx.strokeRect(22, 22, 980, 724); ctx.strokeRect(29, 29, 966, 710);
    ctx.strokeStyle = '#7d7666'; ctx.lineWidth = 2;
    for (let y = 180; y < 700; y += 150) {
      ctx.beginPath(); ctx.moveTo(45, y); ctx.lineTo(979, y); ctx.stroke();
    }
  });
}

export type PosterKind = 'ohio' | 'chelsea' | 'car' | 'hades' | 'jjk';
export function posterTexture(kind: PosterKind) {
  return canvasTexture(600, 800, ctx => {
    ctx.fillStyle = kind === 'chelsea' ? '#183779' : kind === 'hades' ? '#263a30' : '#e5dfcf';
    ctx.fillRect(0, 0, 600, 800);
    ctx.textAlign = 'center';
    if (kind === 'ohio') {
      ctx.fillStyle = '#a53335'; ctx.font = 'bold 70px Georgia';
      ctx.fillText('OHIO STATE', 300, 118);
      ctx.font = '22px Arial'; ctx.fillText('COLUMBUS, OHIO', 300, 164);
      ctx.strokeStyle = '#a53335'; ctx.lineWidth = 51;
      ctx.beginPath(); ctx.moveTo(232, 250); ctx.lineTo(368, 250); ctx.lineTo(422, 308);
      ctx.lineTo(422, 490); ctx.lineTo(368, 548); ctx.lineTo(232, 548); ctx.lineTo(178, 490);
      ctx.lineTo(178, 308); ctx.closePath(); ctx.stroke();
      ctx.strokeStyle = '#e5dfcf'; ctx.lineWidth = 5; ctx.stroke();
      ctx.font = 'bold 27px Arial'; ctx.fillText('COMPUTER SCIENCE', 300, 665);
      ctx.font = '22px Georgia'; ctx.fillText('& engineering', 300, 704);
      ctx.fillRect(248, 747, 104, 3);
    } else if (kind === 'chelsea') {
      ctx.fillStyle = '#ecdfb4'; ctx.font = 'bold 66px Georgia'; ctx.fillText('CHELSEA', 300, 112);
      ctx.font = '20px Arial'; ctx.fillText('THE PRIDE OF LONDON', 300, 154);
      ctx.strokeStyle = '#a59c7d'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(300, 387, 181, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#e7e2d5';
      ctx.beginPath(); ctx.moveTo(236, 253); ctx.lineTo(181, 268); ctx.lineTo(133, 335);
      ctx.lineTo(189, 374); ctx.lineTo(214, 342); ctx.lineTo(214, 522); ctx.lineTo(386, 522);
      ctx.lineTo(386, 342); ctx.lineTo(411, 374); ctx.lineTo(467, 335); ctx.lineTo(419, 268);
      ctx.lineTo(364, 253); ctx.quadraticCurveTo(300, 303, 236, 253); ctx.fill();
      ctx.fillStyle = '#214995'; ctx.font = 'bold 106px Arial'; ctx.fillText('12', 300, 442);
      ctx.fillStyle = '#ecdfb4'; ctx.font = 'italic 40px Georgia'; ctx.fillText('Keep the blue flag', 300, 654);
      ctx.font = 'italic 40px Georgia'; ctx.fillText('flying high.', 300, 706);
      ctx.font = '18px Arial'; ctx.fillText('LONDON  •  EST. 1905', 300, 760);
    } else if (kind === 'car') {
      ctx.fillStyle = '#32362f'; ctx.font = '23px Arial'; ctx.fillText('THE DAILY DRIVER', 300, 95);
      ctx.font = 'bold 88px Georgia'; ctx.fillText('2011', 300, 200);
      ctx.strokeStyle = '#55574f'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(65, 465); ctx.lineTo(79, 406); ctx.lineTo(153, 384);
      ctx.lineTo(218, 310); ctx.lineTo(370, 310); ctx.lineTo(442, 386); ctx.lineTo(520, 406);
      ctx.lineTo(539, 465); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(182, 383); ctx.lineTo(237, 326); ctx.lineTo(356, 326);
      ctx.lineTo(411, 383); ctx.closePath(); ctx.stroke();
      [163, 438].forEach(x => { ctx.beginPath(); ctx.arc(x, 465, 41, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      ctx.font = '34px Georgia'; ctx.fillText('Hyundai Elantra', 300, 616);
      ctx.font = '20px Arial'; ctx.fillText('LIMITED / THE CAMPUS COMMUTE', 300, 662);
    } else {
      ctx.fillStyle = kind === 'hades' ? '#bda66b' : '#524564';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.arc(300, 350, 60 + i * 20, 0, Math.PI * 1.8); ctx.lineWidth = 8; ctx.strokeStyle = ctx.fillStyle; ctx.stroke();
      }
      ctx.font = 'bold 72px Georgia'; ctx.fillText(kind === 'hades' ? 'HADES' : 'JUJUTSU', 300, 650);
      ctx.font = '44px Georgia'; ctx.fillText(kind === 'hades' ? 'II' : 'KAISEN', 300, 718);
    }
  });
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
