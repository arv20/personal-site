import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
export function postprocessing(renderer:T.WebGLRenderer,scene:T.Scene,camera:T.Camera){
  const composer=new EffectComposer(renderer);const render=new RenderPass(scene,camera);composer.addPass(render);
  const bloom=new UnrealBloomPass(new T.Vector2(1,1),.12,.35,1.15);composer.addPass(bloom);
  const output=new OutputPass();composer.addPass(output);
  const vignette=new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',fragmentShader:'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){vec4 c=texture2D(tDiffuse,vUv); float edge=dot(vUv-.5,vUv-.5); gl_FragColor=vec4(c.rgb*(1.0-.12*edge),c.a); }'});composer.addPass(vignette);
  return {composer,bloom,dispose:()=>{bloom.dispose();output.dispose();vignette.dispose();composer.dispose();}};
}
