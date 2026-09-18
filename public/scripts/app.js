import * as THREE from '../../node_modules/three/build/three.module.js'; // Corrigido para acessar o diretÃ³rio raiz
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js'; // Corrigido
import { celestialData } from '../../src/data/celestial_data.js';
import { tnoData } from '../../src/data/tno_data.js';
import { cometData } from '../../src/data/comet_data.js';
import { moonData } from '../../src/data/moon_data.js';
import { majorTNOData } from '../../src/data/major_tnos_data.js';
// NOVO IMPORT: Dados dos Buracos Negros
import { blackHoleData, GALACTIC_SCALE_FACTOR } from '../../src/data/black_hole_data.js';
import { initSearch } from '../../ui/search.js';
import { Trail } from '../../utils/trail.js';
// NOVO IMPORT: LÃ³gica de criaÃ§Ã£o do Buraco Negro
import { createBlackHole, animateBlackHole } from '../../utils/black_hole.js';
import { APP_VERSION } from './config.js';
import { initializeAudioPlayer } from './modules/audio-player.js';
import { initializeControlPanels } from './modules/control-panels.js';
import { initializeDateTime } from './modules/date-time.js';
import { initializeVersionDisplay } from './modules/version-display.js';

// --- VariÃ¡veis Globais e ConfiguraÃ§Ã£o Inicial ---
const scene = new THREE.Scene();

// Ajustamos o far para um valor alto para renderizar a transiÃ§Ã£o da galÃ¡xia (20.000.000)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50000000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.rotateSpeed = 0.42;
controls.zoomSpeed = 0.8;
controls.minPolarAngle = 0.08;
controls.maxPolarAngle = Math.PI - 0.08;
controls.minDistance = 20;
controls.maxDistance = 20000000; // Aumentado para permitir o zoom-out atÃ© a galÃ¡xia
// Desabilitamos o zoom padrÃ£o do OrbitControls, pois vamos controlÃ¡-lo manualmente
controls.enableZoom = true;

camera.position.z = 2500;

// VariÃ¡veis para seleÃ§Ã£o e hover
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let selectionHalo = null;
let hoveredObject = null;

// VariÃ¡veis de ESTADO para ROTAÃ‡ÃƒO MANUAL (PASSO 2)
let isDragging = false;
let previousMousePosition = {
  x: 0,
  y: 0
};
// Fator de sensibilidade da rotaÃ§Ã£o

// Elementos da UI
let planetInfoOverlay = document.getElementById('planet-info-overlay');
const scaleDisplayElem = document.getElementById('scale-display');
const loadingOverlay = document.getElementById('loading-overlay');

// NOVO: ReferÃªncias para os botÃµes de zoom
const zoomControlsContainer = document.getElementById('zoom-controls-container');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const toggleCameraBtn = document.getElementById('toggle-camera-btn');
const electronIpc = typeof window.require === 'function' ? window.require('electron').ipcRenderer : null;

function restoreMainNavigation() {
  selectedObject = null;
  hoveredObject = null;
  isCameraFree = true;
  isDragging = false;
  controls.enabled = true;
  controls.target.set(0, 0, 0);
  camera.position.set(0, 0, 2500);
  controls.update();
  hideInfoOverlay();
  zoomControlsContainer.style.display = 'none';
  renderer.domElement.style.cursor = 'default';
}

if (electronIpc) {
  electronIpc.on('dedicated-viewer:closed', restoreMainNavigation);
}

// Arrays de objetos
export const clickableObjects = [];
export const searchableSceneObjects = [];
const planets = [];
const majorTNOs = [];
const tnos = [];
const moons = [];
const comets = [];
// NOVO ARRAY: Buracos Negros
const blackHoles = [];
let sunObject = null; // Para armazenar o objeto do Sol

// --- CONFIGURAÃ‡ÃƒO GALÃCTICA E TRANSIÃ‡ÃƒO ---
let sunLightPoint = null;
let galaxyBackground = null;
// NOVO: VariÃ¡vel global para armazenar a textura de fundo do sistema solar
let solarSystemBackground = null;

// DefiniÃ§Ã£o dos EstÃ¡gios de VisualizaÃ§Ã£o (em Unidades de Cena)
const SOLAR_SYSTEM_END_DISTANCE = 400000;
const INTERSTELLAR_START_DISTANCE = SOLAR_SYSTEM_END_DISTANCE;
const GALAXY_START_DISTANCE = 2000000; // Aumentado para dar tempo do fade acontecer
const SUN_GLARE_END_FADE_DISTANCE = 600000;

// --- NOVO: CÃLCULO DE POSICIONAMENTO GALÃCTICO ---
// O Sol estÃ¡ em (0,0,0). O centro da galÃ¡xia estÃ¡ a ~26.000 Anos-Luz.
const DISTANCE_TO_GALACTIC_CENTER = 26000 * GALACTIC_SCALE_FACTOR;

// Offset para posicionar o plano da galÃ¡xia.
// Movemos o CENTRO da imagem da galÃ¡xia para longe, para que o Sol (0,0,0)
// fique localizado no BraÃ§o de Ã“rion (periferia da textura).
const GALACTIC_CENTER_POS = {
  x: 0,
  y: -2000, // Leve deslocamento vertical para dar profundidade 3D
  z: -DISTANCE_TO_GALACTIC_CENTER
};

// Arrays para as novas trilhas (trails)
const moonTrails = [];
const tnoMoonTrails = []; // Novo array para os trails das luas dos TNOs

// VariÃ¡vel para controle de zoom manual
let currentZoomDistance = 0;
// VariÃ¡vel para a posiÃ§Ã£o vertical do marcador
// NOVO: VariÃ¡vel de estado para a cÃ¢mera livre
let isCameraFree = false;

// Fator de escala para objetos celestes (ajustado para melhor visualizaÃ§Ã£o)
const CELESTIAL_SCALE_FACTOR = 0.00005;
const ORBIT_SCALE_UNITS_PER_AU = 100;

// Loading manager (AGORA UNIFICADO)
// CORRIGIDO: Usando THREE.LoadingManager do namespace importado.
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

function getViewerSatellites(data) {
  if (data?.isPlanet) {
    return moonData
      .filter((moon) => moon.parentPlanet === data.name)
      .map((moon) => ({ ...moon, isMoon: true, type: 'Satélite Natural' }));
  }

  if (data?.isMajorTNO) {
    const catalogEntry = majorTNOData.find((entry) => entry.name === data.name);
    return (catalogEntry?.satellites || []).map((satellite) => ({
      ...satellite,
      isMoonOfTNO: true,
      type: 'Satélite de planeta anão'
    }));
  }

  return [];
}

function openObjectViewer(data) {
  const isInspectableObject =
    data?.isBlackHole ||
    data?.isSun ||
    data?.isPlanet ||
    data?.isMoon ||
    data?.isMoonOfTNO ||
    data?.isMajorTNO ||
    data?.isTNO ||
    data?.isComet;
  if (!electronIpc || !isInspectableObject) return;

  electronIpc.invoke('black-hole:open', {
    mode: data.isBlackHole ? 'black-hole' : 'celestial-body',
    name: data.name || data.Nome || data['Designação provisória'],
    type: data.type || (data.isMajorTNO ? 'Planeta-anão' : data.isTNO ? 'TNO' : undefined),
    size: data.size,
    texturePath: data.texturePath,
    ring: data.ring,
    isComet: data.isComet,
    isTNO: data.isTNO,
    isMajorTNO: data.isMajorTNO,
    isMoon: data.isMoon,
    isMoonOfTNO: data.isMoonOfTNO,
    orbitSemiMajorAxis: data.positionX || data.a || data.position,
    orbitEccentricity: data.info?.['Excentricidade orbital'] || data.e || 0,
    orbitInclination:
      data.info?.['Inclinação orbital em graus'] || data.i || data.inclination || 0,
    massSolar: data.massSolar,
    distanceLY: data.distanceLY,
    sceneSize: data.sceneSize,
    isGalacticCenter: data.isGalacticCenter,
    info: data.info,
    satellites: getViewerSatellites(data)
  });
}

// --- Adicionado: Handlers de Erro para Debug de Texturas ---
loadingManager.onLoad = function () {
  console.log('[Texture Loader] Todas as texturas carregadas com sucesso.');
  // Garantindo que o loading overlay seja removido apenas apÃ³s o sucesso
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
  }
};

loadingManager.onError = function (url) {
  console.error('[Texture Loader ERROR] Falha ao carregar a textura: ' + url);
  // Se o carregamento falhar, vamos tentar rodar o app de qualquer forma, mas a textura estarÃ¡ faltando (objeto preto)
  if (loadingOverlay) {
    // CORRIGIDO: Remover o overlay mesmo se houver falha no carregamento.
    loadingOverlay.classList.add('hidden');
    console.warn('A aplicaÃ§Ã£o iniciou, mas algumas texturas estÃ£o faltando.');
  }
};
// --- FIM dos Handlers de Erro ---

// --- Adicionadas variÃ¡veis para a checagem de oclusÃ£o e labels ---
const occluders = [];
const CHECK_INTERVAL = 10; // Checar a cada 10 frames para otimizaÃ§Ã£o
const EPSILON_DISTANCE = 2; // Pequena margem para evitar que o prÃ³prio objeto seja ocluder
let frameCounter = 0;

// --- NOVO: FunÃ§Ã£o auxiliar para gerar o material do shader (REFATORADO PARA SUAVILIDADE REAL) ---
// Agora o cÃ¡lculo de intensidade Ã© feito no Fragment Shader (por pixel) para evitar artefatos
// --- FunÃ§Ãµes de CriaÃ§Ã£o de Objetos ---
// FunÃ§Ã£o ATUALIZADA para criar o Sol com Mesh esfÃ©rico e glows
function createDistantSun() {
  const sunData = celestialData.find((d) => d.name === 'Sol');

  // O objeto principal do Sol (Object3D pai)
  const sun = new THREE.Object3D();
  sun.userData = { ...sunData, isSun: true };
  scene.add(sun);

  // --- 1. MESH ESFÃ‰RICO DO SOL ---
  // Carrega a textura e cria o material emissivo
  const sunTexture = textureLoader.load(sunData.texturePath);
  const sunGeometry = new THREE.SphereGeometry(sunData.size, 64, 64);

  // Usamos MeshBasicMaterial com emissive para que ele brilhe e nÃ£o dependa de outras luzes
  const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture
  });

  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunMesh.userData = { ...sunData, isSun: true };
  sun.add(sunMesh); // Adiciona o mesh ao Object3D pai

  // Adiciona o mesh do sol como um objeto clicÃ¡vel
  clickableObjects.push(sunMesh);
  searchableSceneObjects.push({
    name: sunData.name,
    type: 'Estrela',
    object: sunMesh
  });

  // Adiciona o mesh como occluder
  occluders.push(sunMesh);

  // --- 2. LÃ³gica de iluminaÃ§Ã£o (PointLight) ---
  const pointLight = new THREE.PointLight(0xffffff, 1.5, 0, 1.5);
  sun.add(pointLight);

  // --- 3. Brilho do Sol (visÃ­vel de perto) ---
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 128;
  glowCanvas.height = 128;
  const ctx = glowCanvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    glowCanvas.width / 2,
    glowCanvas.height / 2,
    0,
    glowCanvas.width / 2,
    glowCanvas.height / 2,
    glowCanvas.width / 2
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, glowCanvas.width, glowCanvas.height);

  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xffa500,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const sunGlow = new THREE.Sprite(glowMaterial);
  // A escala deve ser maior que o mesh do sol
  sunGlow.scale.set(sunData.size * 10, sunData.size * 10, 1);
  sun.add(sunGlow);

  // --- 4. Ponto de Luz Distante (Sprite) - SEMPRE visÃ­vel de LONGE ---
  const starGlowCanvas = document.createElement('canvas');
  starGlowCanvas.width = 128;
  starGlowCanvas.height = 128;
  const starCtx = starGlowCanvas.getContext('2d');

  // Gradiente ajustado para simular um brilho de estrela mais intenso e amarelado
  const starGradient = starCtx.createRadialGradient(
    starGlowCanvas.width / 2,
    starGlowCanvas.height / 2,
    0,
    starGlowCanvas.width / 2,
    starGlowCanvas.height / 2,
    starGlowCanvas.width / 2
  );
  starGradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
  starGradient.addColorStop(0.2, 'rgba(255, 200, 0, 0.9)');
  starGradient.addColorStop(0.5, 'rgba(255, 160, 0, 0.5)');
  starGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  starCtx.fillStyle = starGradient;
  starCtx.fillRect(0, 0, starGlowCanvas.width, starGlowCanvas.height);

  const starTexture = new THREE.CanvasTexture(starGlowCanvas);
  const starMaterial = new THREE.SpriteMaterial({
    map: starTexture,
    color: 0xffff00,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0
  });

  sunLightPoint = new THREE.Sprite(starMaterial);
  sunLightPoint.scale.set(sunData.size * 80000, sunData.size * 80000, 1);
  sun.add(sunLightPoint);

  const labelDiv = document.createElement('div');
  labelDiv.className = 'planet-label category-planet';
  labelDiv.textContent = sunData.name.toUpperCase();
  document.getElementById('labels-container').appendChild(labelDiv);

  // O objeto de Sol agora contÃ©m o Mesh e o Object3D principal
  sunObject = {
    planet: sunMesh, // Alterado para o mesh para fins de rotaÃ§Ã£o e cÃ¡lculo de raio/zoom
    labelDiv: labelDiv,
    sunGlow: sunGlow // Adiciona o brilho prÃ³ximo ao objeto para controle de opacidade
  };

  // Retornamos o MESH para que ele possa ser usado na animaÃ§Ã£o e seleÃ§Ã£o.
  return sunMesh;
}

// Valores de velocidade orbital real
const _realOrbitalSpeeds = {
  Mercúrio: 47.89,
  Vênus: 35.04,
  Terra: 29.79,
  Marte: 24.13,
  Júpiter: 13.07,
  Saturno: 9.65,
  Urano: 6.81,
  Netuno: 5.44
};

// Fator de escala para as velocidades orbitais. Ajustado para melhor visualizaÃ§Ã£o.
const orbitalSpeedFactor = 0.0005;

// Limite de distÃ¢ncia da cÃ¢mera para exibir o nome do planeta
const PLANET_LABEL_VISIBILITY_DISTANCE = 1500;

// Limite de distÃ¢ncia da cÃ¢mera para exibir o nome da lua
const MOON_LABEL_VISIBILITY_DISTANCE = 200;
// NOVO: Limite de distÃ¢ncia da cÃ¢mera para exibir o nome do Buraco Negro
// Aumentado significativamente para ser visÃ­vel na transiÃ§Ã£o GalÃ¡ctica/Interestelar
const _BH_LABEL_VISIBILITY_DISTANCE = 1500000;

const _planetLabels = [];

