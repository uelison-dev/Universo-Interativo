import * as THREE from '../node_modules/three/build/three.module.js';

const RS_SCALE = 1;
const ACCRETION_DISK_VERTEX_SHADER = `
  varying vec2 vDiskPosition;
  varying float vRadius;

  void main() {
    vDiskPosition = position.xy;
    vRadius = length(position.xy);
    vec3 warpedPosition = position;
    float angle = atan(position.y, position.x);
    float warp = sin(angle * 2.0 + vRadius * 1.7) * smoothstep(1.2, 3.1, vRadius) * 0.055;
    warpedPosition.z += warp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(warpedPosition, 1.0);
  }
`;

const ACCRETION_DISK_FRAGMENT_SHADER = `
  uniform float time;
  uniform float outerLayer;
  varying vec2 vDiskPosition;
  varying float vRadius;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float innerEdge = outerLayer > 0.5
      ? smoothstep(3.12, 3.38, vRadius)
      : smoothstep(1.17, 1.34, vRadius);
    float outerEdge = outerLayer > 0.5
      ? 1.0 - smoothstep(4.45, 4.82, vRadius)
      : 1.0 - smoothstep(3.15, 3.62, vRadius);
    float angle = atan(vDiskPosition.y, vDiskPosition.x);
    float turbulence = sin(angle * 17.0 + vRadius * 8.0 - time * 2.1) * 0.5
                     + sin(angle * 31.0 - vRadius * 13.0 - time * 1.15) * 0.25
                     + sin(angle * 7.0 + vRadius * 19.0 - time * 0.7) * 0.25;
    float clumps = smoothstep(-0.45, 0.82, turbulence + (hash(vDiskPosition * 12.0 + time) - 0.5) * 0.18);
    float relativisticBoost = 0.52 + 0.78 * smoothstep(-0.35, 0.85, cos(angle - time * 0.06));
    float innerHeat = 1.0 - smoothstep(1.3, 3.45, vRadius);
    vec3 deepAmber = vec3(0.42, 0.13, 0.035);
    vec3 ember = vec3(0.94, 0.38, 0.10);
    vec3 gold = vec3(1.0, 0.72, 0.36);
    vec3 paleHot = vec3(1.0, 0.94, 0.78);
    vec3 color = mix(deepAmber, ember, clumps);
    color = mix(color, gold, innerHeat * 0.72 + clumps * 0.18);
    color = mix(color, paleHot, innerHeat * 0.38);
    vec3 dustyBlue = vec3(0.20, 0.25, 0.34);
    vec3 outerEmber = vec3(0.82, 0.36, 0.16);
    color = outerLayer > 0.5 ? mix(dustyBlue, outerEmber, clumps * 0.72) : color;
    color *= relativisticBoost;
    float alpha = innerEdge * outerEdge * mix(outerLayer > 0.5 ? 0.13 : 0.25, outerLayer > 0.5 ? 0.48 : 0.94, clumps) * relativisticBoost;
    gl_FragColor = vec4(color, alpha);
  }
`;

const LENSING_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LENSING_FRAGMENT_SHADER = `
  uniform float time;
  uniform float hoverBoost;
  varying vec2 vUv;

  float ringBand(float radius, float target, float width) {
    return exp(-pow((radius - target) / width, 2.0));
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(2.0, 1.48);
    float radius = length(p);
    float angle = atan(p.y, p.x);
    float shadowMask = smoothstep(0.285, 0.315, radius);
    float photonRing = ringBand(radius, 0.325, 0.014);
    float secondaryRing = ringBand(radius, 0.365, 0.012) * 0.34;
    float upperArcRadius = length(vec2(p.x * 0.95, (p.y - 0.27) * 1.27));
    float lowerArcRadius = length(vec2(p.x * 0.95, (p.y + 0.27) * 1.27));
    float upperArcGlow = ringBand(upperArcRadius, 0.438, 0.082);
    float lowerArcGlow = ringBand(lowerArcRadius, 0.438, 0.082);
    float upperArc = ringBand(upperArcRadius, 0.438, 0.033);
    float lowerArc = ringBand(lowerArcRadius, 0.438, 0.033);
    float thinDisk = exp(-pow(p.y / 0.026, 2.0)) * smoothstep(0.34, 0.46, abs(p.x))
                   * (1.0 - smoothstep(0.69, 0.92, abs(p.x)));
    float beaming = 0.35 + 0.65 * smoothstep(-0.25, 0.9, cos(angle - 0.18));
    float flicker = 0.92 + 0.08 * sin(time * 2.4 + angle * 13.0);
    float arcMask = max(upperArc * 0.94, lowerArc * 0.76);
    float arcHalo = max(upperArcGlow * 0.28, lowerArcGlow * 0.18);
    float alpha = shadowMask * max(max(max(photonRing + secondaryRing, arcMask), thinDisk * 0.96), arcHalo);
    vec3 warmWhite = vec3(1.0, 0.96, 0.87);
    vec3 amber = vec3(1.0, 0.48, 0.16);
    vec3 color = mix(amber, warmWhite, clamp(photonRing * 0.92 + arcMask * 0.78, 0.0, 1.0));
    color = mix(color, vec3(1.0, 0.57, 0.27), arcHalo * 0.78);
    color *= beaming * flicker * (1.0 + hoverBoost * 0.05);
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.96));
  }
`;

