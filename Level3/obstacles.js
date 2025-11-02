import * as THREE from "three";

let obstacles = [];
let smokeParticles = [];
let explosionParticles = [];

// Difficulty & spawn control
let difficultyLevel = 2;
let timeSinceLastSpawn = 0;
let spawnInterval = 2000;
let lastSpawnTime = 0;
let lastSpawnedType = null;

// **ADD THESE NEW TRACKING VARIABLES**
let recentLanes = []; // Track recently used lanes
let lastObstacleZ = -100; // Track Z position of last obstacle
const MIN_OBSTACLE_DISTANCE = 15; // Minimum distance between obstacles
const LANE_COOLDOWN = 3; // How many spawns before a lane can be reused

// ... (keep existing texture loader code)

// **ADD THIS HELPER FUNCTION**
function getAvailableLanes(leftLane, middleLane, rightLane) {
  const allLanes = [leftLane, middleLane, rightLane];

  // Filter out recently used lanes
  const availableLanes = allLanes.filter((lane) => {
    return !recentLanes.includes(lane) || recentLanes.length >= 3;
  });

  // If all lanes are blocked, return all lanes (reset)
  return availableLanes.length > 0 ? availableLanes : allLanes;
}

// **ADD THIS HELPER FUNCTION**
function trackLaneUsage(lane) {
  recentLanes.push(lane);

  // Keep only last few lanes in memory
  if (recentLanes.length > LANE_COOLDOWN) {
    recentLanes.shift();
  }
}

// **UPDATE ROLLING SPHERE**
export function spawnRollingSphere(
  scene,
  leftLane,
  middleLane,
  rightLane,
  forceZ = null
) {
  const availableLanes = getAvailableLanes(leftLane, middleLane, rightLane);
  const radius = 0.5;

  const numLanes = Math.random() < 0.5 ? 1 : 2;
  const shuffledLanes = availableLanes
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(numLanes, availableLanes.length));

  const spawnZ =
    forceZ !== null ? forceZ : lastObstacleZ - MIN_OBSTACLE_DISTANCE;
  lastObstacleZ = spawnZ;

  shuffledLanes.forEach((lane) => {
    const geometry = new THREE.DodecahedronGeometry(radius, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      flatShading: true,
      metalness: 0.3,
      roughness: 0.4,
      depthTest: true,
      depthWrite: true,
    });

    const rollingSphere = new THREE.Mesh(geometry, material);
    rollingSphere.castShadow = true;
    rollingSphere.receiveShadow = true;
    rollingSphere.userData.type = "rollingSphere";
    rollingSphere.userData.radius = radius;

    rollingSphere.position.set(lane, radius, spawnZ);
    scene.add(rollingSphere);
    obstacles.push(rollingSphere);

    trackLaneUsage(lane);
  });
}

// **UPDATE BARRICADE**
export function spawnBarricade(
  scene,
  heroBaseY,
  leftLane,
  middleLane,
  rightLane,
  forceZ = null
) {
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

  // **UPDATE LANE SELECTION TO USE AVAILABLE LANES**
  const availableLanes = getAvailableLanes(leftLane, middleLane, rightLane);

  const laneConfigs = [
    [leftLane, middleLane],
    [middleLane, rightLane],
    [leftLane, rightLane],
  ];

  // Filter configs to only use available lanes
  const validConfigs = laneConfigs.filter(
    (config) =>
      availableLanes.includes(config[0]) || availableLanes.includes(config[1])
  );

  const config =
    validConfigs.length > 0
      ? validConfigs[Math.floor(Math.random() * validConfigs.length)]
      : laneConfigs[Math.floor(Math.random() * laneConfigs.length)];

  const xPosition = (config[0] + config[1]) / 2;

  const spawnZ =
    forceZ !== null ? forceZ : lastObstacleZ - MIN_OBSTACLE_DISTANCE;
  lastObstacleZ = spawnZ;

  barricadeGroup.position.x = xPosition;
  barricadeGroup.position.y = heroBaseY + baseHeight / 2;
  barricadeGroup.position.z = spawnZ;
  barricadeGroup.userData.type = "barricade";

  scene.add(barricadeGroup);
  obstacles.push(barricadeGroup);

  // Track both lanes
  trackLaneUsage(config[0]);
  trackLaneUsage(config[1]);
}