// FUNÃ‡ÃƒO ATUALIZADA: Adiciona a lÃ³gica da atmosfera
function createPlanets() {
  celestialData
    .filter((d) => d.name !== 'Sol')
    .forEach((data) => {
      const planetTexture = textureLoader.load(data.texturePath);
      const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
      const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);

      planet.userData = { ...data, isPlanet: true };
      // Adiciona os planetas como occluders para os outros objetos
      occluders.push(planet);

      // O grupo orbit serÃ¡ usado para aplicar a inclinaÃ§Ã£o.
      const orbitGroup = new THREE.Group();
      scene.add(orbitGroup);
      // Adiciona o planeta ao grupo orbital
      orbitGroup.add(planet);

      // ConversÃ£o de graus para radianos para inclinaÃ§Ã£o orbital
      const inclinationRad = data.info['Inclinação orbital em graus'] * (Math.PI / 180);
      orbitGroup.rotation.x = inclinationRad;

      if (data.ring) {
        const ringTexture = textureLoader.load(data.ring.texturePath);
        const ringGeometry = new THREE.RingGeometry(
          data.ring.innerRadius,
          data.ring.outerRadius,
          64
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        planet.add(ringMesh);
        ringMesh.rotation.x = -0.5 * Math.PI;
      }

      // --- NOVO: LÃ“GICA DA ATMOSFERA ---
      // --- FIM LÃ“GICA DA ATMOSFERA ---

      // --- NOVO: VariÃ¡veis para Ã³rbita elÃ­ptica ---
      // A posiÃ§Ã£oX no dado Ã© o semi-eixo maior (a)
      const semiMajorAxis = data.positionX;
      const eccentricity = data.info['Excentricidade orbital'];
      const focusDistance = semiMajorAxis * eccentricity; // DistÃ¢ncia do foco (Sol)

      // Compensamos a posiÃ§Ã£o inicial do planeta para que o Sol (0,0,0) fique no foco
      // Definimos a posiÃ§Ã£o do planeta no afÃ©lio (distÃ¢ncia mÃ¡xima)
      // A posiÃ§Ã£o x na funÃ§Ã£o animate farÃ¡ o planeta se mover em torno do centro da elipse.
      planet.position.x = semiMajorAxis;

      // Ajuste da velocidade orbital usando a Terceira Lei de Kepler
      const orbitSpeed = orbitalSpeedFactor / Math.pow(semiMajorAxis, 1.5);

      // Aplica a lÃ³gica de trail fade nos planetas, similar Ã  das luas.
      const trail = new Trail(0x38bdf8, 900);
      scene.add(trail.line);

      const labelDiv = document.createElement('div');
      labelDiv.className = 'planet-label category-planet';
      labelDiv.textContent = data.name.toUpperCase();
      document.getElementById('labels-container').appendChild(labelDiv);

      planets.push({
        planet,
        orbitGroup,
        rotationSpeed: data.rotationSpeed,
        orbitSpeed,
        labelDiv,
        trail,
        // Armazena dados orbitais reais
        semiMajorAxis,
        eccentricity,
        focusDistance,
        orbitAngle: Math.random() * Math.PI * 2
      });
      clickableObjects.push(planet);
      searchableSceneObjects.push({
        name: planet.userData.name,
        type: 'Planeta',
        object: planet
      });
    });
}

function createBlackHoles() {
  blackHoleData.forEach((data) => {
    // Se for o centro galÃ¡ctico, forÃ§amos a posiÃ§Ã£o para o centro do background
    let position = data.position;
    if (data.isGalacticCenter) {
      // CORREÃ‡ÃƒO ESSENCIAL 1: Garante que Sgr A* use a posiÃ§Ã£o GALACTIC_CENTER_POS.
      position = { x: GALACTIC_CENTER_POS.x, y: GALACTIC_CENTER_POS.y, z: GALACTIC_CENTER_POS.z };

      // --- CORREÃ‡ÃƒO DE PROFUNDIDADE (Z-FIGHTING) ---
      // Move o buraco negro supermassivo ligeiramente acima do plano da galÃ¡xia (Y negativo),
      // onde o plano estÃ¡ em Y = GALACTIC_CENTER_POS.y (-2000).
      // Adicionamos uma pequena margem (5.000 unidades de cena) para garantir que ele fique
      // sempre acima do plano da textura galÃ¡ctica, eliminando o Z-fighting.
      position.y = GALACTIC_CENTER_POS.y + 5000;
      // --- FIM DA CORREÃ‡ÃƒO DE PROFUNDIDADE ---
    }

    const bhMesh = createBlackHole({ ...data, simpleRepresentation: true }, textureLoader);
    // Define a posiÃ§Ã£o absoluta na cena
    bhMesh.position.set(position.x, position.y, position.z);
    scene.add(bhMesh);

    clickableObjects.push(bhMesh);
    occluders.push(bhMesh);

    const labelDiv = document.createElement('div');
    labelDiv.className = 'planet-label black-hole-label category-black-hole';
    labelDiv.textContent = data.name.toUpperCase();
    document.getElementById('labels-container').appendChild(labelDiv);

    // CORREÃ‡ÃƒO ESSENCIAL 2: Garante que o objeto Sgr A* (bhMesh) tenha um nome no userData
    // para que a funÃ§Ã£o selectObject consiga encontrÃ¡-lo corretamente.
    bhMesh.userData.name = data.name;

    blackHoles.push({ bhMesh, labelDiv, position: bhMesh.position });
    searchableSceneObjects.push({ name: data.name, type: 'Buraco Negro', object: bhMesh });
  });
}

// ATUALIZADA: FunÃ§Ã£o para criar TNOs Principais com Ã³rbita elÃ­ptica e Trail
function createMajorTNOs() {
  // Busca dados de Netuno para escala
  const scaleFactor = ORBIT_SCALE_UNITS_PER_AU;

  majorTNOData.forEach((data) => {
    const tnoTexture = textureLoader.load(data.texturePath);
    const tnoGeometry = new THREE.SphereGeometry(data.size, 32, 32);
    const tnoMaterial = new THREE.MeshStandardMaterial({ map: tnoTexture });
    const tno = new THREE.Mesh(tnoGeometry, tnoMaterial);

    tno.userData = { ...data, isMajorTNO: true };
    occluders.push(tno);

    // O grupo orbit serÃ¡ usado para aplicar a inclinaÃ§Ã£o.
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    // Adiciona o TNO ao grupo orbital
    orbitGroup.add(tno);

    // --- CÃLCULO DE DADOS ELÃPTICOS PARA TNO PRINCIPAL (CORRIGIDO) ---
    const semiMajorAxisAU = data.info['Distância orbital média (UA)'];
    const eccentricity = data.info['Excentricidade orbital'];
    const inclinationDeg = data.info['Inclinação orbital em graus'];

    const a_scaled = semiMajorAxisAU * scaleFactor;
    const _semiMinorAxis = a_scaled * Math.sqrt(1 - eccentricity * eccentricity);
    const focusDistance = a_scaled * eccentricity; // DistÃ¢ncia do foco (Sol)

    // PosiÃ§Ã£o inicial do TNO no afÃ©lio (distÃ¢ncia mÃ¡xima)
    tno.position.x = a_scaled;

    // Ajuste da velocidade orbital usando a Terceira Lei de Kepler
    const orbitSpeed = orbitalSpeedFactor / Math.pow(a_scaled, 1.5);
    // --- FIM DO CÃLCULO DE DADOS ELÃPTICOS (CORRIGIDO) ---

    // ConversÃ£o de graus para radianos para inclinaÃ§Ã£o orbital
    const inclinationRad = inclinationDeg * (Math.PI / 180);
    orbitGroup.rotation.x = inclinationRad;

    // --- CRIAÃ‡ÃƒO DO TRAIL (Rastro) ---
    const trail = new Trail(0xd6b77c, 900);
    scene.add(trail.line);

    const labelDiv = document.createElement('div');
    labelDiv.className = 'planet-label category-dwarf';
    labelDiv.textContent = data.name.toUpperCase();
    document.getElementById('labels-container').appendChild(labelDiv);

    // >>> HABILITAR ATMOSFERA EM TNOs (Plutão) <<<
    majorTNOs.push({
      tno,
      orbitGroup,
      rotationSpeed: data.rotationSpeed,
      orbitSpeed,
      labelDiv,
      trail, // Adiciona o trail
      // Novos dados orbitais para cÃ¡lculo elÃ­ptico
      semiMajorAxis: a_scaled, // CORRIGIDO
      eccentricity: eccentricity, // CORRIGIDO
      focusDistance: focusDistance, // CORRIGIDO
      orbitAngle: Math.random() * Math.PI * 2 // Anomalia verdadeira inicial (Î¸)
    });
    clickableObjects.push(tno);
    searchableSceneObjects.push({
      name: tno.userData.name,
      type: 'Planeta-anão',
      object: tno
    });

    // CriaÃ§Ã£o de satÃ©lites para os TNOs principais
    if (data.satellites) {
      data.satellites.forEach((satelliteData) => {
        const satelliteTexture = textureLoader.load(satelliteData.texturePath);
        const satelliteGeometry = new THREE.SphereGeometry(satelliteData.size, 16, 16);
        const satelliteMaterial = new THREE.MeshStandardMaterial({ map: satelliteTexture });
        const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);

        satellite.userData = { ...satelliteData, isMoonOfTNO: true, parent: tno };

        const satelliteOrbitGroup = new THREE.Group();
        tno.add(satelliteOrbitGroup);

        const satelliteOrbitRadius = satelliteData.position * CELESTIAL_SCALE_FACTOR;
        const startAngle = Math.random() * Math.PI * 2;

        // Ajuste do nÃºmero de pontos do trail para os satÃ©lites de TNOs
        const trail = new Trail(0xc6cbd0, 420);
        scene.add(trail.line);
        tnoMoonTrails.push({ moon: satellite, trail });

        // --- NOVO: LÃ“GICA DA ATMOSFERA (se houver) ---
        // --- FIM LÃ“GICA DA ATMOSFERA ---

        satelliteOrbitGroup.add(satellite);
        satellite.position.x = satelliteOrbitRadius;

        const satelliteOrbitSpeed = (satelliteData.orbitSpeed / satelliteData.position) * 0.0001;

        const satelliteLabelDiv = document.createElement('div');
        satelliteLabelDiv.className = 'planet-label category-moon';
        satelliteLabelDiv.textContent = satelliteData.name.toUpperCase();
        document.getElementById('labels-container').appendChild(satelliteLabelDiv);

        moons.push({
          moon: satellite,
          orbitGroup: satelliteOrbitGroup,
          orbitRadius: satelliteOrbitRadius,
          rotationSpeed: satelliteData.rotationSpeed,
          orbitSpeed: satelliteOrbitSpeed,
          orbitAngle: startAngle,
          labelDiv: satelliteLabelDiv
        });

        clickableObjects.push(satellite);
        searchableSceneObjects.push({
          name: satellite.userData.name,
          type: 'Lua',
          object: satellite
        });
      });
    }
  });
}

const unifiedOrbits = {
  planets: null,
  majorTnos: null,
  tnos: null,
  comets: null
};

// ATUALIZADA: FunÃ§Ã£o para criar o caminho da Ã³rbita estÃ¡tica (elipse) para Planetas-AnÃµes
function createUnifiedOrbits() {
  // Órbitas dos planetas
  unifiedOrbits.planets = new THREE.Object3D();
  scene.add(unifiedOrbits.planets);

  celestialData
    .filter((d) => d.name !== 'Sol')
    .forEach((data) => {
      const semiMajorAxis = data.positionX;
      const eccentricity = data.info['Excentricidade orbital'];
      const inclinationDeg = data.info['Inclinação orbital em graus'];
      const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
      const focusDistance = semiMajorAxis * eccentricity; // DistÃ¢ncia do foco (Sol)

      // Grupo para a inclinaÃ§Ã£o orbital
      const orbitGroupInclination = new THREE.Object3D();
      orbitGroupInclination.rotation.x = inclinationDeg * (Math.PI / 180);
      unifiedOrbits.planets.add(orbitGroupInclination);

      // Grupo para o offset do Sol (o Sol estÃ¡ no foco, nÃ£o no centro da elipse)
      const orbitGroupOffset = new THREE.Object3D();
      orbitGroupOffset.position.x = -focusDistance; // O centro da elipse Ã© deslocado
      orbitGroupInclination.add(orbitGroupOffset);

      const segments = 1000;

      // Criamos os pontos para a ELIPSE
      const points = [];
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;

        // FÃ³rmula da elipse com centro em (0, 0)
        const x = semiMajorAxis * Math.cos(angle);
        const z = semiMinorAxis * Math.sin(angle);
        points.push(new THREE.Vector3(x, 0, z));
      }

      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x81909a,
        transparent: true,
        opacity: 0.28
      });

      // Usamos THREE.LineLoop para fechar a Ã³rbita sem criar o segmento indesejado (o "bug")
      const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);

      // Adicionamos a linha de Ã³rbita (elipse) ao grupo de offset, centralizando o Sol no foco.
      orbitLine.visible = false;
      orbitGroupOffset.add(orbitLine);
    });

  // Órbitas dos TNOs principais
  unifiedOrbits.majorTnos = new THREE.Object3D();
  scene.add(unifiedOrbits.majorTnos);

  const scaleFactor = ORBIT_SCALE_UNITS_PER_AU;

  majorTNOData.forEach((data) => {
    // --- CÃLCULO DE DADOS ELÃPTICOS PARA LINHA DE Ã“RBITA ---
    const semiMajorAxisAU = data.info['Distância orbital média (UA)'];
    const eccentricity = data.info['Excentricidade orbital'];
    const inclinationDeg = data.info['Inclinação orbital em graus'];

    const a_scaled = semiMajorAxisAU * scaleFactor;
    const semiMinorAxis = a_scaled * Math.sqrt(1 - eccentricity * eccentricity);
    const focusDistance = a_scaled * eccentricity; // DistÃ¢ncia do foco (Sol)

    const segments = 1000;

    // Grupo para a inclinaÃ§Ã£o orbital
    const orbitGroupInclination = new THREE.Object3D();
    orbitGroupInclination.rotation.x = inclinationDeg * (Math.PI / 180);
    unifiedOrbits.majorTnos.add(orbitGroupInclination);

    // Grupo para o offset do Sol (o Sol estÃ¡ no foco, nÃ£o no centro da elipse)
    const orbitGroupOffset = new THREE.Object3D();
    orbitGroupInclination.add(orbitGroupOffset);

    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;

      // FÃ³rmula da elipse com centro em (0, 0)
      const x = a_scaled * Math.cos(angle) - focusDistance; // Aplica o offset aqui
      const z = semiMinorAxis * Math.sin(angle);
      points.push(new THREE.Vector3(x, 0, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x8d9aa3,
      transparent: true,
      opacity: 0.24
    });

    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);

    orbitLine.visible = false;
    orbitGroupOffset.add(orbitLine);
  });

  // Órbitas dos TNOs e Cometas sÃ£o criadas separadamente agora
  unifiedOrbits.tnos = new THREE.Object3D();
  unifiedOrbits.comets = new THREE.Object3D();
  scene.add(unifiedOrbits.tnos);
  scene.add(unifiedOrbits.comets);
}

const tnoTexture = textureLoader.load('assets/textures/kuiper_texture.png');
const tnoStandardMaterial = new THREE.MeshStandardMaterial({
  map: tnoTexture,
  color: 0xffffff,
  roughness: 0.8,
  metalness: 0.1,
  emissive: new THREE.Color(0x000000),
  emissiveIntensity: 0.0
});

