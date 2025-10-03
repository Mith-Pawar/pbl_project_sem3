import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// Your scene setup goes here

// Basic Three.js scene setup
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color("black"); 

const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Add light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 2);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
// Floating counter setup
let floatSpeed = 0.002;
let floatAmplitude = 0.1;
let heroY = 0; // Default value
const counterElement = document.getElementById('counter');

function animateCounterPulse() {
  const scale = 1 + Math.sin(Date.now() * 0.005) * 0.05;
  counterElement.style.transform = `scale(${scale})`;
  requestAnimationFrame(animateCounterPulse);
}
animateCounterPulse();

function animateCounter(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value.toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

if (counterElement) {
  animateCounter(counterElement, 0, 15, 3000); // 3 seconds
}

// OrbitControls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);

let model; // Declare a variable to hold the loaded model

// Load a GLB model 
const loader = new GLTFLoader();
loader.load(
  './models/cyber_brain_ai.glb',
  (gltf) => {
    model = gltf.scene; 
    scene.add(model);
    model.position.set(0.9, 0.17, 1.2);
    model.scale.set(1.3, 1, 1);
    heroY = model.position.y; // Initialize heroY after model is loaded
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

camera.position.z = 3;




// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  if (model) {
    model.rotation.y += 0.0003; 
    model.position.y = heroY + Math.sin(Date.now() * floatSpeed) * floatAmplitude;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Show login modal on "LOGIN" click
document.querySelector('.navbar a:nth-child(2)').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('login-modal').classList.add('active');
});

// Hide login modal on close button click
document.getElementById('close-login').addEventListener('click', function() {
  document.getElementById('login-modal').classList.remove('active');
});

// Optional: Hide modal when clicking outside the login box
document.getElementById('login-modal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.classList.remove('active');
  }
});



