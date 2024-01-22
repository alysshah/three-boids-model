import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Boid from "./Boid.js";

let camera, scene, renderer, controls;
let particleCount = 600;
let boxDepth = 300;
let boxHeight = window.innerHeight / 1.5;
let boxWidth = window.innerWidth / 1.5;
let flock = [];
let confinementMode = 1; // 0 = checkEdges(), 1 = wrap(), 2 = bound()
let halfFOV;

init();
animate();

function init() {
  // Create the scene
  scene = new THREE.Scene();

  // Create a camera
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  halfFOV = (camera.fov * Math.PI) / 360;
  camera.position.z =
    Math.max(boxWidth, boxHeight) / (2 * Math.tan(halfFOV)) - 350;

  // Create a renderer and add it to the DOM
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);

  // Add orbit controls
  controls = new OrbitControls(camera, renderer.domElement);

  // Limit zoom
  controls.minDistance = camera.position.z - 150; // Minimum zoom distance
  controls.maxDistance = camera.position.z + 50; // Maximum zoom distance

  // Limit rotation
  controls.minPolarAngle = (6 * Math.PI) / 14; // Minimum vertical rotation
  controls.maxPolarAngle = (8 * Math.PI) / 14; // Maximum vertical rotation
  controls.minAzimuthAngle = -Math.PI / 14; // Minimum horizontal rotation
  controls.maxAzimuthAngle = Math.PI / 14; // Maximum horizontal rotation
  controls.enableDamping = true;

  // Add a cube to represent the boundary
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x0000ff })
  );
  // scene.add(line);

  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * boxWidth - boxWidth / 2;
    const y = Math.random() * boxHeight - boxHeight / 2;
    const z = Math.random() * boxDepth - boxDepth / 2;
    const boid = new Boid(
      x,
      y,
      z,
      boxWidth,
      boxHeight,
      boxDepth,
      confinementMode
    );
    scene.add(boid.getMesh());
    flock.push(boid);
  }

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update box dimensions
  boxWidth = window.innerWidth / 1.5;
  boxHeight = window.innerHeight / 1.5;

  // Update each boid with the new box dimensions
  flock.forEach((boid) => {
    boid.setBoxSize(boxWidth, boxHeight, boxDepth);
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  // Update each boid
  flock.forEach((boid) => boid.update(flock));
  renderer.render(scene, camera);
}