function createTNOs() {
  const tnoGroup = new THREE.Group();
  scene.add(tnoGroup);

  const marsSize = celestialData.find((d) => d.name === 'Marte').size;
  const tnoSize = marsSize * 0.3;
  const scaleFactor = ORBIT_SCALE_UNITS_PER_AU;

  tnoData.forEach((data) => {
    const tnoGeometry = new THREE.SphereGeometry(tnoSize, 8, 8);
    //const tnoMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.2 });
    const tno = new THREE.Mesh(tnoGeometry, tnoStandardMaterial);

    tno.userData = { ...data, isTNO: true };
    occluders.push(tno);

    const a = data.a * scaleFactor;
    const e = data.e;
    const i = data.i * (Math.PI / 180);
    const b = a * Math.sqrt(1 - e * e);
    const c = a * e;

    const tnoOrbit = new THREE.Object3D();
    scene.add(tnoOrbit);
    tnoOrbit.rotation.x = i; // Aplica a inclinaÃ§Ã£o correta aqui

    // CORREÃ‡ÃƒO: A curva elÃ­ptica deve ter o centro em (-c, 0) para que o foco (Sol) fique na origem (0,0)
    // A EllipseCurve Ã© criada no plano XY (x, y). Usaremos (x) para a coordenada X e (y) para a coordenada Z
    // na cena (plano XZ).
    const orbitCurve = new THREE.EllipseCurve(-c, 0, a, b, 0, 2 * Math.PI, false, 0);

    // --- INÃCIO DA MUDANÃ‡A: Estilo da Ã³rbita dos TNOs ---
    const segments = 1000;
    const curvePoints = orbitCurve.getPoints(segments);
    const points = [];
    // Mapeia os pontos da curva do plano XY (retornado pela EllipseCurve) para o plano XZ,
    // onde X e Z sÃ£o as coordenadas orbitais e Y Ã© 0 no espaÃ§o local do tnoOrbit.
    curvePoints.forEach((point) => {
      points.push(new THREE.Vector3(point.x, 0, point.y));
    });

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0xb4a37d,
      transparent: true,
      opacity: 0.34
    });
    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial); // Usamos LineLoop para fechar a Ã³rbita

    orbitLine.visible = false;
    tnoOrbit.add(orbitLine);

    const startAngle = Math.random() * Math.PI * 2;
    // CORREÃ‡ÃƒO ESSENCIAL: O mÃ©todo getPoint(t) da EllipseCurve requer 't' no intervalo [0, 1].
    const startPoint = orbitCurve.getPoint(startAngle / (2 * Math.PI));

    tno.position.x = startPoint.x;
    tno.position.y = 0; // Deve ser 0 para usar a rotaÃ§Ã£o de inclinaÃ§Ã£o
    tno.position.z = startPoint.y; // Y da curva se torna Z do mundo (no espaÃ§o local do tnoOrbit)
    tnoOrbit.add(tno);

    const tnoTrail = new Trail(0xa99bd8, 650);
    scene.add(tnoTrail.line);

    tnos.push({
      tno,
      orbit: tnoOrbit,
      a,
      e,
      i,
      currentAngle: startAngle,
      orbitCurve,
      orbitLine,
      trail: tnoTrail
    });
    clickableObjects.push(tno);

    searchableSceneObjects.push({
      name: data.Nome || data['Designação provisória'],
      type: 'TNO',
      object: tno
    });
  });
}

function createComets() {
  const sunSize = celestialData.find((d) => d.name === 'Sol').size;
  const scaleFactor = ORBIT_SCALE_UNITS_PER_AU;

  const cometHeadTexture = textureLoader.load('assets/textures/comet_head_mesh.jpg');

  function generateNoise(x, y, z, scale = 0.5) {
    return (
      (Math.sin(x * scale) + Math.sin(y * scale + Math.PI / 2) + Math.sin(z * scale + Math.PI)) / 3
    );
  }

  cometData.forEach((data) => {
    const baseGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const positions = baseGeometry.attributes.position;
    const tempPositions = [];

    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
      const noise = generateNoise(vertex.x, vertex.y, vertex.z, 0.2);
      const deformationFactor = 1 + noise * 0.3;
      vertex.multiplyScalar(deformationFactor);
      tempPositions.push(vertex.x, vertex.y, vertex.z);
    }
    baseGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tempPositions, 3));
    baseGeometry.computeVertexNormals();

    const cometMaterial = new THREE.MeshStandardMaterial({
      map: cometHeadTexture,
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.1,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.7
    });
    const comet = new THREE.Mesh(baseGeometry, cometMaterial);
    comet.userData = { ...data, isComet: true };
    occluders.push(comet);

    const numParticles = 1000;
    const tailGeometry = new THREE.BufferGeometry();
    const tailPositions = new Float32Array(numParticles * 3);
    const tailColors = new Float32Array(numParticles * 3);
    const tailSizes = new Float32Array(numParticles);

    const particleData = [];
    const tailLength = 15;
    const tailWidth = 3;

    const colorDustStart = new THREE.Color(0xfffff0);
    const colorDustEnd = new THREE.Color(0x000000);
    const colorIonStart = new THREE.Color(0xb4b4ff);
    const colorIonEnd = new THREE.Color(0x000000);

    for (let i = 0; i < numParticles; i++) {
      const z = -Math.random() * tailLength;
      const r = (Math.random() * 0.5 + 0.5) * tailWidth * (1 - Math.abs(z) / tailLength);
      const phi = Math.random() * Math.PI * 2;
      const x = r * Math.cos(phi);
      const y = r * Math.sin(phi);

      tailPositions[i * 3 + 0] = x;
      tailPositions[i * 3 + 1] = y;
      tailPositions[i * 3 + 2] = z;

      const fadeFactor = Math.abs(positions[i * 3 + 2]) / tailLength;
      const color =
        i % 2 === 0
          ? colorDustStart.clone().lerp(colorDustEnd, fadeFactor)
          : colorIonStart.clone().lerp(colorIonEnd, fadeFactor);
      tailColors[i * 3 + 0] = color.r;
      tailColors[i * 3 + 1] = color.g;
      tailColors[i * 3 + 2] = color.b;

      tailSizes[i] = 0.05 + Math.random() * 0.1;

      particleData.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          -(0.05 + Math.random() * 0.1)
        ),
        age: Math.random() * tailLength
      });
    }

    tailGeometry.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));
    tailGeometry.setAttribute('color', new THREE.BufferAttribute(tailColors, 3));
    tailGeometry.setAttribute('size', new THREE.Float32BufferAttribute(tailSizes, 1));

    const tailMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      size: 0.1,
      sizeAttenuation: true
    });

    const cometTail = new THREE.Points(tailGeometry, tailMaterial);
    comet.add(cometTail);
    comet.userData.particleData = particleData;
    comet.userData.tailLength = tailLength;

    const cometLabelDiv = document.createElement('div');
    cometLabelDiv.className = 'planet-label category-comet';
    cometLabelDiv.textContent = data.name.toUpperCase();
    document.getElementById('labels-container').appendChild(cometLabelDiv);
    const cometTrail = new Trail(0x9dd2c3, 650);
    scene.add(cometTrail.line);

    let a = data.a * scaleFactor;
    const e = data.e;
    const i = data.i * (Math.PI / 180);
    let b = a * Math.sqrt(1 - e * e);
    let c = a * e;

    const scaledPerihelion = data.q * scaleFactor;
    const minPerihelion = sunSize + 2;
    if (scaledPerihelion < minPerihelion) {
      a = minPerihelion / (1 - e);
      c = a * e;
      b = a * Math.sqrt(1 - e * e);
    }

    const cometOrbit = new THREE.Object3D();
    scene.add(cometOrbit);

    // CORREÃ‡ÃƒO: A curva elÃ­ptica deve ter o centro em (-c, 0) para que o foco (Sol) fique na origem (0,0)
    const orbitPoints = new THREE.EllipseCurve(-c, 0, a, b, 0, 2 * Math.PI, true, 0).getPoints(
      1000
    );

    // Mapeia os pontos para o plano XZ (onde Y do ponto se torna Z na cena)
    const mappedPoints = orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y));

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(mappedPoints);

    // --- INÃCIO DA MUDANÃ‡A: Estilo da Ã³rbita dos Cometas ---
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x8ca8ad,
      transparent: true,
      opacity: 0.34
    });
    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial); // LineLoop para fechar a Ã³rbita
    // --- FIM DA MUDANÃ‡A ---

    orbitLine.visible = false;
    cometOrbit.add(orbitLine);
    cometOrbit.rotation.x = i;

    cometOrbit.add(comet);

    const orbitCurve = new THREE.EllipseCurve(-c, 0, a, b, 0, 2 * Math.PI, true, 0);
    const startAngle = Math.random() * Math.PI * 2;

    // CORREÃ‡ÃƒO ESSENCIAL: O mÃ©todo getPoint(t) da EllipseCurve requer 't' no intervalo [0, 1].
    const startPoint = orbitCurve.getPoint(startAngle / (2 * Math.PI));

    comet.position.x = startPoint.x;
    comet.position.y = 0; // Deve ser 0 para usar a rotaÃ§Ã£o de inclinaÃ§Ã£o
    comet.position.z = startPoint.y; // Y da curva se torna Z do mundo (no espaÃ§o local do tnoOrbit)

    comets.push({
      comet,
      orbit: cometOrbit,
      a: a,
      e: e,
      i: i,
      currentAngle: startAngle,
      tail: cometTail,
      orbitLine,
      orbitCurve,
      orbitSpeedFactor: 0.005,
      labelDiv: cometLabelDiv,
      trail: cometTrail
    });

    clickableObjects.push(comet);
    searchableSceneObjects.push({
      name: data.name,
      type: 'Cometa',
      object: comet
    });
  });
}

const realMoonOrbitalSpeeds = {
  Lua: 1.022,
  Fobos: 2.18,
  Deimos: 1.35,
  Io: 17.3,
  Europa: 13.7,
  Ganimedes: 10.9,
  Calisto: 8.2,
  Titã: 5.57,
  Reia: 8.5,
  Iapeto: 3.26,
  Titânia: 3.64,
  Tritão: 4.39
};

const moonOrbitSpeedFactor = 0.0001;

const _moonLabels = [];

// FUNÃ‡ÃƒO ATUALIZADA: Adiciona a lÃ³gica da atmosfera (para Titã)
function createMoons() {
  const neptuneData = celestialData.find((d) => d.name === 'Netuno');
  const _scaleFactor = neptuneData.positionX / neptuneData.info['Distância orbital média (UA)'];

  moonData.forEach((data) => {
    const parentPlanetObj = planets.find((p) => p.planet.userData.name === data.parentPlanet);
    if (!parentPlanetObj) {
      console.warn(`Planeta pai nÃ£o encontrado para a lua: ${data.name}`);
      return;
    }

    const moonSize = data.size * CELESTIAL_SCALE_FACTOR;
    const moonTexture = textureLoader.load(data.texturePath);
    const moonGeometry = new THREE.SphereGeometry(moonSize, 16, 16);

    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    const moonOrbitGroup = new THREE.Group();
    parentPlanetObj.planet.add(moonOrbitGroup);

    const inclinationRad = data.inclination * (Math.PI / 180);
    moonOrbitGroup.rotation.x = inclinationRad;

    // Linha ~830 em app.js (dentro de createMoons)

    // ...
    moon.userData = { ...data, isMoon: true };

    // NOVO: Fator de escala visual para luas de TNOs.
    // Aumenta a distÃ¢ncia para que a lua nÃ£o se sobreponha ao planeta principal na escala de renderizaÃ§Ã£o.
    const TNO_MOON_VISUAL_SCALE = 100;

    let orbitDistanceFactor = CELESTIAL_SCALE_FACTOR;
    if (
      data.parentPlanet === 'Plutão' ||
      data.parentPlanet === 'Haumea' ||
      data.parentPlanet === 'Makemake' ||
      data.parentPlanet === 'Éris' ||
      data.parentPlanet === 'Salácia' ||
      data.parentPlanet === 'Orco'
    ) {
      orbitDistanceFactor *= TNO_MOON_VISUAL_SCALE;
    }

    // CORRIGIDO: Usa o fator de escala ajustado
    const moonOrbitRadius = data.position * orbitDistanceFactor;
    // ...
    const startAngle = Math.random() * Math.PI * 2;

    const trail = new Trail(0xc6cbd0, 700);
    scene.add(trail.line);
    moonTrails.push({ moon, trail });

    // --- NOVO: LÃ“GICA DA ATMOSFERA (Para Titã) ---
    // --- FIM LÃ“GICA DA ATMOSFERA ---

    moonOrbitGroup.add(moon);
    moon.position.x = moonOrbitRadius;

    const moonOrbitSpeed =
      (realMoonOrbitalSpeeds[data.name] / data.position) * moonOrbitSpeedFactor;

    const labelDiv = document.createElement('div');
    labelDiv.className = 'planet-label category-moon';
    labelDiv.textContent = data.name.toUpperCase();
    document.getElementById('labels-container').appendChild(labelDiv);

    moons.push({
      moon,
      orbitGroup: moonOrbitGroup,
      orbitRadius: moonOrbitRadius,
      rotationSpeed: data.rotationSpeed,
      orbitSpeed: moonOrbitSpeed,
      orbitAngle: startAngle,
      labelDiv
    });

    clickableObjects.push(moon);
    searchableSceneObjects.push({
      name: moon.userData.name,
      type: 'Lua',
      object: moon
    });
  });
}

// --- FunÃ§Ã£o auxiliar para verificar oclusÃ£o de labels com raycasting ---
function checkOcclusion(object) {
  if (!object.labelDiv || !object.labelDiv.classList.contains('visible')) {
    return; // NÃ£o precisa checar se o label jÃ¡ estÃ¡ oculto
  }

  // PosiÃ§Ã£o do objeto na tela em NDC
  const position = new THREE.Vector3();
  const objectMesh = object.planet || object.tno || object.bhMesh; // Adiciona bhMesh
  // Verifica se objectMesh Ã© um objeto 3D antes de chamar getWorldPosition
  if (!(objectMesh instanceof THREE.Object3D)) {
    return;
  }

  objectMesh.getWorldPosition(position);
  const screenPosition = position.clone().project(camera);

  // Se o objeto estiver atrÃ¡s da cÃ¢mera, esconda a label imediatamente
  if (screenPosition.z > 1) {
    object.labelDiv.style.opacity = '0';
    return;
  }

  // Cria um vetor de direÃ§Ã£o da cÃ¢mera para o objeto
  const direction = new THREE.Vector3().subVectors(position, camera.position).normalize();

  // Configura o raycaster
  raycaster.set(camera.position, direction);

  // Filtra occluders para evitar checar o prÃ³prio objeto
  const filteredOccluders = occluders.filter((o) => o.uuid !== objectMesh.uuid);

  // Encontra a interseÃ§Ã£o mais prÃ³xima
  const intersects = raycaster.intersectObjects(filteredOccluders, true);

  const distanceToCamera = camera.position.distanceTo(position);

  if (intersects.length > 0) {
    // A distÃ¢ncia atÃ© o occluder mais prÃ³xima
    const distanceToOccluder = intersects[0].distance;

    // Se a distÃ¢ncia atÃ© o occluder for menor que a distÃ¢ncia atÃ© o objeto, ele estÃ¡ ocluÃ­do
    if (distanceToOccluder < distanceToCamera - EPSILON_DISTANCE) {
      object.labelDiv.style.opacity = '0';
    } else {
      object.labelDiv.style.opacity = '1';
    }
  } else {
    // Nenhuma interseÃ§Ã£o, o objeto estÃ¡ visÃ­vel
    object.labelDiv.style.opacity = '1';
  }
}

// O skydome padrÃ£o Ã© REMOVIDO e a textura Ã© aplicada ao background da cena.
function setupBackground() {
  textureLoader.load('assets/textures/milky_way.jpg', (loadedTexture) => {
    // Armazena a textura globalmente para que a lÃ³gica de transiÃ§Ã£o possa restaurÃ¡-la.
    solarSystemBackground = loadedTexture;
    scene.background = solarSystemBackground;
  });
}
function createGalaxyBackground() {
  // Tamanho gigantesco para o plano da galÃ¡xia (50 MilhÃµes)
  const GALAXY_PLANE_SIZE = 50000000;

  const galaxyTexture = textureLoader.load('assets/textures/galaxy_backy.png');

  const galaxyMaterial = new THREE.MeshBasicMaterial({
    map: galaxyTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0, // ComeÃ§a invisÃ­vel, o animate controla o fade in
    depthWrite: false
  });

  const planeGeometry = new THREE.PlaneGeometry(GALAXY_PLANE_SIZE, GALAXY_PLANE_SIZE);
  galaxyBackground = new THREE.Mesh(planeGeometry, galaxyMaterial);

  // RotaÃ§Ã£o para ficar horizontal (plano XZ)
  galaxyBackground.rotation.x = -Math.PI / 2;

  // --- AQUI ESTÃ A MÃGICA DO POSICIONAMENTO ---
  // Posiciona o centro da textura longe da cÃ¢mera
  galaxyBackground.position.set(
    GALACTIC_CENTER_POS.x,
    GALACTIC_CENTER_POS.y,
    GALACTIC_CENTER_POS.z
  );

  // Opcional: Ajuste de rotaÃ§Ã£o Z para alinhar visualmente os braÃ§os da espiral
  galaxyBackground.rotation.z = Math.PI / 1.2;

  scene.add(galaxyBackground);
}

