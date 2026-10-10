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
const returnParentButton = document.getElementById('return-parent');
const artificialSatellitePanel = document.getElementById('artificial-satellite-panel');
const artificialSatelliteToggle = document.getElementById('toggle-artificial-satellites');
const artificialSatelliteStatus = document.getElementById('artificial-satellite-status');
const satelliteLegendTotal = document.getElementById('satellite-legend-total');
const selectedSatelliteDetails = document.getElementById('selected-artificial-satellite');
const selectedSatelliteLabel = document.getElementById('selected-satellite-label');
const satelliteHoverLabel = document.getElementById('satellite-hover-label');

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
let currentObjectData = null;
let artificialSatelliteWorker = null;
let artificialSatellitePoints = null;
let artificialSatelliteSpheres = null;
let artificialSatelliteOrbit = null;
let artificialSatelliteMarker = null;
let artificialSatelliteRecords = [];
let selectedArtificialSatelliteId = null;
let selectedArtificialSatelliteIndex = -1;
let artificialSatelliteLayerEnabled = false;
let previousCameraDistance = null;
let lastSatellitePointerDown = null;
let lastSatelliteHoverAt = 0;
const inspectedWorldPosition = new THREE.Vector3();
const satelliteSphereTransform = new THREE.Object3D();
const satelliteSelectionColor = new THREE.Color(0xffd166);
const satelliteSphereRadius = 0.018;
const selectedSatelliteSphereRadius = 0.03;
let previousTime = performance.now();

const satelliteCategories = [
  { name: 'LEO · i 50–60° · h 400–500 km', color: 0x12b3a8 },
  { name: 'LEO · i 40–50° · h 400–500 km', color: 0xef6a4c },
  { name: 'LEO polar · i 80–100°', color: 0x6663d9 },
  { name: 'LEO · i 50–60° · h 300–400 km', color: 0xe4b02a },
  { name: 'LEO · i 40–50° · h 300–400 km', color: 0x49a078 },
  { name: 'LEO · i 70–80° · h 400–500 km', color: 0xf08a24 },
  { name: 'LEO · i 70–80° · h 500–600 km', color: 0x4c78a8 },
  { name: 'LEO · i 60–70° · h 500–600 km', color: 0xb24c8b },
  { name: 'Starlink · demais bandas', color: 0x8a96a3 },
  { name: 'Outras constelações', color: 0xe3e7eb }
];

scene.add(new THREE.AmbientLight(0x5f6d82, 0.12));
const keyLight = new THREE.DirectionalLight(0xffe5c8, 1.35);
keyLight.position.set(-7, 5, 10);
scene.add(keyLight);

function isEarthInspection(data) {
  return data?.mode === 'celestial-body' && data.name === 'Terra';
}

function setSatelliteStatus(message) {
  artificialSatelliteStatus.textContent = message;
}

function removeSatelliteObject(object) {
  if (!object) return;
  scene.remove(object);
  object.geometry?.dispose();
  if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
  else object.material?.dispose();
}

function clearSelectedSatelliteDetails() {
  selectedSatelliteDetails.hidden = true;
  selectedSatelliteDetails.replaceChildren();
}

function stopArtificialSatelliteLayer() {
  if (artificialSatelliteWorker) {
    artificialSatelliteWorker.postMessage({ type: 'stop' });
    artificialSatelliteWorker.terminate();
    artificialSatelliteWorker = null;
  }
  removeSatelliteObject(artificialSatellitePoints);
  removeSatelliteObject(artificialSatelliteSpheres);
  removeSatelliteObject(artificialSatelliteOrbit);
  removeSatelliteObject(artificialSatelliteMarker);
  artificialSatellitePoints = null;
  artificialSatelliteSpheres = null;
  artificialSatelliteOrbit = null;
  artificialSatelliteMarker = null;
  artificialSatelliteRecords = [];
  selectedArtificialSatelliteId = null;
  selectedArtificialSatelliteIndex = -1;
  selectedSatelliteLabel.hidden = true;
  satelliteHoverLabel.hidden = true;
  satelliteLegendTotal.textContent = 'Distribuição (aguardando catálogo)';
  renderer.domElement.style.cursor = '';
  artificialSatelliteLayerEnabled = false;
  artificialSatelliteToggle.setAttribute('aria-pressed', 'false');
  artificialSatelliteToggle.textContent = 'Ativar camada';
  clearSelectedSatelliteDetails();
  if (inspectedOrbit) inspectedOrbit.visible = true;
  if (previousCameraDistance !== null) {
    camera.position.setLength(previousCameraDistance);
    previousCameraDistance = null;
    controls.maxDistance = 36;
    controls.update();
  }
}

