import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
export function mesh(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,p:T.Object3D){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
export function box(w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material,p:T.Object3D,r=.004){return mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),m,x,y,z,p);}
export function cyl(rt:number,rb:number,h:number,x:number,y:number,z:number,m:T.Material,p:T.Object3D,open=false){
  if(open)return mesh(new T.CylinderGeometry(rt,rb,h,24,1,true),m,x,y,z,p);
  const b=Math.min(.002,h*.15,rt*.15,rb*.15);
  const profile=[[0,-h/2],[rb-b,-h/2],[rb-b*.3,-h/2+b*.3],[rb,-h/2+b],[rt,h/2-b],[rt-b*.3,h/2-b*.3],[rt-b,h/2],[0,h/2]].map(([r,y])=>new T.Vector2(r,y));
  return mesh(new T.LatheGeometry(profile,24),m,x,y,z,p);
}
export function ball(r:number,x:number,y:number,z:number,m:T.Material,p:T.Object3D){return mesh(new T.SphereGeometry(r,20,14),m,x,y,z,p);}
export function rod(a:T.Vector3,b:T.Vector3,r:number,m:T.Material,p:T.Object3D){const q=a.clone().add(b).multiplyScalar(.5);const o=cyl(r,r,a.distanceTo(b),q.x,q.y,q.z,m,p);o.quaternion.setFromUnitVectors(v(0,1,0),b.clone().sub(a).normalize());return o;}
export function tube(points:number[][],r:number,m:T.Material,p:T.Object3D){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>v(a[0],a[1],a[2]))),48,r,6,false),m,0,0,0,p);}
export function group(p:T.Object3D,x=0,y=0,z=0,rotation=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;p.add(g);return g;}
export function plane(w:number,h:number,x:number,y:number,z:number,m:T.Material,p:T.Object3D){return mesh(new T.PlaneGeometry(w,h),m,x,y,z,p);}
