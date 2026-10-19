import * as T from 'three';
import {box,cyl,ball,group,mesh,plane,rod,tube,v} from './geometry';
import {cloth} from './cloth';
import {texture,type Materials} from './materials';
import type {buildFurniture} from './furniture';
import type {artwork} from './posters';

export function buildProps(room:T.Group,m:Materials,f:ReturnType<typeof buildFurniture>,art:ReturnType<typeof artwork>){
  const {desk,wardrobe,fridge}=f;
  const red=m.fabric('#7e4147'),navy=m.fabric('#465262'),linen=m.fabric('#99998e');
  function book(p:T.Object3D,x:number,y:number,z:number,color:string,w=.17,d=.23,angle=0){
    const g=group(p,x,y,z,angle);box(w,.026,d,0,0,0,m.paper,g,.001);const cover=m.plain(color,.9);
    for(const yy of [-.016,.016])box(w+.007,.003,d+.005,0,yy,0,cover,g,.001);box(.004,.032,d,-w/2,0,0,cover,g,.001);return g;
  }
  // Task lamp points down toward the notebook and work surface.
  cyl(.056,.061,.012,-.43,.823,-.18,m.dark,desk);
  rod(v(-.43,.83,-.18),v(-.45,1.08,-.22),.007,m.metal,desk);
  rod(v(-.45,1.08,-.22),v(-.32,1.21,-.13),.006,m.metal,desk);
  ball(.015,-.45,1.08,-.22,m.dark,desk);
  const shade=cyl(.033,.075,.065,-.32,1.19,-.13,m.dark,desk,true);shade.rotation.z=-.16;
  const glow=m.plain('#c0aa80',.45);glow.emissive=new T.Color('#ffc782');glow.emissiveIntensity=3;
  cyl(.066,.066,.002,-.315,1.157,-.13,glow,desk).castShadow=false;
  // Laptop, notebook, stationery, drink and textbook stacks leave usable desk space.
  const laptop=group(desk,-.33,.831,.11,-.08);box(.22,.016,.15,0,0,0,m.metal,laptop,.005);
  box(.035,.001,.03,-.055,.009,.02,m.plain('#55746c'),laptop,.002).rotation.y=.2;
  box(.025,.001,.04,.07,.009,-.03,m.plain('#ac9e74'),laptop,.002).rotation.y=-.13;
  book(desk,-.28,.864,.13,'#727e8b',.16,.20,.075);
  rod(v(-.34,.886,.07),v(-.22,.886,.16),.002,m.dark,desk);
  for(let i=0;i<3;i++)book(desk,-.37,.833+i*.037,-.20,['#6e7a83','#8c6954','#a29b7d'][i],.16,.17,(i-1)*.04);
  for(const xx of [-.47,-.27])box(.008,.13,.08,xx,.88,-.23,m.metal,desk);
  cyl(.027,.024,.075,.43,.852,.18,m.paper,desk,true);cyl(.021,.021,.001,.43,.879,.18,m.plain('#4b392c',.4),desk);
  const handle=mesh(new T.TorusGeometry(.021,.004,8,20),m.paper,.465,.86,.18,desk);handle.rotation.y=Math.PI/2;
  cyl(.026,.026,.15,-.48,.89,.14,m.plain('#607580',.45,.2),desk);cyl(.018,.018,.012,-.48,.972,.14,m.dark,desk);
  cyl(.025,.025,.105,.42,.867,-.035,m.plain('#7d877a',.45,.65),desk);cyl(.024,.024,.003,.42,.922,-.035,m.metal,desk);
  box(.014,.002,.006,.42,.924,-.035,m.dark,desk);
  for(const [x,y] of [[-.11,.968],[.32,.966]]){const sticky=box(.045,.039,.001,x,y,-.161,m.plain('#b6ab6b',.9),desk,.0002);sticky.rotation.z=.07;}
  const phones=group(desk,.535,.74,.19,.1);
  mesh(new T.TorusGeometry(.06,.007,8,32,Math.PI),m.dark,0,0,0,phones);
  for(const x of [-.06,.06])box(.027,.065,.027,x,-.04,0,m.dark,phones,.01);
  // Visible outlet, zip-tied cables, charging lead and an intentionally loose floor run.
  box(.066,.105,.012,-.20,.24,-1.428,m.paper,room);
  for(const y of [.22,.26])for(const x of [-.211,-.189])box(.004,.01,.003,x,y,-1.42,m.dark,room,.0005);
  const strip=group(room,-.43,.036,-.94,.17);box(.23,.03,.05,0,0,0,m.paper,strip);
  for(let i=0;i<4;i++)for(const z of [-.007,.007])box(.008,.001,.003,-.085+i*.055,.016,z,m.dark,strip,.0004);
  tube([[-.19,.25,-1.41],[-.18,.08,-1.28],[-.29,.024,-1.0],[-.43,.055,-.94]],.003,m.dark,room);
  tube([[-.92,1.0,-1.30],[-.88,.74,-1.35],[-.75,.30,-1.33],[-.55,.04,-1.14],[-.42,.055,-.94]],.003,m.dark,room);
  tube([[-1.47,.83,-1.29],[-1.50,.63,-1.31],[-1.48,.08,-1.30],[-.76,.024,-1.22],[-.45,.05,-.94]],.003,m.dark,room);
  for(const y of [.35,.50,.66])rod(v(-.87,y,-1.36),v(-.81,y,-1.33),.002,m.trim,room);
  tube([[-.35,.055,-.92],[-.1,.024,-.60],[.16,.024,-.53],[.44,.024,-.78],[.89,.05,-.82],[.98,.62,-.67],[1.19,.77,-.58]],.0025,m.paper,room);
  box(.065,.006,.13,1.21,.77,-.53,m.dark,room,.008).rotation.y=.16;
  // Local artwork: no approximated team marks or substitute illustrations.
  art.poster(room,'textures/posters/osu-poster.jpg',-1.47,1.69,-1.432,.36,.51,-.035);
  art.poster(room,'textures/posters/chelsea-poster.jpg',-.98,1.74,-1.432,.37,.52,.025);
  art.poster(room,'textures/posters/car-poster.jpg',-.49,1.66,-1.432,.35,.49,-.022);
  art.poster(room,'textures/posters/osu-pennant.jpg',1.30,2.08,-1.425,.91,.29,.018,true);
  // Corkboard layers with real photos supplied separately.
  const cork=texture(256,256,c=>{c.fillStyle='#9d805b';c.fillRect(0,0,256,256);for(let i=0;i<7000;i++){c.fillStyle=i%2?'#5a472d21':'#d9ba8528';c.fillRect((i*79)%256,(i*137)%256,2,3);}});
  box(.48,.47,.018,.10,1.64,-1.43,m.oak,room);
  plane(.45,.44,.10,1.64,-1.416,new T.MeshStandardMaterial({map:cork,roughness:1,roughnessMap:m.noise,bumpMap:cork,bumpScale:.001}),room);
  const schedule=texture(256,340,c=>{c.fillStyle='#cfc9b6';c.fillRect(0,0,256,340);c.fillStyle='#4e5a60';c.font='bold 22px monospace';c.fillText('THIS WEEK',18,35);c.font='15px monospace';['MON  CSE / lab','TUE  problem set','WED  office hours','THU  study group','FRI  call home','     laundry'].forEach((s,i)=>c.fillText(s,18,79+i*39));});
  const paper=new T.MeshStandardMaterial({map:schedule,roughness:.94,roughnessMap:m.noise,bumpMap:m.noise,bumpScale:.0002});
  plane(.20,.28,-.005,1.65,-1.402,paper,room).rotation.z=.06;
  art.poster(room,'textures/photos/corkboard-01.jpg',.22,1.71,-1.399,.12,.13,-.06,false,true);
  art.poster(room,'textures/photos/corkboard-02.jpg',.23,1.51,-1.393,.11,.11,.04,false,true);
  box(.15,.044,.001,.02,1.48,-1.397,m.paper,room,.0001).rotation.z=-.1;
  for(const [x,y] of [[.0,1.78],[.23,1.80],[.22,1.56]])ball(.006,x,y,-1.385,m.plain('#824449'),room);
  // Shelf, nonuniform book spines, camera and a modest trophy.
  box(1.05,.025,.20,1.27,1.50,-1.33,m.oak,room);
  for(const x of [.83,1.69]){rod(v(x,1.32,-1.44),v(x,1.49,-1.23),.005,m.metal,room);box(.018,.19,.012,x,1.40,-1.433,m.metal,room);}
  ['#81604f','#7c837d','#5d6e7e','#aaa18b','#5b5e5b'].forEach((color,i)=>{
    const g=group(room,.83+i*.053,1.515,-1.32);g.rotation.z=(i===4?-.08:(i%2)*.025);
    const h=.20+(i%3)*.022;box(.04,h,.135,0,h/2,0,m.plain(color,.88),g,.001);
    box(.031,.002,.002,0,.06,.069,m.paper,g,.0001);
  });
  const camera=group(room,1.40,1.57,-1.30,-.09);box(.15,.09,.065,0,0,0,m.dark,camera,.005);
  const lens=cyl(.032,.035,.065,0,0,.056,m.dark,camera);lens.rotation.x=Math.PI/2;
  const glass=cyl(.027,.027,.002,0,0,.09,m.plain('#465e68',.22,.7),camera);glass.rotation.x=Math.PI/2;
  box(.075,.018,.065,1.67,1.53,-1.32,m.dark,room);rod(v(1.67,1.54,-1.32),v(1.67,1.64,-1.32),.008,m.metal,room);ball(.026,1.67,1.67,-1.32,m.plain('#a38a58',.4,.8),room);
  // Clock with raised ticks and hands.
  const clock=group(room,.15,2.13,-1.421);const rim=cyl(.105,.105,.022,0,0,0,m.trim,clock);rim.rotation.x=Math.PI/2;
  const dial=cyl(.096,.096,.003,0,0,.013,m.paper,clock);dial.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;box(.003,.009,.002,Math.sin(a)*.081,Math.cos(a)*.081,.016,m.dark,clock,.0005).rotation.z=-a;}
  rod(v(0,0,.02),v(.03,.04,.02),.002,m.dark,clock);rod(v(0,0,.022),v(-.055,.03,.022),.0015,m.dark,clock);
  // Slightly irregular runs on adhesive clips, no nails.
  const bulbs:T.Vector3[]=[];
  const points=Array.from({length:49},(_,i)=>{const x=-1.83+i*.076;const y=2.29-.06*Math.abs(Math.sin(i/16*Math.PI))-.008*Math.sin(i*.8);return [x,y,-1.40];});
  tube(points,.002,m.dark,room);
  for(let i=0;i<points.length;i+=3){const [x,y,z]=points[i];rod(v(x,y,z),v(x,y-.024,z),.002,m.dark,room);const b=ball(.009,x,y-.033,z,glow,room);b.scale.y=1.35;b.castShadow=false;bulbs.push(v(x,y-.033,z));}
  for(const i of [0,16,32,48]){const [x,y,z]=points[i];box(.013,.023,.006,x,y,z-.016,m.paper,room,.002);}
  // Tiny plant on the windowsill: cutout leaves with veins and a curved surface.
  const plant=group(room,-1.86,.747,-.50);
  cyl(.057,.043,.10,0,.055,0,m.plain('#9d6b53',.9),plant);cyl(.065,.065,.01,0,.008,0,m.plain('#95674d',.9),plant);
  cyl(.049,.049,.003,0,.107,0,m.plain('#504b39',1),plant);
  const leafTex=texture(128,256,c=>{c.fillStyle='#667a51';c.beginPath();c.moveTo(64,6);c.bezierCurveTo(150,80,105,200,64,246);c.bezierCurveTo(9,190,-8,86,64,6);c.fill();c.strokeStyle='#a6ac734f';c.lineWidth=2;c.beginPath();c.moveTo(64,15);c.lineTo(64,240);c.stroke();for(let y=55;y<215;y+=25){c.beginPath();c.moveTo(64,y+15);c.lineTo(28,y-12);c.moveTo(64,y+15);c.lineTo(98,y-12);c.stroke();}});
  const leafMat=new T.MeshPhysicalMaterial({map:leafTex,alphaTest:.3,roughness:.85,roughnessMap:m.noise,bumpMap:leafTex,bumpScale:.0007,side:T.DoubleSide,transmission:.08,thickness:.004});
  for(let i=0;i<9;i++){const a=i*2.4,h=.17+(i%4)*.035;rod(v(0,.1,0),v(Math.cos(a)*.055,h,Math.sin(a)*.055),.0015,m.trim,plant);const leaf=plane(.055,.12,Math.cos(a)*.055,h+.045,Math.sin(a)*.055,leafMat,plant);leaf.rotation.set(.3,a,.3*Math.cos(a));}
  // Hamper, clothes, shoes, backpack and basketball belong near the entry.
  const hamper=group(room,-1.52,0,.23,-.08);
  cyl(.19,.155,.44,0,.23,0,linen,hamper,true);const top=mesh(new T.TorusGeometry(.19,.006,8,32),m.trim,0,.45,0,hamper);top.rotation.x=Math.PI/2;
  for(let i=0;i<3;i++){const laundry=cloth(.22,.25,(i-1)*.09,.455+i*.005,0,i===1?red:navy,hamper,.09,.015);laundry.rotation.y=i*.8;}
  const bag=group(room,-.31,0,.08,-.21);bag.rotation.z=.10;
  box(.28,.38,.13,0,.21,0,m.fabric('#4c5b50'),bag,.045);box(.23,.17,.065,0,.15,.085,m.fabric('#46534a'),bag,.02);
  tube([[-.08,.39,0],[-.08,.44,0],[.06,.45,0],[.08,.39,0]],.006,m.dark,bag);
  tube([[-.08,.38,-.055],[-.12,.19,-.12],[-.08,.06,-.055]],.012,m.dark,bag);
  box(.17,.003,.003,0,.23,.122,m.trim,bag,.001);
  for(const [x,z,a] of [[-.77,1.12,.13],[-.52,1.17,-.1]]){
    const shoe=group(room,x,0,z,a);box(.11,.025,.27,0,.025,0,m.paper,shoe,.01);box(.10,.075,.22,0,.071,-.01,navy,shoe,.025);
    for(let i=0;i<4;i++)rod(v(-.027,.11,-.04+i*.023),v(.027,.11,-.04+i*.023),.002,m.paper,shoe);
  }
  for(const [x,z,a] of [[.55,.97,-.12],[.71,1.12,.2]]){const slipper=group(room,x,0,z,a);box(.105,.015,.24,0,.025,0,m.trim,slipper,.012);box(.108,.045,.1,0,.05,-.035,linen,slipper,.019);}
  cloth(.08,.17,.84,.028,.59,m.fabric('#a6a89e'),room,.1,.008,.25).rotation.y=.5;
  const ballMat=m.plain('#91694b',.95);ballMat.bumpScale=.001;
  const basketball=ball(.119,-1.03,.122,.69,ballMat,room);
  for(let i=0;i<3;i++){const seam=mesh(new T.TorusGeometry(.1195,.0015,6,48),m.dark,0,0,0,basketball);if(i===1)seam.rotation.x=Math.PI/2;if(i===2)seam.rotation.y=Math.PI/2;}
  // Wardrobe contents, a towel and a cap on adhesive hooks.
  for(let i=0;i<4;i++)cloth(.28,.27,(i%2-.5)*.30,1.08+Math.floor(i/2)*.25,0,i%2?navy:linen,wardrobe,.18,.0,.2);
  for(let i=0;i<3;i++){
    const x=-.18+i*.17;
    rod(v(x,.84,0),v(x-.11,.76,0),.002,m.metal,wardrobe);rod(v(x,.84,0),v(x+.11,.76,0),.002,m.metal,wardrobe);rod(v(x-.11,.76,0),v(x+.11,.76,0),.002,m.metal,wardrobe);
    const shape=new T.Shape();shape.moveTo(-.038,0);shape.lineTo(-.12,-.035);shape.lineTo(-.18,-.27);shape.lineTo(-.125,-.29);shape.lineTo(-.09,-.15);shape.lineTo(-.095,-.43);shape.lineTo(.095,-.43);shape.lineTo(.09,-.15);shape.lineTo(.125,-.29);shape.lineTo(.18,-.27);shape.lineTo(.12,-.035);shape.lineTo(.038,0);shape.quadraticCurveTo(0,-.04,-.038,0);
    const geo=new T.ShapeGeometry(shape,20);const pos=geo.attributes.position;for(let j=0;j<pos.count;j++)pos.setZ(j,.006*Math.sin(pos.getX(j)*60)+.004*Math.sin(pos.getY(j)*35));geo.computeVertexNormals();
    const jacket=mesh(geo,i===1?red:navy,x,.77,.065+i*.005,wardrobe);jacket.rotation.y=(i-1)*.08;
  }
  box(.025,.035,.018,-1.24,1.30,1.12,m.paper,room);
  const towel=cloth(.30,.62,0,0,0,linen,room,.13,.03,.6);towel.rotation.set(Math.PI/2,0,Math.PI/2);towel.position.set(-1.23,1.05,1.12);
  box(.022,.031,.015,-1.24,1.48,.93,m.paper,room);const cap=ball(.07,-1.22,1.43,.93,navy,room);cap.scale.set(.45,.7,1);box(.09,.008,.10,-1.18,1.40,.93,navy,room,.02);
  // Magnets and a note on the fridge, restrained snack clutter beside the microwave.
  box(.075,.085,.001,-.08,.55,.273,m.plain('#b9ac77',.95),fridge,.0002).rotation.z=.07;
  ball(.009,-.08,.583,.277,m.plain('#79484b'),fridge);box(.025,.03,.004,.08,.67,.276,m.plain('#657a88'),fridge,.003);
  box(.055,.12,.09,1.76,.74,-.60,m.plain('#9d8254',.9),room,.005).rotation.y=.08;
  return {bulbs,lampPosition:v(-1.355,1.15,-1.235),lampTarget:v(-1.20,.82,-1.0)};
}
