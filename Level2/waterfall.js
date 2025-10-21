function addSideWaterfalls() {
  // Add waterfalls along both sides of the road
  const waterfallSpacing = 25; // Distance between waterfalls
  const waterfallCount = 35; // Number of waterfalls on each side

  for (let i = 0; i < waterfallCount; i++) {
    // Left side waterfalls
    const leftWaterfall = createWaterfall();
    leftWaterfall.position.set(
      -15 - Math.random() * 8, // X position (left side)
      0, // Y position
      -i * waterfallSpacing + Math.random() * 10 // Z position along the road
    );
    leftWaterfall.rotation.y = Math.PI * 0.1; // Slightly angle towards road
    scene.add(leftWaterfall);
    waterfalls.push(leftWaterfall);

    // Right side waterfalls
    const rightWaterfall = createWaterfall();
    rightWaterfall.position.set(
      15 + Math.random() * 8, // X position (right side)
      0, // Y position
      -i * waterfallSpacing + Math.random() * 10 // Z position along the road
    );
    rightWaterfall.rotation.y = -Math.PI * 0.2; // Slightly angle towards road
    scene.add(rightWaterfall);
    waterfalls.push(rightWaterfall);
  }
}

function createWaterfall() {
  const waterfall = new THREE.Group();

  // cliff backdrop
  const cliffGeometry = new THREE.BoxGeometry(6, 12, 2);
  const cliffMaterial = new THREE.MeshLambertMaterial({
    color: 0x555555,
    roughness: 0.9,
  });
  const cliff = new THREE.Mesh(cliffGeometry, cliffMaterial);
  cliff.position.set(0, 6, -2);
  cliff.castShadow = true;
  cliff.receiveShadow = true;
  waterfall.add(cliff);

  // water stream using planes
  const waterGeometry = new THREE.PlaneGeometry(2, 10, 16, 32);
  const waterPositions = waterGeometry.attributes.position.array;

  // flowing water variations
  for (let i = 0; i < waterPositions.length; i += 3) {
    const y = waterPositions[i + 1];
    const x = waterPositions[i];
    waterPositions[i] += Math.sin(y * 0.3) * 0.1; // Side to side flow
    waterPositions[i + 2] = Math.sin(x * 2) * 0.05; // Depth variation
  }
  waterGeometry.attributes.position.needsUpdate = true;
  waterGeometry.computeVertexNormals();

  const waterMaterial = new THREE.MeshPhongMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.7,
    shininess: 100,
    side: THREE.DoubleSide,
  });

  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  waterMesh.position.set(0, 5, -1);
  waterMesh.receiveShadow = true;
  waterfall.add(waterMesh);

  // water pool at bottom
  const poolGeometry = new THREE.CylinderGeometry(3, 2.5, 0.5, 16);
  const poolMaterial = new THREE.MeshPhongMaterial({
    color: 0x006994,
    transparent: true,
    opacity: 0.8,
    shininess: 100,
  });
  const pool = new THREE.Mesh(poolGeometry, poolMaterial);
  pool.position.set(0, -0.25, 0);
  pool.receiveShadow = true;
  waterfall.add(pool);

  //mist particles
  const particleCount = 100;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < particleCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 4, // x spread
      Math.random() * 8, // y height
      (Math.random() - 0.5) * 2 // z spread
    );
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    size: 0.5,
    sizeAttenuation: true,
  });

  const mistParticles = new THREE.Points(particleGeometry, particleMaterial);
  mistParticles.position.set(0, 2, 0);
  waterfall.add(mistParticles);

  // rocks around the base
  for (let i = 0; i < 8; i++) {
    const rockGeometry = new THREE.DodecahedronGeometry(
      0.3 + Math.random() * 0.5,
      0
    );
    const rockMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(0.1, 0.2, 0.2 + Math.random() * 0.3),
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(
      (Math.random() - 0.5) * 6,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 3
    );
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    waterfall.add(rock);
  }

  return waterfall;
}
