import * as THREE from '../node_modules/three/build/three.module.js';

const SUN_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPosition;
  void main() {
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPosition.xyz;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const SUN_FRAGMENT_SHADER = `
  uniform sampler2D sunMap;
  uniform float time;
  uniform float opacity;
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPosition;
  float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    float a = mix(hash(i), hash(i + vec3(1.0,0.0,0.0)), f.x);
    float b = mix(hash(i + vec3(0.0,1.0,0.0)), hash(i + vec3(1.0,1.0,0.0)), f.x);
    float c = mix(hash(i + vec3(0.0,0.0,1.0)), hash(i + vec3(1.0,0.0,1.0)), f.x);
    float d = mix(hash(i + vec3(0.0,1.0,1.0)), hash(i + vec3(1.0,1.0,1.0)), f.x);
    return mix(mix(a,b,f.y),mix(c,d,f.y),f.z);
  }
  void main() {
    vec3 point = normalize(vec3((vUv.x-0.5)*6.28318,(vUv.y-0.5)*3.14159,1.0));
    float granules = noise(point*54.0+vec3(time*0.018,0.0,0.0))*0.65 + noise(point*132.0-vec3(time*0.032,time*0.012,0.0))*0.35;
    vec3 source = texture2D(sunMap,vUv).rgb;
    float detail = clamp(dot(source,vec3(0.299,0.587,0.114))*0.5+granules*0.5,0.0,1.0);
    vec3 color = mix(vec3(0.62,0.12,0.018),vec3(1.0,0.36,0.055),smoothstep(0.12,0.42,detail));
    color = mix(color,vec3(1.0,0.72,0.26),smoothstep(0.38,0.70,detail));
    color = mix(color,vec3(1.0,0.91,0.67),smoothstep(0.70,0.96,detail)*0.8);
    float limb = max(dot(normalize(vNormalView),normalize(-vViewPosition)),0.0);
    color *= mix(0.52,1.12,pow(limb,0.42));
    gl_FragColor = vec4(color,opacity);
  }
`;

export function createSunSurfaceMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: { sunMap: { value: texture }, time: { value: 0 }, opacity: { value: 1 } },
    vertexShader: SUN_VERTEX_SHADER,
    fragmentShader: SUN_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: true,
    toneMapped: false
  });
}

export function createSunGlow(radius) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 244, 210, 0.64)');
  gradient.addColorStop(0.22, 'rgba(255, 180, 66, 0.30)');
  gradient.addColorStop(0.58, 'rgba(255, 112, 20, 0.10)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      color: 0xffc16a,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    })
  );
  glow.scale.set(radius * 4.8, radius * 4.8, 1);
  return glow;
}
