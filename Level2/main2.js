import * as THREE from "three";
import { createMenu2 } from './menu2.js';

import { addEmotions, updateEmotions } from "./emotions2.js";
import {
  spawnObstacle,
  spawnBarricade,
  spawnBoulder,
  updateObstacles,
  clearObstacles,
} from "./obstacles.js";
import { addHearts, checkCollisions, resetHearts } from "./healthBar.js";
import { addRoad, roadSegments, waterSegments } from "./road.js";
import { addSideTrees, treeGroups } from "./trees.js";
import { addSideWaterfalls, waterfalls } from "./waterfalls.js";
//import { addSounds, sounds } from "./sounds.js";
import { createScene, scene, camera, renderer } from "./scene.js";
import {
  addHero,
  heroSphere,
  heroBaseY,
  updateHero,
  playJumpAnimation,
} from "../hero.js";
import { addLight, createLightning, flash } from "./lighting.js";
import { addSideRailings, railings } from "./railings.js";

export function startLevel2() {
  let gameStarted = false;
  let rollingSpeed = 0.6;
  let heroRollingSpeed;
  let bounceValue = 0.02;
  let lastObstacleTime = 0;

  let leftLane = -2;
  let rightLane = 2;
  let middleLane = 0;
  let currentLane = middleLane;
  let clock;
  let distance = 0;
  let score = 0;

  //theto
  let jump_can = 1;
  let velocity_y = 0;
  let isPaused = false;

  // ----- DENSE RAIN VARIABLES -----
  let rain, rainGeo, rainVelocities;
  const rainCount = 5000; // heavy rain
  

  function initRain() {
    rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    rainVelocities = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = Math.random() * 40 - 20;      // x: narrower range around road
      rainPositions[i * 3 + 1] = Math.random() * 100;      // y: 0 to 100
      rainPositions[i * 3 + 2] = Math.random() * 100 - 60; // z: -60 to 40 (in front of camera)

      rainVelocities[i] = 0.5 + Math.random() * 0.5;
    }

    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));

    const rainMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,              
      transparent: true,
      opacity: 0.7,           
    });

    rain = new THREE.Points(rainGeo, rainMaterial);
    scene.add(rain);
  }

  function onWindowResize() {
    const sceneHeight = window.innerHeight;
    const sceneWidth = window.innerWidth;
    renderer.setSize(sceneWidth, sceneHeight);
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
  }

  init();

  function init() {
    createScene();

    heroRollingSpeed = rollingSpeed * 5;

    addRoad(scene);
    addLight(scene);
    addSideTrees(scene);
    addSideRailings(scene);
    createLightning(scene);
    addEmotions(scene);
    addHearts();

    clock = new THREE.Clock();
    addHero(scene, currentLane);

    // INIT DENSE RAIN
    initRain();

    //theto menu2
    createMenu2(startGame);

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("keydown", handleKeyDown);

    render();
  }

  function startGame() {
    gameStarted = true;
    clock.start();
    lastObstacleTime = clock.getElapsedTime();
    update();
  }

  function togglePause() {
    isPaused = !isPaused;
    console.log(isPaused ? "Game Paused" : "Game Resumed");
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
    } else if (keyEvent.keyCode === 38 && jump_can == 1) {
      // up
      jump_can = 0;
      velocity_y = 16;
    }
  }

  function update() {
    if (!heroSphere) return requestAnimationFrame(update); // safety check
    if (!isPaused) {
      const deltaTime = clock.getDelta();
      distance += rollingSpeed;

      // Update hero rolling animation
      heroSphere.rotation.x += heroRollingSpeed * deltaTime;

      // Smooth lane changing
      heroSphere.position.x = THREE.MathUtils.lerp(
        heroSphere.position.x,
        currentLane,
        5 * deltaTime
      );

      // Jump animation
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

      // Move road segments
      roadSegments.forEach((segment) => {
        segment.position.z += rollingSpeed;
        if (segment.position.z > 20) {
          segment.position.z -= roadSegments.length * 20;
        }
      });

      // Move railings
      railings.forEach((railing) => {
        railing.position.z += rollingSpeed;
        if (railing.position.z > 20) {
          railing.position.z -= 1000;
        }
      });

      // Move trees
      treeGroups.forEach((tree) => {
        tree.position.z += rollingSpeed;
        if (tree.position.z > 20) {
          tree.position.z -= 200;
        }
      });

      // Move waterfalls
      waterfalls.forEach((waterfall) => {
        waterfall.position.z += rollingSpeed;
        if (waterfall.position.z > 25) {
          waterfall.position.z -= 300;
        }
      });

      // ----- DENSE RAIN UPDATE -----
    if (rain && rainGeo) {
      const positions = rainGeo.attributes.position.array;

      for (let i = 0; i < rainCount; i++) {
        const idx = i * 3 + 1; // y coordinate
        positions[idx] -= rainVelocities[i] * 2; // falling speed

        // reset drop when below ground
        if (positions[idx] < 0) {
          positions[i * 3] = Math.random() * 40 - 20;      // x reset
          positions[idx] = Math.random() * 100;            // y reset
          positions[i * 3 + 2] = Math.random() * 100 - 60; // z reset
        }
      }

      rainGeo.attributes.position.needsUpdate = true;
    }
      // Spawn obstacles occasionally
      if (Math.random() < 0.01) {
        const choice = Math.random();
        if (choice < 0.4) {
          spawnObstacle(leftLane, middleLane, rightLane, heroSphere, scene);
        } else if (choice < 0.7) {
          spawnBarricade(leftLane, rightLane, heroBaseY, scene);
        } else {
          spawnBoulder(leftLane, rightLane, middleLane, heroBaseY, scene);
        }
      }

      // Update emotions and obstacles
      updateEmotions(heroSphere, scene, rollingSpeed);
      checkCollisions(heroSphere, heroBaseY, scene);
      updateObstacles(scene, rollingSpeed, heroBaseY);

      // Camera follow
      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        heroSphere.position.z + 8,
        2 * deltaTime
      );

      render();
      requestAnimationFrame(update);
    }
  }

  function render() {
    renderer.render(scene, camera);
  }

  function resetGame() {
    clearObstacles(scene); // Use the existing obstacle clearing function
    resetHearts();         // Reset health bar

    currentLane = middleLane;
    heroSphere.position.set(currentLane, heroBaseY, 0);
    velocity_y = 0;
    jump_can = 1;

    distance = 0;
    score = 0;
    lastObstacleTime = clock.getElapsedTime();
  }
}
