import * as T from 'three';
import {box,group,mesh,plane} from './geometry';
import {texture,type Materials} from './materials';

export function artwork(m:Materials,anisotropy:number,onProgress:(fraction:number)=>void=()=>{}){
  const pending:Promise<void>[]=[];let disposed=false;let finished=0;
  const loader=new T.TextureLoader();
  const placeholder=texture(256,256,c=>{c.fillStyle='#93948e';c.fillRect(0,0,256,256);if(import.meta.env.DEV){c.fillStyle='#424845';c.textAlign='center';c.font='18px sans-serif';c.fillText('ADD IMAGE',128,135);}});
  function poster(parent:T.Object3D,path:string,x:number,y:number,z:number,w:number,h:number,rotation=0,felt=false,photo=false){
    const g=group(parent,x,y,z);g.rotation.z=rotation;
    const paper=new T.MeshStandardMaterial({map:placeholder,roughness:.95,roughnessMap:m.noise,bumpMap:felt?m.weave:m.noise,bumpScale:felt?.0012:.00025,side:T.DoubleSide});
    const geometry=new T.PlaneGeometry(1,1,24,24),a=geometry.attributes.position;
    for(let i=0;i<a.count;i++){const u=a.getX(i),v=a.getY(i);a.setZ(i,felt?-.018*(1-4*u*u)*Math.cos(v*2):.003*Math.pow(Math.abs(u)*2,6)*Math.pow(Math.abs(v)*2,6));}
    geometry.computeVertexNormals();
    const sheet=mesh(geometry,paper,0,0,.006,g);sheet.scale.set(w,h,1);
    const shade=texture(128,128,c=>{const grad=c.createRadialGradient(64,64,25,64,64,64);grad.addColorStop(0,'#00000040');grad.addColorStop(1,'#00000000');c.fillStyle=grad;c.fillRect(0,0,128,128);});
    const shadowMat=new T.MeshStandardMaterial({map:shade,transparent:true,roughness:1,depthWrite:false});
    const shadow=plane(w*1.1,h*1.1,.005,-.005,.001,shadowMat,g);shadow.castShadow=false;
    const tapeMat=m.plain('#c2bea9',.65);tapeMat.transparent=true;tapeMat.opacity=.55;
    const tapes=[-1,1].map(side=>{const t=box(.065,.022,.001,side*w*.39,h*.47,.014,tapeMat,g,.0003);t.rotation.z=side*.22;return t;});
    const backing=photo?box(w+.025,h+.055,.002,0,-.012,0,m.paper,g,.0003):null;
    pending.push(new Promise<void>(resolve=>{
      let settled=false;
      const fail=()=>{if(settled)return;settled=true;console.warn(`Missing room image: ${path}; using neutral paper.`);resolve();};
      const timer=setTimeout(fail,8000);
      loader.load(`${import.meta.env.BASE_URL}${path}`,t=>{
        clearTimeout(timer);if(disposed||settled){t.dispose();resolve();return;}settled=true;
        t.colorSpace=T.SRGBColorSpace;t.anisotropy=anisotropy;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;
        const aspect=t.image.width/t.image.height;const width=Math.min(w,h*aspect),height=width/aspect;
        sheet.scale.set(width,height,1);shadow.scale.set(width/w,height/h,1);
        tapes.forEach((t,i)=>t.position.set((i?1:-1)*width*.39,height*.47,.014));
        if(backing){backing.scale.set((width+.025)/(w+.025),(height+.055)/(h+.055),1);}
        paper.map=t;paper.needsUpdate=true;resolve();
      },undefined,()=>{clearTimeout(timer);fail();});
    }).then(()=>{finished++;if(!disposed)onProgress(finished/pending.length);}));
    return g;
  }
  return {poster,ready:()=>Promise.all(pending),dispose:()=>{disposed=true;placeholder.dispose();}};
}
