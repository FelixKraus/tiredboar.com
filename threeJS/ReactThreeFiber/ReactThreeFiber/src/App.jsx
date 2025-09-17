import { Canvas, useFrame, useLoader, useThree  } from "@react-three/fiber";
import { useRef, useState, useEffect, use } from "react";
import {OrbitControls, GizmoHelper, GizmoViewcube, GizmoViewport, useHelper, PositionalAudio} from '@react-three/drei'
import { useControls } from 'leva'
import { color } from "three/tsl";
import { SpotLightHelper, Color, AudioListener, Audio, AudioLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

function LightWithHelper(){
  const light = useRef();
  const {angle, penumbra} = useControls({
    angle: {value: Math.PI / 8, min: 0, max: Math.PI / 2, step: 0.01},
    penumbra: {value: 0, min: 0, max: 1, step: 0.01}
  });

  useHelper(light, SpotLightHelper, 'cyan');
  return <spotLight 
    ref={light} 
    penumbra={penumbra}
    angle={angle}
    intensity={80} 
    color={0xffea00} 
    position={[2, 5, 1]}
    castShadow ={true}
  />
}

function AnimatedBox() {
  const boxRef = useRef();
  const audioRef = useRef();

  const {color, speed} = useControls({
    color: '#00bfff',
    speed: {value: 0.01, min: 0, max: 0.1, step: 0.01}
  });

  useFrame(() => {
    if (boxRef.current) {
      boxRef.current.rotation.x += speed;
      boxRef.current.rotation.y += speed;
    }
  });

  const [wireframe, setWireframe] = useState(false);

  const handlePointerDown = () => {
    setWireframe(!wireframe);

    if (audioRef.current) {
      if (audioRef.current.isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }}
  

  return (
    <mesh ref={boxRef} castShadow onPointerDown={handlePointerDown}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} wireframe={wireframe} />
      <PositionalAudio
        ref={audioRef}
        url="/sound.mp3"
        distance={5}
        loop={false}
        autoplay={false}
      />
    </mesh>)
  
}

function Model() {
  const gltf = useLoader(GLTFLoader, '/LaptopPortfolio_with_Materials.glb');
  return <primitive object={gltf.scene}/>;
}

function AudioComponent() {
  const { camera} = useThree();
  
  useEffect(() => {
    const listener = new AudioListener();
    camera.add(listener);
    
    const sound = new Audio(listener);
    const audioLoader = new AudioLoader();
    audioLoader.load('/sound.mp3', (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      
      const handleClick = () => {
        if (sound.isPlaying) {
          sound.pause();
        } else {
          sound.play();
        }
      }
      window.addEventListener('click', handleClick);

    });
  })

  return null;
}

function App() {
  return (
    <div id="canvas-container">
      <Canvas shadows>
        {/* <gridHelper/> */}
        <OrbitControls panSpeed={.5}/>
        <AnimatedBox />
        <directionalLight position={[2, 5, 1]} intensity={2} />
        <ambientLight intensity={0.5} />
        <spotLight intensity = {80} color = {0xffea00} position={[-10, 0, -20]} angle={0.3} />
        <LightWithHelper />
        {/* <AudioComponent /> */}
      
        <Model />
        
      </Canvas>
    </div>
  )
}

export default App
