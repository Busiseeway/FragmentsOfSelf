import * as THREE from "three";

let obstacles = [];
let smokeParticles = [];

// Difficulty & spawn control
let difficultyLevel = 2;
let timeSinceLastSpawn = 0;
let spawnInterval = 1500; // milliseconds between spawns
let lastSpawnTime = 0;

// === Utility: Load rock textures (optional) ===
const textureLoader = new THREE.TextureLoader();
function loadTexture(path) {
  return textureLoader.load(path, undefined, undefined, (err) =>
    console.error(`❌ Failed to load texture: ${path}`, err)
  );
}

// === ROLLING SPHERE ===
export function spawnRollingSphere(scene, leftLane, middleLane, rightLane) {
  const lanes = [leftLane, middleLane, rightLane];
  const radius = 0.5;

  lanes.forEach((lane) => {
    const geometry = new THREE.DodecahedronGeometry(radius, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      flatShading: true,
      metalness: 0.3,
      roughness: 0.4,
    });

    const rollingSphere = new THREE.Mesh(geometry, material);
    rollingSphere.castShadow = true;
    rollingSphere.receiveShadow = true;
    rollingSphere.userData.type = "rollingSphere";
    rollingSphere.userData.radius = radius;

    rollingSphere.position.set(lane, radius, -75); // start far ahead
    scene.add(rollingSphere);
    obstacles.push(rollingSphere);
  });
}

// === LOG ===
export function spawnLog(scene, heroSphere, leftLane, middleLane, rightLane) {
  const logGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
  const logMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
  const log = new THREE.Mesh(logGeometry, logMaterial);

  log.rotation.z = Math.PI / 2; // lay it flat
  log.userData.type = "log";

  const lanes = [leftLane, middleLane, rightLane];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];

  log.position.set(lane, 6, heroSphere.position.z - 30);
  log.castShadow = true;
  log.receiveShadow = true;

  scene.add(log);
  obstacles.push(log);
}

// === BARRICADE ===
export function spawnBarricade(scene, heroBaseY, leftLane, rightLane) {
  const barricadeGroup = new THREE.Group();

  const baseWidth = 2.4;
  const baseHeight = 0.7;
  const baseDepth = 0.4;
  const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b0000,
    metalness: 0.6,
    roughness: 0.3,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.castShadow = true;
  base.receiveShadow = true;
  barricadeGroup.add(base);

  // Spikes
  const spikeRadius = 0.12;
  const spikeHeight = 0.4;
  const spikeGeometry = new THREE.ConeGeometry(spikeRadius, spikeHeight, 4);
  const silverSpikeMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 1.0,
    roughness: 0.2,
  });

  const topSpikeCount = 5;
  for (let i = 0; i < topSpikeCount; i++) {
    const spike = new THREE.Mesh(spikeGeometry, silverSpikeMaterial);
    const spacing = baseWidth / (topSpikeCount + 1);
    spike.position.set(
      -baseWidth / 2 + spacing * (i + 1),
      baseHeight / 2 + spikeHeight / 2,
      0
    );
    spike.rotation.y = Math.PI / 4;
    spike.castShadow = true;
    barricadeGroup.add(spike);
  }

  barricadeGroup.position.x = (leftLane + rightLane) / 2;
  barricadeGroup.position.y = heroBaseY + baseHeight / 2;
  barricadeGroup.position.z = -100;
  barricadeGroup.userData.type = "barricade";

  scene.add(barricadeGroup);
  obstacles.push(barricadeGroup);
}

// === HOLE ===
export function spawnHole(scene, heroBaseY, leftLane, middleLane, rightLane) {
  const holeGroup = new THREE.Group();
  holeGroup.userData.type = "hole";

  const holeGeometry = new THREE.CircleGeometry(0.6, 32);
  const holeMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d0d0d,
    roughness: 0.9,
    metalness: 0.1,
  });
  const hole = new THREE.Mesh(holeGeometry, holeMaterial);
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = 0.01;

  const rimGeometry = new THREE.RingGeometry(0.6, 0.75, 32);
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.8,
  });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.02;

  holeGroup.add(hole);
  holeGroup.add(rim);

  const smokeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const smokeMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    transparent: true,
    opacity: 0.4,
    roughness: 1.0,
  });

  for (let i = 0; i < 15; i++) {
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
    smoke.position.set(
      (Math.random() - 0.5) * 0.6,
      0.05 + Math.random() * 0.2,
      (Math.random() - 0.5) * 0.6
    );
    smoke.scale.setScalar(0.5 + Math.random() * 0.5);
    holeGroup.add(smoke);
    smokeParticles.push({ mesh: smoke, speed: 0.001 + Math.random() * 0.002 });
  }

  const lanes = [leftLane, middleLane, rightLane];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  holeGroup.position.set(lane, heroBaseY, -100);
  holeGroup.receiveShadow = true;

  scene.add(holeGroup);
  obstacles.push(holeGroup);
}

