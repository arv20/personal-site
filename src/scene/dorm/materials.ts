import * as T from 'three';

export function texture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, color = true) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const c = canvas.getContext('2d'); if (!c) throw new Error('Canvas unavailable'); draw(c);
  const t = new T.CanvasTexture(canvas); t.colorSpace = color ? T.SRGBColorSpace : T.NoColorSpace;
  t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t;
}
export function seeded(seed = 47) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
export function materials() {
  const noise = texture(256, 256, c => {
    const r=seeded(); c.fillStyle='#b5b5b5';c.fillRect(0,0,256,256);
    for(let i=0;i<21000;i++){const v=130+r()*100;c.fillStyle=`rgb(${v},${v},${v})`;c.fillRect(r()*256,r()*256,1+r()*3,1+r()*2);}
  },false);
  const albedo = texture(256,256,c=>{const r=seeded(15);c.fillStyle='#c1c1c1';c.fillRect(0,0,256,256);for(let i=0;i<19000;i++){const v=187+r()*9;c.fillStyle=`rgb(${v},${v},${v})`;c.fillRect(r()*256,r()*256,1,1);}});
  const weave = texture(256,256,c=>{
    c.fillStyle='#858585';c.fillRect(0,0,256,256);
    for(let y=0;y<256;y+=4)for(let x=0;x<256;x+=4){c.fillStyle=(x+y)%8?'#9a9a9a':'#6d6d6d';c.fillRect(x,y,3,2);c.fillStyle='#ababab';c.fillRect(x,y+2,2,2);}
  },false); weave.repeat.set(5,5);
  const wood = texture(1024,256,c=>{
    const r=seeded(28);c.fillStyle='#9c7958';c.fillRect(0,0,1024,256);
    for(let i=0;i<1900;i++){const y=r()*256;c.strokeStyle=`rgba(${r()>.45?'59,39,23':'217,189,147'},${r()*.13})`;c.lineWidth=.3+r();c.beginPath();c.moveTo(0,y);c.bezierCurveTo(270,y+8,720,y-12,1024,y+3);c.stroke();}
    c.strokeStyle='#38291b25';c.lineWidth=3;c.beginPath();c.ellipse(780,140,28,36,0,0,Math.PI*1.82);c.stroke();
    const wear=c.createRadialGradient(480,150,5,480,150,180);wear.addColorStop(0,'#e2cba212');wear.addColorStop(1,'#e2cba200');c.fillStyle=wear;c.fillRect(0,0,1024,256);
  });
  const wall = texture(1024,1024,c=>{
    const r=seeded(71);c.fillStyle='#c1bdb0';c.fillRect(0,0,1024,1024);
    for(let i=0;i<50000;i++){c.fillStyle=r()>.5?'#f3efdf08':'#48494008';c.fillRect(r()*1024,r()*1024,2,2);}
    c.lineWidth=2;c.strokeStyle='#8e8c822c';
    for(let y=0;y<=1024;y+=128){c.beginPath();c.moveTo(0,y);c.lineTo(1024,y);c.stroke();for(let x=((y/128)%2)*128;x<1024;x+=256){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+128);c.stroke();}}
    for(let i=0;i<25;i++){const x=r()*1024,y=770+r()*245;c.strokeStyle='#55554e0c';c.lineWidth=1+r()*3;c.beginPath();c.moveTo(x,y);c.lineTo(x+8+r()*15,y+2);c.stroke();}
  });
  const joints = texture(1024,1024,c=>{c.fillStyle='#b9b9b9';c.fillRect(0,0,1024,1024);c.strokeStyle='#979797';c.lineWidth=2;for(let y=0;y<=1024;y+=128){c.beginPath();c.moveTo(0,y);c.lineTo(1024,y);c.stroke();for(let x=((y/128)%2)*128;x<1024;x+=256)c.fillRect(x,y,2,128);}},false);
  const tile = texture(1024,1024,c=>{
    const r=seeded(81);c.fillStyle='#ada99d';c.fillRect(0,0,1024,1024);
    for(let i=0;i<65000;i++){c.fillStyle=['#77776b25','#ded9cb32','#8b8d7e32'][i%3];c.fillRect(r()*1024,r()*1024,1+r()*3,1+r()*2);}
    c.strokeStyle='#736f6327';c.lineWidth=2;
    for(let i=0;i<=1024;i+=128){c.beginPath();c.moveTo(i,0);c.lineTo(i,1024);c.moveTo(0,i);c.lineTo(1024,i);c.stroke();}
    for(let i=0;i<12;i++){c.strokeStyle='#6c685b0e';c.lineWidth=3;c.beginPath();c.ellipse(r()*1024,r()*1024,20,5,r(),0,2);c.stroke();}
  });
  const plain=(color: string,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,map:albedo,roughnessMap:noise,bumpMap:noise,bumpScale:.0003});
  const fabric=(color:string)=>new T.MeshPhysicalMaterial({color,map:albedo,roughness:.98,roughnessMap:noise,bumpMap:weave,bumpScale:.001,sheen:.35,sheenColor:new T.Color(color),sheenRoughness:1,side:T.DoubleSide});
  return {noise,weave,wood,wall,joints,tile,plain,fabric,
    oak:new T.MeshPhysicalMaterial({map:wood,roughness:.58,roughnessMap:noise,bumpMap:wood,bumpScale:.0006,clearcoat:.12,clearcoatRoughness:.6}),
    paint:new T.MeshStandardMaterial({map:wall,roughness:.95,roughnessMap:noise,bumpMap:joints,bumpScale:.0015}),
    floor:new T.MeshStandardMaterial({map:tile,roughness:.65,roughnessMap:noise,bumpMap:noise,bumpScale:.0004}),
    metal:plain('#72777b',.46,.87),dark:plain('#353b3f',.62),paper:plain('#d0c9b8',.95),trim:plain('#797b76',.85),
  };
}
export type Materials = ReturnType<typeof materials>;
