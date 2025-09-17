import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { Wireframe } from 'three/examples/jsm/Addons.js';
import { log, mix, mod } from 'three/tsl';
import { LoopOnce } from 'three';

const canvas = document.querySelector("#experience-canvas")
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),


  //testing model
  test: document.querySelector(".modal.work"),
}

document.querySelector("#test-modal-button").addEventListener("click", () => {
  showModal(modals.test);
});

document.querySelector("#test-modal-button").addEventListener("touchend", () => {
  showModal(modals.test);
});

document.querySelector("#play-animation-button").addEventListener("click", () => {
  openCloseLaptop();
});

let laptopOpenAnimation;
let laptopOpenAnimation2;
let laptopOpenAnimation3;
let laptopOpenAnimation4;
let isLaptopOpen = false;
//testing end

function openCloseLaptop(){
  if(isLaptopOpen) {
    console.log("Closing Laptop");
    laptopOpenAnimation.paused = false;              // unpause if stopped
    laptopOpenAnimation.timeScale = -1.5;              // play backwards
    laptopOpenAnimation.time = laptopOpenAnimation.getClip().duration; // start from end
    laptopOpenAnimation.play();
    isLaptopOpen = false;
  }else{
    console.log("Opening Laptop");
    laptopOpenAnimation.paused = false;
    laptopOpenAnimation.reset(); // rewind to 0
    laptopOpenAnimation.timeScale = 1.5; // play forward
    laptopOpenAnimation.play();


    isLaptopOpen = true;
  }
}

let touchHappened = false;

document.querySelectorAll(".modal-Exit-Button").forEach((button) => {

  button.addEventListener("touchend", (event) => {
    touchHappened = true;
    const modal = event.target.closest(".modal");
    hideModal(modal);
  },{passive: false})

  button.addEventListener("click", (event) => {
    if(touchHappened) return;
    const modal = event.target.closest(".modal");
    hideModal(modal);
  },{passive: false}
)
})


let isModalOpen = false;

const showModal = (modal) => {
  modal.style.display = "block";

  //disable controls while modal is open
  isModalOpen = true;
  controls.enabled = false;

  if(currentHoveredObject){
      playHoverAnimation(currentHoveredObject, false);
      currentHoveredObject = null;
  }

  document.body.style.cursor = 'default';
  currentIntersects = [];

  gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.5 });
}

const hideModal = (modal) => {

  isModalOpen = false;
  controls.enabled = true;

  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    }
  });
}


//Arrays to hold fan objects for animation
const zAxisFans = [];
const yAxisFans = [];

//Arrays to hold raycastable objects
const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredObject = null;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//social links
const socialLinks = {

  "GitHub": "https://github.com/FelixKraus",
  "Itch.io": "https://felixkraus.itch.io/"

}

//loaders
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
//define variables for animation
const laptopMixers = [];
const clock = new THREE.Clock();

const environmentMap = new THREE.CubeTextureLoader().setPath('/textures/skybox/').load([
  'px.webp',
  'nx.webp',
  'py.webp',
  'ny.webp',
  'pz.webp',
  'nz.webp'
]);


const textureMap =
{
  First: {
    day: "/textures/Paisley Cat.png",
    night: "/textures/Paisley Cat.png"
  },
  Second: {
    day: "/textures/Paisley Cat.png",
    night: "/textures/Paisley Cat.png"
  },
  Third: {
    day: "/textures/Paisley Cat.png",
    night: "/textures/Paisley Cat.png"
  }
}

const loadedTextures = {
  day: {},
  night: {}
}

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  loadedTextures.day[key] = dayTexture;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.flipY = false;

  const nightTexture = textureLoader.load(paths.night);
  loadedTextures.night[key] = nightTexture;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.flipY = false;

})

//Glass Material Settings
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 1,
  opacity: 1,
  metalness: 0,
  roughness: 0,
  ior: 1.5,
  thickness: 0.01,
  specularIntensity: 1,
  specularColor: 0xffffff,
  envMap: environmentMap,
  envMapIntensity: 1,
  depthWrite: false,
})

