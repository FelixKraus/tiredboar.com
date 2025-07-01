// scene.js
import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { createCamera } from '../src/setup/camera.js';
import { createIcosahedron } from '../objects/icosahedron.js';
import { createRenderer } from './setup/renderer.js';

const scene = new THREE.Scene();

// Camera
const camera = createCamera();

// Renderer
const renderer = createRenderer();

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Geometry
const mesh = createIcosahedron();
scene.add(mesh);

// Lighting
const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500, 1);
scene.add(hemiLight);

// Export everything needed by main loop
export { scene, camera, renderer, controls, mesh };