// **UPDATE OVERHEAD BAR**
export function spawnOverheadBar(
  scene,
  heroBaseY,
  leftLane,
  middleLane,
  rightLane,
  forceZ = null
) {
  const barGroup = new THREE.Group();
  barGroup.userData.type = "overheadBar";

  const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 12);
  const poleMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.7,
    roughness: 0.3,
  });

  const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
  leftPole.position.set(-0.8, 1.25, 0);
  leftPole.castShadow = true;

  const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
  rightPole.position.set(0.8, 1.25, 0);
  rightPole.castShadow = true;

  const barGeometry = new THREE.BoxGeometry(1.8, 0.2, 0.2);
  const barMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4400,
    metalness: 0.6,
    roughness: 0.4,
  });
  const bar = new THREE.Mesh(barGeometry, barMaterial);
  bar.position.set(0, 1.5, 0);
  bar.castShadow = true;

  const spikeGeometry = new THREE.ConeGeometry(0.06, 0.2, 4);
  const spikeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    metalness: 0.8,
    roughness: 0.2,
  });

  const spikes = [];
  for (let i = 0; i < 5; i++) {
    const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
    spike.position.set(-0.8 + i * 0.4, 1.4, 0);
    spike.rotation.x = Math.PI;
    spike.castShadow = true;
    spikes.push(spike);
    barGroup.add(spike);
  }

  barGroup.add(leftPole, rightPole, bar);

  barGroup.userData.parts = {
    bar: bar,
    leftPole: leftPole,
    rightPole: rightPole,
    spikes: spikes,
  };

  // **USE AVAILABLE LANES**
  const availableLanes = getAvailableLanes(leftLane, middleLane, rightLane);
  const lane =
    availableLanes[Math.floor(Math.random() * availableLanes.length)];

  const spawnZ =
    forceZ !== null ? forceZ : lastObstacleZ - MIN_OBSTACLE_DISTANCE;
  lastObstacleZ = spawnZ;

  barGroup.position.set(lane, heroBaseY, spawnZ);

  scene.add(barGroup);
  obstacles.push(barGroup);

  trackLaneUsage(lane);
}

// **UPDATE HOLE**
export function spawnHole(
  scene,
  heroBaseY,
  leftLane,
  middleLane,
  rightLane,
  forceZ = null
) {
  const holeGroup = new THREE.Group();
  holeGroup.userData.type = "hole";

  const holeGeometry = new THREE.CircleGeometry(0.6, 32);
  const holeMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.9,
    metalness: 0.1,
  });
  const hole = new THREE.Mesh(holeGeometry, holeMaterial);
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = 0.02;

  const rimGeometry = new THREE.RingGeometry(0.6, 0.75, 32);
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.8,
  });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.03;

  holeGroup.add(hole, rim);

  const smokeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const smokeMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    transparent: true,
    opacity: 0.4,
    roughness: 1.0,
  });

  holeGroup.userData.smokeParticles = [];

  for (let i = 0; i < 15; i++) {
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
    const startX = (Math.random() - 0.5) * 0.6;
    const startZ = (Math.random() - 0.5) * 0.6;

    smoke.position.set(startX, 0.1 + Math.random() * 0.15, startZ);
    smoke.scale.setScalar(0.5 + Math.random() * 0.5);
    holeGroup.add(smoke);

    holeGroup.userData.smokeParticles.push({
      mesh: smoke,
      speed: 0.008 + Math.random() * 0.012,
      startX: startX,
      startZ: startZ,
      startY: smoke.position.y,
      fadeSpeed: 0.002 + Math.random() * 0.003,
    });
  }

  // **USE AVAILABLE LANES**
  const availableLanes = getAvailableLanes(leftLane, middleLane, rightLane);
  const lane =
    availableLanes[Math.floor(Math.random() * availableLanes.length)];

  const spawnZ =
    forceZ !== null ? forceZ : lastObstacleZ - MIN_OBSTACLE_DISTANCE;
  lastObstacleZ = spawnZ;

  holeGroup.position.set(lane, 0, spawnZ);
  holeGroup.receiveShadow = true;

  scene.add(holeGroup);
  obstacles.push(holeGroup);

  trackLaneUsage(lane);
}

