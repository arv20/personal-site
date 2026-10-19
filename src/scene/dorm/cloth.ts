import * as T from 'three';
import {mesh} from './geometry';
// Cloth coordinates use x across the fabric and z along it; gravity turns the edges down.
export function cloth(w:number,d:number,x:number,y:number,z:number,m:T.Material,p:T.Object3D,edge=.43,fold=0,ripple=1){
  const g=new T.PlaneGeometry(w,d,64,72);const a=g.attributes.position;
  for(let i=0;i<a.count;i++){
    const u=a.getX(i),v=-a.getY(i);
    const wrinkles=.006*Math.sin(u*48+v*13)+.009*Math.sin(v*23+u*16)*Math.cos(u*9-v*7);
    const ridge=.027*Math.exp(-Math.pow((u+.09-v*.18)*10,2));
    const drop=Math.pow(Math.max(0,Math.abs(u)-edge),.85)*1.5;
    const corner=fold*Math.exp(-((u+w*.42)**2+(v+d*.42)**2)*32);
    a.setXYZ(i,u,y+(wrinkles+ridge)*ripple-drop+corner,v);
  }g.computeVertexNormals();return mesh(g,m,x,0,z,p);
}
export function pillow(x:number,y:number,z:number,w:number,d:number,m:T.Material,p:T.Object3D,angle=0){
  const g=new T.SphereGeometry(1,40,24);const a=g.attributes.position;
  for(let i=0;i<a.count;i++){
    const u=a.getX(i),v=a.getY(i),q=a.getZ(i);
    const xx=Math.sign(u)*Math.pow(Math.abs(u),.45)*w/2;
    const zz=Math.sign(q)*Math.pow(Math.abs(q),.48)*d/2;
    const dent=v>0?.018*Math.exp(-(xx*xx+zz*zz)*42):0;
    a.setXYZ(i,xx,v*.075-dent+.003*Math.sin(xx*60+zz*40),zz);
  }g.computeVertexNormals();const o=mesh(g,m,x,y,z,p);o.rotation.y=angle;return o;
}
