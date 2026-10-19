import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTexture, plasterTexture, posterTexture, rugTexture, screenTexture, woodTexture } from './textures';

export function buildRoom() {
  const room = new THREE.Group();
  const woodMap = woodTexture();
  const mat = (color: string, roughness = 0.6, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const walnut = new THREE.MeshStandardMaterial({ map: woodMap, color: '#d0b68d', roughness: 0.48 });
  const darkWood = new THREE.MeshStandardMaterial({ map: woodMap, color: '#8f8168', roughness: 0.5 });
  const plaster = new THREE.MeshStandardMaterial({ map: plasterTexture(), roughness: 0.95 });
  const black = mat('#20221f', 0.5);
  const brass = mat('#646967', 0.6, 0.25);
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
  function section() {
    const group = new THREE.Group(); room.add(group); return group;
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

  // A slightly sagging string of warm dorm lights.
  const stringPoints = Array.from({ length: 25 }, (_, i) => vec(-4.35 + i * 0.36, 4.02 - 0.19 * Math.sin(i / 24 * Math.PI), -3.02));
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stringPoints), 64, 0.009, 6, false), black, 0, 0, 0);
  for (let i = 0; i < stringPoints.length; i += 2) {
    const p = stringPoints[i];
    rod(p, vec(p.x, p.y - 0.08, p.z), 0.011, black);
    sphere(0.04, p.x, p.y - 0.12, p.z, warmGlow).scale.y = 1.35;
  }
  const pennant = canvasTexture(900, 260, ctx => {
    ctx.fillStyle = '#913d40'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(900, 130); ctx.lineTo(0, 260); ctx.fill();
    ctx.fillStyle = '#efe6d4'; ctx.font = 'bold 68px Georgia'; ctx.fillText('OHIO STATE', 42, 151);
  });
  mesh(new THREE.PlaneGeometry(2.17, 0.63), new THREE.MeshStandardMaterial({ map: pennant, transparent: true, roughness: 1, side: THREE.DoubleSide }), 3.11, 3.48, -3.03);

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
  // The standard-issue window blind is pulled up most of the way.
  for (let i = 0; i < 6; i++) box(2.65, 0.045, 0.09, 0, 1.13 - i * 0.085, 0.17, paper, windowGroup);
  rod(vec(1.4, 1.2, 0.2), vec(1.4, -0.5, 0.2), 0.008, linen, windowGroup);

  const archive = section();
  function frame(kind: 'ohio' | 'chelsea' | 'car', x: number, y: number, width: number, height: number) {
    const print = new THREE.Group(); print.position.set(x, y, -3.12);
    print.rotation.z = kind === 'ohio' ? -0.035 : kind === 'chelsea' ? 0.025 : -0.02;
    archive.add(print);
    face(width, height, 0, 0, 0.012, posterTexture(kind), print);
    const tape = mat('#d5c8a4', 0.95);
    for (const side of [-1, 1]) box(0.19, 0.09, 0.012, side * width * 0.36, height * 0.48, 0.025, tape, print).rotation.z = side * 0.28;
  }
  frame('ohio', -3.32, 2.98, 1.22, 1.62);
  frame('chelsea', -1.78, 2.98, 1.22, 1.62);
  frame('car', -0.24, 2.98, 1.12, 1.49);

  // A desk made from a single thick walnut slab, on brass/black legs.
  const desk = section();
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
  box(4.3, 0.027, 3.2, -1.0, 0.027, 0.64, rug, room, 0.03);
  const chair = new THREE.Group(); chair.position.set(-1.43, 0, -0.04); chair.rotation.y = -0.17; room.add(chair);
  const leather = mat('#424a4b', 0.95);
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

  // A simple shelf on steel brackets, over the bed.
  const shelf = section();
  box(2.16, 0.09, 0.5, 3.16, 2.7, -2.83, walnut, shelf);
  for (const x of [2.38, 3.94]) {
    rod(vec(x, 2.4, -3.09), vec(x, 2.65, -2.63), 0.018, black, shelf);
    box(0.045, 0.32, 0.035, x, 2.53, -3.10, black, shelf);
  }
  ['#a8624d', '#b7ad8f', '#455970', '#625c49', '#878a74', '#393c39'].forEach((color, i) => {
    const height = 0.44 + (i % 3) * 0.055;
    box(0.14, height, 0.3, 2.35 + i * 0.16, 2.75 + height / 2, -2.83, mat(color), shelf, 0.005);
    box(0.1, 0.018, 0.004, 2.35 + i * 0.16, 2.86, -2.675, paper, shelf);
  });
  box(0.48, 0.3, 0.25, 3.77, 2.9, -2.79, black, shelf, 0.045);
  const lens = cylinder(0.115, 0.13, 0.2, 3.77, 2.9, -2.6, black, shelf); lens.rotation.x = Math.PI / 2;
  const glass = cylinder(0.09, 0.09, 0.009, 3.77, 2.9, -2.49, mat('#263a43', 0.1, 0.6), shelf); glass.rotation.x = Math.PI / 2;

  // School-issued raised twin: chunky oak frame, storage below, rumpled cotton on top.
  const bed = section();
  for (const x of [2.02, 4.2]) for (const z of [-2.42, 2.05]) {
    box(0.12, z < 0 ? 1.6 : 0.9, 0.12, x, z < 0 ? 0.8 : 0.45, z, walnut, bed, 0.015);
  }
  for (const x of [2.03, 4.19]) box(0.10, 0.22, 4.5, x, 0.73, -0.17, walnut, bed);
  for (const y of [0.93, 1.2, 1.47]) box(2.16, 0.16, 0.075, 3.11, y, -2.42, walnut, bed, 0.012);
  box(2.13, 0.14, 4.43, 3.11, 0.81, -0.17, walnut, bed);
  box(2.08, 0.27, 4.32, 3.11, 1.015, -0.17, paper, bed, 0.10);
  const bedding = canvasTexture(512, 512, ctx => {
    ctx.fillStyle = '#455e7c'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 3) {
      ctx.fillStyle = i % 2 ? '#ffffff08' : '#00000009'; ctx.fillRect(0, i, 512, 1); ctx.fillRect(i, 0, 1, 512);
    }
    ctx.fillStyle = '#b6bec4'; ctx.fillRect(0, 405, 512, 7); ctx.fillRect(0, 424, 512, 3);
  });
  const duvet = new THREE.MeshStandardMaterial({ map: bedding, roughness: 1, side: THREE.DoubleSide });
  const duvetGeometry = new THREE.PlaneGeometry(2.55, 3.3, 30, 34);
  const vertices = duvetGeometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i), y = vertices.getY(i);
    const fold = 0.025 * Math.sin(x * 15 + y * 5) + 0.016 * Math.cos(y * 18 - x * 6);
    const drape = Math.pow(Math.max(0, Math.abs(x) - 0.96), 0.7) * 1.0;
    vertices.setZ(i, fold - drape);
  }
  duvetGeometry.computeVertexNormals();
  const blanket = mesh(duvetGeometry, duvet, 3.11, 1.19, 0.36, bed); blanket.rotation.x = -Math.PI / 2;
  const pillow = box(1.55, 0.22, 0.64, 3.06, 1.24, -1.81, paper, bed, 0.13); pillow.rotation.y = -0.05;
  box(2.14, 0.1, 0.35, 3.11, 1.24, -1.16, mat('#76899a', 1), bed, 0.05);
  // A sweatshirt tossed across the foot of the bed.
  const hoodie = new THREE.Group(); hoodie.position.set(3.25, 1.23, 1.28); hoodie.rotation.y = -0.32; bed.add(hoodie);
  const scarlet = mat('#893c3f', 1);
  box(0.69, 0.08, 0.7, 0, 0.02, 0, scarlet, hoodie, 0.08);
  box(0.23, 0.08, 0.64, -0.39, 0.02, 0.06, scarlet, hoodie, 0.07).rotation.y = -0.35;
  box(0.23, 0.08, 0.64, 0.39, 0.02, 0.06, scarlet, hoodie, 0.07).rotation.y = 0.35;
  const hood = sphere(0.2, 0, 0.055, -0.36, scarlet, hoodie); hood.scale.set(1, 0.34, 0.9);
  box(0.09, 0.006, 0.14, 0, 0.067, -0.03, paper, hoodie);
  box(1.08, 0.38, 0.78, 2.73, 0.27, 1.49, mat('#69736a'), bed, 0.03);
  box(1.12, 0.05, 0.81, 2.73, 0.48, 1.49, mat('#7e887f'), bed, 0.02);
  box(0.29, 0.05, 0.018, 2.73, 0.32, 1.89, black, bed, 0.012);
  box(0.78, 0.3, 0.62, 3.71, 0.2, 0.9, mat('#b68252'), bed);
  box(0.8, 0.04, 0.64, 3.71, 0.37, 0.9, paper, bed);

  // Mini-fridge, with a couple of magnets and a plant on top.
  const fridge = section();
  const fridgeWhite = mat('#b8bdba', 0.65);
  box(0.88, 1.2, 0.88, 1.3, 0.62, -2.57, fridgeWhite, fridge, 0.055);
  box(0.81, 1.08, 0.04, 1.3, 0.65, -2.1, paper, fridge, 0.025);
  box(0.055, 0.28, 0.045, 1.61, 0.98, -2.06, black, fridge, 0.015);
  box(0.18, 0.23, 0.01, 1.18, 0.87, -2.07, mat('#d6bd78'), fridge).rotation.z = -0.14;
  sphere(0.023, 1.18, 0.95, -2.05, scarlet, fridge);
  // Corkboard: pinned schedule and snapshots, rather than a UI card.
  box(0.91, 1.02, 0.06, 1.24, 2.9, -3.08, walnut);
  box(0.83, 0.94, 0.015, 1.24, 2.9, -3.04, mat('#a68a58', 1));
  const noteTexture = canvasTexture(300, 380, ctx => {
    ctx.fillStyle = '#e7dfbc'; ctx.fillRect(0, 0, 300, 380);
    ctx.fillStyle = '#41515f'; ctx.font = 'bold 35px monospace'; ctx.fillText('THIS WEEK', 24, 58);
    ctx.font = '22px monospace'; ['CSE notes', 'problem set', 'laundry...', 'call home'].forEach((line, i) => ctx.fillText(line, 24, 122 + i * 55));
  });
  face(0.43, 0.55, 1.08, 2.96, -3.021, noteTexture, room).rotation.z = 0.08;
  sphere(0.024, 1.07, 3.19, -2.997, scarlet);
  box(0.25, 0.3, 0.012, 1.46, 2.73, -3.015, paper).rotation.z = -0.12;
  box(0.2, 0.19, 0.015, 1.45, 2.76, -3.003, mat('#6e818c')).rotation.z = -0.12;

  // Textbooks, a water bottle, and loose sheets on the desk.
  for (let i = 0; i < 3; i++) {
    box(0.57, 0.07, 0.43, -3.55, 1.49 + i * 0.075, -2.18, mat(['#556977', '#a8674e', '#c9bd9c'][i]), desk, 0.005).rotation.y = i * 0.1;
  }
  cylinder(0.09, 0.09, 0.42, -3.6, 1.67, -1.46, mat('#54767e'), desk);
  cylinder(0.067, 0.067, 0.045, -3.6, 1.9, -1.46, black, desk);
  box(0.42, 0.004, 0.3, -2.7, 1.463, -1.28, paper, desk).rotation.y = -0.21;
  // Headphones hung on the desk edge.
  const headphoneBand = mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 32, Math.PI), black, 0.57, 1.32, -1.06);
  headphoneBand.rotation.z = 0.22;
  for (const x of [0.42, 0.72]) box(0.1, 0.19, 0.09, x, 1.2, -1.06, black, room, 0.04);

  // Canvas laundry hamper with an open top and clothes poking out.
  const hamper = new THREE.Group(); hamper.position.set(-3.8, 0, 1.47); room.add(hamper);
  const canvas = mat('#a4a69a', 1);
  mesh(new THREE.CylinderGeometry(0.4, 0.31, 0.73, 32, 1, true), canvas, 0, 0.4, 0, hamper);
  const rim = mesh(new THREE.TorusGeometry(0.4, 0.02, 8, 40), paper, 0, 0.765, 0, hamper); rim.rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const clothes = sphere(0.19, Math.sin(i * 2) * 0.17, 0.7 + i % 2 * 0.05, Math.cos(i * 2) * 0.16, mat(['#babebd', '#465a72', '#c3b5a3', '#7c4645'][i]), hamper);
    clothes.scale.y = 0.5;
  }
  // Backpack dropped beside the desk chair.
  const backpack = new THREE.Group(); backpack.position.set(-0.22, 0, 0.19); backpack.rotation.y = -0.25; room.add(backpack);
  const bag = mat('#354438', 1);
  box(0.6, 0.77, 0.3, 0, 0.42, 0, bag, backpack, 0.13);
  box(0.45, 0.3, 0.16, 0, 0.3, 0.18, bag, backpack, 0.06);
  box(0.42, 0.012, 0.015, 0, 0.45, 0.26, paper, backpack);
  const loop = mesh(new THREE.TorusGeometry(0.09, 0.017, 8, 24, Math.PI), black, 0, 0.8, 0, backpack);
  loop.scale.y = 0.7;
  // Everyday sneakers next to the bed.
  for (const x of [1.22, 1.64]) {
    box(0.27, 0.085, 0.63, x, 0.08, 2.1, paper, room, 0.07).rotation.y = -0.17;
    box(0.24, 0.18, 0.48, x, 0.19, 2.05, mat('#576171'), room, 0.09).rotation.y = -0.17;
    for (let i = 0; i < 3; i++) rod(vec(x - 0.06, 0.285, 2.04 + i * 0.055), vec(x + 0.07, 0.285, 2.04 + i * 0.055), 0.008, paper);
  }
  const ball = sphere(0.24, -2.65, 0.26, 2.55, mat('#95613b', 0.95));
  for (let i = 0; i < 3; i++) {
    const seam = mesh(new THREE.TorusGeometry(0.242, 0.004, 6, 64), black, 0, 0, 0, ball);
    if (i === 1) seam.rotation.x = Math.PI / 2; if (i === 2) seam.rotation.y = Math.PI / 2;
  }

  // Broad leaves modelled individually around stems.
  const plant = new THREE.Group(); plant.position.set(1.3, 1.23, -2.57); plant.scale.setScalar(0.4); room.add(plant);
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
  const clock = new THREE.Group(); clock.position.set(0.9, 3.72, -3.06); room.add(clock);
  const dial = cylinder(0.26, 0.26, 0.05, 0, 0, 0, brass, clock); dial.rotation.x = Math.PI / 2;
  const clockFace = cylinder(0.235, 0.235, 0.012, 0, 0, 0.03, paper, clock); clockFace.rotation.x = Math.PI / 2;
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const tick = box(0.012, 0.03, 0.009, Math.sin(angle) * 0.203, Math.cos(angle) * 0.203, 0.043, black, clock);
    tick.rotation.z = -angle;
  }
  rod(vec(0, 0, 0.05), vec(0.09, 0.1, 0.05), 0.009, black, clock);
  rod(vec(0, 0, 0.055), vec(-0.12, 0.12, 0.055), 0.007, black, clock);

  return { room };
}
