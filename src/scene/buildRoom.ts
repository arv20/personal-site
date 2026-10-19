import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTexture, plasterTexture, posterTexture, rugTexture, screenTexture, woodTexture } from './textures';
import type { RoomSection } from '../data/room';

export function buildRoom() {
  const room = new THREE.Group();
  const interactive: THREE.Object3D[] = [];
  const woodMap = woodTexture();
  const mat = (color: string, roughness = 0.6, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const walnut = new THREE.MeshStandardMaterial({ map: woodMap, color: '#9d8874', roughness: 0.48 });
  const darkWood = new THREE.MeshStandardMaterial({ map: woodMap, color: '#51473b', roughness: 0.5 });
  const plaster = new THREE.MeshStandardMaterial({ map: plasterTexture(), roughness: 0.95 });
  const black = mat('#20221f', 0.5);
  const brass = mat('#ae9561', 0.3, 0.7);
  const chrome = mat('#999d96', 0.26, 0.85);
  const linen = mat('#aaa590', 0.95);
  const paper = mat('#e1dac6', 0.9);
  const warmGlow = new THREE.MeshBasicMaterial({ color: '#ffdc97' });

  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = room) {
    const obj = new THREE.Mesh(geometry, material);
    obj.position.set(x, y, z); obj.castShadow = true; obj.receiveShadow = true;
    parent.add(obj); return obj;
  }
  function box(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = room, radius = 0) {
    return mesh(radius ? new RoundedBoxGeometry(w, h, d, 3, radius) : new THREE.BoxGeometry(w, h, d), material, x, y, z, parent);
  }
  function cylinder(top: number, bottom: number, height: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = room) {
    return mesh(new THREE.CylinderGeometry(top, bottom, height, 32), material, x, y, z, parent);
  }
  function sphere(radius: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = room) {
    return mesh(new THREE.SphereGeometry(radius, 32, 20), material, x, y, z, parent);
  }
  function rod(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material, parent: THREE.Object3D = room) {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const obj = cylinder(radius, radius, a.distanceTo(b), mid.x, mid.y, mid.z, material, parent);
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); return obj;
  }
  const vec = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  function section(id: RoomSection) {
    const group = new THREE.Group(); group.userData.section = id; room.add(group); interactive.push(group); return group;
  }
  function face(w: number, h: number, x: number, y: number, z: number, texture: THREE.Texture, parent: THREE.Object3D, emissive = false) {
    const material = emissive ? new THREE.MeshBasicMaterial({ map: texture }) : new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
    return mesh(new THREE.PlaneGeometry(w, h), material, x, y, z, parent);
  }

  // A cutaway room, with real wall thickness and a timber foundation.
  box(9.3, 0.26, 6.6, 0, -0.18, 0, darkWood, room, 0.06);
  const floorColors = ['#a58d72', '#b39a7d', '#967c63', '#b09a7e'];
  for (let row = 0; row < 17; row++) {
    for (let col = 0; col < 4; col++) {
      const floorMat = new THREE.MeshStandardMaterial({ map: woodMap, color: floorColors[(row * 3 + col) % 4], roughness: 0.58 });
      box(2.285, 0.055, 0.377, -3.45 + col * 2.3, -0.02, -3.1 + row * 0.387, floorMat);
    }
  }
  box(9.3, 4.3, 0.18, 0, 2.13, -3.25, plaster);
  box(0.18, 4.3, 6.6, -4.65, 2.13, 0, plaster);
  box(9.12, 0.13, 0.065, 0, 0.085, -3.12, darkWood);
  box(0.065, 0.13, 6.45, -4.52, 0.085, 0, darkWood);
  box(9.35, 0.07, 0.24, 0, 4.3, -3.25, paper);
  box(0.24, 0.07, 6.6, -4.65, 4.3, 0, paper);

  // Walnut feature wall and recessed warm edge light.
  box(2.68, 4.24, 0.08, 3.17, 2.14, -3.11, darkWood);
  for (let i = 0; i < 22; i++) box(0.057, 4.2, 0.075, 1.91 + i * 0.12, 2.13, -3.04, walnut);
  box(0.025, 4.1, 0.03, 1.78, 2.16, -3.07, warmGlow);
  box(8.95, 0.026, 0.035, 0, 4.12, -3.12, warmGlow);

  // A blue-hour window inset into the left wall, with dimensional mullions.
  const windowGroup = new THREE.Group(); windowGroup.position.set(-4.54, 2.55, 0.25); windowGroup.rotation.y = Math.PI / 2; room.add(windowGroup);
  box(2.7, 2.45, 0.12, 0, 0, 0, darkWood, windowGroup);
  const cityTexture = canvasTexture(640, 640, ctx => {
    const sky = ctx.createLinearGradient(0, 0, 0, 640); sky.addColorStop(0, '#657988'); sky.addColorStop(0.65, '#a4a69c'); sky.addColorStop(1, '#7d8177');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 640, 640);
    for (let i = 0; i < 23; i++) {
      const h = 30 + ((i * 97) % 180); ctx.fillStyle = i % 2 ? '#6f7775' : '#7e8580';
      ctx.fillRect(i * 31 - 10, 640 - h, 27, h);
      ctx.fillStyle = '#c4ba8b';
      for (let j = 0; j < h / 21 - 1; j++) if ((i + j) % 3) ctx.fillRect(i * 31, 640 - h + 10 + j * 20, 4, 6);
    }
  });
  face(2.48, 2.22, 0, 0, 0.071, cityTexture, windowGroup, true);
  box(0.06, 2.3, 0.09, 0, 0, 0.12, black, windowGroup);
  box(2.5, 0.055, 0.09, 0, 0.12, 0.12, black, windowGroup);
  box(2.88, 0.095, 0.34, 0, -1.24, 0.1, walnut, windowGroup);
  // Light linen curtains, pleated instead of a flat rectangle.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const curtain = cylinder(0.07, 0.075, 2.8, side * (1.28 + i * 0.075), -0.12, 0.23, linen, windowGroup);
      curtain.scale.z = 0.7;
    }
  }
  rod(vec(-1.85, 1.36, 0.2), vec(1.85, 1.36, 0.2), 0.025, brass, windowGroup);

  const archive = section('about');
  function frame(kind: 'ohio' | 'chelsea' | 'car', x: number, y: number, width: number, height: number) {
    box(width + 0.1, height + 0.1, 0.09, x, y, -3.08, black, archive, 0.012);
    box(width + 0.035, height + 0.035, 0.025, x, y, -3.022, brass, archive);
    face(width, height, x, y, -3.003, posterTexture(kind), archive);
  }
  frame('ohio', -3.32, 2.98, 1.22, 1.62);
  frame('chelsea', -1.78, 2.98, 1.22, 1.62);
  frame('car', -0.24, 2.98, 1.12, 1.49);

  // A desk made from a single thick walnut slab, on brass/black legs.
  const desk = section('work');
  box(4.8, 0.15, 1.65, -1.55, 1.37, -1.87, walnut, desk, 0.055);
  for (const x of [-3.62, 0.5]) {
    box(0.07, 1.27, 1.35, x, 0.67, -1.87, black, desk);
    box(0.10, 0.06, 1.47, x, 0.06, -1.87, brass, desk, 0.015);
  }
  box(1.02, 0.86, 1.32, -3.01, 0.87, -1.85, darkWood, desk, 0.025);
  for (const y of [0.63, 0.97, 1.24]) {
    box(0.95, 0.018, 0.02, -3.01, y, -1.182, black, desk);
    box(0.26, 0.022, 0.045, -3.01, y + 0.11, -1.16, brass, desk, 0.008);
  }
  // Monitor, with a luminous authored code workspace.
  box(0.65, 0.035, 0.38, -1.45, 1.47, -2.1, chrome, desk, 0.035);
  box(0.075, 0.42, 0.09, -1.45, 1.68, -2.24, chrome, desk);
  box(2.17, 1.25, 0.10, -1.45, 2.18, -2.27, black, desk, 0.045);
  face(2.04, 1.12, -1.45, 2.19, -2.211, screenTexture(), desk, true);
  sphere(0.012, -1.45, 1.586, -2.209, warmGlow, desk);
  // Desk mat, individually modelled keyboard keys, and mouse.
  box(2.32, 0.018, 0.76, -1.35, 1.457, -1.62, mat('#383e34', 0.95), desk, 0.045);
  box(1.18, 0.045, 0.4, -1.57, 1.49, -1.56, mat('#b6b5a5'), desk, 0.026);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) {
    box(0.071, 0.022, 0.066, -2.09 + c * 0.085, 1.52, -1.70 + r * 0.087, c === 0 ? brass : paper, desk, 0.008);
  }
  box(0.18, 0.09, 0.28, -0.49, 1.5, -1.54, paper, desk, 0.055);
  // Speaker pair.
  for (const x of [-2.86, 0.02]) {
    box(0.32, 0.52, 0.31, x, 1.71, -2.29, black, desk, 0.025);
    const cone = cylinder(0.105, 0.105, 0.012, x, 1.68, -2.125, mat('#3f413a'), desk); cone.rotation.x = Math.PI / 2;
    const tweeter = sphere(0.041, x, 1.86, -2.123, chrome, desk); tweeter.scale.z = 0.25;
  }
  // Ceramic mug and notebook.
  const mug = cylinder(0.105, 0.09, 0.22, -0.01, 1.56, -1.49, paper, desk);
  cylinder(0.085, 0.085, 0.009, mug.position.x, 1.674, mug.position.z, mat('#2f2318'), desk);
  const handle = mesh(new THREE.TorusGeometry(0.078, 0.02, 8, 24), paper, 0.12, 1.57, -1.49, desk); handle.rotation.y = Math.PI / 2;
  const notebook = box(0.53, 0.035, 0.39, -3.2, 1.48, -1.57, mat('#b39b70'), desk, 0.01); notebook.rotation.y = 0.15;
  rod(vec(-3.37, 1.51, -1.65), vec(-3.03, 1.51, -1.56), 0.009, black, desk);

  // Articulated brass task lamp.
  cylinder(0.22, 0.25, 0.055, 0.49, 1.49, -2.03, black, desk);
  rod(vec(0.49, 1.5, -2.03), vec(0.61, 2.21, -2.12), 0.026, brass, desk);
  rod(vec(0.61, 2.21, -2.12), vec(0.28, 2.58, -2.07), 0.022, brass, desk);
  sphere(0.06, 0.61, 2.21, -2.12, black, desk);
  cylinder(0.12, 0.29, 0.2, 0.26, 2.51, -2.07, mat('#30352d'), desk);
  cylinder(0.25, 0.25, 0.012, 0.26, 2.408, -2.07, warmGlow, desk);

  // Woven rug and upholstered office chair with visible arms and casters.
  const rug = new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 1 });
  box(5.4, 0.027, 3.5, -0.1, 0.027, 0.64, rug, room, 0.03);
  const chair = new THREE.Group(); chair.position.set(-1.43, 0, -0.04); chair.rotation.y = -0.17; room.add(chair);
  const leather = mat('#514c3c', 0.88);
  box(1.04, 0.17, 0.97, 0, 0.82, 0, leather, chair, 0.12);
  box(0.99, 1.04, 0.16, 0, 1.3, 0.43, leather, chair, 0.11);
  box(0.84, 0.78, 0.07, 0, 1.31, 0.535, darkWood, chair, 0.065);
  cylinder(0.045, 0.065, 0.55, 0, 0.45, 0, chrome, chair);
  for (const x of [-0.59, 0.59]) {
    rod(vec(x, 0.84, 0.28), vec(x, 1.14, 0.24), 0.024, chrome, chair);
    box(0.13, 0.08, 0.65, x, 1.18, 0.05, leather, chair, 0.035);
  }
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    rod(vec(0, 0.22, 0), vec(Math.cos(a) * 0.6, 0.13, Math.sin(a) * 0.6), 0.032, chrome, chair);
    const wheel = cylinder(0.073, 0.073, 0.09, Math.cos(a) * 0.6, 0.08, Math.sin(a) * 0.6, black, chair); wheel.rotation.z = Math.PI / 2;
  }

  // Display shelves: books, a camera and a small sculptural object.
  const shelf = section('shelf');
  for (const y of [1.65, 2.65, 3.62]) {
    box(2.24, 0.085, 0.55, 3.07, y, -2.72, walnut, shelf, 0.018);
    box(2.06, 0.016, 0.018, 3.07, y - 0.052, -2.48, warmGlow, shelf);
  }
  function book(x: number, y: number, color: string, h = 0.54, title = '') {
    const b = box(0.13, h, 0.32, x, y + h / 2, -2.7, mat(color), shelf, 0.006);
    if (title) {
      const tx = canvasTexture(80, 320, ctx => { ctx.fillStyle = color; ctx.fillRect(0, 0, 80, 320); ctx.translate(40, 160); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillStyle = '#e7dfce'; ctx.font = '18px Georgia'; ctx.fillText(title, 0, 6); });
      face(0.118, h - 0.03, x, b.position.y, -2.534, tx, shelf);
    }
  }
  ['#8a7651', '#b7ad8f', '#474b41', '#624b43', '#878a74', '#393c39'].forEach((c, i) => book(2.23 + i * 0.15, 1.70, c, 0.44 + (i % 3) * 0.05, ['DESIGN', 'SYSTEMS', 'NOTES'][i % 3]));
  // Game and manga covers on the middle shelf.
  for (const [kind, x] of [['hades', 2.45], ['jjk', 3.08]] as const) {
    box(0.51, 0.68, 0.12, x, 3.03, -2.71, black, shelf);
    face(0.48, 0.65, x, 3.03, -2.644, posterTexture(kind), shelf);
  }
  // Camera body with a metallic lens.
  box(0.48, 0.3, 0.25, 3.7, 1.86, -2.65, black, shelf, 0.045);
  box(0.18, 0.07, 0.17, 3.7, 2.04, -2.65, black, shelf, 0.018);
  const lens = cylinder(0.116, 0.13, 0.23, 3.67, 1.87, -2.44, black, shelf); lens.rotation.x = Math.PI / 2;
  const glass = cylinder(0.093, 0.093, 0.008, 3.67, 1.87, -2.32, mat('#263a43', 0.1, 0.6), shelf); glass.rotation.x = Math.PI / 2;
  const sculpture = mesh(new THREE.TorusKnotGeometry(0.16, 0.045, 80, 12), brass, 3.47, 3.92, -2.7, shelf);
  sculpture.rotation.x = 0.4;

  // Low record console at the side of the room.
  const consoleGroup = section('shelf');
  box(2.12, 0.71, 0.87, 3.14, 0.66, -1.37, walnut, consoleGroup, 0.035);
  for (const x of [2.28, 4]) for (const z of [-1.7, -1.05]) cylinder(0.035, 0.023, 0.3, x, 0.17, z, black, consoleGroup);
  box(1.96, 0.55, 0.025, 3.14, 0.66, -0.925, darkWood, consoleGroup);
  box(0.045, 0.55, 0.06, 3.1, 0.66, -0.89, walnut, consoleGroup);
  for (let i = 0; i < 10; i++) box(0.04, 0.46, 0.05, 2.27 + i * 0.066, 0.65, -0.88, mat(['#aa956b', '#343c35', '#d4cab5'][i % 3]), consoleGroup);
  box(1.35, 0.1, 0.66, 3.13, 1.08, -1.36, black, consoleGroup, 0.025);
  cylinder(0.27, 0.27, 0.025, 2.98, 1.15, -1.36, mat('#101511', 0.3), consoleGroup);
  cylinder(0.074, 0.074, 0.027, 2.98, 1.155, -1.36, mat('#a99466'), consoleGroup);
  rod(vec(3.63, 1.17, -1.57), vec(3.54, 1.19, -1.23), 0.012, chrome, consoleGroup);
  rod(vec(3.54, 1.19, -1.23), vec(3.35, 1.19, -1.15), 0.012, chrome, consoleGroup);

  // A lounge chair, side table and a basketball; objects that make the space lived-in.
  const lounge = new THREE.Group(); lounge.position.set(2.48, 0, 1.48); lounge.rotation.y = -0.42; room.add(lounge);
  const olive = mat('#73745b', 0.98);
  box(1.38, 0.32, 1.25, 0, 0.55, 0, olive, lounge, 0.15);
  const back = box(1.39, 0.88, 0.25, 0, 1, -0.55, olive, lounge, 0.13); back.rotation.x = -0.1;
  for (const x of [-0.69, 0.69]) {
    box(0.19, 0.32, 1.24, x, 0.87, 0, olive, lounge, 0.08);
    for (const z of [-0.45, 0.46]) rod(vec(x, 0.44, z), vec(x * 1.08, 0.05, z * 1.1), 0.045, darkWood, lounge);
  }
  const cushion = box(0.66, 0.52, 0.18, 0.15, 1.04, -0.32, linen, lounge, 0.1); cushion.rotation.z = 0.12;
  cylinder(0.47, 0.47, 0.08, 0.9, 0.62, 1.6, darkWood);
  cylinder(0.09, 0.12, 0.56, 0.9, 0.31, 1.6, black);
  cylinder(0.3, 0.34, 0.04, 0.9, 0.04, 1.6, black);
  box(0.44, 0.045, 0.32, 0.91, 0.69, 1.62, paper, room, 0.009).rotation.y = 0.3;
  const ball = sphere(0.24, 3.86, 0.26, 2.55, mat('#95613b', 0.95));
  for (let i = 0; i < 3; i++) {
    const seam = mesh(new THREE.TorusGeometry(0.242, 0.004, 6, 64), black, 0, 0, 0, ball);
    if (i === 1) seam.rotation.x = Math.PI / 2; if (i === 2) seam.rotation.y = Math.PI / 2;
  }

  // Broad leaves modelled individually around stems.
  const plant = new THREE.Group(); plant.position.set(-3.8, 0, 2.15); room.add(plant);
  cylinder(0.35, 0.27, 0.55, 0, 0.31, 0, mat('#a39980', 0.95), plant);
  cylinder(0.32, 0.32, 0.025, 0, 0.59, 0, mat('#302d20'), plant);
  const leafMat = mat('#3f553b', 0.85); leafMat.side = THREE.DoubleSide;
  for (let i = 0; i < 11; i++) {
    const angle = i * 2.4, h = 0.8 + (i % 4) * 0.25;
    const endpoint = vec(Math.cos(angle) * 0.42, h + 0.5, Math.sin(angle) * 0.42);
    rod(vec(0, 0.55, 0), endpoint, 0.013, mat('#4f5937'), plant);
    const leaf = sphere(0.3, endpoint.x, endpoint.y, endpoint.z, leafMat, plant);
    leaf.scale.set(0.43, 1.2, 0.055); leaf.rotation.set(0.5 * Math.sin(angle), angle, -Math.cos(angle) * 0.55);
  }

  // Small wall clock with actual hands, a quiet architectural detail.
  const clock = new THREE.Group(); clock.position.set(1.12, 3.31, -3.06); room.add(clock);
  const dial = cylinder(0.26, 0.26, 0.05, 0, 0, 0, brass, clock); dial.rotation.x = Math.PI / 2;
  const clockFace = cylinder(0.235, 0.235, 0.012, 0, 0, 0.03, paper, clock); clockFace.rotation.x = Math.PI / 2;
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const tick = box(0.012, 0.03, 0.009, Math.sin(angle) * 0.203, Math.cos(angle) * 0.203, 0.043, black, clock);
    tick.rotation.z = -angle;
  }
  rod(vec(0, 0, 0.05), vec(0.09, 0.1, 0.05), 0.009, black, clock);
  rod(vec(0, 0, 0.055), vec(-0.12, 0.12, 0.055), 0.007, black, clock);

  return { room, interactive };
}
