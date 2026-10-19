import * as T from 'three';
import {texture} from './materials';
import {plane} from './geometry';
import type {buildRoom} from '../buildRoom';

export function lighting(scene:T.Scene,model:ReturnType<typeof buildRoom>){
  const hemi=new T.HemisphereLight('#849fc5','#726253',.25);scene.add(hemi);
  const sun=new T.DirectionalLight('#f0c29b',1.65);sun.position.set(-4,3.3,-1.3);sun.target.position.set(.4,.2,.3);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.1,far:12});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=.008;sun.shadow.bias=-.0001;sun.shadow.radius=4;scene.add(sun,sun.target);
  const lamp=new T.SpotLight('#ffd09a',1.2,2.7,.86,.65,2);lamp.position.copy(model.lampPosition);lamp.target.position.copy(model.lampTarget);lamp.castShadow=true;lamp.shadow.mapSize.set(1024,1024);lamp.shadow.bias=-.0001;lamp.shadow.normalBias=.003;lamp.shadow.camera.near=.05;lamp.shadow.camera.far=3;scene.add(lamp,lamp.target);
  for(const i of [1,5,9,13]){const light=new T.PointLight('#ffcb87',.09,1.45,2);light.position.copy(model.bulbs[i]).add(new T.Vector3(0,-.03,.05));scene.add(light);}
  const monitor=new T.PointLight('#8eadd9',.018,.8,2);monitor.position.set(-.92,1.07,-1.08);scene.add(monitor);
  const shadowMap=texture(128,128,c=>{const g=c.createRadialGradient(64,64,8,64,64,64);g.addColorStop(0,'#24252a9c');g.addColorStop(.4,'#24252a66');g.addColorStop(1,'#24252a00');c.fillStyle=g;c.fillRect(0,0,128,128);});
  const shadowMaterial=new T.MeshStandardMaterial({map:shadowMap,transparent:true,roughness:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  function contact(x:number,z:number,w:number,d:number,y=.016){const s=plane(w,d,x,y,z,shadowMaterial,model.room);s.rotation.x=-Math.PI/2;s.castShadow=s.receiveShadow=false;return s;}
  // Contact masks are tied to real supports, not large floating foundation shadows.
  contact(-1.04,-1.105,1.25,.76);contact(1.37,.17,1.08,2.18);contact(-1.63,.99,.68,.85);contact(.43,-1.14,.60,.60);
  contact(-1.52,.23,.46,.46);contact(-.31,.08,.4,.28,.038);contact(-1.03,.69,.30,.30);contact(-.84,-.28,.67,.66,.038);
  for(const [x,z] of [[-.77,1.12],[-.52,1.17],[.55,.97],[.71,1.12]])contact(x,z,.16,.31,.038);
  for(const x of [.915,1.825])for(const z of [-.87,1.21])contact(x,z,.15,.15);
  for(let i=0;i<5;i++){const a=i*Math.PI*.4-.24;contact(-.84+Math.cos(a)*.27,-.28+Math.sin(a)*.27,.10,.10,.038);}
  // Static AO is baked into a second UV channel, surviving the low-quality tier.
  const floorAO=texture(512,512,c=>{
    c.fillStyle='#ffffff';c.fillRect(0,0,512,512);
    const draw=(x:number,z:number,w:number,d:number)=>{c.save();c.shadowBlur=24;c.shadowColor='#000000';c.fillStyle='#999999';c.fillRect((x-w/2+1.95)/3.9*512,(z-d/2+1.45)/2.9*512,w/3.9*512,d/2.9*512);c.restore();};
    draw(-1.04,-1.10,1.07,.61);draw(1.37,.17,.91,2.08);draw(-1.63,.99,.54,.70);draw(.43,-1.14,.47,.49);
    const g=c.createLinearGradient(0,0,0,40);g.addColorStop(0,'#00000077');g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(0,0,512,40);
    const h=c.createLinearGradient(0,0,35,0);h.addColorStop(0,'#00000055');h.addColorStop(1,'#00000000');c.fillStyle=h;c.fillRect(0,0,35,512);
  },false);floorAO.channel=1;
  model.room.traverse(o=>{if(o instanceof T.Mesh && o.geometry.boundingBox===null)o.geometry.computeBoundingBox();});
  const floor=model.room.children.find(o=>o instanceof T.Mesh && Math.abs(o.position.y+.006)<.0001) as T.Mesh;
  if(floor){const a=floor.geometry.attributes.position;const uv=new Float32Array(a.count*2);for(let i=0;i<a.count;i++){uv[i*2]=(a.getX(i)+1.95)/3.9;uv[i*2+1]=1-(a.getZ(i)+1.45)/2.9;}floor.geometry.setAttribute('uv1',new T.BufferAttribute(uv,2));(floor.material as T.MeshStandardMaterial).aoMap=floorAO;(floor.material as T.MeshStandardMaterial).aoMapIntensity=.7;}
  // Vertical contact along wall/floor intersections.
  const wallMask=texture(64,256,c=>{const g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,'#24252a00');g.addColorStop(1,'#24252a70');c.fillStyle=g;c.fillRect(0,0,64,256);});
  const wallShade=new T.MeshStandardMaterial({map:wallMask,transparent:true,roughness:1,depthWrite:false});
  plane(3.9,.22,0,.11,-1.441,wallShade,model.room).castShadow=false;
  const side=plane(2.9,.22,-1.941,.11,0,wallShade,model.room);side.rotation.y=Math.PI/2;side.castShadow=false;
  return {sun,lamp,update:(seconds:number)=>{sun.color.set('#f0c29b').lerp(new T.Color('#b0bfd2'),Math.min(seconds/30,1)*.22);},dispose:()=>{sun.shadow.dispose();lamp.shadow.dispose();}};
}
