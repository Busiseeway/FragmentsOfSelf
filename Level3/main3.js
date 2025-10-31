import * as THREE from "three";
import { createMenu3, createLevel3CompleteMenu } from "./menu3.js";

import { createScene, scene, camera, renderer } from "./scene.js";
import { addLight } from "./lights.js";
import {
  addHero,
  heroSphere,
  heroBaseY,
  updateHero,
  playJumpAnimation,
} from "../hero.js";
import { addRoad, roadSegments, sideRocks } from "./road.js";
import { addBeach } from "./beach.js";
import { addSideTrees, treeGroups } from "./trees.js";
import { addSideWaterfalls, waterfalls } from "./waterfalls.js";
import { addEmotions, emotions, emotionTypes } from "./emotions.js";
import {
  addHearts,
  checkCollisions,
  takeLanePenalty,
  resetHearts,
} from "./healthBar.js";
import {
  spawnBarricade,
  updateObstacles,
  clearObstacles,
   animateSmoke,
   spawnRandomObstacle
} from "./obstacles.js";
import { addSounds, sounds } from "./sounds.js";

let resetGame;

export function startLevel3() {
  let rollingSpeed = 0.6;
  let heroRollingSpeed;
  let bounceValue = 0.02;
  let leftLane = -2;
  let rightLane = 2;
  let middleLane = 0;
  let currentLane = middleLane;
  let clock;
  let distance = 0;
  let score = 0;
  let isPaused = false;
  let pauseButton;
  let resumeButton;

  //theto menu
  let gameStarted = false;

  // Jump variables
  let jump_can = 1;
  let velocity_y = 0;
  let velocity_z = 0;
  let slide_can = 1;
  let levelEnded = false;

  // Obstacle spawning
  let lastObstacleTime = 0;
  const obstacleInterval = 2; // seconds between obstacle spawns

  init();

  function init() {
    createScene();

    heroRollingSpeed = rollingSpeed * 10;

    addLight(scene);
    addRoad(scene);
    addBeach(scene);
    addHero(scene, currentLane);
    addSideTrees(scene);
    addSideWaterfalls(scene);
    addEmotions(scene);
    addHearts();
    addSounds(scene, camera);

    clock = new THREE.Clock();

    setupPauseControls();
    //theto menu
    createMenu3(startGame);

    window.addEventListener("resize", onWindowResize);
    document.addEventListener("keydown", handleKeyDown);

    render();
  }

  function startGame() {
    gameStarted = true;
    clock.start();
    lastObstacleTime = clock.getElapsedTime();
    const spookyDance = sounds.find((s) => s.name === "spookyDance");
    if (spookyDance) spookyDance.audio.play();
    update();
  }

  function endLevel() {
    if (levelEnded) return;

    levelEnded = true;
    clock.stop();
    console.log("Level Complete! Final Score: " + score);

    setTimeout(() => {
      createLevel3CompleteMenu();
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
        // Already at leftmost lane
        takeLanePenalty(heroSphere, -1);
      }
    }

    // Right arrow
    else if (keyEvent.keyCode === 39) {
      if (currentLane < rightLane) {
        currentLane += 2;
      } else {
        // Already at rightmost lane
        takeLanePenalty(heroSphere, 1);
      }
    }

    // Up arrow — jump
    else if (keyEvent.keyCode === 38 && jump_can == 1) {
      // up arrow - jump
      jump_can = 0;
      velocity_y = 15;

      playJumpAnimation("jump"); // Trigger jump animation
    }
    //down arrow - slide
    else if (keyEvent.keyCode === 40 && slide_can == 1) {
      // up arrow - jump
      slide_can = 0;
      velocity_y = 10;

      playJumpAnimation("slide"); // Trigger jump animation
    }

    // Spacebar — pause
    else if (keyEvent.keyCode === 32) {
      keyEvent.preventDefault();
      togglePause();
      return;
    }
  }

  function update() {
    if (levelEnded) {
      return;
    }

    if (isPaused) {
      render();
      requestAnimationFrame(update);
      return;
    }

    const deltaTime = clock.getDelta();
    distance += rollingSpeed;

    updateHero(deltaTime);

    if (heroSphere) {
      const elapsed = clock.getElapsedTime();

        // Spawn obstacles periodically
      if (elapsed - lastObstacleTime > obstacleInterval) {
        spawnRandomObstacle(scene, heroSphere, heroBaseY, leftLane, middleLane, rightLane);
        lastObstacleTime = elapsed;
      }

      // Update all obstacles
      updateObstacles(scene, rollingSpeed, heroBaseY, heroSphere);

      animateSmoke();

      // Smooth lane changing
      heroSphere.position.x = THREE.MathUtils.lerp(
        heroSphere.position.x,
        currentLane,
        5 * deltaTime
      );

      // Jump logic
      if (jump_can === 0) {
        heroSphere.position.y += velocity_y * deltaTime;
        heroSphere.position.z += velocity_z * deltaTime;
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

      // Move road segments
      roadSegments.forEach((segment) => {
        segment.position.z += rollingSpeed;
        if (segment.position.z > 20) {
          segment.position.z -= roadSegments.length * 20;
        }
      });

      if (typeof sideRocks !== "undefined") {
        sideRocks.forEach((rock) => {
          rock.position.z += rollingSpeed;
          if (rock.position.z > 20) {
            rock.position.z -= roadSegments.length * 20;
          }
        });
      }

      // Infinite trees
      treeGroups.forEach((tree) => {
        tree.position.z += rollingSpeed;
        if (tree.position.z > 20) {
          tree.position.z -= 200;
        }
      });

      // Infinite waterfalls with animation
      waterfalls.forEach((waterfall) => {
        waterfall.position.z += rollingSpeed;
        if (waterfall.position.z > 25) {
          waterfall.position.z -= 300;
        }

        const waterMesh = waterfall.children[1];
        const mistParticles = waterfall.children[3];
        const pool = waterfall.children[2];

        if (waterMesh && waterMesh.geometry) {
          const positions = waterMesh.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 9) {
            positions[i] += Math.sin(distance * 10 + i) * 0.01;
          }
          waterMesh.geometry.attributes.position.needsUpdate = true;
        }

        if (mistParticles) {
          mistParticles.rotation.y += 0.01;
          mistParticles.position.y = 2 + Math.sin(distance * 5) * 0.2;
        }

        if (pool) {
          pool.rotation.y += 0.02;
          pool.material.opacity = 0.6 + Math.sin(distance * 8) * 0.2;
        }
      });

      // Camera follow
      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        heroSphere.position.z + 8,
        2 * deltaTime
      );

      // Emotions (collectibles)
      emotions.forEach((emotion) => {
        if (!emotion.userData.collected) {
          emotion.position.z += rollingSpeed;

          const dx = heroSphere.position.x - emotion.position.x;
          const dy = heroSphere.position.y - emotion.position.y;
          const dz = heroSphere.position.z - emotion.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 1) {
            score = Math.max(0, score + emotion.userData.score);
            document.getElementById("score").textContent = "Score: " + score;
            console.log(
              "Collected " + emotion.userData.type + "! Score: " + score
            );

            if (score >= 1000 && !levelEnded) {
              endLevel();
              return;
            }

            // Play sound if available
            if (sounds.collect) sounds.collect.play();

            const lanes = [-2, 0, 2];
            emotion.position.x = lanes[Math.floor(Math.random() * 3)];
            emotion.position.z = -200 - Math.random() * 200;
            emotion.userData.collected = false;

            const newType =
              emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
            emotion.material.color.set(newType.color);
            emotion.userData.type = newType.name;
          }

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

      // Check health bar collisions
      checkCollisions(heroSphere, heroBaseY, scene);
    }

    render();
    requestAnimationFrame(update);
  }

  function render() {
    renderer.sortObjects = true; 
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    const sceneHeight = window.innerHeight;
    const sceneWidth = window.innerWidth;
    renderer.setSize(sceneWidth, sceneHeight);
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
    resetGame = function () {
      clearObstacles(scene);
      resetHearts();

      currentLane = middleLane;
      heroSphere.position.set(currentLane, heroBaseY, 0);

      distance = 0;
      score = 0;
      document.getElementById("score").textContent = "Score: " + score;

      lastObstacleTime = clock.getElapsedTime();
    };
  }
}

export { resetGame };