function satelliteCategory(record) {
  if (!/^STARLINK/i.test(record.name)) return 'Outras constelações';

  const meanMotion = Number(record.meanMotion);
  if (!Number.isFinite(meanMotion) || meanMotion <= 0) return 'Starlink · demais bandas';
  const meanMotionRadians = (meanMotion * 2 * Math.PI) / 86400;
  const altitudeKm = Math.cbrt(398600.8 / (meanMotionRadians * meanMotionRadians)) - 6378.135;
  const inclination = Number(record.inclination);
  if (!Number.isFinite(inclination) || !Number.isFinite(altitudeKm)) {
    return 'Starlink · demais bandas';
  }

  if (inclination >= 80 && inclination <= 100 && altitudeKm >= 200 && altitudeKm < 1000) {
    return 'LEO polar · i 80–100°';
  }
  if (inclination >= 50 && inclination < 60 && altitudeKm >= 400 && altitudeKm < 500)
    return 'LEO · i 50–60° · h 400–500 km';
  if (inclination >= 40 && inclination < 50 && altitudeKm >= 400 && altitudeKm < 500)
    return 'LEO · i 40–50° · h 400–500 km';
  if (inclination >= 50 && inclination < 60 && altitudeKm >= 300 && altitudeKm < 400)
    return 'LEO · i 50–60° · h 300–400 km';
  if (inclination >= 40 && inclination < 50 && altitudeKm >= 300 && altitudeKm < 400)
    return 'LEO · i 40–50° · h 300–400 km';
  if (inclination >= 70 && inclination < 80 && altitudeKm >= 400 && altitudeKm < 500)
    return 'LEO · i 70–80° · h 400–500 km';
  if (inclination >= 70 && inclination < 80 && altitudeKm >= 500 && altitudeKm < 600)
    return 'LEO · i 70–80° · h 500–600 km';
  if (inclination >= 60 && inclination < 70 && altitudeKm >= 500 && altitudeKm < 600)
    return 'LEO · i 60–70° · h 500–600 km';
  return 'Starlink · demais bandas';
}

function satelliteColor(record) {
  const category = satelliteCategories.find((entry) => entry.name === record.category);
  return new THREE.Color(category?.color ?? 0x777777);
}

function addArtificialSatellitePoints(records) {
  artificialSatelliteRecords = records.map((record) => ({
    ...record,
    category: satelliteCategory(record)
  }));
  if (records.length === 0) {
    setSatelliteStatus('O catálogo não retornou elementos orbitais propagáveis.');
    return;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(records.length * 3), 3)
  );
  const colors = new Float32Array(records.length * 3);
  artificialSatelliteRecords.forEach((record, index) => {
    const color = satelliteColor(record);
    color.toArray(colors, index * 3);
  });
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 55);

  artificialSatellitePoints = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.075,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false
    })
  );
  artificialSatellitePoints.frustumCulled = false;
  scene.add(artificialSatellitePoints);

  artificialSatelliteSpheres = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 8, 6),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x8899aa,
      shininess: 64,
      toneMapped: false
    }),
    records.length
  );
  artificialSatelliteSpheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  artificialSatelliteSpheres.frustumCulled = false;
  artificialSatelliteSpheres.visible = false;
  artificialSatelliteRecords.forEach((record, index) => {
    artificialSatelliteSpheres.setColorAt(index, satelliteColor(record));
    satelliteSphereTransform.position.set(0, 0, 0);
    satelliteSphereTransform.scale.setScalar(satelliteSphereRadius);
    satelliteSphereTransform.updateMatrix();
    artificialSatelliteSpheres.setMatrixAt(index, satelliteSphereTransform.matrix);
  });
  artificialSatelliteSpheres.instanceMatrix.needsUpdate = true;
  artificialSatelliteSpheres.instanceColor.needsUpdate = true;
  scene.add(artificialSatelliteSpheres);

  artificialSatelliteMarker = new THREE.Mesh(
    new THREE.SphereGeometry(selectedSatelliteSphereRadius * 1.25, 16, 12),
    new THREE.MeshBasicMaterial({
      color: satelliteSelectionColor,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      toneMapped: false
    })
  );
  artificialSatelliteMarker.visible = false;
  scene.add(artificialSatelliteMarker);
}

