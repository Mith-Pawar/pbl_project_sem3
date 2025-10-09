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
  if (!counterElement) return;
  const scale = 1 + Math.sin(Date.now() * 0.005) * 0.05;
  counterElement.style.transform = `scale(${scale})`;
  requestAnimationFrame(animateCounterPulse);
}

if (counterElement) animateCounterPulse();

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

// If "Login" button on the landing page is clicked, open the same login modal as the navbar
const gotoLoginBtn = document.getElementById('goto-login');
if (gotoLoginBtn) {
  gotoLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      // open the modal (same behavior as navbar LOGIN)
      loginModal.classList.add('active');
      // ensure focus on first input for better UX
      const firstInput = loginModal.querySelector('input');
      if (firstInput) firstInput.focus();
    } else {
      // fallback to full page if modal isn't present
      window.location.href = 'login.html';
    }
  });
}

// If URL contains #login (for example after registration), open the login modal automatically
if (window.location.hash === '#login') {
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.classList.add('active');
    // remove the hash without affecting history too much
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

  // Show welcome in navbar when user is logged in
  function updateNavbarForUser() {
    try {
      const raw = localStorage.getItem('user');
      const navLogin = document.getElementById('nav-login');
      const navWelcome = document.getElementById('nav-welcome');
      if (!navLogin || !navWelcome) return;
      if (raw) {
        const user = JSON.parse(raw);
        navLogin.style.display = 'none';
        navWelcome.style.display = 'inline-block';
        navWelcome.textContent = `Welcome, ${user.name || user.email}`;
        // add logout small link
        let logout = document.getElementById('nav-logout');
        if (!logout) {
          logout = document.createElement('span');
          logout.id = 'nav-logout';
          logout.textContent = 'Logout';
          logout.style.marginLeft = '8px';
          logout.addEventListener('click', function () {
            localStorage.removeItem('user');
            location.reload();
          });
          navWelcome.parentNode.insertBefore(logout, navWelcome.nextSibling);
        }
      } else {
        navWelcome.style.display = 'none';
        if (navLogin) navLogin.style.display = 'inline-block';
        const logout = document.getElementById('nav-logout');
        if (logout) logout.remove();
      }
      try { updateStartButton(); } catch (e) { /* ignore */ }
    } catch (e) {
      console.error('Navbar update error', e);
    }
  }

  updateNavbarForUser();

  // Update landing start button based on login state
  function updateStartButton() {
    const btn = document.getElementById('goto-login');
    if (!btn) return;
    const raw = localStorage.getItem('user');
    if (raw) {
      btn.querySelector('span').textContent = 'Start Testing!';
      btn.removeEventListener('click', gotoLoginFallback);
      btn.addEventListener('click', () => { window.location.href = 'getstarted.html'; });
    } else {
      btn.querySelector('span').textContent = 'Login';
      btn.removeEventListener('click', () => { window.location.href = 'getstarted.html'; });
      btn.addEventListener('click', gotoLoginFallback);
    }
  }

  function gotoLoginFallback(e) {
    e.preventDefault();
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.classList.add('active');
      const firstInput = loginModal.querySelector('input');
      if (firstInput) firstInput.focus();
    } else {
      window.location.href = 'login.html';
    }
  }

  updateStartButton();

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

// Open register page when Sign Up button is clicked inside login modal

const openRegisterBtn = document.getElementById('open-register');

if (openRegisterBtn) {
  openRegisterBtn.addEventListener('click', function() {
    // Navigate to register.html (will use same styling)
    window.location.href = 'register.html';
  });
}
// Handle login form submit and call backend
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (loginError) { loginError.style.display = 'none'; }
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (loginError) { loginError.textContent = data.error || 'Login failed'; loginError.style.display = 'block'; }
        return;
      }
      // success: store user info, update UI and close modal
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        try { updateNavbarForUser(); } catch (e) { /* ignore */ }
      }
+
      document.getElementById('login-modal').classList.remove('active');
    } catch (err) {
      if (loginError) { loginError.textContent = 'Network error'; loginError.style.display = 'block'; }
      console.error(err);
    }
  });
}

