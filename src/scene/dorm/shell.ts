import * as T from 'three';
import {box,group,plane,rod,v} from './geometry';
import {texture,type Materials} from './materials';
export function buildShell(room:T.Group,m:Materials){
  box(4.06,.12,3.06,0,-.08,0,m.trim,room,.008);
  box(3.9,.025,2.9,0,-.006,0,m.floor,room,.003);
  box(4.06,2.4,.12,0,1.2,-1.51,m.paint,room,.0002);
  // Window opening is an actual hole, so the key light can enter the room.
  box(.12,.76,2.9,-2.01,.38,0,m.paint,room,.0002);
  box(.12,.34,2.9,-2.01,2.23,0,m.paint,room,.0002);
  box(.12,1.3,.6,-2.01,1.41,-1.15,m.paint,room,.0002);
  box(.12,1.3,1.1,-2.01,1.41,.9,m.paint,room,.0002);
  box(3.9,.09,.018,0,.045,-1.442,m.trim,room);
  box(.018,.09,2.9,-1.942,.045,0,m.trim,room);
  const win=group(room,-1.956,1.41,-.25,Math.PI/2);
  const frame=m.plain('#bebdb0',.74);
  for(const x of [-.62,.62])box(.055,1.38,.095,x,0,0,frame,win);
  for(const y of [-.67,.67])box(1.29,.055,.095,0,y,0,frame,win);
  const sky=texture(512,512,c=>{
    const g=c.createLinearGradient(0,0,0,512);g.addColorStop(0,'#3a526f');g.addColorStop(.6,'#aa9390');g.addColorStop(1,'#d2b29a');c.fillStyle=g;c.fillRect(0,0,512,512);
    c.filter='blur(8px)';for(let i=0;i<16;i++){const h=50+(i*73)%110;c.fillStyle=i%2?'#4d5360':'#626773';c.fillRect(i*38-20,512-h,34,h);c.fillStyle='#e9c08e';for(let j=0;j<3;j++)c.fillRect(i*38+2,520-h+j*26,4,7);}
  });
  const view=plane(1.2,1.3,0,0,-.05,new T.MeshStandardMaterial({map:sky,emissiveMap:sky,emissive:'#c6c3bb',emissiveIntensity:.55,roughness:.6,roughnessMap:m.noise}),win);view.castShadow=false;
  box(.027,1.3,.05,0,0,.035,frame,win);box(1.2,.035,.05,0,-.05,.035,frame,win);
  box(1.35,.035,.22,0,-.69,.055,frame,win);
  box(.08,.014,.04,.27,-.08,.08,m.metal,win);
  for(let i=0;i<8;i++){const slat=box(1.25,.022,.045,0,.62-i*.05,.085,m.paper,win,.002);slat.rotation.z=.012;slat.rotation.x=-.18;}
  for(const x of [-.46,.46])rod(v(x,.65,.09),v(x,.22,.09),.0015,m.paper,win);
  rod(v(.67,.64,.09),v(.67,-.36,.09),.0015,m.paper,win);
  return {windowView:view};
}
