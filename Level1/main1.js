import * as THREE from "three";

//mukondi
import {
  addRollingLogs,
  spawnBoulder,
  checkObsCollisions,
  updateObstacles,
  clearObstacles,
  addObstacles,
} from "./obstacles1.js";
import { addEmotions, emotions, emotionTypes } from "./emotions.js";
import { addHearts, checkCollisions, resetHearts } from "./healthBar.js";
import { createRealisticStone } from "./stones.js";
import { addSideTrees, treeGroups } from "./trees.js";
import { addSideWaterfalls, waterfalls } from "./waterfalls.js";
import { addRoad, roadSegments } from "./road.js";
import { createScene, scene, camera, renderer } from "./scene.js";
import { addLight } from "./lights.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function startLevel1() {
  let road, heroSphere;
  let rollingSpeed = 0.2;
  let heroRollingSpeed;
  let heroRadius = 0.3;
  let heroBaseY = 0.5;
  let bounceValue = 0.02;
  let gravity = 0.002;
  let leftLane = -2;
  let rightLane = 2;
  let middleLane = 0;
  let currentLane = middleLane;
  let clock;
  var score = 0;
  var scoreText;
  var hasCollided;
  let distance = 0;
  let obstacles = [];
  let controls;
  let isPaused = false;
  let pauseButton;
  let resumeButton;
  let raycaster;
  let isFirstPerson = false;

  //theto
  let jump_can = 1;
  let velocity_y = 0;
  let delta = 0;

  init();

  function init() {
    createScene();

    addRoad(scene);
    addLight(scene);
    addSideTrees(scene);
    //addObstacles();
    addEmotions(scene);
    addSideWaterfalls(scene); // Add waterfalls along the sides
    addHearts();
    clock = new THREE.Clock();

    addHero(scene);

    update();

    setupPauseControls();

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("keydown", handleKeyDown);
  }

  function setupPauseControls() {
    pauseButton = document.getElementById("pause-btn");

    if (pauseButton) {
      pauseButton.addEventListener("click", togglePause);
    } else {
      console.error("Pause button not found!");
    }

    if (resumeButton) {
      resumeButton.addEventListener("click", togglePause);
    }
  }

  function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
      pauseButton.textContent = "Resume";
      clock.stop();
      console.log("Game Paused");
    } else {
      pauseButton.textContent = "Pause";
      clock.start();
      console.log("Game Resumed");
    }
  }

  function handleKeyDown(keyEvent) {
    if (keyEvent.keyCode === 37) {
      // left
      if (currentLane > leftLane) {
        currentLane -= 2;
      }
    } else if (keyEvent.keyCode === 39) {
      // right
      if (currentLane < rightLane) {
        currentLane += 2;
      }
    }
    //theto
    else if (keyEvent.keyCode === 38 && jump_can == 1) {
      //up
      jump_can = 0;
      heroSphere.position.z -= 1;
      velocity_y = 16;
    }

    //mukondi
    else if (keyEvent.key === "v" || keyEvent.key === "V") {
      toggleCameraView();
    }
    // Spacebar — pause
    else if (keyEvent.keyCode === 32) {
      keyEvent.preventDefault();
      togglePause();
      return;
    }
  }
  function toggleCameraView() {
    isFirstPerson = !isFirstPerson;

    if (isFirstPerson) {
      // Switch to First-Person
      OrbitControls.enabled = false;
      PointerLockControls.enabled = true;
      // Position camera relative to character
      camera.position.copy(heroSphere.position);
      camera.position.y += heroBaseY / 2; // Adjust for eye level
      camera.position.x = heroSphere.position.x;
      camera.rotation.copy(heroSphere.rotation); // Align camera with character's forward
    } else {
      // Switch to Third-Person
      PointerLockControls.enabled = false;
      OrbitControls.enabled = true;

      // Reposition camera for third-person view
      // (This might involve setting orbitControls target and camera position)
      controls = new OrbitControls(camera, renderer.domElement);
      //controls.target.set( 0, 0, 0 ); // Set the target to the origin
      //OrbitControls.target.copy(heroSphere.position);
      // camera.position.set(heroSphere.position.x - 5, heroSphere.position.y + 3, heroSphere.position.z); // Example offset
      camera.position.set(0, 4, 8);
      camera.lookAt(0, 0, 0);
    }
  }
  function updateCamera() {
    if (isFirstPerson) {
      OrbitControls.enabled = false;
      PointerLockControls.enabled = true;
      // Position camera relative to character
      camera.position.copy(heroSphere.position);
      camera.position.y += heroBaseY / 2; // Adjust for eye level
      camera.position.x = heroSphere.position.x;
      camera.rotation.copy(heroSphere.rotation);
    } else {
      const deltaTime = clock.getDelta();
      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        heroSphere.position.z + 8,
        2 * deltaTime
      );
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function addHero() {
    const sphereGeometry = new THREE.DodecahedronGeometry(heroRadius, 1);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      flatShading: true,
      metalness: 0.3,
      roughness: 0.4,
    });

    heroSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    heroSphere.receiveShadow = true;
    heroSphere.castShadow = true;
    scene.add(heroSphere);
    heroSphere.position.y = heroBaseY;
    heroSphere.position.z = 0;
    heroSphere.position.x = currentLane;
    //heroSphere.add(camera);
  }

  function update() {
    if (isPaused) {
      render();
      requestAnimationFrame(update);
      return;
    }
    const deltaTime = clock.getDelta();
    distance += rollingSpeed;

    treeGroups.forEach((tree) => {
      tree.position.z += rollingSpeed;
      if (tree.position.z > 20) {
        tree.position.z -= 200;
      }
    });

    //theto (jump animation when up key is pressed)
    if (jump_can === 0) {
      heroSphere.position.y += velocity_y * deltaTime;
      velocity_y -= 45 * deltaTime;

      if (heroSphere.position.y <= heroBaseY) {
        heroSphere.position.y = heroBaseY;
        velocity_y = 0;
        jump_can = 1;
      }
    } else {
      heroSphere.position.y = heroBaseY + Math.sin(distance * 10) * bounceValue;
    }

    //update cylinder rolling
    // obstacles.forEach(obstacle =>{

    // })
    //pabii
    // Spawn random obstacle (low probability each frame)
    if (Math.random() < 0.01) {
      // adjust 0.01 to control frequency
      const choice = Math.random();
      if (choice < 0.4) {
        addRollingLogs(scene); // log
      } else if (choice < 0.7) {
        spawnBoulder(scene, heroSphere, leftLane, middleLane, rightLane); // trees
      } else {
        // spawnBoulder();    // rolling boulder
      }
    }
    //update obstacles
    updateObstacles(scene, rollingSpeed, heroBaseY);
    //check collision
    checkCollisions(heroSphere, heroBaseY, scene);
    // Smooth lane changing
    heroSphere.position.x = THREE.MathUtils.lerp(
      heroSphere.position.x,
      currentLane,
      5 * deltaTime
    );

    // Add subtle bouncing
    //heroSphere.position.y = heroBaseY + Math.sin(distance * 10) * bounceValue;

    // Move road segments to create infinite road effect
    roadSegments.forEach((segment) => {
      segment.position.z += rollingSpeed;
      if (segment.position.z > 20) {
        segment.position.z -= roadSegments.length * 20;
      }
    });

    // Move waterfalls to create infinite effect
    waterfalls.forEach((waterfall) => {
      waterfall.position.z += rollingSpeed;
      if (waterfall.position.z > 25) {
        waterfall.position.z -= 300; // Reset further back
      }

      // Animate water flow and mist
      const waterMesh = waterfall.children[1]; // Water plane
      const mistParticles = waterfall.children[3]; // Mist particles
      const pool = waterfall.children[2]; // Water pool

      if (waterMesh && waterMesh.geometry) {
        // Animate water flowing down
        const positions = waterMesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 9) {
          // Every 3 vertices
          positions[i] += Math.sin(distance * 10 + i) * 0.01; // Flowing motion
        }
        waterMesh.geometry.attributes.position.needsUpdate = true;
      }

      // Animate mist particles
      if (mistParticles) {
        mistParticles.rotation.y += 0.01;
        mistParticles.position.y = 2 + Math.sin(distance * 5) * 0.2;
      }

      // Animate water pool
      if (pool) {
        pool.rotation.y += 0.02;
        pool.material.opacity = 0.6 + Math.sin(distance * 8) * 0.2;
      }
    });

    // Update camera to follow slightly
    updateCamera();
    //camera.position.z = THREE.MathUtils.lerp(camera.position.z, heroSphere.position.z + 8, 2 * deltaTime);

    emotions.forEach((emotion) => {
      if (!emotion.userData.collected) {
        emotion.position.z += rollingSpeed * 0.8; // move towards player

        // Collision detection (simple distance check)
        const dx = heroSphere.position.x - emotion.position.x;
        const dy = heroSphere.position.y - emotion.position.y;
        const dz = heroSphere.position.z - emotion.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 1) {
          // collision radius
          score += emotion.userData.score;
          document.getElementById("score").textContent = "Score: " + score;
          console.log(
            "Collected " + emotion.userData.type + "! Score: " + score
          );

          // Reset emotion immediately after collection
          const lanes = [-2, 0, 2];
          emotion.position.x = lanes[Math.floor(Math.random() * 3)];
          emotion.position.z = -200 - Math.random() * 200;
          emotion.userData.collected = false;

          const newType =
            emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
          emotion.material.color.set(newType.color);
          emotion.userData.type = newType.name;
        }

        // Reset if emotion goes behind hero
        if (emotion.position.z > 10) {
          const lanes = [-2, 0, 2];
          emotion.position.x = lanes[Math.floor(Math.random() * 3)]; // pick random lane
          emotion.position.z = -200 - Math.random() * 200; // random depth
          emotion.userData.collected = false;

          const newType =
            emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
          emotion.material.color.set(newType.color);
          emotion.userData.type = newType.name;

          scene.add(emotion);
        }
      }
    });

    render();
    requestAnimationFrame(update);
  }

  function render() {
    renderer.render(scene, camera);
  }

  function resetGame() {
    // Clear all obstacles
    clearObstacles(scene);

    // Reset hero position
    currentLane = middleLane;
    heroSphere.position.set(currentLane, heroBaseY, 0);

    // Reset game variables
    distance = 0;
    score = 0;
    document.getElementById("score").textContent = "Score: " + score;

    // Reset clock
    lastObstacleTime = clock.getElapsedTime();
  }
  // Export resetGame if needed elsewhere
  //export { resetGame };
}
