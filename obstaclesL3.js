import * as THREE from 'three';

let obstacles = [];

export function spawnLog(scene, heroSphere, leftLane, middleLane, rightLane) {
  const logGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
  const logMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const log = new THREE.Mesh(logGeometry, logMaterial);

  log.rotation.z = Math.PI / 2; // lay it flat
  log.userData.type = 'log';

  // Pick a random lane
  const lanes = [leftLane, middleLane, rightLane];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];

  // Position above road so it can "fall"
  log.position.set(lane, 6, heroSphere.position.z - 30);

  log.castShadow = true;
  log.receiveShadow = true;

  scene.add(log);
  obstacles.push(log);
}

export function spawnBarricade(scene, heroBaseY, leftLane, rightLane) {
  const barricadeGroup = new THREE.Group();

  const baseWidth = 2.4;
  const baseHeight = 0.7;
  const baseDepth = 0.4;
  const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B0000,
    metalness: 0.6,
    roughness: 0.3,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.castShadow = true;
  base.receiveShadow = true;
  barricadeGroup.add(base);

  // Spike geometry & material
  const spikeRadius = 0.12;
  const spikeHeight = 0.4;
  const spikeGeometry = new THREE.ConeGeometry(spikeRadius, spikeHeight, 4);
  const silverSpikeMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 1.0,
    roughness: 0.2,
  });

  // === Top spikes ===
  const topSpikeCount = 5;
  for (let i = 0; i < topSpikeCount; i++) {
    const spike = new THREE.Mesh(spikeGeometry, silverSpikeMaterial);
    const spacing = baseWidth / (topSpikeCount + 1);
    spike.position.set(-baseWidth/2 + spacing * (i + 1), baseHeight/2 + spikeHeight/2, 0);
    spike.rotation.y = Math.PI / 4;
    spike.castShadow = true;
    barricadeGroup.add(spike);
  }
  // === Position barricade in world ===
  barricadeGroup.position.x = (leftLane + rightLane) / 2;
  barricadeGroup.position.y = heroBaseY + baseHeight/2;
  barricadeGroup.position.z = -100;
  barricadeGroup.userData.type = 'barricade';

  scene.add(barricadeGroup);
  obstacles.push(barricadeGroup);
}

// Spawn a hole in the road
const smokeParticles = [];

export function spawnHole(scene, heroBaseY, leftLane, middleLane, rightLane) {
  const holeGroup = new THREE.Group();
  holeGroup.userData.type = 'hole';

  // Dark circular pit
  const holeGeometry = new THREE.CircleGeometry(0.6, 32);
  const holeMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d0d0d,
    roughness: 0.9,
    metalness: 0.1
  });
  const hole = new THREE.Mesh(holeGeometry, holeMaterial);
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = 0.01;

  // Dark rim
  const rimGeometry = new THREE.RingGeometry(0.6, 0.75, 32);
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.8
  });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.02;

  holeGroup.add(hole);
  holeGroup.add(rim);

  // Smoke particles
  const smokeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const smokeMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    transparent: true,
    opacity: 0.4,
    roughness: 1.0
  });

  for (let i = 0; i < 15; i++) {
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial.clone());
    smoke.position.set(
      (Math.random() - 0.5) * 0.6, // random X offset
      0.05 + Math.random() * 0.2, // random Y offset
      (Math.random() - 0.5) * 0.6  // random Z offset
    );
    smoke.scale.setScalar(0.5 + Math.random() * 0.5);
    holeGroup.add(smoke);
    smokeParticles.push({ mesh: smoke, speed: 0.001 + Math.random() * 0.002 });
  }

  // Random lane positioning
  const lanes = [leftLane, middleLane, rightLane];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  holeGroup.position.set(lane, heroBaseY, -100);
  holeGroup.receiveShadow = true;

  scene.add(holeGroup);
  obstacles.push(holeGroup);
}

// Animate smoke over time
export function updateSmoke() {
  for (const { mesh, speed } of smokeParticles) {
    mesh.position.y += speed; // rise up
    mesh.material.opacity -= 0.002; // fade out slowly
    if (mesh.material.opacity <= 0) {
      // reset smoke puff to bottom
      mesh.position.y = 0.05 + Math.random() * 0.1;
      mesh.material.opacity = 0.4;
      mesh.position.x = (Math.random() - 0.5) * 0.6;
      mesh.position.z = (Math.random() - 0.5) * 0.6;
    }
  }
}

export function updateObstacles(scene, rollingSpeed, heroBaseY, heroSphere) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    
    switch (obs.userData.type) {
      case 'log':
        if (obs.position.y > heroBaseY) {
          obs.position.y -= 0.1;
        }
        obs.rotation.x += 0.1;
        obs.position.z += rollingSpeed;
        break;
        
      case 'barricade':
        obs.position.z += rollingSpeed;
        break;
        
      case 'hole':
      default:
        // Default behavior for any other obstacles
        obs.position.z += rollingSpeed;
    }
    
    // Remove obstacle if it goes past the camera
    if (obs.position.z > 10) {
      scene.remove(obs);
      obstacles.splice(i, 1);
    }
  }
}

// Check collision between hero and obstacles
export function checkObstacleCollision(heroSphere, heroBaseY) {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    
    // Calculate distance between hero and obstacle
    const dx = heroSphere.position.x - obs.position.x;
    const dy = heroSphere.position.y - obs.position.y;
    const dz = heroSphere.position.z - obs.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Different collision radii for different obstacles
    let collisionRadius = 1.0;
    
    switch (obs.userData.type) {
      case 'log':
        collisionRadius = 1.2;
        break;
      case 'barricade':
        collisionRadius = 1.7;
        break;
      case 'hole':
        collisionRadius = 0.8;
        // Only collide if hero is on the ground (not jumping)
        if (heroSphere.position.y > heroBaseY + 0.5) {
          continue; // Skip collision if jumping over hole
        }
        break;
    }
    
    if (distance < collisionRadius) {
      return true; // Collision detected
    }
  }
  
  return false; // No collision
}

// Helper exports
export function getObstacles() {
  return obstacles;
}

export function clearObstacles(scene) {
  obstacles.forEach(obj => scene.remove(obj));
  obstacles = [];
}