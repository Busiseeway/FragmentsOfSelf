import * as THREE from "three";

let obstacles = [];

export function addRollingLogs(scene) {
  //I want these to  be rolling from left to right
  //Disappear them when they are no longer on the road

  //add Texture
  // const texture = new THREE.TextureLoader().load(
  //   "assets/textures/top-view-tree-bark.jpg"
  // );
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.wrapT = THREE.RepeatWrapping;
  // texture.repeat.set(4, 4);

  const logGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 20);
  const logMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    //map: texture,
  });
  const log = new THREE.Mesh(logGeometry, logMaterial);
  log.position.x = 5 + Math.random() * 10;
  log.position.z = -20 + Math.random() * 8;
  log.name = "log";
  // cylinder.position.y = 0;
  log.castShadow = true;
  log.receiveShadow = true;
  scene.add(log);
  obstacles.push(log);
}
//got code from Pabi
export function spawnBoulder(
  scene,
  heroSphere,
  leftLane,
  middleLane,
  rightLane
) {
  const lanes = [leftLane, middleLane, rightLane];
  const radius = 0.7; // size of boulder
  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const boulder = new THREE.Mesh(geometry, material);
  boulder.name = "boulder";

  // Pick a random lane

  const lane = lanes[Math.floor(Math.random() * lanes.length)];

  // Position the obstacle above road so it can "fall"
  boulder.position.set(lane, 6, heroSphere.position.z - 30);

  boulder.castShadow = true;
  boulder.receiveShadow = true;

  scene.add(boulder);
  obstacles.push(boulder);
}
//from pabi
export function checkObsCollisions(heroSphere) {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];

    // Calculate distance between hero and obstacle
    const dx = heroSphere.position.x - obs.position.x;
    const dy = heroSphere.position.y - obs.position.y;
    const dz = heroSphere.position.z - obs.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Different collision thresholds for different obstacle types
    let collisionThreshold = 1;
    if (obs.name === "log") {
      collisionThreshold = 1.5;
    } else if (obs.name === "boulder") {
      collisionThreshold = 1.2;
    }

    if (distance <= collisionThreshold) {
      return { collided: true, obstacle: obs, index: i }; // Return obstacle info
    }
  }
  return { collided: false };
}

export function explodeObstacle(scene, obstacleIndex) {
  if (obstacleIndex >= 0 && obstacleIndex < obstacles.length) {
    const obs = obstacles[obstacleIndex];

    // Create explosion at obstacle position
    const particles = createExplosion(scene, obs.position.clone());
    addExplosionParticles(particles);

    // Remove the obstacle
    scene.remove(obs);
    obs.geometry.dispose();
    obs.material.dispose();
    obstacles.splice(obstacleIndex, 1);
  }
}

// Helper exports
export function getObstacles() {
  return obstacles;
}
export function updateObstacles(scene, rollingSpeed, heroBaseY) {
  // Move and animate obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    //console.log(obs);
    // Logs (cylinders)
    if (obs.name === "boulder") {
      // console.log(obs);

      // Falling effect until it hits the ground
      if (obs.position.y > heroBaseY) {
        obs.position.y -= 0.1;
      }
      obs.position.z += rollingSpeed;
      // // Make log roll
      // obs.rotation.x += 0.1;
    }

    // // Barricades (boxes) - they just sit still (no animation needed)

    // // Boulders (spheres) - roll faster than road
    else if (obs.name === "log") {
      obs.position.x -= rollingSpeed * 0.6; //rolling to the side but I want them to repeat
      obs.position.z += rollingSpeed * 1.25;
      // obs.position.z -= (rollingSpeed*1.5);
    } else {
      // Logs + barricades move at normal road speed
      obs.position.z += rollingSpeed;
    }

    // Remove obstacle if it goes past the camera
    if (obs.position.z > 10) {
      scene.remove(obs);
      obstacles.splice(i, 1);
    }
  }
}

// Function for explosions
export function createExplosion(scene, position) {
  const particleCount = 30;
  const particles = [];

  // Create wood chip particles with same color as logs
  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshStandardMaterial({
      color: Math.random() > 0.5 ? 0xffff00 : 0xffdd00, // Yellow shades (same as log)
    });
    const particle = new THREE.Mesh(geometry, material);

    // Position at explosion point
    particle.position.copy(position);

    // Random velocity for each particle
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      Math.random() * 0.3 + 0.1,
      (Math.random() - 0.5) * 0.3
    );

    particle.userData.rotationSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2
    );

    particle.userData.lifetime = 60; // frames
    particle.castShadow = true;

    scene.add(particle);
    particles.push(particle);
  }

  return particles;
}

// Add this array at the top of the file with other variables
let explosionParticles = [];

// Add this function to update explosion particles
export function updateExplosionParticles(scene) {
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const particle = explosionParticles[i];

    // Update position
    particle.position.add(particle.userData.velocity);

    // Apply gravity
    particle.userData.velocity.y -= 0.01;

    // Rotate
    particle.rotation.x += particle.userData.rotationSpeed.x;
    particle.rotation.y += particle.userData.rotationSpeed.y;
    particle.rotation.z += particle.userData.rotationSpeed.z;

    // Decrease lifetime
    particle.userData.lifetime--;

    // Fade out
    particle.material.opacity = particle.userData.lifetime / 60;
    particle.material.transparent = true;

    // Remove when lifetime is over
    if (particle.userData.lifetime <= 0) {
      scene.remove(particle);
      particle.geometry.dispose();
      particle.material.dispose();
      explosionParticles.splice(i, 1);
    }
  }
}

export function getExplosionParticles() {
  return explosionParticles;
}

export function addExplosionParticles(particles) {
  explosionParticles.push(...particles);
}

export function clearObstacles(scene) {
  obstacles.forEach((obj) => scene.remove(obj));
  obstacles = [];
}

//mukondi
export function addObstacles(scene) {
  //they should only cross the path when the hero is approaching them

  const TreeType = Math.floor(Math.random() * 4);
  const obsTree = createTree(TreeType);
  obsTree.name = "obsTree";
  // obsTree.position.x =  Math.random() * 10;
  // obsTree.position.z = -i * 20 + Math.random() * 8;
  // obsTree.position.y = 0;

  // Pick a random lane
  const lanes = [leftLane, middleLane, rightLane];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];

  // Position the obstacle above road so it can "fall"
  obsTree.position.set(lane, 6, heroSphere.position.z - 30);

  obsTree.castShadow = true;
  obsTree.receiveShadow = true;
  scene.add(obsTree);
  obstacles.push(obsTree);
}

//test