function createSimpleMarker(data) {
  const radius = data.sceneSize || 1;
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0x010101 })
  );
  const photonHint = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.12, radius * 0.025, 8, 64),
    new THREE.MeshBasicMaterial({
      color: 0xb98656,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  photonHint.rotation.x = Math.PI / 2;
  marker.add(photonHint);
  marker.userData = {
    ...data,
    isBlackHole: true,
    accretionDisc: photonHint,
    simpleRepresentation: true
  };
  return marker;
}

function createAccretionDisk(outerLayer = false) {
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, outerLayer: { value: outerLayer ? 1 : 0 } },
    vertexShader: ACCRETION_DISK_VERTEX_SHADER,
    fragmentShader: ACCRETION_DISK_FRAGMENT_SHADER,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const disk = new THREE.Mesh(
    outerLayer
      ? new THREE.RingGeometry(3.14, 4.82, 384, 10)
      : new THREE.RingGeometry(1.22, 3.62, 384, 10),
    material
  );
  disk.rotation.x = Math.PI / 2 - 0.055;
  disk.renderOrder = outerLayer ? 1 : 2;
  return disk;
}

function createLensingLayer() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      hoverBoost: { value: 0 }
    },
    vertexShader: LENSING_VERTEX_SHADER,
    fragmentShader: LENSING_FRAGMENT_SHADER,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const lensingLayer = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 6.5), material);
  lensingLayer.renderOrder = 4;
  lensingLayer.frustumCulled = false;
  return lensingLayer;
}

export function createBlackHole(data, _textureLoader) {
  if (data.simpleRepresentation) return createSimpleMarker(data);

  const visualScale = Number(data.sceneSize) || 4;
  const root = new THREE.Group();
  root.name = `${data.name || 'black-hole'}-visualization`;

  const shadow = new THREE.Mesh(
    new THREE.SphereGeometry(1.08, 96, 96),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  shadow.name = 'black-hole-shadow';
  root.add(shadow);

  const photonRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.16, 0.018, 12, 256),
    new THREE.MeshBasicMaterial({
      color: 0xffe8c4,
      transparent: true,
      opacity: 0.54,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  photonRing.rotation.x = Math.PI / 2;
  photonRing.renderOrder = 3;
  root.add(photonRing);

  const accretionDisk = createAccretionDisk();
  root.add(accretionDisk);
  const outerDisk = createAccretionDisk(true);
  root.add(outerDisk);

  const lensingLayer = createLensingLayer();
  root.add(lensingLayer);

  root.scale.setScalar(visualScale / 4);
  root.userData = {
    ...data,
    isBlackHole: true,
    rsRadius: (Number(data.massSolar) || 1) * 2.95 * RS_SCALE,
    accretionDisc: lensingLayer,
    accretionDisk,
    outerDisk,
    photonRing,
    shadow,
    spin: Number(data.spin) || 0.88
  };
  return root;
}

export function animateBlackHole(blackHoleObject, camera, delta = 0.016) {
  const { accretionDisc, accretionDisk, outerDisk, spin } = blackHoleObject.userData;
  const lensUniforms = accretionDisc?.material?.uniforms;
  if (lensUniforms?.time) lensUniforms.time.value += delta;
  if (accretionDisk?.material?.uniforms?.time) {
    accretionDisk.material.uniforms.time.value += delta * (0.7 + spin * 0.55);
  }
  if (outerDisk?.material?.uniforms?.time) {
    outerDisk.material.uniforms.time.value += delta * (0.22 + spin * 0.18);
  }
  if (accretionDisc && !blackHoleObject.userData.simpleRepresentation) {
    accretionDisc.lookAt(camera.position);
  }
}
