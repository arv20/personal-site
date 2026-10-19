import * as THREE from 'three';
import {materials} from './dorm/materials';
import {buildShell} from './dorm/shell';
import {buildFurniture} from './dorm/furniture';
import {buildProps} from './dorm/props';
import {artwork} from './dorm/posters';
export function buildRoom(anisotropy=4,onProgress:(fraction:number)=>void=()=>{}){const room=new THREE.Group();const m=materials();const shell=buildShell(room,m);const furniture=buildFurniture(room,m);const art=artwork(m,anisotropy,onProgress);const props=buildProps(room,m,furniture,art);return {room,...shell,...furniture,...props,assetsReady:art.ready(),disposeAssets:art.dispose};}