function createKuiperBelt() {
  for (let i = 0; i < kuiperBeltCount; i++) {
    const tno = new THREE.Mesh(kuiperGeometry, kuiperMaterial);
    const angle = Math.random() * Math.PI * 2;
    const radius = kuiperMinRadius + Math.random() * (kuiperMaxRadius - kuiperMinRadius);

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    // Faixa de elevaÃ§Ã£o (Y) um pouco maior do que o cinturÃ£o de asteroides (eixo Z Ã© o eixo de rotaÃ§Ã£o)
    const y = (Math.random() - 0.5) * 150;

    tno.position.set(x, y, z);
    tno.rotation.x = Math.random() * Math.PI;
    tno.rotation.y = Math.random() * Math.PI;
    tno.rotation.z = Math.random() * Math.PI;

    kuiperGroup.add(tno);
  }
}

const asteroidCount = 2800;
const asteroidMinRadius = 300;
const asteroidMaxRadius = 400;
const asteroidGeometry = new THREE.SphereGeometry(0.2, 8, 8);
const asteroidBaseTexture = textureLoader.load('assets/textures/asteroid_texture.jpg'); // Corrigido
const asteroidMaterial = new THREE.MeshStandardMaterial({
  map: asteroidBaseTexture,
  roughness: 0.8,
  metalness: 0.1,
  emissive: new THREE.Color(0x000000),
  emissiveIntensity: 0.05
});

const asteroidGroup = new THREE.Group();
scene.add(asteroidGroup);

for (let i = 0; i < asteroidCount; i++) {
  const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
  const angle = Math.random() * Math.PI * 2;
  const radius = asteroidMinRadius + Math.random() * (asteroidMaxRadius - asteroidMinRadius);
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = (Math.random() - 0.5) * 4;
  asteroid.position.set(x, y, z);
  asteroid.rotation.x = Math.random() * Math.PI;
  asteroid.rotation.y = Math.random() * Math.PI;
  asteroid.rotation.z = Math.random() * Math.PI;
  asteroidGroup.add(asteroid);
}

const kuiperBeltCount = 8000;
const kuiperMinRadius = 3011; // ComeÃ§a apÃ³s Netuno
const kuiperMaxRadius = 5000; // Cerca de 50 UA
const kuiperGeometry = new THREE.SphereGeometry(2, 4, 4); // Esferas maiores e menos detalhadas para distÃ¢ncia
const kuiperBaseTexture = textureLoader.load('assets/textures/kuiper_texture.jpg');
const kuiperMaterial = new THREE.MeshStandardMaterial({
  map: kuiperBaseTexture,
  roughness: 0.9,
  metalness: 0.1,
  emissive: new THREE.Color(0x3333ff), // Brilho azul/roxo sutil para o gelo
  emissiveIntensity: 0.1
});
const kuiperGroup = new THREE.Group();
scene.add(kuiperGroup);

createDistantSun(); // Chama a nova funÃ§Ã£o simplificada
createPlanets();
createMoons();
createTNOs();
createComets();
createMajorTNOs(); // CORRIGIDO: Agora tem a lÃ³gica de cÃ¡lculo elÃ­ptico dentro
createBlackHoles(); // NOVO: Chama a criaÃ§Ã£o dos buracos negros
createUnifiedOrbits();
setupBackground(); // Chamada para configurar o background
createGalaxyBackground(); // Chamada para o novo fundo plano da galÃ¡xia
createKuiperBelt(); // Chamada para criar o cinturÃ£o de Kuiper

// Adicionado: Event listener para a roda do mouse para zoom
window.addEventListener('wheel', onMouseWheel, false);
document.addEventListener('keydown', onKeyDown, false);

function onMouseWheel(event) {
  if (selectedObject && !isCameraFree) {
    // Altera a distÃ¢ncia de zoom com base na direÃ§Ã£o da roda do mouse
    // Multiplicamos por um fator de aceleraÃ§Ã£o para um zoom mais suave
    currentZoomDistance += event.deltaY * 0.01 * currentZoomDistance;
    // Limita a distÃ¢ncia para evitar que a cÃ¢mera entre no objeto
    currentZoomDistance = Math.max(calculateMinZoomDistance(selectedObject), currentZoomDistance);
  } else if (isCameraFree) {
    // LÃ³gica de zoom no modo livre
    const mouseRaycaster = new THREE.Raycaster();
    mouseRaycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(clickableObjects);
    let zoomTarget = null;
    if (intersects.length > 0) {
      zoomTarget = intersects[0].point;
    } else {
      zoomTarget = controls.target;
    }

    const direction = new THREE.Vector3().subVectors(zoomTarget, camera.position).normalize();
    const distanceToTarget = camera.position.distanceTo(zoomTarget);
    const newDistance = distanceToTarget + event.deltaY * 0.001 * distanceToTarget;

    // Limita a distÃ¢ncia para evitar que a cÃ¢mera entre no objeto mais prÃ³ximo
    const closestObject = findClosestObject(camera.position);
    if (closestObject) {
      const minZoomDistance = calculateMinZoomDistance(closestObject);
      if (newDistance < minZoomDistance) {
        return;
      }
    }
    camera.position.addScaledVector(direction, event.deltaY * 0.001 * distanceToTarget);

    controls.update(); // Garante que a cÃ¢mera livre seja atualizada
  }
}

function onKeyDown(event) {
  if (selectedObject && !isCameraFree) {
    if (event.key === '+' || event.key === '=' || event.key === 'ArrowUp') {
      currentZoomDistance *= 0.9;
    } else if (event.key === '-' || event.key === 'ArrowDown') {
      currentZoomDistance *= 1.1;
    }
    currentZoomDistance = Math.max(calculateMinZoomDistance(selectedObject), currentZoomDistance);
  } else if (isCameraFree) {
    if (event.key === '+' || event.key === '=' || event.key === 'ArrowUp') {
      camera.position.multiplyScalar(0.9);
    } else if (event.key === '-' || event.key === 'ArrowDown') {
      camera.position.multiplyScalar(1.1);
    }
    controls.update();
  }
}