// === RANDOM OBSTACLE SPAWN ===
export function spawnRandomObstacle(
  scene,
  heroSphere,
  heroBaseY,
  leftLane,
  middleLane,
  rightLane
) {
  const rand = Math.random();

  if (rand < 0.25) {
    spawnRollingSphere(scene, leftLane, middleLane, rightLane);
  } else if (rand < 0.5) {
    spawnLog(scene, heroSphere, leftLane, middleLane, rightLane);
  } else if (rand < 0.75) {
    spawnBarricade(scene, heroBaseY, leftLane, rightLane);
  } else {
    spawnHole(scene, heroBaseY, leftLane, middleLane, rightLane);
  }

  // Occasionally spawn two at once
  if (Math.random() < 0.2 * difficultyLevel) {
    const rand2 = Math.random();
    if (rand2 < 0.5) spawnRollingSphere(scene, leftLane, middleLane, rightLane);
    else spawnLog(scene, heroSphere, leftLane, middleLane, rightLane);
  }
}

// === SMOKE UPDATE ===
export function updateSmoke() {
  for (const { mesh, speed } of smokeParticles) {
    mesh.position.y += speed;
    mesh.material.opacity -= 0.002;
    if (mesh.material.opacity <= 0) {
      mesh.position.y = 0.05 + Math.random() * 0.1;
      mesh.material.opacity = 0.4;
      mesh.position.x = (Math.random() - 0.5) * 0.6;
      mesh.position.z = (Math.random() - 0.5) * 0.6;
    }
  }
}

// === DIFFICULTY UPDATE ===
export function updateDifficulty(deltaTime) {
  timeSinceLastSpawn += deltaTime;

  if (difficultyLevel < 5 && Math.random() < 0.001) {
    difficultyLevel += 0.1;
    spawnInterval = Math.max(400, spawnInterval - 50);
  }
}

// === OBSTACLE UPDATE ===
export function updateObstacles(
  scene,
  rollingSpeed,
  heroBaseY,
  heroSphere,
  deltaTime
) {
  updateDifficulty(deltaTime);

  const now = performance.now();
  if (now - lastSpawnTime > spawnInterval) {
    spawnRandomObstacle(scene, heroSphere, heroBaseY, -2, 0, 2);
    lastSpawnTime = now;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    let speedMultiplier = 1 + difficultyLevel * 0.2;

    switch (obs.userData.type) {
      case "log":
        if (obs.position.y > heroBaseY) obs.position.y -= 0.1 * speedMultiplier;
        obs.rotation.x += 0.1 * speedMultiplier;
        obs.position.z += rollingSpeed * speedMultiplier;
        break;

      case "barricade":
        obs.position.z += rollingSpeed * speedMultiplier;
        break;

      case "rollingSphere":
        obs.position.z += rollingSpeed * 3 * speedMultiplier;
        obs.rotation.x += 0.3 * speedMultiplier;
        obs.rotation.z += 0.2 * speedMultiplier;
        break;

      case "hole":
      default:
        obs.position.z += rollingSpeed * speedMultiplier;
    }

    if (obs.position.z > 10) {
      scene.remove(obs);
      obstacles.splice(i, 1);
    }
  }
}

// === COLLISION DETECTION ===
export function checkObstacleCollision(heroSphere, heroBaseY) {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const dx = heroSphere.position.x - obs.position.x;
    const dy = heroSphere.position.y - obs.position.y;
    const dz = heroSphere.position.z - obs.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    let collisionRadius = 1.0;

    switch (obs.userData.type) {
      case "log":
        collisionRadius = 1.2;
        break;
      case "barricade":
        collisionRadius = 1.7;
        break;
      case "hole":
        collisionRadius = 0.8;
        if (heroSphere.position.y > heroBaseY + 0.5) continue;
        break;
      case "rollingSphere":
        collisionRadius = obs.userData.radius + 0.3;
        break;
    }

    if (distance < collisionRadius) {
      return true;
    }
  }

  return false;
}

// === HELPERS ===
export function getObstacles() {
  return obstacles;
}

export function clearObstacles(scene) {
  obstacles.forEach((obj) => scene.remove(obj));
  obstacles = [];
}
