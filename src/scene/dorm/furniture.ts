import * as T from 'three';
import {box,cyl,ball,group,mesh,plane,rod,tube,v} from './geometry';
import {cloth,pillow} from './cloth';
import {texture,type Materials} from './materials';
import {screenTexture} from '../textures';

export function buildFurniture(room:T.Group,m:Materials){
  // OSU desk: 42 × 24 × 32 in, a modest laminate desktop on a drawer pedestal.
  const desk=group(room,-1.04,0,-1.105);desk.name='42-inch desk';
  box(1.067,.032,.610,0,.797,0,m.oak,desk,.004);
  box(.025,.765,.55,.495,.39,0,m.trim,desk);
  box(.31,.62,.53,-.345,.39,0,m.oak,desk);
  for(let i=0;i<3;i++){
    const z=i===2?.048:0;
    box(.293,.19,.025,-.345,.2+i*.199,.28+z,m.oak,desk);
    box(.085,.012,.019,-.345,.25+i*.199,.302+z,m.metal,desk);
    if(i===2)box(.28,.018,.47,-.345,.51,.04,m.dark,desk);
  }
  box(.64,.23,.022,.14,.67,-.278,m.oak,desk);
  const mat=m.fabric('#42484c');box(.56,.004,.28,.13,.817,.095,mat,desk,.002);
  // A 24-inch monitor, 54 cm wide; the original editor text is retained.
  box(.21,.009,.13,.12,.822,-.11,m.metal,desk);
  box(.024,.12,.024,.12,.88,-.14,m.metal,desk);
  box(.55,.325,.027,.12,1.086,-.18,m.dark,desk,.006);
  const screenMap=screenTexture();
  const screenMat=new T.MeshStandardMaterial({map:screenMap,emissiveMap:screenMap,emissive:'#acbed2',emissiveIntensity:.65,roughness:.38,roughnessMap:m.noise});
  const screen=plane(.523,.294,.12,1.088,-.165,screenMat,desk);
  const glare=texture(256,256,c=>{const g=c.createLinearGradient(0,0,256,256);g.addColorStop(0,'#bdd5ef1b');g.addColorStop(.55,'#bdd5ef00');c.fillStyle=g;c.fillRect(0,0,256,256);});
  const glareMat=new T.MeshStandardMaterial({map:glare,transparent:true,roughness:.4,roughnessMap:m.noise,depthWrite:false});
  plane(.523,.294,.12,1.088,-.164,glareMat,desk).castShadow=false;
  box(.32,.016,.105,.08,.832,.10,m.trim,desk,.004);
  for(let r=0;r<4;r++)for(let c=0;c<13;c++)box(.019,.006,.018,-.06+c*.023,.843,.065+r*.024,c===0?m.dark:m.paper,desk,.0015);
  box(.087,.006,.017,.08,.844,.156,m.paper,desk,.0015);
  const mouse=ball(.026,.35,.842,.12,m.paper,desk);mouse.scale.set(.85,.5,1.35);
  for(const x of [-.235,.465]){
    box(.075,.135,.08,x,.882,-.20,m.dark,desk,.004);
    const cone=cyl(.025,.025,.004,x,.87,-.157,m.trim,desk);cone.rotation.x=Math.PI/2;
    ball(.011,x,.916,-.155,m.dark,desk).scale.z=.2;
  }
  // Angled padded task chair, not perfectly tucked in.
  const chair=group(room,-.84,0,-.28,-.24);chair.name='desk chair';const upholstery=m.fabric('#414647');
  box(.45,.07,.43,0,.46,0,upholstery,chair,.028);
  const back=box(.43,.43,.065,0,.72,.20,upholstery,chair,.025);back.rotation.x=.10;
  for(const x of [-.18,.18])rod(v(x,.48,.17),v(x,.85,.23),.009,m.metal,chair);
  cyl(.025,.03,.30,0,.27,0,m.metal,chair);
  for(let i=0;i<5;i++){const a=i*Math.PI*.4;rod(v(0,.14,0),v(Math.cos(a)*.27,.075,Math.sin(a)*.27),.014,m.metal,chair);const wheel=cyl(.028,.028,.035,Math.cos(a)*.27,.04,Math.sin(a)*.27,m.dark,chair);wheel.rotation.z=Math.PI/2;}
  for(const x of [-.27,.27]){rod(v(x,.49,.12),v(x,.65,.10),.01,m.metal,chair);box(.045,.025,.27,x,.66,.04,m.dark,chair,.009);}
  // Twin XL: 80 × 36 × 8 in mattress, 82-inch frame. 32 cm clear storage below.
  const bed=group(room,1.37,0,.17);bed.name='Twin XL bed';
  for(const x of [-.455,.455])for(const z of [-1.04,1.04])box(.046,z<0?1.05:.60,.046,x,z<0?.525:.30,z,m.oak,bed);
  for(const x of [-.455,.455]){box(.035,.12,2.08,x,.38,0,m.oak,bed);for(const z of [-.99,.99])ball(.004,x+(x<0?-.019:.019),.40,z,m.metal,bed);}
  for(let i=0;i<12;i++)box(.89,.014,.055,0,.439,-.93+i*.169,m.oak,bed,.002);
  for(const y of [.72,.91])box(.91,.11,.025,0,y,-1.04,m.oak,bed);
  const sheet=m.fabric('#79818a');box(.914,.203,2.032,0,.548,0,sheet,bed,.028);
  box(.914,.022,2.025,0,.66,0,m.fabric('#bab7ab'),bed,.01);
  const plaid=texture(1024,1024,c=>{
    c.fillStyle='#394957';c.fillRect(0,0,1024,1024);
    for(let i=0;i<1024;i+=128){c.fillStyle='#78828a55';c.fillRect(i,0,32,1024);c.fillRect(0,i,1024,32);c.fillStyle='#182b3744';c.fillRect(i+58,0,45,1024);c.fillRect(0,i+58,1024,45);c.fillStyle='#bbb4a54a';c.fillRect(i+12,0,3,1024);c.fillRect(0,i+12,1024,3);}
  });
  const duvet=m.fabric('#b8bec4');duvet.map=plaid;
  cloth(1.18,1.55,0,.705,.30,duvet,bed,.43,.12);
  pillow(-.16,.738,-.78,.49,.32,m.fabric('#b8b7ad'),bed,.08);
  pillow(.20,.746,-.70,.46,.30,m.fabric('#7e858c'),bed,-.12);
  const throwMat=m.fabric('#8e8b80');const thrown=cloth(1.12,.45,.02,.745,.84,throwMat,bed,.42);thrown.rotation.y=.06;
  // Slumped hoodie: continuous cloth body/sleeves, one sleeve hanging over the bedside.
  const hoodie=group(bed,.27,0,.61,-.30);const red=m.fabric('#793e43');
  cloth(.43,.48,0,.78,0,red,hoodie,.25,.03);
  cloth(.15,.47,-.22,.76,.035,red,hoodie,.035).rotation.y=.34;
  const sleeve=cloth(.14,.57,.25,.74,.09,red,hoodie,.02);sleeve.rotation.y=-.30;
  const hood=mesh(new T.TorusGeometry(.075,.022,10,28),red,0,.79,-.25,hoodie);hood.rotation.x=Math.PI/2;hood.scale.set(1,.85,.55);
  tube([[-.02,.79,-.18],[-.03,.79,-.09],[-.015,.79,-.04]],.0015,m.paper,hoodie);
  box(.49,.24,.58,-.11,.145,.86,m.plain('#778079',.8),bed,.009).rotation.y=.05;
  box(.52,.018,.60,-.11,.275,.86,m.trim,bed,.006).rotation.y=.05;
  box(.12,.022,.007,-.11,.19,1.169,m.dark,bed,.003);
  box(.30,.17,.35,.26,.10,.04,m.plain('#a48561',.9),bed);box(.31,.018,.36,.26,.194,.04,m.paper,bed);
  // Microfridge and microwave stack.
  const fridge=group(room,.43,0,-1.14);fridge.name='microfridge';const enamel=m.plain('#aaaead',.65);
  box(.47,.78,.49,0,.40,0,enamel,fridge,.009);box(.445,.73,.023,0,.415,.257,enamel,fridge,.005);
  box(.021,.12,.025,.18,.65,.28,m.dark,fridge);
  box(.45,.27,.34,0,.925,-.03,enamel,fridge,.007);
  box(.32,.196,.012,-.035,.927,.148,m.dark,fridge,.004);
  box(.025,.15,.018,.14,.929,.158,m.trim,fridge);
  for(const y of [.97,.915,.86])ball(.009,.19,y,.146,m.dark,fridge).scale.z=.35;
  // Freestanding wardrobe with open shelves and hanging rail.
  const wardrobe=group(room,-1.63,0,.99,Math.PI/2);wardrobe.name='wardrobe';
  box(.68,1.78,.025,0,.90,-.265,m.oak,wardrobe);
  for(const x of [-.35,.35])box(.025,1.78,.54,x,.9,0,m.oak,wardrobe);
  for(const y of [.04,1.02,1.78])box(.70,.025,.54,0,y,0,m.oak,wardrobe);
  rod(v(-.33,.84,0),v(.33,.84,0),.012,m.metal,wardrobe);
  for(const y of [1.25,1.51])box(.70,.018,.52,0,y,0,m.oak,wardrobe);
  // Woven 5 × 8 ft rug, partly under the bed, with a lifted front corner.
  const rugMap=texture(512,768,c=>{c.fillStyle='#8c8b7f';c.fillRect(0,0,512,768);c.strokeStyle='#555e60';c.lineWidth=9;c.strokeRect(18,18,476,732);c.strokeStyle='#b4ac98';c.lineWidth=3;c.strokeRect(32,32,448,704);for(let y=0;y<768;y+=3){c.fillStyle=y%2?'#dad4bd12':'#343a3914';c.fillRect(0,y,512,1);}});
  const rugMat=m.fabric('#bdb7a7');rugMat.map=rugMap;
  const rug=cloth(1.524,2.438,-.05,.025,.13,rugMat,room,2,.035,.06);rug.rotation.y=.025;
  return {desk,bed,fridge,wardrobe,chair,screen,screenMat};
}