function updateArtificialSatelliteSpherePositions(positions) {
  if (!artificialSatelliteSpheres) return;

  for (let index = 0; index < artificialSatelliteRecords.length; index += 1) {
    satelliteSphereTransform.position.fromArray(positions, index * 3);
    satelliteSphereTransform.scale.setScalar(
      index === selectedArtificialSatelliteIndex
        ? selectedSatelliteSphereRadius
        : satelliteSphereRadius
    );
    satelliteSphereTransform.updateMatrix();
    artificialSatelliteSpheres.setMatrixAt(index, satelliteSphereTransform.matrix);
  }

  artificialSatelliteSpheres.instanceMatrix.needsUpdate = true;
  artificialSatelliteSpheres.visible = true;
}

function updateArtificialSatelliteSphereSelection(index, selected) {
  if (!artificialSatelliteSpheres || index < 0) return;

  const record = artificialSatelliteRecords[index];
  const positionAttribute = artificialSatellitePoints.geometry.getAttribute('position');
  artificialSatelliteSpheres.setColorAt(
    index,
    selected ? satelliteSelectionColor : satelliteColor(record)
  );
  satelliteSphereTransform.position.fromBufferAttribute(positionAttribute, index);
  satelliteSphereTransform.scale.setScalar(
    selected ? selectedSatelliteSphereRadius : satelliteSphereRadius
  );
  satelliteSphereTransform.updateMatrix();
  artificialSatelliteSpheres.setMatrixAt(index, satelliteSphereTransform.matrix);
  artificialSatelliteSpheres.instanceColor.needsUpdate = true;
  artificialSatelliteSpheres.instanceMatrix.needsUpdate = true;
}

function appendSatelliteDetail(label, value) {
  const row = document.createElement('div');
  const term = document.createElement('dt');
  const description = document.createElement('dd');
  term.textContent = label;
  description.textContent = value;
  row.append(term, description);
  selectedSatelliteDetails.appendChild(row);
}

function renderSelectedSatellite(details) {
  const record = artificialSatelliteRecords.find((entry) => entry.catalogId === details.catalogId);
  selectedSatelliteDetails.replaceChildren();
  appendSatelliteDetail('Satélite', details.name);
  appendSatelliteDetail('NORAD ID', details.catalogId);
  appendSatelliteDetail('Categoria orbital', record?.category || 'Other');
  appendSatelliteDetail(
    'Altitude estimada',
    `${Math.round(details.altitudeKm).toLocaleString('pt-BR')} km`
  );
  appendSatelliteDetail('Inclinação orbital', `${Number(details.inclination).toFixed(2)}°`);
  appendSatelliteDetail('Período orbital', `${(details.periodMinutes / 60).toFixed(2)} h`);
  appendSatelliteDetail('Época dos elementos', new Date(details.epoch).toLocaleString('pt-BR'));
  selectedSatelliteDetails.hidden = false;
}

function drawSelectedOrbit(positions) {
  removeSatelliteObject(artificialSatelliteOrbit);
  if (positions.length < 6) return;
  const selectedRecord = artificialSatelliteRecords.find(
    (entry) => entry.catalogId === selectedArtificialSatelliteId
  );
  const points = [];
  for (let index = 0; index < positions.length; index += 3) {
    points.push(new THREE.Vector3(positions[index], positions[index + 1], positions[index + 2]));
  }
  artificialSatelliteOrbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color: satelliteColor(selectedRecord || {}).getHex(),
      transparent: true,
      opacity: 0.86,
      depthWrite: false,
      toneMapped: false
    })
  );
  scene.add(artificialSatelliteOrbit);
}

