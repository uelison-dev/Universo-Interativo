import * as THREE from '../node_modules/three/build/three.module.js';

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

const TAIL_VERTEX_SHADER = `
  uniform float uLength;
  uniform float uWidth;
  uniform float uCurve;
  uniform float uFlutter;
  uniform float uStart;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float along = uv.y;
    float side = uv.x * 2.0 - 1.0;
    float widthShape = uWidth * (0.04 + 0.52 * sin(along * 1.5707963)) * (1.0 - 0.72 * along);
    float curve = uCurve * along * along;
    float flutter = sin(uTime * 1.3 + along * 8.0) * uFlutter * along * along;
    vec3 localPosition = vec3(
      side * widthShape + curve + flutter,
      side * widthShape * 0.035,
      uStart + along * uLength
    );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(localPosition, 1.0);
  }
`;

const TAIL_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform vec3 uCoreColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uIon;
  varying vec2 vUv;

  void main() {
    float along = vUv.y;
    float side = abs(vUv.x * 2.0 - 1.0);
    float softEdge = 1.0 - smoothstep(0.22, 1.0, side);
    float headFade = smoothstep(0.0, 0.026, along);
    float endFade = 1.0 - smoothstep(0.72, 1.0, along);
    float centralGlow = exp(-side * (uIon > 0.5 ? 5.0 : 3.1));
    float striation = 0.92 + 0.08 * sin(along * 92.0 - uTime * (uIon > 0.5 ? 1.7 : 0.55) + side * 8.0);
    float density = (0.24 + centralGlow * 0.76) * striation;
    vec3 color = mix(uColor, uCoreColor, centralGlow * 0.68 + (1.0 - along) * 0.22);
    float halo = 0.72 + centralGlow * 1.6;
    gl_FragColor = vec4(color * halo, softEdge * headFade * endFade * density * uOpacity);
  }
`;

function createCometTail(radius, length, kind, colors) {
  const segmentCount = 48;
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array((segmentCount + 1) * 2 * 3);
  const uvs = new Float32Array((segmentCount + 1) * 2 * 2);
  const indices = [];

  for (let segment = 0; segment <= segmentCount; segment += 1) {
    const along = segment / segmentCount;
    const vertex = segment * 2;
    uvs[vertex * 2] = 0;
    uvs[vertex * 2 + 1] = along;
    uvs[(vertex + 1) * 2] = 1;
    uvs[(vertex + 1) * 2 + 1] = along;
    if (segment < segmentCount) {
      indices.push(vertex, vertex + 1, vertex + 2, vertex + 1, vertex + 3, vertex + 2);
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  const isIon = kind === 'ion';
  const uniforms = {
    uLength: { value: length },
    uWidth: { value: radius * (isIon ? 0.72 : 2.4) },
    uCurve: { value: isIon ? 0 : -radius * 1.05 },
    uFlutter: { value: isIon ? radius * 0.1 : radius * 0.025 },
    uStart: { value: radius * 1.08 },
    uColor: { value: new THREE.Color(isIon ? colors.ion : colors.dust) },
    uCoreColor: { value: new THREE.Color(colors.core) },
    uOpacity: { value: isIon ? 0.76 : 0.62 },
    uTime: { value: 0 },
    uIon: { value: isIon ? 1 : 0 }
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: TAIL_VERTEX_SHADER,
    fragmentShader: TAIL_FRAGMENT_SHADER,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  const tail = new THREE.Mesh(geometry, material);
  tail.frustumCulled = false;
  return { tail, uniforms, length, kind };
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
  const dustTail = createCometTail(radius, tailLength, 'dust', colors);
  const ionTail = createCometTail(radius, tailLength * 1.22, 'ion', colors);
  dustTail.tail.renderOrder = 1;
  ionTail.tail.renderOrder = 1;
  tailFrame.add(dustTail.tail, ionTail.tail);

  const tangent = new THREE.Vector3(0, 1, 0);
  const antiSolar = new THREE.Vector3(0, 0, 1);
  const binormal = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  const orientation = new THREE.Quaternion();

  return (antiSolarDirection, orbitalVelocity, elapsed, activity = 1) => {
    antiSolar.copy(antiSolarDirection).normalize();
    tangent.copy(orbitalVelocity).addScaledVector(antiSolar, -orbitalVelocity.dot(antiSolar));
    if (tangent.lengthSq() < 1e-6) tangent.set(0, 1, 0);
    tangent.normalize();
    binormal.crossVectors(antiSolar, tangent).normalize();
    tangent.crossVectors(binormal, antiSolar).normalize();
    basis.makeBasis(tangent, binormal, antiSolar);
    orientation.setFromRotationMatrix(basis);
    tailFrame.quaternion.copy(orientation);

    const normalizedActivity = THREE.MathUtils.clamp(activity, 0.12, 1);
    [dustTail, ionTail].forEach(({ uniforms, length, kind }) => {
      uniforms.uLength.value = length * (0.48 + normalizedActivity * 0.92);
      uniforms.uOpacity.value = (kind === 'ion' ? 0.76 : 0.62) * (0.24 + normalizedActivity * 0.76);
      uniforms.uTime.value = elapsed;
    });
    coma.material.opacity = 0.3 + normalizedActivity * 0.48;
    const comaSize = radius * (4.8 + normalizedActivity * 2.3);
    coma.scale.set(comaSize, comaSize, 1);
  };
}