function onDocumentClick(event) {
  if (event.target.closest('.info-overlay') || event.target.closest('#controls-container')) {
    return; // IGNORA CLIQUES NOS BOTÃ•ES DA NOVA BARRA LATERAL
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(clickableObjects, true); // Usa `true` para verificar recursivamente

  // CORREÃ‡ÃƒO: Ignora o clique se o usuÃ¡rio estiver arrastando/girando a cÃ¢mera focada
  if (isDragging) {
    return;
  }

  if (intersects.length > 0) {
    // Encontra o objeto clicÃ¡vel que contÃ©m o userData.isBlackHole/isPlanet, etc.
    let newSelectedObject = intersects[0].object;
    while (
      !newSelectedObject.userData.isBlackHole &&
      !newSelectedObject.userData.isSun &&
      !newSelectedObject.userData.isPlanet &&
      !newSelectedObject.userData.isMoon &&
      !newSelectedObject.userData.isMoonOfTNO &&
      !newSelectedObject.userData.isMajorTNO &&
      !newSelectedObject.userData.isTNO &&
      !newSelectedObject.userData.isComet &&
      newSelectedObject.parent
    ) {
      newSelectedObject = newSelectedObject.parent;
      if (newSelectedObject.uuid === selectedObject?.uuid) return; // Evita selecionar o parent se jÃ¡ for o selecionado
    }

    // Verifica se o objeto encontrado Ã© um objeto selecionÃ¡vel real
    if (
      newSelectedObject.userData.isBlackHole ||
      newSelectedObject.userData.isSun ||
      newSelectedObject.userData.isPlanet ||
      newSelectedObject.userData.isMoon ||
      newSelectedObject.userData.isMajorTNO ||
      newSelectedObject.userData.isTNO ||
      newSelectedObject.userData.isComet
    ) {
      if (selectedObject !== newSelectedObject) {
        deselectObject();
        selectObject(newSelectedObject);
      }
    }
  }
  // REMOVIDO: A lÃ³gica de deseleÃ§Ã£o por CLIQUE ÃšNICO foi removida.
}

// NOVO: FunÃ§Ã£o para DeseleÃ§Ã£o por Duplo Clique
function onDocumentDoubleClick(event) {
  if (event.target.closest('.info-overlay') || event.target.closest('#controls-container')) {
    return; // IGNORA CLIQUES NOS BOTÃ•ES DA NOVA BARRA LATERAL
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(clickableObjects);

  // Se nÃ£o atingir nenhum objeto selecionÃ¡vel, deseleciona.
  // Isso garante que vocÃª precisa de um duplo clique fora do objeto para sair da cÃ¢mera.
  if (intersects.length === 0) {
    deselectObject();
  }
}

function onDocumentMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // --- LÃ³gica de RotaÃ§Ã£o Manual (quando um objeto estÃ¡ selecionado) ---
  if (selectedObject && !isCameraFree && isDragging) {
    const _deltaX = event.clientX - previousMousePosition.x;
    const _deltaY = event.clientY - previousMousePosition.y;

    const _objectToRotate = selectedObject.userData.isSun
      ? sunObject.planet.parent
      : selectedObject.parent;

    // Para rotaÃ§Ã£o horizontal e vertical durante o arrasto, aplicamos a rotaÃ§Ã£o na cÃ¢mera
    // em torno do target (que Ã© o objeto selecionado).

    // No entanto, para usar a rotaÃ§Ã£o anterior, precisamos usar a posiÃ§Ã£o do mouse na LÃ“GICA DO ANIMATE.
    // Aqui, apenas atualizamos o previousMousePosition para o prÃ³ximo frame.

    // CORREÃ‡ÃƒO: Aplicamos a rotaÃ§Ã£o no Object3D PARENT APENAS para fins de rotaÃ§Ã£o do objeto (nÃ£o da cÃ¢mera)
    // A rotaÃ§Ã£o horizontal (yaw) do objeto pai causa o giro aparente no modo de inspeÃ§Ã£o.
    // A rotaÃ§Ã£o vertical do objeto Ã© desaconselhada devido Ã  inclinaÃ§Ã£o orbital.

    // A rotaÃ§Ã£o horizontal (yaw) do objeto pai pode ser aplicada aqui
    // objectToRotate.rotation.y += deltaX * rotationSensitivity;

    // Vamos deixar a rotaÃ§Ã£o da cÃ¢mera ser tratada no `animate` usando o `isDragging`
  }

  // --- LÃ³gica de Hover (Raycasting) ---
  const intersects = raycaster.intersectObjects(clickableObjects);

  if (intersects.length > 0) {
    const newHoveredObject = intersects[0].object;
    if (hoveredObject !== newHoveredObject) {
      // Encontra o objeto raiz clicÃ¡vel
      let rootHoveredObject = newHoveredObject;
      while (
        !rootHoveredObject.userData.isBlackHole &&
        !rootHoveredObject.userData.isPlanet &&
        !rootHoveredObject.userData.isMoon &&
        !rootHoveredObject.userData.isMoonOfTNO &&
        !rootHoveredObject.userData.isMajorTNO &&
        !rootHoveredObject.userData.isTNO &&
        !rootHoveredObject.userData.isComet &&
        rootHoveredObject.parent
      ) {
        rootHoveredObject = rootHoveredObject.parent;
      }

      // CORREÃ‡ÃƒO: Verifica se o objeto hoverado Ã© o Sol (sunObject.planet)
      const isHoveredSun = sunObject && hoveredObject === sunObject.planet;

      if (
        hoveredObject &&
        hoveredObject.userData.isTNO &&
        hoveredObject.material instanceof THREE.MeshStandardMaterial
      ) {
        hoveredObject.material.emissive.setHex(0xff0000);
      }
      if (
        hoveredObject &&
        hoveredObject.userData.isPlanet &&
        hoveredObject.material instanceof THREE.MeshStandardMaterial
      ) {
        hoveredObject.material.emissive.setHex(0x000000);
      }
      // NOVO: Remove o destaque de Buraco Negro anterior (o disco de acreÃ§Ã£o)
      if (hoveredObject && hoveredObject.userData.isBlackHole) {
        // Diminui o brilho do disco de acreÃ§Ã£o (ShaderMaterial) no hover-out
        if (hoveredObject.userData.accretionDisc.material.uniforms) {
          hoveredObject.userData.accretionDisc.material.uniforms.hoverBoost.value = 0.0;
        }
      }

      // O Sol nÃ£o precisa de emissive hover effect, mas precisa ser rastreado
      if (isHoveredSun) {
        hoveredObject = rootHoveredObject;
        renderer.domElement.style.cursor = 'pointer';
        return;
      }

      hoveredObject = rootHoveredObject;

      if (hoveredObject !== selectedObject) {
        if (
          hoveredObject.userData.isPlanet &&
          hoveredObject.material instanceof THREE.MeshStandardMaterial
        ) {
          hoveredObject.material.emissive.setHex(0x0a2040);
        } else if (
          hoveredObject.userData.isTNO &&
          hoveredObject.material instanceof THREE.MeshStandardMaterial
        ) {
          hoveredObject.material.emissive.setHex(0xffff00);
        }
        // NOVO: Adiciona destaque de Buraco Negro (aumenta o brilho do disco)
        else if (hoveredObject.userData.isBlackHole) {
          // Aumenta o brilho do disco de acreÃ§Ã£o (ShaderMaterial) no hover-in
          if (hoveredObject.userData.accretionDisc.material.uniforms) {
            hoveredObject.userData.accretionDisc.material.uniforms.hoverBoost.value = 0.5;
          }
        }
      }
      renderer.domElement.style.cursor = 'pointer';
    }
  } else {
    if (hoveredObject && hoveredObject !== selectedObject) {
      if (
        hoveredObject.userData.isTNO &&
        hoveredObject.material instanceof THREE.MeshStandardMaterial
      ) {
        hoveredObject.material.emissive.setHex(0xff0000);
      }
      if (
        hoveredObject.userData.isPlanet &&
        hoveredObject.material instanceof THREE.MeshStandardMaterial
      ) {
        hoveredObject.material.emissive.setHex(0x000000);
      }
      // NOVO: Remove o destaque de Buraco Negro ao sair
      if (hoveredObject && hoveredObject.userData.isBlackHole) {
        // Diminui o brilho do disco de acreÃ§Ã£o (ShaderMaterial) no hover-out
        if (hoveredObject.userData.accretionDisc.material.uniforms) {
          hoveredObject.userData.accretionDisc.material.uniforms.hoverBoost.value = 0.0;
        }
      }
    }
    hoveredObject = null;
    renderer.domElement.style.cursor = 'default';
  }

  // Atualiza a posiÃ§Ã£o anterior do mouse para o prÃ³ximo frame de arrasto
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
}

// --- NOVO: FunÃ§Ãµes de Evento do Mouse para RotaÃ§Ã£o Manual ---
function onDocumentMouseDown(event) {
  // 1. Inicia o arrasto APENAS se um objeto estiver selecionado e a cÃ¢mera livre estiver DESLIGADA
  // E o botÃ£o esquerdo do mouse (button 0) for pressionado.
  if (event.button === 0 && selectedObject && !isCameraFree) {
    isDragging = true;
    // Captura a posiÃ§Ã£o inicial do mouse
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
    // Impede o OrbitControls de assumir o controle (mesmo que esteja desabilitado)
    event.preventDefault();

    // O cursor deve ser um indicador de movimento
    renderer.domElement.style.cursor = 'grabbing';
  }
}

function onDocumentMouseUp() {
  // 2. Para o arrasto
  if (isDragging) {
    isDragging = false;
    // Retorna o cursor ao estado normal se nÃ£o estiver sobre um objeto clicÃ¡vel
    if (!hoveredObject) {
      renderer.domElement.style.cursor = 'default';
    } else {
      renderer.domElement.style.cursor = 'pointer';
    }
  }
}
// --- FIM das FunÃ§Ãµes de Evento do Mouse para RotaÃ§Ã£o Manual ---

// NOVO: FunÃ§Ã£o para calcular a distÃ¢ncia de zoom mÃ­nima segura
function calculateMinZoomDistance(object) {
  let radius = 1;

  // O Sol Ã© sunObject.planet, que agora Ã© um Mesh e tem geometry.parameters.radius
  if (sunObject && object === sunObject.planet) {
    radius = object.geometry.parameters.radius;
    // Permite um zoom muito prÃ³ximo ao Sol (mas seguro)
    return radius * 1.05;
  }
  // NOVO: LÃ³gica para Buraco Negro
  else if (object.userData.isBlackHole) {
    // Usa o raio Rs (Raio de Schwarzschild) que estÃ¡ no userData
    // O raio real do buraco negro na cena Ã© o rsRadius (calculado em utils/black_hole.js)
    radius = object.userData.rsRadius || object.userData.sceneSize;
    // Permite um zoom muito prÃ³ximo ao buraco negro, mas antes do horizonte de eventos
    // Usamos um fator maior para BH para incluir o disco de acreÃ§Ã£o
    return radius * 5;
  }

  if (object.geometry && object.geometry.parameters.radius) {
    radius = object.geometry.parameters.radius;
  } else if (object.userData.size) {
    // Para luas ou TNOs sem raio de geometria definido
    radius = object.userData.size * CELESTIAL_SCALE_FACTOR;
  }

  // Calcula a distÃ¢ncia mÃ­nima com base no raio da atmosfera
  // A distÃ¢ncia deve ser um pouco maior que o raio * multiplicador da atmosfera
  // Retorna um mÃ­nimo absoluto de 1 para evitar valores minÃºsculos
  return Math.max(1, radius * 1.5);
}

export function selectObject(nameToFind) {
  let object = null;
  if (nameToFind instanceof THREE.Object3D) {
    object = nameToFind;
  } else {
    const found = searchableSceneObjects.find((obj) => obj.name === nameToFind);
    if (found) {
      object = found.object;
    }
  }

  if (!object) {
    console.error('Objeto nÃ£o encontrado na cena:', nameToFind);
    return;
  }

  const opensDedicatedViewer =
    object.userData.isBlackHole ||
    object.userData.isSun ||
    object.userData.isPlanet ||
    object.userData.isMoon ||
    object.userData.isMoonOfTNO ||
    object.userData.isMajorTNO ||
    object.userData.isTNO ||
    object.userData.isComet;

  if (opensDedicatedViewer) {
    deselectObject();
    openObjectViewer(object.userData);
    restoreMainNavigation();
    return;
  }

  deselectObject();

  selectedObject = object;

  // NOVO: Define o estado inicial como cÃ¢mera fixa
  isCameraFree = false;
  controls.enabled = false;

  // Remove a classe 'active' do botÃ£o de cÃ¢mera livre
  document.getElementById('toggle-camera-btn').classList.remove('active');

  if (!opensDedicatedViewer) {
    updateInfoOverlay(object.userData);
    zoomControlsContainer.style.display = 'flex';
  }

  // *** INÃCIO DA CORREÃ‡ÃƒO DE ZOOM INICIAL ***
  const minZoom = calculateMinZoomDistance(selectedObject);
  let targetRadius =
    selectedObject.geometry && selectedObject.geometry.parameters.radius
      ? selectedObject.geometry.parameters.radius
      : 1;

  if (selectedObject === sunObject.planet) {
    // DistÃ¢ncia inicial muito prÃ³xima para o Sol
    currentZoomDistance = Math.max(minZoom, targetRadius * 2);
  } else if (selectedObject.userData.isBlackHole) {
    // CORRIGIDO: DistÃ¢ncia inicial para Buraco Negro. Usa um fator que mostra o disco.
    // Como o Sgr A* tem um sceneSize de 50000, e o GALACTIC_SCALE_FACTOR Ã© 500, a escala Ã© mantida.
    // O minZoom jÃ¡ considera o rsRadius*5. Multiplicamos por 10 o meshRadius.
    currentZoomDistance = Math.max(minZoom, selectedObject.userData.sceneSize * 10);
  } else if (selectedObject.userData.isPlanet) {
    // Usamos um valor base de 50 para os planetas internos garantindo a visibilidade
    currentZoomDistance = Math.max(minZoom, targetRadius * 4, 50);
  } else if (selectedObject.userData.isMoon || selectedObject.userData.isMoonOfTNO) {
    // Luas sÃ£o muito pequenas, multiplicamos mais
    currentZoomDistance = Math.max(minZoom, targetRadius * 25);
  } else if (selectedObject.userData.isTNO || selectedObject.userData.isMajorTNO) {
    // TNOs sÃ£o pequenos
    currentZoomDistance = Math.max(minZoom, targetRadius * 30);
  } else if (selectedObject.userData.isComet) {
    currentZoomDistance = Math.max(minZoom, 15);
  }
  // *** FIM DA CORREÃ‡ÃƒO DE ZOOM INICIAL ***
}

function deselectObject() {
  if (selectedObject) {
    // Se o objeto selecionado for o Sol, garantimos que ele retorne para o Object3D pai
    const objectToDeselect =
      selectedObject === sunObject.planet ? sunObject.planet.parent : selectedObject;

    if (
      selectedObject.userData.isTNO &&
      selectedObject !== hoveredObject &&
      selectedObject.material instanceof THREE.MeshStandardMaterial
    ) {
      selectedObject.material.emissive.setHex(0xff0000);
    }
    if (
      selectedObject.userData.isPlanet &&
      selectedObject !== hoveredObject &&
      selectedObject.material instanceof THREE.MeshStandardMaterial
    ) {
      selectedObject.material.emissive.setHex(0x000000);
    }
    // NOVO: Remove o destaque do Buraco Negro ao deselecionar
    if (selectedObject.userData.isBlackHole) {
      // Diminui o brilho do disco de acreÃ§Ã£o (ShaderMaterial) no deselect
      if (selectedObject.userData.accretionDisc.material.uniforms) {
        selectedObject.userData.accretionDisc.material.uniforms.hoverBoost.value = 0.0;
      }
    }

    if (selectionHalo && objectToDeselect.children.includes(selectionHalo)) {
      objectToDeselect.remove(selectionHalo);
    }

    selectedObject = null;

    controls.enabled = true;
    controls.target.set(0, 0, 0);

    hideInfoOverlay();
    // NOVO: Esconde o contÃªiner dos botÃµes de zoom
    zoomControlsContainer.style.display = 'none';
    // Remove a classe 'active' do botÃ£o de cÃ¢mera livre
    document.getElementById('toggle-camera-btn').classList.remove('active');

    // Remove os listeners de arrasto manual se a cÃ¢mera livre estiver desativada (garantindo o modo padrÃ£o)
    renderer.domElement.removeEventListener('mousedown', onDocumentMouseDown);
    document.removeEventListener('mouseup', onDocumentMouseUp);

    // Garante que o cursor volte ao estado normal se estava no estado de 'pointer' ou 'grabbing'
    renderer.domElement.style.cursor = 'default';
  }
}

export function updateInfoOverlay(data) {
  const planetInfoOverlay = document.getElementById('planet-info-overlay');
  const planetNameElem = document.getElementById('planet-name');
  const planetDetailsElem = document.getElementById('planet-details');
  const planetImageIcon = document.getElementById('planet-image-icon');

  if (data.iconPath) {
    planetImageIcon.src = data.iconPath;
    if (data.name === 'Saturno') {
      planetImageIcon.classList.add('saturn-icon');
    } else {
      planetImageIcon.classList.remove('saturn-icon');
    }
    planetImageIcon.style.display = 'block';
  } else {
    planetImageIcon.style.display = 'none';
  }

  planetNameElem.textContent = (
    data.name ||
    data.Nome ||
    data['Designação provisória']
  ).toUpperCase();
  planetDetailsElem.innerHTML = '';

  const infoLabels = {
    Tipo: 'Tipo:',
    Idade: 'Idade:',
    'DiÃ¢metro': 'DiÃ¢metro:',
    Massa: 'Massa:',
    'Distância ao planeta': 'Distância ao planeta:',
    'PerÃ­odo orbital': 'PerÃ­odo orbital:',
    Particularidades: 'Particularidades:',
    designation: 'DesignaÃ§Ã£o:',
    'Temperatura da Superfície': 'Temperatura:',
    'ComposiÃ§Ã£o Principal': 'ComposiÃ§Ã£o:',
    'Ressonância orbital com Netuno': 'RessonÃ¢ncia Orbital:',
    'Distância orbital média (UA)': 'DistÃ¢ncia Orbital MÃ©dia:',
    'PeriÃ©lio (UA)': 'PeriÃ©lio (UA):',
    'AfÃ©lio (UA)': 'AfÃ©lio (UA):',
    'Excentricidade orbital': 'Excentricidade Orbital:',
    'Inclinação orbital em graus': 'InclinaÃ§Ã£o Orbital (Graus):',
    'Magnitude absoluta': 'Magnitude Absoluta:',
    NÃºmero: 'NÃºmero:',
    'Designação provisória': 'DesignaÃ§Ã£o Prov.:',
    Data: 'Data de Descoberta:',
    'LocalizaÃ§Ã£o': 'LocalizaÃ§Ã£o:',
    'â™†': 'Ress. com Netuno:',
    a: 'Semieixo Maior (UA):',
    q: 'PeriÃ©lio (UA):',
    Q: 'AfÃ©lio (UA):',
    e: 'Excentricidade:',
    i: 'InclinaÃ§Ã£o (graus):',
    H: 'Magnitude Absoluta (H):',
    Descoberta: 'Descoberta:',
    'Ãšltima apariÃ§Ã£o': 'Ãšltima ApariÃ§Ã£o:',
    'PrÃ³xima apariÃ§Ã£o': 'PrÃ³xima ApariÃ§Ã£o:',
    period: 'PerÃ­odo Orbital (anos):',
    // NOVOS LABELS PARA BURANCOS NEGROS
    'Massa em Mâ˜‰': 'Massa (Mâ˜‰):',
    'Raio de Schwarzschild (km)': 'Raio de Schwarzschild (km):',
    'DistÃ¢ncia (Anos-Luz)': 'DistÃ¢ncia (AL):',
    Companheira: 'Estrela Companheira:',
    'PerÃ­odo Orbital (dias)': 'PerÃ­odo BinÃ¡rio (dias):',
    Status: 'Status:'
  };

  let relevantKeys;
  if (
    data.isSun ||
    data.isPlanet ||
    data.isMoon ||
    data.isMajorTNO ||
    data.isMoonOfTNO ||
    data.isBlackHole
  ) {
    // Inclui isBlackHole aqui para usar a estrutura data.info
    relevantKeys = Object.keys(data.info);
  } else if (data.isTNO) {
    relevantKeys = Object.keys(data).filter((key) => infoLabels.hasOwnProperty(key) && data[key]);
  } else if (data.isComet) {
    relevantKeys = ['type', 'designation', 'info', 'a', 'q', 'Q', 'e', 'i', 'period'];
  }

  relevantKeys.forEach((key) => {
    const li = document.createElement('li');
    let value;

    if (
      data.isSun ||
      data.isPlanet ||
      data.isMoon ||
      data.isMajorTNO ||
      data.isMoonOfTNO ||
      data.isBlackHole
    ) {
      value = data.info[key];
    } else if (data.isTNO) {
      value = data[key];
    } else if (data.isComet) {
      if (key === 'info') {
        Object.keys(data.info).forEach((infoKey) => {
          const infoLi = document.createElement('li');
          infoLi.innerHTML = `<span class="info-label">${infoLabels[infoKey] || infoKey}</span> <span class="info-value">${data.info[infoKey]}</span>`;
          planetDetailsElem.appendChild(infoLi);
        });
        return;
      }
      value = data[key];
    }

    // Tenta usar o rÃ³tulo traduzido
    const labelText = infoLabels[key] || key;

    li.innerHTML = `<span class="info-label">${labelText}</span> <span class="info-value">${value}</span>`;
    planetDetailsElem.appendChild(li);
  });

  planetInfoOverlay.classList.add('visible');
}

function hideInfoOverlay() {
  planetInfoOverlay.classList.remove('visible');
}

// NOVO: FunÃ§Ã£o para atualizar o display de escala com base na distÃ¢ncia da cÃ¢mera
function updateScaleDisplay() {
  if (selectedObject && !isCameraFree) {
    let baseRadius = 1;
    const inspectionDistance = Math.max(currentZoomDistance, 0.0001);

    // Se for o Sol, usamos o raio do mesh
    if (sunObject && selectedObject === sunObject.planet) {
      baseRadius = selectedObject.geometry.parameters.radius;
    } else if (selectedObject.userData.isBlackHole) {
      // Usa o Raio de Schwarzschild para a escala de Buraco Negro (mais preciso)
      // CORRIGIDO: Usa o rsRadius (calculado no mesh)
      baseRadius = selectedObject.userData.rsRadius;
      // Altera a escala para ser mais intuitiva no modo de inspeÃ§Ã£o (km ou Rs)
      let scaleText;
      // Usa a distÃ¢ncia real de Schwarzschild (rsRadius estÃ¡ em km)
      const rsRadiusKm = selectedObject.userData.massSolar * 2.95;

      if (inspectionDistance < 10000) {
        // Mostra em km se muito prÃ³ximo
        scaleText = `${((inspectionDistance / GALACTIC_SCALE_FACTOR) * rsRadiusKm).toFixed(2)} km`;
      } else {
        // Mostra a distÃ¢ncia de inspeÃ§Ã£o em relaÃ§Ã£o ao Raio de Schwarzschild (Rs)
        const rsRatio = inspectionDistance / baseRadius;
        scaleText = `~${rsRatio.toFixed(1)} x Rs`;
      }
      scaleDisplayElem.textContent = `DISTÃ‚NCIA: ${scaleText}`;
      zoomControlsContainer.style.display = 'flex';
      return;
    } else if (selectedObject.userData.size) {
      baseRadius = selectedObject.userData.size;
    } else if (selectedObject.geometry && selectedObject.geometry.parameters.radius) {
      baseRadius = selectedObject.geometry.parameters.radius;
    }

    const scale = baseRadius / inspectionDistance;
    let scaleText;

    if (scale >= 1) {
      scaleText = `${scale.toFixed(1)}x`;
    } else if (scale > 0.1) {
      scaleText = `${(scale * 10).toFixed(1)}x`;
    } else {
      scaleText = `~${(scale * 100).toFixed(0)}%`;
    }
    scaleDisplayElem.textContent = `ESCALA: ${scaleText}`;
    zoomControlsContainer.style.display = 'flex';
  } else if (isCameraFree) {
    const earthPosition = celestialData.find((d) => d.name === 'Terra').positionX;
    // CORREÃ‡ÃƒO: PosiÃ§Ã£o do Object3D pai do Sol
    const sunPosition = sunObject.planet.parent.position;
    const currentDistanceToSun = camera.position.distanceTo(sunPosition);

    let scaleText;
    // NOVO: Adiciona Anos-Luz para Buracos Negros distantes
    if (currentDistanceToSun > GALAXY_START_DISTANCE) {
      const ly = currentDistanceToSun / GALACTIC_SCALE_FACTOR;
      scaleText = `${ly.toFixed(0)} AL (Anos-Luz)`;
    } else if (currentDistanceToSun > earthPosition * 1000) {
      const ua = currentDistanceToSun / earthPosition;
      scaleText = `${(ua / 1000).toFixed(0)} Milhares de UA`;
    } else if (currentDistanceToSun > earthPosition * 10) {
      const ua = currentDistanceToSun / earthPosition;
      scaleText = `${ua.toFixed(0)} UA`;
    } else if (currentDistanceToSun > earthPosition) {
      const ua = currentDistanceToSun / earthPosition;
      scaleText = `${ua.toFixed(1)} UA`;
    } else if (currentDistanceToSun > celestialData.find((d) => d.name === 'Marte').positionX) {
      // Se estiver entre Marte e Terra, mostra em 1000 km
      const km = currentDistanceToSun / 1000;
      scaleText = `${km.toFixed(0)} mil km`;
    } else {
      // PrÃ³ximo do Sol, mostra em km
      const km = currentDistanceToSun / 1;
      scaleText = `${km.toFixed(0)} km`;
    }
    scaleDisplayElem.textContent = `ESCALA: ${scaleText}`;
    zoomControlsContainer.style.display = 'flex';
  } else {
    zoomControlsContainer.style.display = 'none';
  }
}

function findClosestObject(cameraPosition) {
  let closestObject = null;
  let minDistance = Infinity;

  // Checa planetas
  for (const p of planets) {
    const dist = cameraPosition.distanceTo(p.planet.position);
    if (dist < minDistance) {
      minDistance = dist;
      closestObject = p.planet;
    }
  }
  // Checa luas
  for (const m of moons) {
    const moonWorldPosition = new THREE.Vector3();
    m.moon.getWorldPosition(moonWorldPosition);
    const dist = cameraPosition.position.distanceTo(moonWorldPosition);
    if (dist < minDistance) {
      minDistance = dist;
      closestObject = m.moon;
    }
  }
  // Checa TNOs principais
  for (const t of majorTNOs) {
    const tnoWorldPosition = new THREE.Vector3();
    t.tno.getWorldPosition(tnoWorldPosition);
    const dist = cameraPosition.distanceTo(tnoWorldPosition);
    if (dist < minDistance) {
      minDistance = dist;
      closestObject = t.tno;
    }
  }
  // Checa TNOs e Cometas
  for (const t of tnos) {
    const tnoWorldPosition = new THREE.Vector3();
    t.tno.getWorldPosition(tnoWorldPosition);
    const dist = cameraPosition.distanceTo(tnoWorldPosition);
    if (dist < minDistance) {
      minDistance = dist;
      closestObject = t.tno;
    }
  }
  for (const c of comets) {
    const cometWorldPosition = new THREE.Vector3();
    c.comet.getWorldPosition(cometWorldPosition);
    const dist = cameraPosition.distanceTo(cometWorldPosition);
    if (dist < minDistance) {
      minDistance = dist;
      closestObject = c.comet;
    }
  }
  // NOVO: Checa Buracos Negros
  for (const bh of blackHoles) {
    const bhWorldPosition = new THREE.Vector3();
    bh.bhMesh.getWorldPosition(bhWorldPosition);
    const dist = cameraPosition.distanceTo(bhWorldPosition);
    if (dist < minDistance) {
      minDistance = dist;
      closestObject = bh.bhMesh;
    }
  }

  // Se a distÃ¢ncia mÃ­nima ainda for muito grande, retorna nulo
  if (minDistance > 500) {
    return null;
  }

  return closestObject;
}

// NOVO: LÃ³gica de zoom contÃ­nuo com botÃµes
let zoomInterval = null;

function startZoomIn() {
  if (zoomInterval) clearInterval(zoomInterval);
  zoomInterval = setInterval(() => {
    if (selectedObject && !isCameraFree) {
      const minZoomDistance = calculateMinZoomDistance(selectedObject);
      // Reduz a distÃ¢ncia com uma aceleraÃ§Ã£o suave
      currentZoomDistance = Math.max(minZoomDistance, currentZoomDistance * 0.98);
    } else if (isCameraFree) {
      camera.position.multiplyScalar(0.98);
      controls.update();
    }
  }, 16); // ~60 FPS
}

function startZoomOut() {
  if (zoomInterval) clearInterval(zoomInterval);
  zoomInterval = setInterval(() => {
    if (selectedObject && !isCameraFree) {
      // Aumenta o maxZoom para a transiÃ§Ã£o interestelar (400.000)
      // Se o objeto for um Buraco Negro, permitimos um zoom-out maior
      let maxZoomDistance = 500;
      if (selectedObject === sunObject.planet) {
        maxZoomDistance = 450000;
      } else if (selectedObject.userData.isBlackHole) {
        maxZoomDistance = 5000000; // Permite zoom out na escala galÃ¡ctica
      }

      // Aumenta a distÃ¢ncia com uma aceleraÃ§Ã£o suave
      currentZoomDistance = Math.min(maxZoomDistance, currentZoomDistance * 1.02);
    } else if (isCameraFree) {
      camera.position.multiplyScalar(1.02);
      controls.update();
    }
  }, 16);
}

function stopZoom() {
  clearInterval(zoomInterval);
  zoomInterval = null;
}

zoomInBtn.addEventListener('mousedown', startZoomIn);
zoomOutBtn.addEventListener('mousedown', startZoomOut);
zoomInBtn.addEventListener('mouseup', stopZoom);
zoomOutBtn.addEventListener('mouseup', stopZoom);
zoomInBtn.addEventListener('mouseout', stopZoom);
zoomOutBtn.addEventListener('mouseout', stopZoom);

// NOVO: Evento para o botÃ£o de alternar a cÃ¢mera
toggleCameraBtn.addEventListener('click', () => {
  isCameraFree = !isCameraFree;
  const btn = document.getElementById('toggle-camera-btn');

  if (isCameraFree) {
    controls.enabled = true;
    controls.minDistance = 0.1;
    controls.maxDistance = Infinity;

    const targetPosition = new THREE.Vector3();
    if (selectedObject) {
      // CORREÃ‡ÃƒO: Se houver um objeto selecionado, foca nele, garantindo que seja o mesh pai
      let focusObject = selectedObject;
      while (
        !focusObject.userData.isBlackHole &&
        !focusObject.userData.isPlanet &&
        focusObject.parent
      ) {
        focusObject = focusObject.parent;
      }
      focusObject.getWorldPosition(targetPosition);
      controls.target.copy(targetPosition);
    } else {
      // Se nenhum objeto estiver selecionado, foca no Sol
      sunObject.planet.getWorldPosition(targetPosition);
      controls.target.copy(targetPosition);
    }
    btn.classList.add('active'); // Adiciona destaque quando a cÃ¢mera estÃ¡ livre
    // Remove os listeners de arrasto manual se a cÃ¢mera livre estiver ativada
    renderer.domElement.removeEventListener('mousedown', onDocumentMouseDown);
    document.removeEventListener('mouseup', onDocumentMouseUp);
  } else {
    controls.enabled = false;
    // Se houver um objeto selecionado, voltamos ao modo de foco
    if (selectedObject) {
      selectObject(selectedObject); // Chama selectObject para reativar o modo de foco
      // Adiciona novamente os listeners de arrasto manual
      renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
      document.addEventListener('mouseup', onDocumentMouseUp, false);
    } else {
      // Se nÃ£o houver objeto, reinicia o OrbitControls (padrÃ£o)
      controls.enabled = true; // Garante que OrbitControls esteja ativo no modo de seleÃ§Ã£o global
      controls.target.set(0, 0, 0);
      controls.minDistance = 20;
      controls.maxDistance = 10000000;
      // Remove os listeners de arrasto manual se nÃ£o houver objeto selecionado
      renderer.domElement.removeEventListener('mousedown', onDocumentMouseDown);
      document.removeEventListener('mouseup', onDocumentMouseUp);
    }
    btn.classList.remove('active');
  }
});

function updatePlanetLabel(p) {
  const distanceToCamera = camera.position.distanceTo(
    p.planet.getWorldPosition(new THREE.Vector3())
  );
  // CORREÃ‡ÃƒO: Verifica se o objeto selecionado Ã© o Sol
  const isSelected = selectedObject && selectedObject.uuid === p.planet.uuid;
  const isSun = p.planet.userData.isSun;

  // NOVO: Verifica se QUALQUER outro objeto estÃ¡ selecionado.
  // Usamos selectedObject != null && !isSelected para detectar quando o foco estÃ¡ em OUTRO objeto.
  const isOtherObjectSelected = selectedObject && !isSelected;

  // --- LÃ“GICA ESPECIAL PARA O SOL ---
  if (isSun) {
    // CORREÃ‡ÃƒO 1: Se qualquer outro objeto estiver selecionado, o rÃ³tulo do Sol deve ser ocultado.
    if (isOtherObjectSelected) {
      p.labelDiv.style.opacity = '0'; // Oculta o rÃ³tulo do Sol
      p.labelDiv.classList.remove('visible');
      return;
    }

    // 1. Zona Morta: TÃ­tulo desaparece na transiÃ§Ã£o para evitar bugs visuais
    if (distanceToCamera > SOLAR_SYSTEM_END_DISTANCE && distanceToCamera < GALAXY_START_DISTANCE) {
      p.labelDiv.style.opacity = '0';
      p.labelDiv.classList.remove('visible');
      return;
    }

    // 2. VisÃ£o GalÃ¡ctica: TÃ­tulo FIXO "SISTEMA SOLAR"
    if (distanceToCamera >= GALAXY_START_DISTANCE) {
      p.labelDiv.textContent = 'SISTEMA SOLAR';
      p.labelDiv.style.opacity = '1';

      const tempV = new THREE.Vector3();
      p.planet.getWorldPosition(tempV);
      tempV.project(camera);

      // ProteÃ§Ã£o: Se estiver atrÃ¡s da cÃ¢mera, esconde imediatamente
      if (tempV.z > 1) {
        p.labelDiv.style.opacity = '0';
        return;
      }

      // MANTÃ‰M O RÃ“TULO DO SOL FIXO NO TOPO DA TELA QUANDO LONGE, PARA FUNCIONAR COMO REFERÃŠNCIA.
      p.labelDiv.style.left = `50%`;
      p.labelDiv.style.top = `30px`;
      p.labelDiv.style.transform = 'translate(-50%, 0)';
      p.labelDiv.style.fontSize = '1.2em'; // Tamanho fixo legÃ­vel
      p.labelDiv.classList.add('visible');
      return;
    }

    // 3. VisÃ£o PrÃ³xima (Sistema Solar)
    p.labelDiv.textContent = 'SOL';
  }

  // --- LÃ“GICA PADRÃƒO PARA OUTROS PLANETAS ---
  const showLabel = isSelected || distanceToCamera < PLANET_LABEL_VISIBILITY_DISTANCE;

  if (showLabel) {
    const tempV = new THREE.Vector3();
    p.planet.getWorldPosition(tempV);
    tempV.project(camera);

    if (tempV.z > 1) {
      p.labelDiv.style.opacity = '0';
      return;
    }

    const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;

    p.labelDiv.style.left = `${x}px`;
    p.labelDiv.style.top = `${y}px`;
    p.labelDiv.style.transform = 'translate(-50%, -50%)';
    p.labelDiv.style.opacity = '1';
    p.labelDiv.classList.add('visible');
  } else {
    p.labelDiv.style.opacity = '0';
    p.labelDiv.classList.remove('visible');
  }
}

function updateBlackHoleLabel(bh, isInterstellar) {
  // CORREÃ‡ÃƒO: O rÃ³tulo sÃ³ deve ser exibido se a cÃ¢mera estiver na zona interestelar
  if (!isInterstellar) {
    bh.labelDiv.style.opacity = '0';
    return;
  }

  const bhWorldPos = new THREE.Vector3();
  bh.bhMesh.getWorldPosition(bhWorldPos);

  // VerificaÃ§Ã£o de projeÃ§Ã£o para manter o tÃ­tulo visÃ­vel de longe
  const tempV = bhWorldPos.clone().project(camera);

  // Se estiver atrÃ¡s da cÃ¢mera, esconde
  if (tempV.z > 1) {
    bh.labelDiv.style.opacity = '0';
    return;
  }

  const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
  const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;

  bh.labelDiv.style.left = `${x}px`;
  bh.labelDiv.style.top = `${y - 30}px`;
  bh.labelDiv.style.transform = 'translate(-50%, 0)';

  // Ajuste fino do tamanho da fonte baseado na distÃ¢ncia
  const distance = camera.position.distanceTo(bhWorldPos);
  let fontSize = '1em';
  // Se estiver muito longe (escala galÃ¡ctica), aumenta um pouco a fonte
  if (distance > GALAXY_START_DISTANCE) fontSize = '1.1em';

  bh.labelDiv.style.fontSize = fontSize;
  bh.labelDiv.style.opacity = '1';
  bh.labelDiv.classList.add('visible');
}

function updateMoonLabel(m) {
  const moonWorldPosition = new THREE.Vector3();
  m.moon.getWorldPosition(moonWorldPosition);

  const distanceToCamera = camera.position.distanceTo(moonWorldPosition);
  const isSelected = selectedObject && selectedObject.uuid === m.moon.uuid;

  const showLabel = !isSelected && distanceToCamera < MOON_LABEL_VISIBILITY_DISTANCE;

  if (showLabel) {
    // Projeta a posiÃ§Ã£o 3D da lua para a posiÃ§Ã£o 2D da tela
    const tempV = new THREE.Vector3();
    m.moon.getWorldPosition(tempV);
    const position = tempV.project(camera);

    // Se o objeto estiver atrÃ¡s da cÃ¢mera (posiÃ§Ã£o.z > 1), oculta o rÃ³tulo
    if (position.z > 1 || position.x < -1 || position.x > 1 || position.y < -1 || position.y > 1) {
      m.labelDiv.style.opacity = '0';
      m.labelDiv.classList.remove('visible');
      return;
    }

    const moonScreenX = (position.x * 0.5 + 0.5) * window.innerWidth;
    const moonScreenY = (-position.y * 0.5 + 0.5) * window.innerHeight;

    const minFontSize = 0.6;
    const maxFontSize = 1.2;
    const normalizedDistance = Math.min(1, distanceToCamera / MOON_LABEL_VISIBILITY_DISTANCE);
    const interpolatedFontSize =
      minFontSize + (maxFontSize - minFontSize) * (1 - normalizedDistance);
    m.labelDiv.style.fontSize = `${interpolatedFontSize}em`;

    const objectRadius = m.moon.geometry.parameters.radius;
    const screenRadius = (objectRadius * (window.innerHeight / camera.fov)) / distanceToCamera;
    const offset = screenRadius * 1.5 + 15;

    m.labelDiv.style.opacity = '1';
    m.labelDiv.style.left = `${moonScreenX + offset}px`;
    m.labelDiv.style.top = `${moonScreenY}px`;
    m.labelDiv.style.transform = 'translate(0%, -50%)';
    m.labelDiv.classList.add('visible');
  } else {
    m.labelDiv.style.opacity = '0';
    m.labelDiv.classList.remove('visible');
  }
}

function updateCometLabel(cometData) {
  const worldPosition = new THREE.Vector3();
  cometData.comet.getWorldPosition(worldPosition);
  const distanceToCamera = camera.position.distanceTo(worldPosition);
  const projected = worldPosition.clone().project(camera);

  if (
    !cometData.labelDiv ||
    distanceToCamera > 2500 ||
    projected.z > 1 ||
    Math.abs(projected.x) > 1 ||
    Math.abs(projected.y) > 1
  ) {
    cometData.labelDiv.classList.remove('visible');
    return;
  }

  cometData.labelDiv.style.left = `${(projected.x * 0.5 + 0.5) * window.innerWidth}px`;
  cometData.labelDiv.style.top = `${(projected.y * -0.5 + 0.5) * window.innerHeight}px`;
  cometData.labelDiv.classList.add('visible');
}

// NOVO: FunÃ§Ã£o para gerenciar a transiÃ§Ã£o de escala
function updateInterstellarTransition() {
  // CORREÃ‡ÃƒO: Usa a posiÃ§Ã£o do Object3D pai (sun.parent ou sun.position) se for o Sol
  const sunParentWorldPosition = new THREE.Vector3();
  sunObject.planet.getWorldPosition(sunParentWorldPosition);
  const distanceToSun = camera.position.distanceTo(sunParentWorldPosition);

  // 1. Calcular o fator de transiÃ§Ã£o para o EstÃ¡gio da GalÃ¡xia (t)
  // t: Varia de 0 a 1 no intervalo [INTERSTELLAR_START_DISTANCE, GALAXY_START_DISTANCE]
  const transitionRange = GALAXY_START_DISTANCE - INTERSTELLAR_START_DISTANCE;
  const t = Math.min(
    1,
    Math.max(0, (distanceToSun - INTERSTELLAR_START_DISTANCE) / transitionRange)
  );

  // 2. Calcular o fator de transiÃ§Ã£o para o BRILHO DO SOL (tSunFade)
  // tSunFade: Varia de 0 a 1 no intervalo [SOLAR_SYSTEM_END_DISTANCE, SUN_GLARE_END_FADE_DISTANCE]
  const sunFadeRange = SUN_GLARE_END_FADE_DISTANCE - SOLAR_SYSTEM_END_DISTANCE;
  const tSunFade = Math.min(
    1,
    Math.max(0, (distanceToSun - SOLAR_SYSTEM_END_DISTANCE) / sunFadeRange)
  );

  // --- CORREÃ‡ÃƒO DA VISIBILIDADE DA GALÃXIA ---
  if (distanceToSun <= INTERSTELLAR_START_DISTANCE) {
    // EstÃ¡gio 1: Dentro do Sistema Solar
    // CORREÃ‡ÃƒO: Garante que o fundo da Via LÃ¡ctea seja restaurado se estiver carregado
    if (solarSystemBackground) {
      scene.background = solarSystemBackground;
    }
    if (galaxyBackground) galaxyBackground.material.opacity = 0;
  } else if (
    distanceToSun > INTERSTELLAR_START_DISTANCE &&
    distanceToSun <= GALAXY_START_DISTANCE
  ) {
    // EstÃ¡gio 2: TransiÃ§Ã£o Interestelar
    // TransiÃ§Ã£o: Fundo esfÃ©rico desaparece, plano de galÃ¡xia aparece.
    scene.background = null;
    if (galaxyBackground) galaxyBackground.material.opacity = t;
  } else {
    // EstÃ¡gio 3: GalÃ¡xia
    // Opacidade total do plano da galÃ¡xia
    scene.background = null;
    if (galaxyBackground) galaxyBackground.material.opacity = 1;
  }
  // --- FIM DA CORREÃ‡ÃƒO DA VISIBILIDADE DA GALÃXIA ---

  // --- LÃ³gica de Opacidade do Sol: Agora depende de tSunFade (mantÃ©m brilho total atÃ© 400.000) ---
  // sunGlow (Brilho PrÃ³ximo): 1.0 -> 0.0
  // O brilho prÃ³ximo desaparece entre 400.000 e 500.000
  if (sunObject.sunGlow) {
    sunObject.sunGlow.material.opacity = 1.0 - tSunFade;
  }

  // sunLightPoint (Ponto Distante): 0.0 -> 1.0 (Fica totalmente visÃ­vel em 500.000)
  // O brilho distante substitui o brilho prÃ³ximo no mesmo intervalo
  if (sunLightPoint) {
    sunLightPoint.material.opacity = tSunFade;
    // Garante que o Sprite de Luz Distante sempre aponte para a cÃ¢mera (billboard effect)
    sunLightPoint.lookAt(camera.position);
  }

  // CORREÃ‡ÃƒO: Mesh do Sol (sunObject.planet) desaparece na transiÃ§Ã£o
  if (sunObject.planet.material.transparent === true) {
    sunObject.planet.material.opacity = 1.0 - t; // Mesh desaparece de 1.0 para 0.0
  }
  sunObject.planet.visible = 1.0 - t > 0.05; // Esconde quando a opacidade estÃ¡ muito baixa

  // --- LÃ³gica de Opacidade da GalÃ¡xia e Objetos: Depende de t (fade gradual entre 400.000 e 5.000.000) ---
  if (distanceToSun <= INTERSTELLAR_START_DISTANCE) {
    // EstÃ¡gio 1: Sistema Solar (DistÃ¢ncia <= 400.000)

    // Objetos visÃ­veis e opacos
    planets.forEach((p) => (p.planet.visible = true));
    moons.forEach((m) => (m.moon.visible = true));
    majorTNOs.forEach((tno) => (tno.tno.visible = true));
    tnos.forEach((tno) => (tno.tno.visible = true));
    comets.forEach((c) => (c.comet.visible = true));
    asteroidGroup.visible = true;
    kuiperGroup.visible = true;
    // NOVO: Esconde Buracos Negros
    blackHoles.forEach((bh) => (bh.bhMesh.visible = false));

    // Resetar opacidade dos objetos para 1
    planets.forEach((p) => {
      if (p.planet.material instanceof THREE.MeshStandardMaterial) {
        p.planet.material.opacity = 1;
      }
    });
    moons.forEach((m) => {
      if (m.moon.material instanceof THREE.MeshStandardMaterial) {
        m.moon.material.opacity = 1;
      }
    });
    majorTNOs.forEach((tno) => {
      if (tno.tno.material instanceof THREE.MeshStandardMaterial) {
        tno.tno.material.opacity = 1;
      }
    });
    tnos.forEach((tno) => {
      if (tno.tno.material instanceof THREE.MeshStandardMaterial) {
        tno.tno.material.opacity = 1;
      }
    });
    comets.forEach((c) => {
      if (c.comet.material instanceof THREE.MeshStandardMaterial) {
        c.comet.material.opacity = 1;
      }
    });

    // Resetar opacidade das Ã³rbitas
    unifiedOrbits.planets.children.forEach((group) => {
      group.children.forEach((mesh) => {
        if (mesh.material && mesh.material.transparent) mesh.material.opacity = 0.1;
      });
    });
    unifiedOrbits.majorTnos.children.forEach((group) => {
      group.children.forEach((mesh) => {
        if (mesh.material && mesh.material.transparent) mesh.material.opacity = 0.1;
      });
    });
    unifiedOrbits.tnos.children.forEach((group) => {
      group.children.forEach((mesh) => {
        if (mesh.material && mesh.material.transparent) mesh.material.opacity = 0.8;
      });
    });
    unifiedOrbits.comets.children.forEach((group) => {
      group.children.forEach((mesh) => {
        if (mesh.material && mesh.material.transparent) mesh.material.opacity = 0.8;
      });
    });

    // Rótulo do Sol: Oculto (pois estÃ¡ muito prÃ³ximo e ofuscante)
    if (sunObject && sunObject.labelDiv) {
      sunObject.labelDiv.classList.remove('interstellar-visible');
    }
  }
  // EstÃ¡gio 2: TransiÃ§Ã£o Interestelar (Objetos e GalÃ¡xia)
  else if (distanceToSun > INTERSTELLAR_START_DISTANCE && distanceToSun <= GALAXY_START_DISTANCE) {
    // Opacidade dos objetos internos (planetas, luas, TNOs) diminui de 1 para 0
    const opacityPlanets = 1 - t;

    planets.forEach((p) => {
      p.planet.visible = opacityPlanets > 0.05;
      if (p.planet.material instanceof THREE.MeshStandardMaterial) {
        p.planet.material.opacity = opacityPlanets;
      }
    });
    moons.forEach((m) => {
      m.moon.visible = opacityPlanets > 0.05;
      if (m.moon.material instanceof THREE.MeshStandardMaterial) {
        m.moon.material.opacity = opacityPlanets;
      }
    });
    asteroidGroup.visible = opacityPlanets > 0.05;
    kuiperGroup.visible = opacityPlanets > 0.05;

    // Aplica opacidade para TNOs e Cometas
    majorTNOs.forEach((tno) => {
      tno.tno.visible = opacityPlanets > 0.05;
      if (tno.tno.material instanceof THREE.MeshStandardMaterial) {
        tno.tno.material.opacity = opacityPlanets;
      }
    });

    tnos.forEach((tno) => {
      tno.tno.visible = opacityPlanets > 0.05;
      if (tno.tno.material instanceof THREE.MeshStandardMaterial) {
        tno.tno.material.opacity = opacityPlanets;
      }
      // Fade nas linhas de Ã³rbita dos TNOs
      if (tno.orbitLine.material && tno.orbitLine.material.transparent) {
        tno.orbitLine.material.opacity = opacityPlanets * 0.8;
      }
    });

    comets.forEach((c) => {
      c.comet.visible = opacityPlanets > 0.05;
      if (c.comet.material instanceof THREE.MeshStandardMaterial) {
        c.comet.material.opacity = opacityPlanets;
      }
      // Fade nas linhas de Ã³rbita dos Cometas
      if (c.orbitLine.material && c.orbitLine.material.transparent) {
        c.orbitLine.material.opacity = opacityPlanets * 0.8;
      }
    });

    // As Ã³rbitas dos planetas principais e TNOs tambÃ©m devem sumir
    unifiedOrbits.planets.children.forEach((group) => {
      group.children.forEach((mesh) => {
        if (mesh.material && mesh.material.transparent)
          mesh.material.opacity = 0.1 * opacityPlanets;
      });
    });
    unifiedOrbits.majorTnos.children.forEach((group) => {
      group.children.forEach((mesh) => {
        if (mesh.material && mesh.material.transparent)
          mesh.material.opacity = 0.1 * opacityPlanets;
      });
    });

    // NOVO: Buracos Negros ficam visÃ­veis e opacos
    blackHoles.forEach((bh) => (bh.bhMesh.visible = true));

    // Via LÃ¡ctea aumenta a opacidade de 0 para 1
    if (galaxyBackground) galaxyBackground.material.opacity = t;

    // Rótulo do Sol: VisÃ­vel (entre 400.000 e 5.000.000)
    if (sunObject && sunObject.labelDiv) {
      sunObject.labelDiv.classList.add('interstellar-visible');
    }
  }
  // EstÃ¡gio 3: GalÃ¡xia (DistÃ¢ncia > 5.000.000)
  else {
    // Desligar objetos internos
    planets.forEach((p) => (p.planet.visible = false));
    moons.forEach((m) => (m.moon.visible = false));
    majorTNOs.forEach((tno) => (tno.tno.visible = false));
    tnos.forEach((tno) => (tno.tno.visible = false));
    comets.forEach((c) => (c.comet.visible = false));
    asteroidGroup.visible = false;
    kuiperGroup.visible = false;

    // NOVO: Buracos Negros ficam visÃ­veis
    blackHoles.forEach((bh) => (bh.bhMesh.visible = true));

    // Brilho do Sol (distante) e GalÃ¡xia com opacidade total
    if (galaxyBackground) galaxyBackground.material.opacity = 1;

    // Rótulo do Sol: VisÃ­vel (totalmente afastado)
    if (sunObject && sunObject.labelDiv) {
      sunObject.labelDiv.classList.add('interstellar-visible');
    }
  }

  return distanceToSun > SOLAR_SYSTEM_END_DISTANCE; // Retorna se estamos na zona interestelar ou alÃ©m
}

function animate() {
  try {
    requestAnimationFrame(animate);

    // CORREÃ‡ÃƒO: Captura o estado interestelar da transiÃ§Ã£o
    const isInterstellar = updateInterstellarTransition();

    const colorDustStart = new THREE.Color(0xfffff0);
    const colorDustEnd = new THREE.Color(0x000000);
    const colorIonStart = new THREE.Color(0xb4b4ff);
    const colorIonEnd = new THREE.Color(0x000000);

    // PosiÃ§Ã£o da cÃ¢mera no mundo para o cÃ¡lculo do shader

    // CORREÃ‡ÃƒO: Rotaciona o Object3D pai para mover todos os filhos (mesh, luzes, glows)
    if (sunObject.planet.parent) {
      sunObject.planet.parent.rotation.y += 0.0005;
    }

    if (sunObject) {
      // CORREÃ‡ÃƒO: ObtÃ©m a posiÃ§Ã£o do Object3D pai para o cÃ¡lculo de distÃ¢ncia
      const sunParent = sunObject.planet.parent || sunObject.planet;
      const distanceToCamera = camera.position.distanceTo(sunParent.position);

      const isSelected = selectedObject && selectedObject.uuid === sunObject.planet.uuid;

      // CORREÃ‡ÃƒO: A verificaÃ§Ã£o agora Ã© se QUALQUER outro objeto estÃ¡ selecionado.
      const isOtherObjectSelected = selectedObject && !isSelected;

      const showLabel =
        isSelected ||
        distanceToCamera < PLANET_LABEL_VISIBILITY_DISTANCE ||
        (sunObject.labelDiv.classList.contains('interstellar-visible') && !isOtherObjectSelected); // Apenas mostra se estiver em escala galÃ¡ctica E NENHUM outro objeto estiver selecionado

      if (showLabel) {
        // Passamos o objeto Sol (Mesh) e sua label
        updatePlanetLabel(sunObject);

        if (isInterstellar) {
          // ForÃ§a o rÃ³tulo a ser visÃ­vel no modo interestelar
          updatePlanetLabel(sunObject);
          sunObject.labelDiv.style.opacity = '1';
        } else if (!isSelected) {
          // Apenas checa a oclusÃ£o se nÃ£o for o modo interestelar e nÃ£o estiver selecionado
          checkOcclusion(sunObject);
        }
        sunObject.labelDiv.classList.add('visible');
      } else {
        sunObject.labelDiv.classList.remove('visible');
        sunObject.labelDiv.style.opacity = '0';
      }
    }

    planets.forEach((p) => {
      p.planet.rotation.y += p.rotationSpeed;
      p.orbitAngle += p.orbitSpeed;

      // --- NOVO: CÃ¡lculo de Ã³rbita ElÃ­ptica com o Sol no foco (FÃ³rmula Polar) ---
      // A Ã³rbita Ã© calculada em torno do Sol (origem 0,0,0)
      const r =
        (p.semiMajorAxis * (1 - p.eccentricity * p.eccentricity)) /
        (1 + p.eccentricity * Math.cos(p.orbitAngle));

      p.planet.position.x = r * Math.cos(p.orbitAngle);
      p.planet.position.z = r * Math.sin(p.orbitAngle);

      // Ajustamos o Trail para seguir a nova posiÃ§Ã£o
      const planetWorldPosition = new THREE.Vector3();
      p.planet.getWorldPosition(planetWorldPosition);
      p.trail.addPoint(planetWorldPosition);

      // NOVO: Atualiza o vetor de visÃ£o para o Shader da Atmosfera (se houver)
      updatePlanetLabel(p);
    });

    moons.forEach((m) => {
      m.moon.rotation.y += m.rotationSpeed;
      m.orbitAngle += m.orbitSpeed;
      m.moon.position.x = m.orbitRadius * Math.cos(m.orbitAngle);
      m.moon.position.z = m.orbitRadius * Math.sin(m.orbitAngle);

      // NOVO: Atualiza o vetor de visÃ£o para o Shader da Atmosfera (se houver)
      updateMoonLabel(m);
    });

    // Novo loop para os trails dos satÃ©lites de TNOs
    tnoMoonTrails.forEach(({ moon, trail }) => {
      const position = new THREE.Vector3();
      moon.getWorldPosition(position);
      trail.addPoint(position);
    });

    // --- NOVO LOOP: Buracos Negros ---
    blackHoles.forEach((bh) => {
      // Anima o disco de acreÃ§Ã£o
      animateBlackHole(bh.bhMesh, camera, 0.016); // MantÃ©m o efeito coerente com OrbitControls

      // CORREÃ‡ÃƒO: Rótulo do BH visÃ­vel APENAS se a cÃ¢mera estiver fora do sistema solar
      if (bh.bhMesh.visible && isInterstellar) {
        updateBlackHoleLabel(bh, isInterstellar);
      } else {
        bh.labelDiv.style.opacity = '0';
      }
    });

    // --- NOVO LOOP: TNOs Principais com Órbita ElÃ­ptica e Trail ---
    majorTNOs.forEach((tno) => {
      tno.tno.rotation.y += tno.rotationSpeed;
      tno.orbitAngle += tno.orbitSpeed;

      // --- CÃLCULO DE Ã“RBITA ELÃPTICA (TNOs Principais) ---
      // r = a * (1 - e^2) / (1 + e * cos(theta))
      const r =
        (tno.semiMajorAxis * (1 - tno.eccentricity * tno.eccentricity)) /
        (1 + tno.eccentricity * Math.cos(tno.orbitAngle));

      // Aplica a posiÃ§Ã£o no plano XZ em relaÃ§Ã£o ao foco (Sol na origem)
      tno.tno.position.x = r * Math.cos(tno.orbitAngle);
      tno.tno.position.z = r * Math.sin(tno.orbitAngle);

      // Adiciona ponto ao Trail
      const tnoWorldPosition = new THREE.Vector3();
      tno.tno.getWorldPosition(tnoWorldPosition);
      tno.trail.addPoint(tnoWorldPosition);

      updatePlanetLabel({ planet: tno.tno, labelDiv: tno.labelDiv });
    });

    // --- CORREÃ‡ÃƒO DO LOOP: TNOs Menores (de tno_data.js) ---
    tnos.forEach((tno) => {
      // Ajustei a velocidade para ser mais visÃ­vel na simulaÃ§Ã£o
      const tnoOrbitSpeed = 0.00008;
      tno.currentAngle += tnoOrbitSpeed / Math.pow(tno.a, 1.5);

      // CORREÃ‡ÃƒO: Normaliza currentAngle para o intervalo [0, 1] para o mÃ©todo getPoint(t)
      const normalizedTime = (tno.currentAngle % (2 * Math.PI)) / (2 * Math.PI);

      const newPoint = tno.orbitCurve.getPoint(normalizedTime);

      // CORREÃ‡ÃƒO: Posiciona o TNO no plano XZ do seu grupo orbital, para que a rotaÃ§Ã£o de inclinaÃ§Ã£o funcione.
      tno.tno.position.set(newPoint.x, 0, newPoint.y);
      if (tno.trail) {
        const tnoWorldPosition = new THREE.Vector3();
        tno.tno.getWorldPosition(tnoWorldPosition);
        tno.trail.addPoint(tnoWorldPosition);
      }
    });

    comets.forEach((c) => {
      const angleSpeed = c.orbitSpeedFactor / Math.pow(c.a, 1.5);
      c.currentAngle += angleSpeed;
      // CORREÃ‡ÃƒO: Usando getPoint(t/T) para o cÃ¡lculo da posiÃ§Ã£o na curva elÃ­ptica
      const normalizedTime = (c.currentAngle % (2 * Math.PI)) / (2 * Math.PI);
      const newPoint = c.orbitCurve.getPoint(normalizedTime);

      c.comet.position.set(newPoint.x, 0, newPoint.y); // O eixo Y da curva se torna Z do mundo (XZ Plane) - e Y do objeto Ã© 0.

      const cometWorldPosition = new THREE.Vector3();
      c.comet.getWorldPosition(cometWorldPosition);
      const sunWorldPosition = new THREE.Vector3();
      // CORREÃ‡ÃƒO: PosiÃ§Ã£o do Object3D pai do Sol
      sunObject.planet.parent.getWorldPosition(sunWorldPosition);
      const directionToSun = new THREE.Vector3()
        .subVectors(cometWorldPosition, sunWorldPosition)
        .normalize();

      c.tail.lookAt(directionToSun.add(cometWorldPosition));

      const positions = c.tail.geometry.attributes.position.array;
      const colors = c.tail.geometry.attributes.color.array;
      const particleData = c.comet.userData.particleData;
      const tailLength = c.comet.userData.tailLength;

      for (let i = 0; i < particleData.length; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += particleData[i].velocity.z;

        if (positions[i3 + 2] < -tailLength) {
          positions[i3 + 2] = 0;
        }

        const fadeFactor = Math.abs(positions[i3 + 2]) / tailLength;
        if (i % 2 === 0) {
          const color = colorDustStart.clone().lerp(colorDustEnd, fadeFactor);
          colors[i3 + 0] = color.r;
          colors[i3 + 1] = color.g;
          colors[i3 + 2] = color.b;
        } else {
          const color = colorIonStart.clone().lerp(colorIonEnd, fadeFactor);
          colors[i3 + 0] = color.r;
          colors[i3 + 1] = color.g;
          colors[i3 + 2] = color.b;
        }

        c.tail.material.opacity = 1.0 - fadeFactor * 0.5;
      }

      c.tail.geometry.attributes.position.needsUpdate = true;
      c.tail.geometry.attributes.color.needsUpdate = true;
      if (c.trail) {
        c.trail.addPoint(cometWorldPosition);
      }
      updateCometLabel(c);
    });

    moonTrails.forEach(({ moon, trail }) => {
      const position = new THREE.Vector3();
      moon.getWorldPosition(position);
      trail.addPoint(position);
    });

    asteroidGroup.rotation.y += 0.0001;

    if (frameCounter % CHECK_INTERVAL === 0) {
      planets.forEach((p) => {
        if (!selectedObject || p.planet.uuid !== selectedObject.uuid) {
          checkOcclusion({ planet: p.planet, labelDiv: p.labelDiv });
        }
      });
      majorTNOs.forEach((t) => {
        // Adicionada checagem para TNOs Principais
        if (!selectedObject || t.tno.uuid !== selectedObject.uuid) {
          checkOcclusion({ planet: t.tno, labelDiv: t.labelDiv });
        }
      });
      // CORREÃ‡ÃƒO: Adiciona a checagem de oclusÃ£o para o Sol
      if (!selectedObject || selectedObject.uuid !== sunObject.planet.uuid) {
        checkOcclusion(sunObject);
      }
      frameCounter = 0;
    }
    frameCounter++;

    // NOVO: LÃ³gica de seleÃ§Ã£o de cÃ¢mera
    if (selectedObject && !isCameraFree) {
      const targetPosition = new THREE.Vector3();
      selectedObject.getWorldPosition(targetPosition);

      let offsetHeight = 0;
      // Define a distÃ¢ncia de zoom apropriada
      let offsetDistance = currentZoomDistance;

      // LÃ³gica de offset para o Buraco Negro (mais focado)
      if (selectedObject.userData.isBlackHole) {
        // A altura do offset deve ser baseada no Raio de Schwarzschild (Rs)
        offsetHeight = selectedObject.userData.rsRadius * 0.5;
      } else if (selectedObject.userData.isSun) {
        offsetHeight = 0;
      } else if (selectedObject.userData.isPlanet) {
        offsetHeight = selectedObject.geometry.parameters.radius * 2;
      } else if (selectedObject.userData.isTNO || selectedObject.userData.isMajorTNO) {
        offsetHeight = selectedObject.geometry.parameters.radius * 5;
      } else if (selectedObject.userData.isComet) {
        offsetHeight = 10;
      } else if (selectedObject.userData.isMoon || selectedObject.userData.isMoonOfTNO) {
        offsetHeight = selectedObject.geometry.parameters.radius * 2;
      }

      const offset = new THREE.Vector3(0, offsetHeight, offsetDistance);

      // CORREÃ‡ÃƒO: Se o Sol estiver selecionado, usamos a rotaÃ§Ã£o do seu pai (o Object3D)
      const parent = selectedObject.userData.isSun
        ? sunObject.planet.parent
        : selectedObject.parent;
      // Se for Buraco Negro, o parent Ã© a cena, rotacionamos o prÃ³prio mesh se estiver sendo arrastado.
      if (parent instanceof THREE.Object3D) {
        offset.applyQuaternion(parent.quaternion);
      }

      // Rotaciona o offset (posiÃ§Ã£o da cÃ¢mera) de acordo com a rotaÃ§Ã£o do objeto (se houver)
      if (parent instanceof THREE.Object3D) {
        offset.applyQuaternion(parent.quaternion);
      }

      // CORREÃ‡ÃƒO: CÃ¢mera gira em torno do alvo, respeitando o isDragging
      if (isDragging) {
        // LÃ³gica de RotaÃ§Ã£o Manual Aplicada Ã  CÃ¢mera

        // 1. ObtÃ©m o delta de movimento desde o Ãºltimo frame (em coordenadas de tela)
        const deltaX = mouse.x - ((previousMousePosition.x / window.innerWidth) * 2 - 1);
        const deltaY = mouse.y - ((previousMousePosition.y / window.innerHeight) * 2 - 1);

        // 2. Cria a matriz de rotaÃ§Ã£o com base no movimento do mouse

        // RotaÃ§Ã£o Horizontal (Yaw): em torno do eixo Y global (para rotaÃ§Ã£o horizontal intuitiva)
        // Usamos o deltaX para a rotaÃ§Ã£o horizontal
        const rotationFactor = 0.005;
        if (parent) {
          // Garante que o parent exista (o BH nÃ£o tem)
          parent.rotation.y += deltaX * rotationFactor;
        } else if (selectedObject.userData.isBlackHole) {
          selectedObject.rotation.y += deltaX * rotationFactor; // Rota o prÃ³prio BH
        }

        // A rotaÃ§Ã£o vertical Ã© aplicada na cÃ¢mera
        const currentCameraOffset = camera.position.clone().sub(targetPosition);
        const localXAxis = new THREE.Vector3()
          .crossVectors(currentCameraOffset.clone().normalize(), camera.up)
          .normalize();

        const verticalRotation = new THREE.Matrix4().makeRotationAxis(
          localXAxis,
          deltaY * rotationFactor
        );
        currentCameraOffset.applyMatrix4(verticalRotation);

        // Atualiza a posiÃ§Ã£o da cÃ¢mera
        camera.position.copy(targetPosition).add(currentCameraOffset);

        // O lookAt abaixo garante que a cÃ¢mera estÃ¡ olhando para o alvo

        // Se o modo de rotaÃ§Ã£o livre for desativado, o OrbitControls tambÃ©m estÃ¡
        controls.enabled = false;
      } else {
        // InterpolaÃ§Ã£o normal (sem arrasto) - A cÃ¢mera se move suavemente para a posiÃ§Ã£o de offset
        const finalCameraPosition = targetPosition.clone().add(offset);
        const currentDistanceToFinalTarget = camera.position.distanceTo(finalCameraPosition);

        // *** INÃCIO DA CORREÃ‡ÃƒO DE TRAVAMENTO (LENTIDÃƒO PERCEBIDA) ***
        let lerpFactor = 0.2;
        if (currentDistanceToFinalTarget > 100000) {
          // OTIMIZAÃ‡ÃƒO: Pulo rÃ¡pido para distÃ¢ncias muito grandes (elimina lag na transiÃ§Ã£o galÃ¡ctica)
          lerpFactor = 0.9;
        } else if (currentDistanceToFinalTarget > 50000) {
          lerpFactor = 0.7;
        } else if (currentDistanceToFinalTarget > 1000) {
          lerpFactor = 0.5; // Pular mais rÃ¡pido se ainda estiver longe (dentro do sistema solar)
        } else {
          lerpFactor = 0.15; // SuavizaÃ§Ã£o normal ao aproximar
        }

        camera.position.lerp(finalCameraPosition, lerpFactor); // Aplica o novo fator de interpolaÃ§Ã£o
        // *** FIM DA CORREÃ‡ÃƒO DE TRAVAMENTO ***
      }

      camera.lookAt(targetPosition);

      const selectedObjInfo =
        planets.find((p) => p.planet.uuid === selectedObject.uuid) ||
        moons.find((m) => m.moon.uuid === selectedObject.uuid);

      if (selectedObjInfo && selectedObjInfo.labelDiv) {
        selectedObjInfo.labelDiv.style.opacity = '1';
      }
      controls.enabled = false;
    } else if (selectedObject && isCameraFree) {
      controls.enabled = true;
      const targetPosition = new THREE.Vector3();
      selectedObject.getWorldPosition(targetPosition);
      controls.target.copy(targetPosition);
      controls.update();
    } else {
      controls.enabled = true;
      controls.update();
    }

    updateScaleDisplay();
    renderer.render(scene, camera);
  } catch (e) {
    console.error('AnimaÃ§Ã£o falhou:', e);
    // Continue a animaÃ§Ã£o mesmo em caso de erro para tentar recuperar.
    requestAnimationFrame(animate);
  }
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // CORREÃ‡ÃƒO: Remove a lÃ³gica de recalcular o fundo da galÃ¡xia no redimensionamento.
  // Como o galaxyBackground agora Ã© um objeto 3D fixo na cena (e nÃ£o anexado Ã  cÃ¢mera),
  // ele serÃ¡ dimensionado automaticamente pela perspectiva.
});