//Water Material Settings
const waterMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x558BC8,
  transparent: true,
  opacity: 0.66,
  metalness: 0.1,
  depthWrite: false,

})

//Video Screen Settings
const videoElement = document.createElement("video");
videoElement.src = "/textures/room/video/Screen.mp4";
videoElement.loop = true;
videoElement.muted = false;
videoElement.autoplay = true;
videoElement.flipY = false;
videoElement.playsInline = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

const screenMaterial = new THREE.MeshBasicMaterial({
  map: videoTexture,
  side: THREE.DoubleSide,
})

//Window Raycasting for desktop
window.addEventListener("mousemove", (event) => {
  touchHappened = false;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

});

//Touch Event Raycasting for mobile
window.addEventListener("touchstart", (event) => {
  if(isModalOpen) return;

  event.preventDefault();
  pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;

}, { passive: false }
);


window.addEventListener("touchend", (event) => {
  if(isModalOpen) return;

  event.preventDefault();
  handleRaycasterInteraction();

}, { passive: false }
);

function handleRaycasterInteraction() {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key, link]) => {
      if (object.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = link;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (object.name.includes("Work_Button")) {
      showModal(modals.work);
    } else if (object.name.includes("About_Button")) {
      showModal(modals.about);
    } else if (object.name.includes("Contact_Button")) {
      showModal(modals.contact);
    }

    if (object.name.includes("MainBoardTop")) {
      openCloseLaptop();
    }
    if (object.name.includes("LaptopScrHolder")) {
      openCloseLaptop();
    }

    
  }
}

//Click Event Raycasting
window.addEventListener("click", handleRaycasterInteraction);


gltfLoader.load("/models/LaptopPortfolio_with_Materials.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {

      
      if(child.name.includes("Raycaster")){
        if(!child.name.includes("Button")){console.log("Raycaster mesh added:", child.name, child.geometry, child.visible, child.scale);}

        
        raycasterObjects.push(child);
      }

      if(child.name.includes("Hover")){
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialPosition = new THREE.Vector3().copy(child.position);
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }

      //Here we need to assign the different objects per name for the introAnimation function

      if (child.name.includes("Water")) {
        child.material = waterMaterial
      }
      else if (child.name.includes("Glass")) {
        child.material = glassMaterial;
      }
      else if (child.name.includes("Screen")) {

        child.material = screenMaterial;
        
        console.log("Screen mesh found:");
        
        //Testing purpose - apply normal material to all meshes
      }else{
      const material = new THREE.MeshNormalMaterial();
      child.material = material;
      }
      // else {
      //   Object.keys(textureMap).forEach((key) => {
      //     if (child.name.includes(key)) {
      //       const material = new THREE.MeshBasicMaterial({ map: loadedTextures.day[key], });
      //       child.material = material;


      //       if (child.name.includes("Fan")) {
      //         if (child.name.includes("Fan_2") || child.name.includes("Fan_4")) {
      //           zAxisFans.push(child);
      //         } else {
      //           yAxisFans.push(child);
      //         }
      //       }


      //       if (child.material.map) {
      //         child.material.map.minFilter = THREE.LinearFilter;
      //       }
      //     }

      //   })
      // };

      
    }
  })
  scene.add(glb.scene);

  //Getting Animations from GLB own code
  const animations = glb.animations;

  animations.forEach((clip) => {

    console.log(clip.name);
  })

  
  //start animation if there are any
  if(animations && animations.length){
    const mixer = new THREE.AnimationMixer(glb.scene);

    //const action = mixer.clipAction(animations[0]);
    //action.play();

    laptopOpenAnimation = mixer.clipAction(THREE.AnimationClip.findByName(animations, "LaptopOpenAction"));
    laptopOpenAnimation.setLoop(LoopOnce);
    laptopOpenAnimation.clampWhenFinished = true;



    laptopMixers.push(mixer);
  }
  //End Animation code

  //playIntroAnimation();
});



