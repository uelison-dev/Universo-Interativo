import * as THREE from '../node_modules/three/build/three.module.js';

const cometProjectionScratch = new THREE.Vector3();

export function createCometNucleusGeometry(radius = 0.5, segments = 48) {
  const geometry = new THREE.SphereGeometry(radius, segments, Math.max(24, segments >> 1));
  const source = geometry.attributes.position;
  const displaced = new Float32Array(source.count * 3);

  for (let index = 0; index < source.count; index += 1) {
    const direction = new THREE.Vector3().fromBufferAttribute(source, index).normalize();
    const relief =
      Math.sin(direction.x * 8.4 + direction.z * 3.1) *
      Math.sin(direction.y * 6.2 - direction.z * 4.8);
    const fineRelief = Math.sin(direction.x * 22 + direction.y * 17 + direction.z * 13);
    const lobe = Math.pow(Math.max(0, Math.sin(direction.x * 3.1 + direction.z * 2.4)), 5);
    const localRadius = radius * (1 + relief * 0.055 + fineRelief * 0.018 - lobe * 0.075);
    displaced[index * 3] = direction.x * localRadius;
    displaced[index * 3 + 1] = direction.y * localRadius;
    displaced[index * 3 + 2] = direction.z * localRadius;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(displaced, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createComaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 2, 128, 128, 126);
  gradient.addColorStop(0, 'rgba(255,248,224,0.96)');
  gradient.addColorStop(0.09, 'rgba(255,218,160,0.68)');
  gradient.addColorStop(0.28, 'rgba(154,221,231,0.25)');
  gradient.addColorStop(0.62, 'rgba(98,167,193,0.08)');
  gradient.addColorStop(1, 'rgba(56,115,148,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function createCometTail(radius, length, colors) {
  const dustCount = 136;
  const ionCount = 72;
  const particleCount = dustCount + ionCount;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colorValues = new Float32Array(particleCount * 3);
  const spread = new Float32Array(particleCount);
  const seed = new Float32Array(particleCount);
  const speed = new Float32Array(particleCount);
  const ions = new Uint8Array(particleCount);
  const coreColor = new THREE.Color(colors.core);
  const dustColor = new THREE.Color(colors.dust);
  const ionColor = new THREE.Color(colors.ion);
  const start = radius * 1.08;

  for (let index = 0; index < particleCount; index += 1) {
    const isIon = index >= dustCount;
    const streamLength = length * (isIon ? 1.22 : 1);
    ions[index] = isIon ? 1 : 0;
    const along = Math.random();
    spread[index] = Math.random() * 2 - 1;
    seed[index] = Math.random();
    speed[index] = streamLength * (isIon ? 0.035 : 0.022) * (0.55 + seed[index] * 0.75);
    positions[index * 3 + 2] = start + along * streamLength;
  }
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colorValues, 3).setUsage(THREE.DynamicDrawUsage)
  );

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 1.65,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  });
  const tail = new THREE.Points(geometry, material);
  tail.frustumCulled = false;
  return {
    tail,
    material,
    geometry,
    positions,
    colorValues,
    spread,
    seed,
    speed,
    ions,
    particleCount,
    length,
    radius,
    coreColor,
    dustColor,
    ionColor,
    start
  };
}

function advanceTailParticles(tail, elapsed, delta, activity) {
  const positions = tail.positions;
  const colors = tail.colorValues;

  tail.material.opacity = 0.8 * (0.24 + activity * 0.76);
  for (let index = 0; index < tail.particleCount; index += 1) {
    const offset = index * 3;
    const isIon = tail.ions[index] === 1;
    const activeLength = tail.length * (isIon ? 1.22 : 1) * (0.48 + activity * 0.92);
    let z = positions[offset + 2] + tail.speed[index] * delta;
    const end = tail.start + activeLength;
    if (z >= end) z = tail.start + ((z - tail.start) % activeLength);
    const progress = THREE.MathUtils.clamp((z - tail.start) / activeLength, 0, 1);
    const width = tail.radius * (isIon ? 0.62 : 1.75) * (0.1 + progress * 0.8);
    const flutter =
      Math.sin(elapsed * 0.7 + tail.seed[index] * 19) * tail.radius * 0.055 * progress;
    const drift = Math.sin(elapsed * 0.32 + tail.seed[index] * 31) * width * 0.04 * progress;

    positions[offset] =
      tail.spread[index] * width +
      (isIon ? 0 : -tail.radius * 0.72 * progress * progress) +
      flutter +
      drift;
    positions[offset + 1] = Math.sin(tail.seed[index] * 53) * width * 0.025;
    positions[offset + 2] = z;

    const headMix = (1 - progress) * 0.38;
    const brightness = 1 - progress * 0.84;
    const tailColor = isIon ? tail.ionColor : tail.dustColor;
    colors[offset] = (tailColor.r * (1 - headMix) + tail.coreColor.r * headMix) * brightness;
    colors[offset + 1] = (tailColor.g * (1 - headMix) + tail.coreColor.g * headMix) * brightness;
    colors[offset + 2] = (tailColor.b * (1 - headMix) + tail.coreColor.b * headMix) * brightness;
  }

  tail.geometry.attributes.position.needsUpdate = true;
  tail.geometry.attributes.color.needsUpdate = true;
}