// **UPDATE RANDOM OBSTACLE SPAWN**
export function spawnRandomObstacle(
  scene,
  _heroSphere,
  heroBaseY,
  leftLane,
  middleLane,
  rightLane
) {
  const rand = Math.random();
  let obstacleType;

  if (lastSpawnedType === "overheadBar") {
    if (rand < 0.5) {
      obstacleType = "barricade";
    } else {
      obstacleType = "hole";
    }
  } else {
    if (rand < 0.15) {
      obstacleType = "rollingSphere";
    } else if (rand < 0.45) {
      obstacleType = "barricade";
    } else if (rand < 0.7) {
      obstacleType = "hole";
    } else {
      obstacleType = "overheadBar";
    }
  }

  switch (obstacleType) {
    case "rollingSphere":
      spawnRollingSphere(scene, leftLane, middleLane, rightLane);
      break;
    case "barricade":
      spawnBarricade(scene, heroBaseY, leftLane, middleLane, rightLane);
      break;
    case "hole":
      spawnHole(scene, heroBaseY, leftLane, middleLane, rightLane);
      break;
    case "overheadBar":
      spawnOverheadBar(scene, heroBaseY, leftLane, middleLane, rightLane);
      break;
  }

  lastSpawnedType = obstacleType;

  // **UPDATE DOUBLE SPAWN LOGIC**
  if (Math.random() < 0.2 * difficultyLevel) {
    const rand2 = Math.random();
    const doubleSpawnZ = lastObstacleZ - MIN_OBSTACLE_DISTANCE; // Extra spacing for double spawn

    if (lastSpawnedType === "overheadBar") {
      spawnBarricade(
        scene,
        heroBaseY,
        leftLane,
        middleLane,
        rightLane,
        doubleSpawnZ
      );
    } else {
      if (rand2 < 0.33)
        spawnRollingSphere(
          scene,
          leftLane,
          middleLane,
          rightLane,
          doubleSpawnZ
        );
      else if (rand2 < 0.66)
        spawnBarricade(
          scene,
          heroBaseY,
          leftLane,
          middleLane,
          rightLane,
          doubleSpawnZ
        );
      else
        spawnOverheadBar(
          scene,
          heroBaseY,
          leftLane,
          middleLane,
          rightLane,
          doubleSpawnZ
        );
    }
  }
}

export function animateSmoke() {
  obstacles.forEach((obstacle) => {
    if (obstacle.userData.type === "hole" && obstacle.userData.smokeParticles) {
      obstacle.userData.smokeParticles.forEach((particle) => {
        particle.mesh.position.y += particle.speed;
        particle.mesh.material.opacity -= particle.fadeSpeed;
        particle.mesh.scale.x += 0.002;
        particle.mesh.scale.y += 0.002;
        particle.mesh.scale.z += 0.002;

        if (
          particle.mesh.material.opacity <= 0 ||
          particle.mesh.position.y > 2
        ) {
          particle.mesh.position.set(
            particle.startX,
            particle.startY,
            particle.startZ
          );
          particle.mesh.material.opacity = 0.4;
          particle.mesh.scale.setScalar(0.5 + Math.random() * 0.5);
        }
      });
    }
  });
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
      case "barricade":
        obs.position.z += rollingSpeed * speedMultiplier;
        break;

      case "rollingSphere":
        obs.position.z += rollingSpeed * 3 * speedMultiplier;
        obs.rotation.x += 0.3 * speedMultiplier;
        obs.rotation.z += 0.2 * speedMultiplier;
        break;

      case "overheadBar":
        obs.position.z += rollingSpeed * speedMultiplier;
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
export function checkObstacleCollision(heroSphere, heroBaseY, isSliding) {
  const heroBox = new THREE.Box3().setFromObject(heroSphere);

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const obsBox = new THREE.Box3().setFromObject(obs);

    if (!obs.visible) continue;

    switch (obs.userData.type) {
      case "hole":
        // Can't jump over holes if you're on the ground
        if (heroSphere.position.y > heroBaseY + 0.5) continue;
        break;

      case "overheadBar":
        // Can slide under overhead bars
        if (isSliding) continue;
        break;
    }

    if (heroBox.intersectsBox(obsBox)) {
      return { type: obs.userData.type, obstacle: obs };
    }
  }

  return null;
}

