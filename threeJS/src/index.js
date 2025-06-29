import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

//For Testing: browser-sync start --server --files "*.html, css/*.css, js/*.js"

const w = window.innerWidth;
const h = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(w,h);
document.body.appendChild(renderer.domElement);

//camera setup
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

//camera gets pulled back so it isn't in center of scene
camera.position.z = 2;

const scene = new THREE.Scene();

//controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;


//icosahedron geometry
const geo = new THREE.IcosahedronGeometry(1.0, 2)
const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
})
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

// Add a wireframe mesh for the icosahedron
const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    //transparent: true,
    //opacity: 0.5
});

const wireMesh = new THREE.Mesh(geo, wireMat);
wireMesh.scale.setScalar(1.001, 1.001, 1.001); // Slightly larger than the main mesh
mesh.add(wireMesh);


//lights
//const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500, 1);
//scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0x0099ff,5);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

//animation
function animate(t = 0) {

    requestAnimationFrame(animate);
    mesh.rotation.y = t * 0.0001;
   
    renderer.render(scene, camera);
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true    
}

animate();