// Mantém a cauda dimensionada para a tela: grande o bastante perto, mas sem
// cobrir a cena quando a câmera chega ao núcleo. A projeção também evita
// desenhar caudas imperceptíveis ou muito fora do enquadramento.
export function getCometTailPresentation(
  worldPosition,
  camera,
  viewportHeight,
  tailLength,
  activity = 1
) {
  camera.updateMatrixWorld();
  const distance = Math.max(camera.position.distanceTo(worldPosition), camera.near);
  const focalPixels = viewportHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  const projectedLength = (tailLength * 1.22 * (0.48 + activity * 0.92) * focalPixels) / distance;
  const ndc = cometProjectionScratch.copy(worldPosition).project(camera);
  const inView = ndc.z >= -1 && ndc.z <= 1 && Math.abs(ndc.x) < 1.4 && Math.abs(ndc.y) < 1.4;
  const maxPixels = Math.min(viewportHeight * 0.14, 150);
  return {
    scale: Math.min(1, maxPixels / Math.max(projectedLength, 1)),
    visible: inView && projectedLength >= 3
  };
}

export function addCometEffects(
  nucleus,
  { radius = 0.5, tailLength = 24, colors: palette = {} } = {}
) {
  const colors = {
    dust: palette.dust || '#f5dfb5',
    ion: palette.ion || '#79bdff',
    coma: palette.coma || '#b7e6ed',
    core: palette.core || '#fff6df'
  };
  const coma = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createComaTexture(),
      color: colors.coma,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  coma.scale.set(radius * 7, radius * 7, 1);
  coma.renderOrder = 2;
  nucleus.add(coma);

  const tailFrame = new THREE.Group();
  nucleus.add(tailFrame);
  const cometTail = createCometTail(radius, tailLength, colors);
  cometTail.tail.renderOrder = 1;
  tailFrame.add(cometTail.tail);

  const tangent = new THREE.Vector3(0, 1, 0);
  const antiSolar = new THREE.Vector3(0, 0, 1);
  const binormal = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  const orientation = new THREE.Quaternion();
  let previousElapsed = null;

  return (
    antiSolarDirection,
    orbitalVelocity,
    elapsed,
    activity = 1,
    viewScale = 1,
    visible = true
  ) => {
    const delta =
      previousElapsed === null ? 0 : THREE.MathUtils.clamp(elapsed - previousElapsed, 0, 0.05);
    previousElapsed = elapsed;
    antiSolar.copy(antiSolarDirection).normalize();
    tangent.copy(orbitalVelocity).addScaledVector(antiSolar, -orbitalVelocity.dot(antiSolar));
    if (tangent.lengthSq() < 1e-6) tangent.set(0, 1, 0);
    tangent.normalize();
    binormal.crossVectors(antiSolar, tangent).normalize();
    tangent.crossVectors(binormal, antiSolar).normalize();
    basis.makeBasis(tangent, binormal, antiSolar);
    orientation.setFromRotationMatrix(basis);
    tailFrame.quaternion.copy(orientation);
    const tailScale = THREE.MathUtils.clamp(viewScale, 0.001, 1);
    tailFrame.visible = visible;
    tailFrame.scale.setScalar(tailScale);
    tailFrame.position.copy(antiSolar).multiplyScalar(radius * 1.08 * (1 - tailScale));

    const normalizedActivity = THREE.MathUtils.clamp(activity, 0.12, 1);
    if (visible) advanceTailParticles(cometTail, elapsed, delta, normalizedActivity);
    coma.material.opacity = 0.3 + normalizedActivity * 0.48;
    const comaSize = radius * (4.8 + normalizedActivity * 2.3);
    coma.scale.set(comaSize, comaSize, 1);
  };
}
