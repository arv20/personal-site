import * as THREE from 'three';
import {materials} from './dorm/materials';
import {buildShell} from './dorm/shell';
import {buildFurniture} from './dorm/furniture';
export function buildRoom(){const room=new THREE.Group();const m=materials();const shell=buildShell(room,m);const furniture=buildFurniture(room,m);return {room,...shell,...furniture};}
