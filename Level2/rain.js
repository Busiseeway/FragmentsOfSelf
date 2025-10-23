import * as THREE from "three";

let rainMaterial, rainGeo, rainVelocities;
let rain;
let rainCount = 30000; // much denser snow

export function createRain(scene, count = 30000) {
  rainCount = count;
  rainGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(rainCount * 3);
  rainVelocities = new Float32Array(rainCount);

  for (let i = 0; i < rainCount; i++) {
    const x = Math.random() * 800 - 400;
    const y = Math.random() * 1000;
    const z = Math.random() * 800 - 400;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // slow fall speed
    rainVelocities[i] = 0.02 + Math.random() * 0.05;
  }

  rainGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  rainMaterial = new THREE.PointsMaterial({
    color: 0xffffff,             // pure white
    size: 0.3,                   // visible but soft
    transparent: true,
    opacity: 0.95,               // nearly solid
    sizeAttenuation: true,
    depthWrite: false,
  });

  rain = new THREE.Points(rainGeo, rainMaterial);
  rain.frustumCulled = false;
  scene.add(rain);
}

export function updateRain() {
  const positions = rainGeo.attributes.position.array;

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3 + 1] -= rainVelocities[i]; // fall down slowly
    positions[i * 3] += Math.sin(Date.now() * 0.0005 + i) * 0.05; // subtle drift

    // reset when it hits the ground
    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = 1000;
      positions[i * 3] = Math.random() * 800 - 400;
      positions[i * 3 + 2] = Math.random() * 800 - 400;
    }
  }

  rainGeo.attributes.position.needsUpdate = true;
}

export { rain, rainGeo, rainVelocities, rainCount };
