import * as THREE from 'three';
import {materials} from './dorm/materials';
import {buildShell} from './dorm/shell';
export function buildRoom(){const room=new THREE.Group();const m=materials();const shell=buildShell(room,m);return {room,...shell};}