async function enableArtificialSatelliteLayer() {
  if (!isEarthInspection(currentObjectData) || artificialSatelliteLayerEnabled) return;

  artificialSatelliteLayerEnabled = true;
  artificialSatelliteToggle.setAttribute('aria-pressed', 'true');
  artificialSatelliteToggle.textContent = 'Desativar camada';
  setSatelliteStatus('Consultando o catálogo orbital do CelesTrak…');
  clearSelectedSatelliteDetails();
  if (inspectedOrbit) inspectedOrbit.visible = false;
  if (inspectedBody) inspectedBody.rotation.y = 0;
  previousCameraDistance = camera.position.length();
  controls.maxDistance = 70;
  camera.position.setLength(Math.max(previousCameraDistance, 26));
  controls.update();

  try {
    const catalog = await ipcRenderer.invoke('satellites:active:get');
    if (!artificialSatelliteLayerEnabled || !isEarthInspection(currentObjectData)) return;

    const fetchedDate = new Date(catalog.fetchedAt).toLocaleString('pt-BR');
    const ageNote = catalog.stale ? ' · atualização indisponível, usando cache' : '';
    setSatelliteStatus(`Preparando posições · elementos de ${fetchedDate}${ageNote}`);

    artificialSatelliteWorker = new Worker(
      new URL('./artificial-satellite-worker.js', import.meta.url),
      { type: 'module' }
    );
    artificialSatelliteWorker.onmessage = (event) => {
      const message = event.data || {};
      if (message.type === 'catalog-ready') {
        addArtificialSatellitePoints(message.satellites);
        satelliteLegendTotal.textContent = `Distribuição (${message.satellites.length.toLocaleString('pt-BR')} satélites)`;
        setSatelliteStatus(
          `${message.satellites.length.toLocaleString('pt-BR')} satélites · posições estimadas por SGP4 · dados de ${fetchedDate}${ageNote}`
        );
      } else if (message.type === 'positions' && artificialSatellitePoints) {
        const attribute = artificialSatellitePoints.geometry.getAttribute('position');
        attribute.array.set(message.positions);
        attribute.needsUpdate = true;
        updateArtificialSatelliteSpherePositions(message.positions);
        if (selectedArtificialSatelliteIndex >= 0) {
          artificialSatelliteMarker.position.fromBufferAttribute(
            attribute,
            selectedArtificialSatelliteIndex
          );
        }
      } else if (message.type === 'selected-orbit') {
        if (message.catalogId !== selectedArtificialSatelliteId) return;
        drawSelectedOrbit(message.points);
        renderSelectedSatellite(message.details);
      }
    };
    artificialSatelliteWorker.onerror = (error) => {
      setSatelliteStatus(`Falha ao calcular as órbitas: ${error.message || 'erro no worker'}`);
    };
    artificialSatelliteWorker.postMessage({ type: 'load', elements: catalog.elements });
  } catch (error) {
    stopArtificialSatelliteLayer();
    setSatelliteStatus(error.message || 'Não foi possível carregar o catálogo orbital.');
  }
}

function selectArtificialSatellite(catalogId) {
  const record = artificialSatelliteRecords.find((entry) => entry.catalogId === catalogId);
  if (!record || !artificialSatelliteWorker) return;
  const previousIndex = selectedArtificialSatelliteIndex;
  const nextIndex = artificialSatelliteRecords.findIndex((entry) => entry.catalogId === catalogId);
  if (previousIndex >= 0 && previousIndex !== nextIndex) {
    updateArtificialSatelliteSphereSelection(previousIndex, false);
  }
  selectedArtificialSatelliteId = catalogId;
  selectedArtificialSatelliteIndex = nextIndex;
  updateArtificialSatelliteSphereSelection(selectedArtificialSatelliteIndex, true);
  artificialSatelliteMarker.visible = true;
  artificialSatelliteMarker.position.fromBufferAttribute(
    artificialSatellitePoints.geometry.getAttribute('position'),
    selectedArtificialSatelliteIndex
  );
  selectedSatelliteLabel.textContent = record.name;
  selectedSatelliteLabel.hidden = false;
  selectedSatelliteDetails.replaceChildren();
  appendSatelliteDetail('Satélite', record.name);
  appendSatelliteDetail('NORAD ID', record.catalogId);
  appendSatelliteDetail('Categoria orbital', record.category);
  selectedSatelliteDetails.hidden = false;
  setSatelliteStatus(`Calculando a órbita de ${record.name}…`);
  artificialSatelliteWorker.postMessage({ type: 'select', catalogId });
}

