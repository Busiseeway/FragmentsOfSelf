let obstacles = [];

//the falling
export function spawnObstacle(leftLane, middleLane, rightLane, heroSphere, scene) {
    // A simple log (cylinder lying on the road)
    const logGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
    const logMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const log = new THREE.Mesh(logGeometry, logMaterial);

    log.rotation.z = Math.PI / 2; // lay it flat

    // Pick a random lane
    const lanes = [leftLane, middleLane, rightLane];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    // Position the obstacle above road so it can "fall"
    log.position.set(lane, 6, heroSphere.position.z - 30);

    log.castShadow = true;
    log.receiveShadow = true;

    scene.add(log);
    obstacles.push(log);
}

export function spawnBarricade(leftLane, rightLane, heroBaseY, scene) {
    // Determine total width between lanes (add a small margin)
    const totalWidth = Math.abs(rightLane - leftLane) + 2;  // +2 for small overlap
    
    const geometry = new THREE.BoxGeometry(totalWidth, 1, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const barricade = new THREE.Mesh(geometry, material);

    // Center between the two lanes
    barricade.position.x = (leftLane + rightLane) / 2;
    barricade.position.y = heroBaseY + 0.5; // sits on ground
    barricade.position.z = -100; // place it ahead of player

    barricade.castShadow = true;
    barricade.receiveShadow = true;

    scene.add(barricade);
    obstacles.push(barricade);
}


export function spawnBoulder(leftLane, rightLane, middleLane, heroBaseY, scene) {
    const lanes = [leftLane, middleLane, rightLane];
    const radius = 0.7; // size of boulder
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const boulder = new THREE.Mesh(geometry, material);

    // Place in a random lane
    boulder.position.x = lanes[Math.floor(Math.random() * lanes.length)];
    boulder.position.y = heroBaseY + radius;
    boulder.position.z = -100;

    boulder.castShadow = true;
    boulder.receiveShadow = true;

    scene.add(boulder);
    obstacles.push(boulder);
}

export function checkCollisions2(heroSphere) {
    // Define the hero’s collision box (rough cube around it)
    const heroRadius = 0.5; // adjust to match your hero’s size
    const heroBox = new THREE.Box3().setFromCenterAndSize(
        heroSphere.position.clone(),
        new THREE.Vector3(heroRadius * 2, heroRadius * 2, heroRadius * 2)
    );

    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];

        // Create a bounding box for this obstacle
        const obsBox = new THREE.Box3().setFromObject(obs);

        // Check if boxes overlap
        if (heroBox.intersectsBox(obsBox)) {
            return true;
        }
    }
    return false;
}


export function updateObstacles(scene, rollingSpeed, heroBaseY){
    // Move and animate obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];

        // Logs (cylinders)
        if (obs.geometry.type === "CylinderGeometry") {
            // Falling effect until it hits the ground
            if (obs.position.y > heroBaseY) {
                obs.position.y -= 0.2;   //speed of the falling log.
            }
            // Make log roll
            obs.rotation.x += 0.1;
        }

        // Barricades (boxes) - they just sit still (no animation needed)

        // Boulders (spheres) - roll faster than road
        if (obs.geometry.type === "SphereGeometry") {
            obs.rotation.x += 0.2; // spin forward
            obs.position.z += rollingSpeed * 1.5; // faster than road
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

// Helper exports
export function getObstacles() {
  return obstacles;
}

export function clearObstacles(scene) {
  obstacles.forEach(obj => scene.remove(obj));
  obstacles = [];
}