renderer.domElement.addEventListener('click', onDocumentClick, false);
// NOVO: Adiciona o listener de duplo clique para desselaÃ§Ã£o
renderer.domElement.addEventListener('dblclick', onDocumentDoubleClick, false);
renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);

// --- ATUALIZAÃ‡ÃƒO DO PASSO 2: Adiciona listeners ao documento e canvas ---
// Adiciona o listener de mouseup ao DOCUMENTO (e nÃ£o apenas ao canvas) para garantir que
// o arrasto seja interrompido mesmo se o mouse for solto fora do canvas.
document.addEventListener('mouseup', onDocumentMouseUp, false);

// Adiciona o listener de mousedown no elemento do renderer (canvas)
renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
document.getElementById('labels-container').addEventListener('click', (event) => {
  const label = event.target.closest('.planet-label');
  if (!label) return;

  const labelName = label.textContent.trim();
  const match = searchableSceneObjects.find(
    (entry) => entry.name && entry.name.toUpperCase() === labelName.toUpperCase()
  );
  if (match) selectObject(match.object);
});
// --- FIM DA ATUALIZAÃ‡ÃƒO DO PASSO 2 ---

// --- LÃ“GICA ATUALIZADA DOS BOTÃ•ES DE CONTROLE ---
const audioControls = document.getElementById('audio-controls');

initializeControlPanels({
  planets,
  moons,
  moonTrails,
  tnoMoonTrails,
  majorTNOs,
  tnos,
  comets,
  unifiedOrbits,
  kuiperGroup
});
initializeAudioPlayer(audioControls);
initializeDateTime();
initializeVersionDisplay(APP_VERSION);
initSearch(selectObject);
