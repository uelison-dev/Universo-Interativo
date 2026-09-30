import * as THREE from '../../node_modules/three/build/three.module.js';
import { OrbitControls } from '../libs/three/controls/OrbitControls.js';
import { createBlackHole, animateBlackHole } from '../../utils/black_hole.js';
import { createSunSurfaceMaterial, createSunGlow } from '../../utils/sun_visual.js';
import {
  createCometNucleusGeometry,
  addCometEffects,
  getCometTailPresentation
} from '../../utils/comet_visual.js';

const { ipcRenderer } = window.require('electron');
const stage = document.querySelector('.viewer-stage');
const nameElement = document.getElementById('black-hole-name');
const typeElement = document.getElementById('black-hole-type');
const detailsElement = document.getElementById('black-hole-details');
const dataPanel = document.querySelector('.data-panel');
const closeButton = document.getElementById('close-viewer');
const visibilityButton = document.getElementById('viewer-visibility');
const infoButton = document.getElementById('viewer-info');
const zoomInButton = document.getElementById('viewer-zoom-in');
const zoomOutButton = document.getElementById('viewer-zoom-out');
const cameraButton = document.getElementById('viewer-camera');
const satelliteSwitcher = document.getElementById('satellite-switcher');
const satelliteCount = document.getElementById('satellite-count');
const satelliteButtons = document.getElementById('satellite-buttons');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
stage.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.enablePan = false;
controls.minDistance = 8;
controls.maxDistance = 36;
controls.target.set(0, 0, 0);

const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(1500 * 3);
for (let index = 0; index < starPositions.length; index += 3) {
  const radius = 45 + Math.random() * 35;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPositions[index] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[index + 1] = radius * Math.cos(phi);
  starPositions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
scene.add(
  new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0xd9d3c8, size: 0.055, transparent: true, opacity: 0.64 })
  )
);

const textureLoader = new THREE.TextureLoader();
let blackHole = null;
let inspectedBody = null;
let inspectedOrbit = null;
let inspectedSunMaterial = null;
let inspectedCometUpdater = null;
const inspectedWorldPosition = new THREE.Vector3();
let previousTime = performance.now();

scene.add(new THREE.AmbientLight(0x5f6d82, 0.12));
const keyLight = new THREE.DirectionalLight(0xffe5c8, 1.35);
keyLight.position.set(-7, 5, 10);
scene.add(keyLight);

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function renderDetails(data) {
  document.body.classList.toggle('compact-object-view', data.mode !== 'black-hole');
  document.body.classList.toggle('black-hole-view', data.mode === 'black-hole');
  visibilityButton.hidden = data.mode === 'black-hole';
  nameElement.textContent = data.name || 'Buraco negro';
  typeElement.textContent = data.type || data.info?.Tipo || 'Corpo celeste';
  detailsElement.innerHTML = '';

  Object.entries(data.info || {}).forEach(([label, value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    detailsElement.appendChild(row);
  });
}

function renderSatelliteSwitcher(data) {
  const satellites = data.satellites || [];
  satelliteSwitcher.hidden = data.mode === 'black-hole' || satellites.length === 0;
  satelliteCount.textContent = satellites.length;
  satelliteButtons.innerHTML = '';

  satellites.forEach((satellite) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = satellite.name;
    button.classList.toggle('active', data.name === satellite.name);
    button.addEventListener('click', () =>
      showObject({
        ...satellite,
        mode: 'celestial-body',
        name: satellite.name,
        type: satellite.type,
        satellites: []
      })
    );
    satelliteButtons.appendChild(button);
  });
}

function createCelestialBody(data) {
  const radius = 4;
  const group = new THREE.Group();
  const texture = data.texturePath ? textureLoader.load(data.texturePath) : null;
  if (texture) texture.encoding = THREE.sRGBEncoding;
  const body = new THREE.Mesh(
    data.isComet
      ? createCometNucleusGeometry(radius, 64)
      : new THREE.SphereGeometry(radius, 64, 64),
    data.isSun
      ? createSunSurfaceMaterial(texture)
      : new THREE.MeshStandardMaterial({
          map: texture,
          color: data.isComet ? 0xa59a88 : 0xffffff,
          roughness: data.isComet ? 0.98 : 0.88,
          metalness: 0.0
        })
  );
  group.add(body);
  if (data.isSun) group.add(createSunGlow(radius));

  if (data.ring) {
    const ringTexture = textureLoader.load(data.ring.texturePath);
    ringTexture.encoding = THREE.sRGBEncoding;
    const sourceSize = Math.max(Number(data.size) || 1, 1);
    const innerRadius = radius * (data.ring.innerRadius / sourceSize);
    const outerRadius = radius * (data.ring.outerRadius / sourceSize);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(innerRadius, outerRadius, 128),
      new THREE.MeshStandardMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        roughness: 0.95,
        metalness: 0,
        depthWrite: false
      })
    );
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
  }

  if (data.isComet) {
    inspectedCometUpdater = addCometEffects(body, {
      radius,
      tailLength: 13,
      colors: data.cometVisual
    });
  }

  return group;
}

