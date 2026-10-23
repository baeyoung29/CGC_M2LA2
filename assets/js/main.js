import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const PARTICLE_COUNT = 6000;
const PARTICLE_SPREAD = 600;
const PARTICLE_FALL_SPEED = 0.9;
const COLOR_CHANGE_INTERVAL_MS = 3000;
const PARTICLE_COLORS = [0xffb6c1, 0x87cefa, 0x98fb98, 0xffd700, 0xdda0dd];
const FIRST_NAME = "Kris";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  10,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let textMesh = new THREE.Mesh();
let particleGeometry;
let particleMaterial;
let colorIndex = 0;

setupLighting();
createNameText();
createParticles();
startColorCycle();
animate();

function createParticles() {
  const points = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    points.push(
      new THREE.Vector3(
        Math.random() * PARTICLE_SPREAD - PARTICLE_SPREAD / 2,
        Math.random() * PARTICLE_SPREAD - PARTICLE_SPREAD / 2,
        Math.random() * PARTICLE_SPREAD - PARTICLE_SPREAD / 2
      )
    );
  }

  particleGeometry = new THREE.BufferGeometry().setFromPoints(points);

  const sprite = new THREE.TextureLoader().load("assets/images/star.png");
  particleMaterial = new THREE.PointsMaterial({
    color: PARTICLE_COLORS[colorIndex],
    size: 0.7,
    map: sprite,
  });

  scene.add(new THREE.Points(particleGeometry, particleMaterial));
}

function animateParticles() {
  const positions = particleGeometry.attributes.position.array;
  const bottomLimit = -PARTICLE_SPREAD / 2;
  const topLimit = PARTICLE_SPREAD / 2;

  for (let i = 1; i < positions.length; i += 3) {
    positions[i] -= PARTICLE_FALL_SPEED;

    if (positions[i] < bottomLimit) {
      positions[i] = topLimit;
    }
  }

  particleGeometry.attributes.position.needsUpdate = true;
}

function startColorCycle() {
  setInterval(() => {
    colorIndex = (colorIndex + 1) % PARTICLE_COLORS.length;
    particleMaterial.color.setHex(PARTICLE_COLORS[colorIndex]);
  }, COLOR_CHANGE_INTERVAL_MS);
}

function createNameText() {
  const woodTexture = new THREE.TextureLoader().load(
    "assets/textures/wooden.jpg"
  );
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(0.1, 0.1);
  const textMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });

  const fontLoader = new FontLoader();
  fontLoader.load("assets/fonts/helvetiker_bold.typeface.json", (font) => {
    const textGeometry = new TextGeometry(FIRST_NAME, {
      font: font,
      size: 3,
      height: 1,
    });
    textGeometry.center();

    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.z = -5;
    scene.add(textMesh);
  });

  camera.position.z = 15;
}

function setupLighting() {
  const hemisphereLight = new THREE.HemisphereLight(0x780a44, 0x1c3020, 1);
  scene.add(hemisphereLight);

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 0, 15);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 30;
  scene.add(spotLight);
}

function animate() {
  requestAnimationFrame(animate);

  animateParticles();

  textMesh.rotation.x += 0.008;
  textMesh.rotation.y += 0.008;
  renderer.render(scene, camera);
}
