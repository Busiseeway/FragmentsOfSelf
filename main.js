import * as THREE from 'three';

import { createScene, scene, camera, renderer } from './scene.js';
import { addLight } from './lights.js';
import { addHero, heroSphere, heroBaseY, updateHero, playJumpAnimation } from './hero.js';
import { addRoad, roadSegments, sideRocks } from './road.js';
import { addBeach } from './beach.js'; 
import { addSideTrees, treeGroups } from './trees.js'; 
import { addSideWaterfalls, waterfalls } from './waterfalls.js'; 
import { addEmotions, emotions, emotionTypes } from './emotions.js';
import { addHearts, checkCollisions, resetHearts } from './healthBar.js';
import { spawnLog, spawnBarricade,spawnHole, updateObstacles, clearObstacles} from './obstaclesL3.js';

let rollingSpeed = 0.5;
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
let sceneWidth = window.innerWidth;
let sceneHeight = window.innerHeight;

// Jump variables
let jump_can = 1;
let velocity_y = 0;


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
    clock = new THREE.Clock();

    setupPauseControls();

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', handleKeyDown);

    update();
}


function setupPauseControls() {
    pauseButton = document.getElementById('pause-btn');


    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    } else {
        console.error('Pause button not found!');
    }

    if (resumeButton) {
        resumeButton.addEventListener('click', togglePause);
    }
}

function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        pauseButton.textContent = 'Resume';
        console.log('Game Paused');
    } else {
        pauseButton.textContent = 'Pause';
        console.log('Game Resumed');

        // Reset the clock to prevent time jumps
        clock.getDelta();
    }
}

function handleKeyDown(keyEvent) {
    if (keyEvent.keyCode === 37) { // left
        if (currentLane > leftLane) {
            currentLane -= 2;
        }
    } else if (keyEvent.keyCode === 39) { // right
        if (currentLane < rightLane) {
            currentLane += 2;
        }
    } else if (keyEvent.keyCode === 38 && jump_can == 1) { // up arrow - jump
        jump_can = 0;
        velocity_y = 13;
        
        playJumpAnimation(); // Trigger jump animation
    }

    else if (keyEvent.keyCode === 32) { // spacebar
        keyEvent.preventDefault(); // Prevent page scrolling
        togglePause();
    }
}

function update() {

    if (isPaused) {
        render();
        requestAnimationFrame(update);
        return;
    }

    const deltaTime = clock.getDelta();
    distance += rollingSpeed;
    updateHero(deltaTime);
    if(heroSphere){

    const elapsed = clock.getElapsedTime();
    
    // Spawn obstacles at regular intervals
    if (elapsed - lastObstacleTime > obstacleInterval) {
        const obstacleType = Math.floor(Math.random() * 5); // 0-4 for 5 different obstacles

        switch (obstacleType) {
            case 0:
                spawnLog(scene, heroSphere, leftLane, middleLane, rightLane);
                break;
            case 1:
                spawnBarricade(scene, heroBaseY, leftLane, rightLane);
                break;
            case 2:
                spawnHole(scene, heroBaseY, leftLane, middleLane, rightLane);
                break;
        }

        lastObstacleTime = elapsed;
    }

    // Update all obstacles (movement and animation)
    updateObstacles(scene, rollingSpeed, heroBaseY, heroSphere);
    
    // Update hero rolling animation
    //heroSphere.rotation.x += heroRollingSpeed * deltaTime;
    
    // Smooth lane changing
    heroSphere.position.x = THREE.MathUtils.lerp(heroSphere.position.x, currentLane, 5 * deltaTime);
    
    // Jump animation when up key is pressed
    if (jump_can === 0) {
        heroSphere.position.y += velocity_y * deltaTime;
        velocity_y -= 45 * deltaTime; 
        

        if (heroSphere.position.y <= heroBaseY) {
            heroSphere.position.y = heroBaseY;
            velocity_y = 0;
            jump_can = 1; 
            
        }
    } else {
        // Add subtle bouncing
        heroSphere.position.y = heroBaseY + Math.sin(distance * 10) * bounceValue;
    }
    
    // Move road segments to create infinite road effect
    roadSegments.forEach(segment => {
        segment.position.z += rollingSpeed;
        if (segment.position.z > 20) {
            segment.position.z -= roadSegments.length * 20;
        }
    });

    if (typeof sideRocks !== 'undefined') {
        sideRocks.forEach(rock => {
            rock.position.z += rollingSpeed;
            if (rock.position.z > 20) {
                rock.position.z -= roadSegments.length * 20; // wrap around with road
            }
        });
    }
    
    // Move trees to create infinite forest effect
    treeGroups.forEach(tree => {
        tree.position.z += rollingSpeed;
        if (tree.position.z > 20) {
            tree.position.z -= 200;
        }
    });

    // Move waterfalls to create infinite effect
    waterfalls.forEach(waterfall => {
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
            for (let i = 0; i < positions.length; i += 9) { // Every 3 vertices
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
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, heroSphere.position.z + 8, 2 * deltaTime);

    // Update emotions (collectibles)
    emotions.forEach(emotion => {
        if (!emotion.userData.collected) {
            emotion.position.z += rollingSpeed; // move towards player

            // Collision detection (simple distance check)
            const dx = heroSphere.position.x - emotion.position.x;
            const dy = heroSphere.position.y - emotion.position.y;
            const dz = heroSphere.position.z - emotion.position.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (dist < 1) { // collision radius
                score += 10;
                document.getElementById("score").textContent = "Score: " + score;
                console.log("Collected " + emotion.userData.type + "! Score: " + score);

                // Reset emotion immediately after collection
                const lanes = [-2, 0, 2];
                emotion.position.x = lanes[Math.floor(Math.random() * 3)];
                emotion.position.z = -200 - Math.random() * 200;
                emotion.userData.collected = false;

                const newType = emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
                emotion.material.color.set(newType.color);
                emotion.userData.type = newType.name;
            }

            // Reset if emotion goes behind hero
            if (emotion.position.z > 10) {
                const lanes = [-2, 0, 2];
                emotion.position.x = lanes[Math.floor(Math.random() * 3)]; // pick random lane
                emotion.position.z = -200 - Math.random() * 200; // random depth
                emotion.userData.collected = false;

                const newType = emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
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
    renderer.render(scene, camera);
}

function onWindowResize() {
    const sceneHeight = window.innerHeight;
    const sceneWidth = window.innerWidth;
    renderer.setSize(sceneWidth, sceneHeight);
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
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
export { resetGame };