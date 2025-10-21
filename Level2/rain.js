let rainMaterial, rainVelocities;

function createRain() {
  rainGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(rainCount * 3);
  rainVelocities = new Float32Array(rainCount);

  // populate positions and velocities
  for (let i = 0; i < rainCount; i++) {
    const x = Math.random() * 400 - 200;
    const y = Math.random() * 800;
    const z = Math.random() * 400 - 200;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // vertical fall speed for each drop
    rainVelocities[i] = 0.5 + Math.random() * 0.9;
  }

  rainGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  rainMaterial = new THREE.PointsMaterial({
    color: 0x99bbff,
    size: 0.05,
    transparent: false,
    opacity: 0.1,
    sizeAttenuation: true,
    depthWrite: false,
  });

  rain = new THREE.Points(rainGeo, rainMaterial);
  rain.frustumCulled = false;
  scene.add(rain);
}