// === EXPLOSION SYSTEM ===
function createExplosion(scene, obstacle) {
  const position = obstacle.position.clone();
  const particleCount = 20;

  let color;
  switch (obstacle.userData.type) {
    case "rollingSphere":
      color = 0xff0000;
      break;
    case "barricade":
      color = 0x8b0000;
      break;
    case "overheadBar":
      color = 0xff4400;
      break;
    case "hole":
      color = 0x555555;
      break;
    default:
      color = 0xffffff;
  }

  for (let i = 0; i < particleCount; i++) {
    const size = 0.1 + Math.random() * 0.15;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.4,
    });

    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(position);
    particle.castShadow = true;

    const speed = 0.15 + Math.random() * 0.25;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    particle.userData.velocity = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.sin(phi) * Math.sin(theta) * speed + 0.1,
      Math.cos(phi) * speed
    );

    particle.userData.rotationSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3
    );

    particle.userData.lifetime = 60;
    particle.userData.age = 0;

    scene.add(particle);
    explosionParticles.push(particle);
  }

  const flashGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const flashMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 1.0,
  });
  const flash = new THREE.Mesh(flashGeometry, flashMaterial);
  flash.position.copy(position);
  scene.add(flash);

  explosionParticles.push({
    mesh: flash,
    isFlash: true,
    age: 0,
    lifetime: 10,
  });
}

export function updateExplosions(scene) {
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const particle = explosionParticles[i];

    if (particle.isFlash) {
      particle.age++;
      particle.mesh.material.opacity = 1 - particle.age / particle.lifetime;
      particle.mesh.scale.multiplyScalar(1.2);

      if (particle.age >= particle.lifetime) {
        scene.remove(particle.mesh);
        explosionParticles.splice(i, 1);
      }
    } else {
      const p = particle;
      p.userData.age++;

      p.position.add(p.userData.velocity);
      p.userData.velocity.y -= 0.01;

      p.rotation.x += p.userData.rotationSpeed.x;
      p.rotation.y += p.userData.rotationSpeed.y;
      p.rotation.z += p.userData.rotationSpeed.z;

      const fadeProgress = p.userData.age / p.userData.lifetime;
      p.material.opacity = 1 - fadeProgress;
      p.material.transparent = true;
      p.material.emissiveIntensity = 0.5 * (1 - fadeProgress);

      if (p.userData.age >= p.userData.lifetime) {
        scene.remove(p);
        explosionParticles.splice(i, 1);
      }
    }
  }
}

// Export the explosion trigger function
export function triggerExplosion(scene, obstacle) {
  createExplosion(scene, obstacle);
}

// === HELPERS ===
export function getObstacles() {
  return obstacles;
}

// **UPDATE CLEAR OBSTACLES TO RESET TRACKING**
export function clearObstacles(scene) {
  obstacles.forEach((obj) => scene.remove(obj));
  obstacles = [];

  explosionParticles.forEach((particle) => {
    if (particle.isFlash) {
      scene.remove(particle.mesh);
    } else {
      scene.remove(particle);
    }
  });
  explosionParticles = [];

  // **RESET TRACKING VARIABLES**
  recentLanes = [];
  lastObstacleZ = -100;
  lastSpawnedType = null;
}