//starting animation timeline 
function playIntroAnimation() {
  const t1 = gsap.timeline({
    defaults:{
      duration: 0.8,
      ease: "back.out(1.7)"
    }
    
  });

  t1.to(plank1.scale,{x:1, z:1,})
  .to(plank2.scale,{x:1, z:1,}, "-=0.6") //overlap previous animation by 0.6 seconds
  .to(plank3.scale,{x:1, z:1,})
  .to(aboutButton.scale,{x:1, y:1, z:1,})
  .to(workButton.scale,{x:1, y:1, z:1,})
  .to(contactButton.scale,{x:1, y:1, z:1,})

  //to assign plank and button variables need this code in loader.load https://youtu.be/AB6sulUMRGE?si=5Ca9A1yuO12hOCrD&t=30699
  //if(cjhild.name.includes("Plank_1")) plank1 = child, child.scale.set(0,1,0);
  
  
}


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);

//Starting position of camera
camera.position.set(-4, 2, -4);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//const geometry = new THREE.BoxGeometry(1, 1, 1);
//const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);



//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = -Math.PI / 2;
controls.maxAzimuthAngle = Math.PI * 2;
controls.minDistance = 5;
controls.maxDistance = 10;

controls.enablePan = true;

controls.enableDamping = true;
controls.dampingFactor = 0.05;
//controls.update();
//camera starting look at point
//maybe change it for mobile view https://youtu.be/AB6sulUMRGE?si=6-FKc83uWKEm8FbY&t=31128
controls.target.set(0, 1, 0);


//event listeners
window.addEventListener('resize', () => {
  //update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})


function playHoverAnimation(object, isHovering) {


  gsap.killTweensOf([object.scale, object.rotation, object.position]);

  if (isHovering) {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * 1.1,
      y: object.userData.initialScale.y * 1.1,
      z: object.userData.initialScale.z * 1.1,
      duration: 0.5,
      ease: "bounce.out(1.5)"
    })
    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x + Math.PI / 8,
      duration: 0.5,
      ease: "bounce.out(1.5)",
    
    })
  }else{
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "bounce.out(1.5)"
    })
    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x,
      duration: 0.3,
      ease: "bounce.out(1.5)",
      
    })
  }
}

const render = () => {
  controls.update();

  //cube.rotation.x += 0.01;
  //cube.rotation.y += 0.01;

  //animate fans
  zAxisFans.forEach((fan) => {
    fan.rotation.z += 0.01;
  });
  yAxisFans.forEach((fan) => {
    fan.rotation.y += 0.01;
  });

  //update animations
  const delta = clock.getDelta();
  laptopMixers.forEach((mixer) => mixer.update(delta));

  //raycasting
  if(!isModalOpen){

  
  raycaster.setFromCamera(pointer, camera);

  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  for (let i = 0; i < currentIntersects.length; i++) {
    //currentIntersects[i].material.color.set(0xff0000);
    //console.log("Intersected object:", currentIntersects[i].object.name);
  }

  //Change cursor style if hovering over raycastable object
  if (currentIntersects.length > 0) {
    const currentIntersectObject = currentIntersects[0].object;

    if(currentIntersectObject.name.includes("Hover")){
      if(currentIntersectObject !== currentHoveredObject){

        if(currentHoveredObject){
          playHoverAnimation(currentHoveredObject, false);
        }

        playHoverAnimation(currentIntersectObject, true);
        currentHoveredObject = currentIntersectObject;
    }
    }

    if (currentIntersectObject.name.includes("Pointer")) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  } else {

    if(currentHoveredObject){
      playHoverAnimation(currentHoveredObject, false);
      currentHoveredObject = null;
    }
    document.body.style.cursor = 'default';
  }
}
  renderer.render(scene, camera);

  requestAnimationFrame(render);
};

render();