function getArtificialSatelliteHit(event) {
  if (!artificialSatelliteLayerEnabled || !artificialSatellitePoints) return null;
  const rectangle = stage.getBoundingClientRect();
  if (!rectangle.width || !rectangle.height) return null;
  const pointerX = event.clientX - rectangle.left;
  const pointerY = event.clientY - rectangle.top;
  const pointer = new THREE.Vector2(
    (pointerX / rectangle.width) * 2 - 1,
    -(pointerY / rectangle.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  raycaster.params.Points.threshold = Math.max(
    0.1,
    (camera.position.distanceTo(controls.target) *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
      30) /
      rectangle.height
  );
  const hit = raycaster.intersectObject(artificialSatellitePoints, false)[0];
  if (!hit) return null;

  const earthIntersection = inspectedBody
    ? raycaster.intersectObject(inspectedBody.children[0], false)[0]
    : null;
  if (earthIntersection && earthIntersection.distance < hit.distance) return null;
  return { hit, pointerX, pointerY };
}

function pickArtificialSatellite(event) {
  if (!lastSatellitePointerDown) return;
  const movement = Math.hypot(
    event.clientX - lastSatellitePointerDown.x,
    event.clientY - lastSatellitePointerDown.y
  );
  lastSatellitePointerDown = null;
  if (movement > 5 || event.target.closest('button')) return;
  const result = getArtificialSatelliteHit(event);
  if (!result) return;
  satelliteHoverLabel.hidden = true;
  selectArtificialSatellite(artificialSatelliteRecords[result.hit.index].catalogId);
}

function hoverArtificialSatellite(event) {
  if (!artificialSatelliteLayerEnabled || event.timeStamp - lastSatelliteHoverAt < 80) return;
  lastSatelliteHoverAt = event.timeStamp;
  const result = getArtificialSatelliteHit(event);
  const record = result && artificialSatelliteRecords[result.hit.index];
  renderer.domElement.style.cursor = record ? 'pointer' : '';
  satelliteHoverLabel.hidden = !record;
  if (!record || !result) return;
  satelliteHoverLabel.textContent = record.name;
  satelliteHoverLabel.title = `${record.name} · ${record.category}`;
  satelliteHoverLabel.style.left = `${result.pointerX}px`;
  satelliteHoverLabel.style.top = `${result.pointerY}px`;
}

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
        parentObject: data,
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
  stopArtificialSatelliteLayer();
  currentObjectData = data;
  const parentObject = data.parentObject;
  returnParentButton.hidden = !parentObject;
  if (parentObject) {
    returnParentButton.textContent = `Voltar para ${parentObject.name}`;
    returnParentButton.setAttribute('aria-label', `Voltar para ${parentObject.name}`);
    returnParentButton.title = `Voltar para ${parentObject.name}`;
  }

  renderDetails(data);
  renderSatelliteSwitcher(data);
  artificialSatellitePanel.hidden = !isEarthInspection(data);
  if (isEarthInspection(data)) setSatelliteStatus('A camada inicia desativada.');
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
  if (inspectedBody && !artificialSatelliteLayerEnabled) inspectedBody.rotation.y += delta * 0.18;
  if (inspectedSunMaterial?.uniforms?.time) inspectedSunMaterial.uniforms.time.value += delta;
  controls.update();
  if (
    artificialSatelliteMarker?.visible &&
    artificialSatellitePoints &&
    selectedArtificialSatelliteId
  ) {
    const positions = artificialSatellitePoints.geometry.getAttribute('position');
    if (selectedArtificialSatelliteIndex >= 0) {
      const selectedPosition = new THREE.Vector3().fromBufferAttribute(
        positions,
        selectedArtificialSatelliteIndex
      );
      const direction = selectedPosition.sub(camera.position).normalize();
      selectedPosition.fromBufferAttribute(positions, selectedArtificialSatelliteIndex);
      const raycaster = new THREE.Raycaster(camera.position, direction);
      const earthIntersection = inspectedBody
        ? raycaster.intersectObject(inspectedBody.children[0], false)[0]
        : null;
      if (
        earthIntersection &&
        earthIntersection.distance < camera.position.distanceTo(selectedPosition)
      ) {
        selectedSatelliteLabel.hidden = true;
      } else {
        const screenPosition = selectedPosition.project(camera);
        selectedSatelliteLabel.hidden = screenPosition.z < -1 || screenPosition.z > 1;
        selectedSatelliteLabel.style.left = `${(screenPosition.x * 0.5 + 0.5) * stage.clientWidth}px`;
        selectedSatelliteLabel.style.top = `${(-screenPosition.y * 0.5 + 0.5) * stage.clientHeight}px`;
      }
    }
  }
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
returnParentButton.addEventListener('click', () => {
  if (currentObjectData?.parentObject) showObject(currentObjectData.parentObject);
});
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
artificialSatelliteToggle.addEventListener('click', () => {
  if (artificialSatelliteLayerEnabled) {
    stopArtificialSatelliteLayer();
    setSatelliteStatus('Camada desativada.');
  } else {
    enableArtificialSatelliteLayer();
  }
});
stage.addEventListener('pointerdown', (event) => {
  if (event.isPrimary && event.button === 0) {
    lastSatellitePointerDown = { x: event.clientX, y: event.clientY };
  }
});
stage.addEventListener('pointerup', pickArtificialSatellite);
stage.addEventListener('pointermove', hoverArtificialSatellite);
stage.addEventListener('pointerleave', () => {
  satelliteHoverLabel.hidden = true;
  renderer.domElement.style.cursor = '';
});
window.addEventListener('resize', resize);
resize();
animate(performance.now());
