import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { Wireframe } from 'three/examples/jsm/Addons.js';

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

//testing end

document.querySelectorAll(".modal-Exit-Button").forEach((button) => {
  button.addEventListener("click", (event) => {
    const modal = event.target.closest(".modal");
    hideModal(modal);
  })
})

const showModal = (modal) => {
  modal.style.display = "block";
  gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.5 });
}

const hideModal = (modal) => {
  console.log("Testing Hide");
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
videoElement.muted = true;
videoElement.autoplay = true;
videoElement.playsInline = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

const screenMaterial = new THREE.MeshBasicMaterial({
  map: videoTexture,
})

//Window Raycasting
window.addEventListener("mousemove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

});

//Click Event Raycasting
window.addEventListener("click", (event) => {
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
    } else if (child.name.includes("About_Button")) {
      showModal(modals.about);
    } else if (object.name.includes("Contact_Button")) {
      showModal(modals.contact);
    }
  }

});


gltfLoader.load("/models/LaptopPortfolio_with_Materials.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Water")) {
        child.material = waterMaterial
      }
      else if (child.name.includes("Glass")) {
        child.material = glassMaterial;
      }
      else if (child.name.includes("Screen")) {
        child.material = screenMaterial;
      }
      else {
        Object.keys(textureMap).forEach((key) => {
          if (child.name.includes(key)) {
            const material = new THREE.MeshBasicMaterial({ map: loadedTextures.day[key], });
            child.material = material;


            if (child.name.includes("Fan")) {
              if (child.name.includes("Fan_2") || child.name.includes("Fan_4")) {
                zAxisFans.push(child);
              } else {
                yAxisFans.push(child);
              }
            }


            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }

        })
      };

      //Testing purpose - apply normal material to all meshes
      const material = new THREE.MeshNormalMaterial();
      child.material = material;
    }
  })
  scene.add(glb.scene);
});





const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);

//Starting position of camera
camera.position.set(-4, 2, -4);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);



//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
//camera starting look at point
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


const render = () => {
  controls.update();

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  //animate fans
  zAxisFans.forEach((fan) => {
    fan.rotation.z += 0.01;
  });
  yAxisFans.forEach((fan) => {
    fan.rotation.y += 0.01;
  });

  //raycasting
  raycaster.setFromCamera(pointer, camera);

  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  for (let i = 0; i < currentIntersects.length; i++) {
    currentIntersects[i].material.color.set(0xff0000);
  }

  //Change cursor style if hovering over raycastable object
  if (currentIntersects.length > 0) {
    const currentIntersectsObject = currentIntersects[0].object;

    if (currentIntersectsObject.name.includes("Pointer")) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  } else {
    document.body.style.cursor = 'default';
  }

  renderer.render(scene, camera);

  requestAnimationFrame(render);
};

render();