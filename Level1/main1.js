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
import {
  addHearts,
  checkCollisions,
  resetHearts,
  takeLanePenalty,
} from "./healthBar.js";
import { createRealisticStone } from "./stones.js";
import { addSideTrees, treeGroups } from "./trees.js";
import { addSideWaterfalls, waterfalls } from "./waterfalls.js";
import { addRoad, roadSegments } from "./road.js";
import { createScene, scene, camera, renderer } from "./scene.js";
import { addLight } from "./lights.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { sounds, addSounds } from "./sounds.js";
import { createLevel1CompleteMenu } from "./menu1.js";

//Mmakwena
import {
  addHero,
  heroSphere,
  heroBaseY,
  updateHero,
  playJumpAnimation,
} from "../hero.js";

export function startLevel1() {
  //let road, heroSphere;
  let road;
  let rollingSpeed = 0.2;
  let heroRollingSpeed;
  let heroRadius = 0.3;
  //let heroBaseY = 0.5;
  let bounceValue = 0.02;
  let gravity = 0.002;
  let leftLane = -2;
  let rightLane = 2;
  let middleLane = 0;
  let currentLane = middleLane;
  let lastObstacleTime = 0;
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
  let gameStarted = false;
  let levelEnded = false;

  //theto
  let jump_can = 1;
  let velocity_y = 0;
  let velocity_z = 0;
  let delta = 0;
  //Mmakwena
  let slide_can = 1;

  init();

  function init() {
    createScene();

    addRoad(scene);
    addLight(scene);
    addSideTrees(scene);
    addSounds(scene, camera);
    //addObstacles();
    addEmotions(scene);
    addSideWaterfalls(scene); // Add waterfalls along the sides
    addHearts();
    clock = new THREE.Clock();
    //Mmakwena
    //addHero(scene);

    addHero(scene, currentLane);

    // create hamburger in-game menu
    //createInGameMenu();

    setupPauseControls();

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("keydown", handleKeyDown);

    startGame();
  }

  function createInGameMenu() {
    const menuBtn = document.createElement("div");
    menuBtn.id = "hamburger-menu";
    menuBtn.innerHTML = "&#9776;";
    menuBtn.style.cssText = `
      position: fixed;
      top: 30px;
      left: 15px;
      font-size: 40px;
      color: white;
      cursor: pointer;
      z-index: 1500;
    `;
    document.body.appendChild(menuBtn);

    const menuOverlay = document.createElement("div");
    menuOverlay.id = "in-game-menu";
    menuOverlay.style.cssText = `
      position: fixed;
      top:0;
      left:0;
      width:100%;
      height:100%;
      background: rgba(0,0,0,0.85);
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    `;
    document.body.appendChild(menuOverlay);

    resumeButton = document.createElement("button");
    resumeButton.textContent = "RESUME";
    styleMenuButton(resumeButton);
    resumeButton.addEventListener("click", () => {
      menuOverlay.style.display = "none";
      if (isPaused) togglePause();
    });

    const controlsBtn = document.createElement("button");
    controlsBtn.textContent = "CONTROLS";
    styleMenuButton(controlsBtn);
    controlsBtn.addEventListener("click", () => {
      alert(`Controls:\n← → Move\n↑ Jump\nV Change Camera\nSpace - Pause`);
    });

    menuOverlay.appendChild(resumeButton);
    menuOverlay.appendChild(controlsBtn);

    menuBtn.addEventListener("click", () => {
      const isShowing = menuOverlay.style.display !== "flex";
      menuOverlay.style.display = isShowing ? "flex" : "none";
      if (isShowing && !isPaused) togglePause(); // pause game when menu opens
    });

    function styleMenuButton(btn) {
      btn.style.cssText = `
        background: linear-gradient(135deg, #FFD700 0%, #ffcc00 100%);
        color: #333;
        border: none;
        padding: 15px 50px;
        font-size: 20px;
        font-weight: bold;
        border-radius: 12px;
        cursor: pointer;
        margin: 15px;
        transition: transform 0.2s, box-shadow 0.2s;
      `;
      btn.addEventListener("mouseover", () => {
        btn.style.transform = "scale(1.1)";
        btn.style.boxShadow = "0 0 25px rgba(255,215,0,0.7)";
      });
      btn.addEventListener("mouseout", () => {
        btn.style.transform = "scale(1)";
        btn.style.boxShadow = "none";
      });
    }
  }

  function startGame() {
    gameStarted = true;
    clock.start();
    lastObstacleTime = clock.getElapsedTime();
    update();
  }

  function endLevel() {
    if (levelEnded) return;

    levelEnded = true;
    clock.stop();
    console.log("Level Complete! Final Score: " + score);

    setTimeout(() => {
      createLevel1CompleteMenu();
    }, 500);
  }

  function setupPauseControls() {
    pauseButton = document.getElementById("pause-btn1");

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
      pauseButton.innerHTML =
        '<img src="./assets/icons/icons8-play-94.png" width="50" height="50"/>';
      clock.stop();
      console.log("Game Paused");
    } else {
      pauseButton.innerHTML =
        '<img src="./assets/icons/icons8-pause-64.png" width="50" height="50"/>';
      clock.start();
      console.log("Game Resumed");
    }
  }

  function handleKeyDown(keyEvent) {
    // Left arrow
    if (keyEvent.keyCode === 37) {
      if (currentLane > leftLane) {
        currentLane -= 2;
      } else {
        // Already at leftmost lane - take penalty
        takeLanePenalty(heroSphere, -1);
      }
    }
    // Right arrow
    else if (keyEvent.keyCode === 39) {
      if (currentLane < rightLane) {
        currentLane += 2;
      } else {
        // Already at rightmost lane - take penalty
        takeLanePenalty(heroSphere, 1);
      }
    }
    // Up arrow - jump
    else if (keyEvent.keyCode === 38 && jump_can == 1) {
      jump_can = 0;
      velocity_y = 15;
      playJumpAnimation("jump");
    }
    // Down arrow - slide
    else if (keyEvent.keyCode === 40 && slide_can == 1) {
      slide_can = 0;
      velocity_y = 10;
      playJumpAnimation("slide");
    }
    // V - toggle camera
    else if (keyEvent.key === "v" || keyEvent.key === "V") {
      toggleCameraView();
    }
    // Spacebar - pause
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
     // heroSphere.add(camera);
      //camera.position.set(0, 1.8, 0);
      camera.position.copy(heroSphere.position);
      camera.position.y += (heroBaseY+2) / 2; // Adjust for eye level
      camera.position.x = heroSphere.position.x;
      camera.position.z=1;
     // console.log(camera.position);
    } else {
      // Switch to Third-Person
      PointerLockControls.enabled = false;
      OrbitControls.enabled = true;

      // Reposition camera for third-person view
      // (This might involve setting orbitControls target and camera position)
      controls = new OrbitControls(camera, renderer.domElement);
      camera.position.set(heroSphere.position.x - 5, heroSphere.position.y + 3, heroSphere.position.z); // Example offset
      camera.position.set(0, 4, 8);
      camera.lookAt(0, 0, 0);
    }
  }

  function updateCamera() {
    if (isFirstPerson) {
      OrbitControls.enabled = false;
      PointerLockControls.enabled = true;
      camera.position.copy(heroSphere.position);
      camera.position.y += (heroBaseY+2)/2 ; // Adjust for eye level
      camera.position.x = heroSphere.position.x;
     //camera.rotation.y=(Math.PI);
    } else {
      const deltaTime = clock.getDelta();
      console.log("update camera");
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

  function update() {
    if (levelEnded) return;

    if (isPaused) {
      render();
      requestAnimationFrame(update);
      return;
    }
    const deltaTime = clock.getDelta();
    distance += rollingSpeed;
    updateHero(deltaTime);
    if (heroSphere) {
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
        heroSphere.position.y =
          heroBaseY + Math.sin(distance * 10) * bounceValue;
      }

      //slide animation when down key is pressed
      if (slide_can === 0) {
        heroSphere.position.y += velocity_y * deltaTime;
        velocity_y -= 45 * deltaTime;

        if (heroSphere.position.y <= heroBaseY) {
          heroSphere.position.y = heroBaseY;
          velocity_y = 0;
          slide_can = 1;
        }
      }

      // Spawn random obstacle (low probability each frame)
      if (Math.random() < 0.015) {
        const choice = Math.random();
        if (choice < 0.4) {
          addRollingLogs(scene);
        } else if (choice < 0.7) {
          spawnBoulder(scene, heroSphere, leftLane, middleLane, rightLane);
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
            positions[i] += Math.sin(distance * 10 + i) * 0.01;
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

      emotions.forEach((emotion) => {
        if (!emotion.userData.collected) {
          emotion.position.z += rollingSpeed; // move towards player

          // Collision detection (simple distance check)
          const dx = heroSphere.position.x - emotion.position.x;
          const dy = heroSphere.position.y - emotion.position.y;
          const dz = heroSphere.position.z - emotion.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 1) {
            // collision radius
            score = Math.max(0, score + emotion.userData.score);
            document.getElementById("score").textContent = "Score: " + score;
            console.log(
              "Collected " + emotion.userData.type + "! Score: " + score
            );

            if (score >= 500 && !levelEnded) {
              endLevel();
              return;
            }

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
            emotion.position.x = lanes[Math.floor(Math.random() * 3)];
            emotion.position.z = -200 - Math.random() * 200;
            emotion.userData.collected = false;

            const newType =
              emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
            emotion.material.color.set(newType.color);
            emotion.userData.type = newType.name;

            scene.add(emotion);
          }
        }
      });
    }

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
}
