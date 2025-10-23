import * as THREE from "three";
import { createMenu } from "./menu2.js";



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
import { addSounds, sounds } from "./sounds.js";
import  { createRain, rain, rainGeo, rainVelocities, rainCount } from "./rain.js";
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
  let road;
  let rollingSpeed = 0.6;
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
  let distance = 0;
  var score = 0;

  //theto
  let jump_can = 1;
  let velocity_y = 0;
  let delta = 0;
  let cloudParticles = [];
  let rainParticles = [];

  init();

  function init() {
    createScene();

    heroRollingSpeed = rollingSpeed * 5;

    addRoad(scene);
    addLight(scene);
    addSideTrees(scene);
    //addSideWaterfalls(); // Add waterfalls along the sides

    //theto (add railings to scene)
    addSideRailings(scene);
    // make sure this import is at the top
    createRain(scene,5000);

    //thet(add rain)
    //createRain();
    createLightning(scene);
    addEmotions(scene);
    addHearts();
    addSounds(scene, camera);

    // ✅ Start hero loading and update loop only after loaded
    addHero(scene, 0, () => {
      console.log("Hero loaded!");
      clock = new THREE.Clock();
      update(); // start game loop only after hero is ready
    });

    clock = new THREE.Clock();

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("keydown", handleKeyDown);

    update();
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
      velocity_y = 16;
    }
  }

  function update() {
    if (!heroSphere) return requestAnimationFrame(update); // safety check
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

    // Add subtle bouncing
    //heroSphere.position.y = heroBaseY + Math.sin(distance * 10) * bounceValue;

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

    // Move road segments to create infinite road effect
    roadSegments.forEach((segment) => {
      segment.position.z += rollingSpeed;
      if (segment.position.z > 20) {
        segment.position.z -= roadSegments.length * 20;
      }
    });

    //theto
    railings.forEach((railing) => {
      railing.position.z += rollingSpeed;
      if (railing.position.z > 20) {
        railing.position.z -= 1000;
      }
    });

    waterSegments.forEach((segment, index) => {
      const positions = segment.geometry.attributes.position.array;
      const time = performance.now() * 0.001;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] =
          Math.sin(x * 0.1 + time) * 0.1 + Math.cos(z * 0.1 + time) * 0.1;
      }

      segment.geometry.attributes.position.needsUpdate = true;
      segment.geometry.computeVertexNormals();
    });

    // Move trees to create infinite forest effect
    treeGroups.forEach((tree) => {
      tree.position.z += rollingSpeed;
      if (tree.position.z > 20) {
        tree.position.z -= 200;
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

    if (rain && rainGeo) {
      const positions = rainGeo.attributes.position.array;
      const dropFactor = 60 * deltaTime; // scale by frame time

      for (let i = 0; i < rainCount; i++) {
        const idx = i * 3 + 1; // y coordinate
        positions[idx] -= rainVelocities[i] * 700 * deltaTime; // smooth fall speed

        // reset drop when below ground
        if (positions[idx] < -60) {
          positions[i * 3] = Math.random() * 400 - 200; // x reset
          positions[idx] = Math.random() * 300 + 200; // y reset above
          positions[i * 3 + 2] = Math.random() * 400 - 200; // z reset
        }
      }

      rainGeo.attributes.position.needsUpdate = true;
    }

    // ----- lightning flashes -----
    if (flash) {
      // rare chance to trigger a flash
      if (Math.random() > 0.997) {
        flash.intensity = 6 + Math.random() * 10;
        flash.position.set(
          Math.random() * 200 - 100,
          150 + Math.random() * 100,
          Math.random() * 200 - 100
        );
      }
      // gradually decay intensity
      flash.intensity = Math.max(0, flash.intensity - 40 * deltaTime);
    }

    //pabii
    // Spawn random obstacle (low probability each frame)
    if (Math.random() < 0.01) {
      // adjust 0.01 to control frequency
      const choice = Math.random();
      if (choice < 0.4) {
        spawnObstacle(leftLane, middleLane, rightLane, heroSphere, scene); // log
      } else if (choice < 0.7) {
        spawnBarricade(leftLane, rightLane, heroBaseY, scene); // barricade
      } else {
        spawnBoulder(leftLane, rightLane, middleLane, heroBaseY, scene); // rolling boulder
      }
    }

    // Update emotions (collectibles)
    updateEmotions(heroSphere, scene, rollingSpeed);

    // Check collisions
    checkCollisions(heroSphere, heroBaseY, scene);
    updateObstacles(scene, rollingSpeed, heroBaseY);

    // Update camera to follow slightly
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      heroSphere.position.z + 8,
      2 * deltaTime
    );

    render();
    requestAnimationFrame(update);
  }

  function render() {
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    const sceneHeight = window.innerHeight;
    const sceneWidth = window.innerWidth;
    renderer.setSize(sceneWidth, sceneHeight);
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
  }

  //pabi
  function resetGame() {
    // remove all obstacles
    obstacles.forEach((o) => scene.remove(o));
    obstacles = [];
    currentLane = middleLane;
    heroSphere.position.set(currentLane, heroBaseY, 0);
    distance = 0;
  }
}

//export { resetGame };