function createOrbit(data) {
  const eccentricity = Math.min(Math.max(Number(data.orbitEccentricity) || 0, 0), 0.92);
  const semiMajorAxis = Number(data.orbitSemiMajorAxis);
  const orbitRadius = Number.isFinite(semiMajorAxis) && semiMajorAxis > 0 ? 5.7 : 5.7;
  const points = [];
  for (let index = 0; index <= 160; index += 1) {
    const angle = (index / 160) * Math.PI * 2;
    const radius =
      (orbitRadius * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(angle));
    points.push(new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle)));
  }

  const orbit = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x8da7ad, transparent: true, opacity: 0.42 })
  );
  orbit.rotation.x = (Number(data.orbitInclination) || 0) * (Math.PI / 180);
  scene.add(orbit);
  return orbit;
}

function showObject(data) {
  renderDetails(data);
  renderSatelliteSwitcher(data);
  if (blackHole) scene.remove(blackHole);
  if (inspectedBody) scene.remove(inspectedBody);
  if (inspectedOrbit) scene.remove(inspectedOrbit);
  blackHole = null;
  inspectedBody = null;
  inspectedOrbit = null;
  inspectedSunMaterial = null;
  inspectedCometUpdater = null;

  if (data.mode === 'black-hole') {
    blackHole = createBlackHole({ ...data, sceneSize: 4 }, textureLoader);
    scene.add(blackHole);
  } else {
    inspectedBody = createCelestialBody(data);
    if (data.isSun) inspectedSunMaterial = inspectedBody.children[0].material;
    scene.add(inspectedBody);
    inspectedOrbit = createOrbit(data);
  }
  camera.position.set(0, data.isComet ? 0 : 1.35, data.isComet ? 25 : 13.5);
  controls.target.set(0, 0, 0);
  controls.update();
}

function changeZoom(multiplier) {
  const distance = camera.position.length();
  camera.position.multiplyScalar(Math.min(Math.max(multiplier, 0.7), 1.3));
  const nextDistance = camera.position.length();
  if (nextDistance < controls.minDistance || nextDistance > controls.maxDistance) {
    camera.position.setLength(
      Math.min(Math.max(distance * multiplier, controls.minDistance), controls.maxDistance)
    );
  }
  controls.update();
}

function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;
  if (blackHole) animateBlackHole(blackHole, camera, delta);
  if (inspectedBody) inspectedBody.rotation.y += delta * 0.18;
  if (inspectedSunMaterial?.uniforms?.time) inspectedSunMaterial.uniforms.time.value += delta;
  controls.update();
  if (inspectedCometUpdater && inspectedBody) {
    const inverseRotation = inspectedBody.quaternion.clone().invert();
    const antiSolarDirection = keyLight.position
      .clone()
      .negate()
      .normalize()
      .applyQuaternion(inverseRotation);
    const orbitalVelocity = new THREE.Vector3(0, 1, 0).applyQuaternion(inverseRotation);
    inspectedBody.getWorldPosition(inspectedWorldPosition);
    const tailPresentation = getCometTailPresentation(
      inspectedWorldPosition,
      camera,
      stage.clientHeight,
      13,
      1
    );
    inspectedCometUpdater(
      antiSolarDirection,
      orbitalVelocity,
      now / 1000,
      1,
      tailPresentation.scale,
      tailPresentation.visible
    );
  }
  renderer.render(scene, camera);
}

ipcRenderer.on('black-hole:data', (_event, data) => showObject(data));
closeButton.addEventListener('click', () => ipcRenderer.send('black-hole:close'));
visibilityButton.addEventListener('click', () => {
  if (inspectedOrbit) {
    inspectedOrbit.visible = !inspectedOrbit.visible;
    visibilityButton.classList.toggle('active', inspectedOrbit.visible);
  }
});
infoButton.addEventListener('click', () => {
  dataPanel.hidden = !dataPanel.hidden;
  infoButton.classList.toggle('active', !dataPanel.hidden);
});
zoomInButton.addEventListener('click', () => changeZoom(0.82));
zoomOutButton.addEventListener('click', () => changeZoom(1.22));
cameraButton.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  controls.autoRotateSpeed = 0.45;
  cameraButton.classList.toggle('active', controls.autoRotate);
});
window.addEventListener('resize', resize);
resize();
animate(performance.now());
