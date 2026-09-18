import * as THREE from '../node_modules/three/build/three.module.js';

const RS_SCALE = 1.0;

function getEventHorizonMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      rimColor: { value: new THREE.Color('#fff0d4') },
      rimStrength: { value: 0.22 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 rimColor;
      uniform float rimStrength;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 4.0);
        vec3 color = rimColor * fresnel * rimStrength;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    depthWrite: true
  });
}

function getInterstellarDiscMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      hoverBoost: { value: 0.0 },
      innerColor: { value: new THREE.Color('#fff4ea') },
      hotColor: { value: new THREE.Color('#ffd2a0') },
      warmColor: { value: new THREE.Color('#d38a58') },
      dustColor: { value: new THREE.Color('#5b2f1b') }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float hoverBoost;
      uniform vec3 innerColor;
      uniform vec3 hotColor;
      uniform vec3 warmColor;
      uniform vec3 dustColor;
      varying vec2 vUv;

      float gaussianBand(float value, float center, float width) {
        return exp(-pow((value - center) / width, 2.0));
      }

      float noiseBand(float angle, float radial, float speedFactor) {
        float a = sin(angle * 16.0 + radial * 9.5 - time * speedFactor);
        float b = sin(angle * 27.0 - radial * 5.0 - time * speedFactor * 0.55 + 1.6);
        return a * 0.6 + b * 0.4;
      }

      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float radius = length(uv);
        float angle = atan(uv.y, uv.x);
        float horizon = smoothstep(0.28, 0.34, radius);

        float equatorialBand = gaussianBand(uv.y, 0.0, 0.12) * (1.0 - smoothstep(0.66, 1.0, abs(uv.x)));
        float outerDust = gaussianBand(uv.y, 0.0, 0.25) * (1.0 - smoothstep(0.52, 1.0, abs(uv.x)));
        float upperLensedArc = exp(-pow((length(vec2(uv.x, (uv.y - 0.22) * 1.65)) - 0.57) / 0.052, 2.0));
        float lowerLensedArc = exp(-pow((length(vec2(uv.x, (uv.y + 0.22) * 1.65)) - 0.57) / 0.052, 2.0));
        float photonRing = exp(-pow((radius - 0.34) / 0.024, 2.0));

        float bandNoise = smoothstep(-0.18, 0.95, noiseBand(angle, radius, 1.4));
        float arcNoise = smoothstep(-0.3, 0.9, noiseBand(angle * 0.85, radius * 1.2, 0.75));
        float doppler = smoothstep(0.02, 0.98, cos(angle - 0.28) * 0.5 + 0.5);

        vec3 diskColor = mix(dustColor, warmColor, bandNoise);
        diskColor = mix(diskColor, hotColor, equatorialBand * 0.92 + photonRing * 0.9);
        diskColor = mix(diskColor, innerColor, (upperLensedArc + lowerLensedArc) * 0.72 + photonRing * 0.35);
        diskColor *= mix(0.74, 1.35 + hoverBoost * 0.12, doppler);

        float equatorialAlpha = equatorialBand * mix(0.42, 1.0, bandNoise) * 1.12;
        float dustAlpha = outerDust * 0.3;
        float arcAlpha = (upperLensedArc + lowerLensedArc) * mix(0.55, 1.0, arcNoise) * 0.92;
        float ringAlpha = photonRing * 0.78;

        float alpha = max(equatorialAlpha + dustAlpha, max(arcAlpha, ringAlpha));
        alpha *= horizon;

        vec3 color = vec3(0.0);
        color += diskColor * (equatorialAlpha + dustAlpha);
        color += innerColor * arcAlpha * 1.18;
        color += hotColor * ringAlpha * 0.92;

        gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

export function createBlackHole(data, _textureLoader) {
  const meshRadius = data.sceneSize;

  if (data.simpleRepresentation) {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(meshRadius, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x010101 })
    );
    const markerRing = new THREE.Mesh(
      new THREE.TorusGeometry(meshRadius * 1.12, meshRadius * 0.025, 6, 32),
      new THREE.MeshBasicMaterial({
        color: 0x8b5a32,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    markerRing.rotation.x = Math.PI / 2;
    marker.add(markerRing);
    marker.userData = { ...data, isBlackHole: true, accretionDisc: markerRing };
    return marker;
  }

  const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(meshRadius, 36, 36),
    getEventHorizonMaterial()
  );

  horizon.userData = {
    ...data,
    isBlackHole: true,
    rsRadius: data.massSolar * 2.95 * RS_SCALE
  };

  const lensingPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(meshRadius * 7.4, meshRadius * 5.2, 1, 1),
    getInterstellarDiscMaterial()
  );
  lensingPlane.renderOrder = 4;
  horizon.add(lensingPlane);

  horizon.userData.accretionDisc = lensingPlane;

  return horizon;
}

export function animateBlackHole(blackHoleMesh, camera, delta = 0.016) {
  const lensingPlane = blackHoleMesh.userData.accretionDisc;

  if (lensingPlane?.material?.uniforms?.time) {
    lensingPlane.material.uniforms.time.value += delta;
  }

  if (lensingPlane) {
    lensingPlane.lookAt(camera.position);
  }

}
