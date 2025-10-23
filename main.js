//mukondi
import { 
  addRollingLogs,
  spawnBoulder,
  checkObsCollisions,
  updateObstacles,
  clearObstacles
} from './obstaclesL_1.js';
import { addEmotions, emotions, emotionTypes } from './emotions.js';
import { addHearts, checkCollisions, resetHearts } from './healthBar.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {sounds,addSounds} from './sounds.js';
let context;


let sceneWidth, sceneHeight;
let camera, scene, renderer;
let sun, road, heroSphere;
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
var score=0;
var scoreText;
var hasCollided;
let distance = 0;
let roadSegments = [];
let obstacles = [];
let controls ;
let treeGroups = [];
let waterfalls = [];
let isPaused = false;
let pauseButton;
let resumeButton;
let raycaster;
let isFirstPerson = false;
//theto
let jump_can=1;
let velocity_y=0;
let delta=0;

init();

function init() {
    createScene();
    update();
}

function createScene() {
    distance = 0;
    clock = new THREE.Clock();
    clock.start();
    heroRollingSpeed = rollingSpeed * 10;
    
    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 1000);
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);

    
    //camera.position.y = 0;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x87CEEB, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sceneWidth, sceneHeight);
    document.body.appendChild(renderer.domElement);
  
    addRoad();
    addHero();
    addLight();
    addSideTrees();
    //addObstacles();
    addEmotions(scene);
    addSideWaterfalls(); // Add waterfalls along the sides
    addHearts();
   // clock = new THREE.Clock();
   addSounds(scene, camera);

    
setupPauseControls();

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', handleKeyDown);
  
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
        clock.stop();
        console.log('Game Paused');
    } else {
        pauseButton.textContent = 'Pause';
        clock.start();
        console.log('Game Resumed');
    }
}

function handleKeyDown(keyEvent) {
    if (keyEvent.keyCode === 37) { // left
        if (currentLane > leftLane) {
            currentLane -= 2;
        }
    } 
    
    else if (keyEvent.keyCode === 39) { // right
        if (currentLane < rightLane) {
            currentLane += 2;
            
        }
    }
    //theto
    else if (keyEvent.keyCode === 38 && jump_can==1) { //up
        jump_can=0;
        heroSphere.position.z -=1;
        velocity_y=16;
        }
     
    //mukondi
    else if(keyEvent.key === 'v' || keyEvent.key === 'V'){
            toggleCameraView();
        }
         // Spacebar — pause
    else if (keyEvent.keyCode === 32) {
        keyEvent.preventDefault();
        togglePause();
        return;
    }
    
    }
function toggleCameraView(){
    isFirstPerson = !isFirstPerson;

    if (isFirstPerson) {
        // Switch to First-Person
        OrbitControls.enabled = false;
        PointerLockControls.enabled = true;
        // Position camera relative to character
        camera.position.copy(heroSphere.position);
        camera.position.y += heroBaseY /2; // Adjust for eye level
        camera.position.x = heroSphere.position.x;
        camera.rotation.copy(heroSphere.rotation); // Align camera with character's forward
        
    } else {
        // Switch to Third-Person
        PointerLockControls.enabled = false;
        OrbitControls.enabled = true;
        
        // Reposition camera for third-person view
        // (This might involve setting orbitControls target and camera position)
        controls =  new OrbitControls(camera,renderer.domElement);
//controls.target.set( 0, 0, 0 ); // Set the target to the origin
        //OrbitControls.target.copy(heroSphere.position);
       // camera.position.set(heroSphere.position.x - 5, heroSphere.position.y + 3, heroSphere.position.z); // Example offset
        camera.position.set(0, 4, 8);
        camera.lookAt(0, 0, 0);
    
    }
}
function updateCamera(){
    if(isFirstPerson){
        OrbitControls.enabled = false;
        PointerLockControls.enabled = true;
        // Position camera relative to character
        camera.position.copy(heroSphere.position);
        camera.position.y += heroBaseY /2; // Adjust for eye level
        camera.position.x = heroSphere.position.x;
        camera.rotation.copy(heroSphere.rotation);
    }
    else{
        const deltaTime = clock.getDelta();
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, heroSphere.position.z + 8, 2 * deltaTime);
    }
}


function addHero() {
    const sphereGeometry = new THREE.DodecahedronGeometry(heroRadius, 1);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x4A90E2,
        flatShading: true,
        metalness: 0.3,
        roughness: 0.4
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

function addRoad() {
    const roadWidth = 8;
    const roadLength = 20;
    const segmentCount = 10;
    
    for (let i = 0; i < segmentCount; i++) {
        const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength, 64, 64);
        
        const positions = roadGeometry.attributes.position.array;
        for (let j = 0; j < positions.length; j += 3) {
            const x = positions[j];
            const z = positions[j + 2];
            
            // Large dunes and formations
            const largeDunes = Math.sin(x * 0.1) * Math.cos(z * 0.08) * 0.15;
            const mediumRipples = Math.sin(x * 0.8 + z * 0.3) * Math.cos(z * 0.6) * 0.05;
            const fineGrain = (Math.random() - 0.5) * 0.02;
            const microDetail = (Math.random() - 0.5) * 0.008;
            
            positions[j + 1] += largeDunes + mediumRipples + fineGrain + microDetail;
        }
        roadGeometry.attributes.position.needsUpdate = true;
        roadGeometry.computeVertexNormals();
        
        //Sand material
        const roadMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE6D7C3,
            transparent: false,
            roughness: 0.9,
            vertexColors: false
        });
        
        const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
        roadSegment.rotation.x = -Math.PI / 2;
        roadSegment.position.z = -i * roadLength;
        roadSegment.receiveShadow = true;
        roadSegment.castShadow = false;
        scene.add(roadSegment);
        roadSegments.push(roadSegment);
    }

    const sandWidth = 50;
    const sandLength = 200;
    const sandSegments = 5; 
    
    // Natural sand color variations
    const sandColors = [
        0xF0E68C,
        0xE6D7C3, 
        0xDEB887, 
        0xD2B48C, 
        0xC19A6B  
    ];
    
    for (let i = 0; i < sandSegments; i++) {
        // Use natural color variation instead of rainbow
        const colorIndex = Math.floor(Math.random() * sandColors.length);
        const sandColor = new THREE.Color(sandColors[colorIndex]);
        
        const sandGeometry = new THREE.PlaneGeometry(sandWidth, sandLength / sandSegments, 32, 32);
        
        const sidePositions = sandGeometry.attributes.position.array;
        for (let j = 0; j < sidePositions.length; j += 3) {
            const x = sidePositions[j];
            const z = sidePositions[j + 2];
            
            // Gentle undulating dunes
            const dunes = Math.sin(x * 0.05) * Math.cos(z * 0.03) * 0.3;
            
            // Wind ripples
            const ripples = Math.sin(x * 0.4 + z * 0.2) * 0.08;
            
            // Random grain detail
            const grain = (Math.random() - 0.5) * 0.04;
            
            sidePositions[j + 1] += dunes + ripples + grain;
        }
        sandGeometry.attributes.position.needsUpdate = true;
        sandGeometry.computeVertexNormals();
        
        const sandMaterial = new THREE.MeshLambertMaterial({ 
            color: sandColor,
            transparent: false
        });
        
        //left side sand
        const leftSandSegment = new THREE.Mesh(sandGeometry, sandMaterial);
        leftSandSegment.rotation.x = -Math.PI / 2;
        leftSandSegment.position.x = -(roadWidth / 2 + sandWidth / 2);
        leftSandSegment.position.y = -0.02;
        leftSandSegment.position.z = -i * (sandLength / sandSegments);
        leftSandSegment.receiveShadow = true;
        scene.add(leftSandSegment);
        
        //right side sand
        const rightSandSegment = new THREE.Mesh(sandGeometry.clone(), sandMaterial.clone());
        rightSandSegment.rotation.x = -Math.PI / 2;
        rightSandSegment.position.x = (roadWidth / 2 + sandWidth / 2);
        rightSandSegment.position.y = -0.02;
        rightSandSegment.position.z = -i * (sandLength / sandSegments);
        rightSandSegment.receiveShadow = true;
        scene.add(rightSandSegment);
    }

    addBeachDetails();
}

function addBeachDetails() {
    const detailCount = 50;
    const roadWidth = 8;
    
    for (let i = 0; i < detailCount; i++) {
        // Create small shell/pebble details
        const detailGeometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.03, 6, 4);
        const detailMaterial = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(
                0.1 + Math.random() * 0.1,
                0.2 + Math.random() * 0.3,
                0.6 + Math.random() * 0.3
            )
        });
        
        const detail = new THREE.Mesh(detailGeometry, detailMaterial);
        
        detail.position.x = (Math.random() - 0.5) * (roadWidth + 80);
        detail.position.z = -Math.random() * 200;
        detail.position.y = 0.01;
        
        detail.castShadow = true;
        scene.add(detail);
    }
}
function createRealisticStone() {
    const stoneTypes = ['round', 'angular', 'flat', 'pebble'];
    const stoneType = stoneTypes[Math.floor(Math.random() * stoneTypes.length)];
    
    let stoneGeometry;
    const baseSize = 0.08 + Math.random() * 0.12; // Random size 0.08 to 0.2
    
    switch (stoneType) {
        case 'round':
            stoneGeometry = new THREE.SphereGeometry(baseSize, 6, 4);
            const roundPositions = stoneGeometry.attributes.position.array;
            for (let i = 0; i < roundPositions.length; i += 3) {
                const noise = (Math.random() - 0.5) * 0.3;
                roundPositions[i] *= (1 + noise);
                roundPositions[i + 1] *= (1 + noise);
                roundPositions[i + 2] *= (1 + noise);
            }
            break;
            
        case 'angular':
            stoneGeometry = new THREE.DodecahedronGeometry(baseSize, 0);
            break;
            
        case 'flat':
            stoneGeometry = new THREE.SphereGeometry(baseSize * 1.2, 6, 4);
            stoneGeometry.scale(1, 0.3, 1); // Flatten it
            break;
            
        case 'pebble':
            stoneGeometry = new THREE.SphereGeometry(baseSize * 0.7, 8, 6);
            stoneGeometry.scale(1.2, 0.8, 1); // Oval shape
            break;
    }
    
    stoneGeometry.attributes.position.needsUpdate = true;
    stoneGeometry.computeVertexNormals();
    
    //stone colors
    const stoneColors = [
        0x8B7D6B, // Warm gray
        0x696969, // Dim gray
        0x708090, // Slate gray
        0x778899, // Light slate gray
        0x654321, // Dark brown
        0xA0522D, // Sienna
        0x2F4F4F, // Dark slate gray
        0x556B2F, // Dark olive green
        0x8FBC8F, // Dark sea green
        0x9ACD32  // Yellow green
    ];
    
    const stoneColor = stoneColors[Math.floor(Math.random() * stoneColors.length)];
    const stoneMaterial = new THREE.MeshLambertMaterial({
        color: stoneColor,
        transparent: false,
        roughness: 0.8
    });
    
    const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
    stone.castShadow = true;
    stone.receiveShadow = true;
    
    // Add slight random rotation for natural placement
    stone.rotation.x = (Math.random() - 0.5) * 0.4;
    stone.rotation.z = (Math.random() - 0.5) * 0.4;
    
    return stone;
}

function addLight() {
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.1);
    scene.add(hemisphereLight);
    
    sun = new THREE.DirectionalLight(707070, 0.2);
    sun.position.set(10, 10, 5);
    sun.castShadow = true;
    scene.add(sun);
    
    const color = 808080;
    const intensity = 0.5;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
}
//mukondi
function addObstacles(){
    //they should only cross the path when the hero is approaching them
    
        const TreeType = Math.floor(Math.random() * 4);
        const obsTree = createTree(TreeType);
        obsTree.name = 'obsTree';
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




function addSideTrees() {
    // Add variety of trees along the sides of the road
    for (let i = 0; i < 50; i++) {
        // Left side trees
        const leftTreeType = Math.floor(Math.random() * 4);
        const leftTree = createTree(leftTreeType);
        leftTree.position.x = -8 - Math.random() * 10;
        leftTree.position.z = -i * 4 + Math.random() * 8;
        leftTree.position.y = 0;
        scene.add(leftTree);
        treeGroups.push(leftTree);
        
        // Right side trees
        const rightTreeType = Math.floor(Math.random() * 4);
        const rightTree = createTree(rightTreeType);
        rightTree.position.x = 8 + Math.random() * 10;
        rightTree.position.z = -i * 4 + Math.random() * 8;
        rightTree.position.y = 0;
        scene.add(rightTree);
        treeGroups.push(rightTree);
    }
}

function addSideWaterfalls() {
    // Add waterfalls along both sides of the road
    const waterfallSpacing = 25; // Distance between waterfalls
    const waterfallCount = 35; // Number of waterfalls on each side
    
    for (let i = 0; i < waterfallCount; i++) {
        // Left side waterfalls
        const leftWaterfall = createWaterfall();
        leftWaterfall.position.set(
            -15 - Math.random() * 8, // X position (left side)
            0, // Y position
            -i * waterfallSpacing + Math.random() * 10 // Z position along the road
        );
        leftWaterfall.rotation.y = Math.PI * 0.1; // Slightly angle towards road
        scene.add(leftWaterfall);
        waterfalls.push(leftWaterfall);
        
        // Right side waterfalls
        const rightWaterfall = createWaterfall();
        rightWaterfall.position.set(
            15 + Math.random() * 8, // X position (right side)
            0, // Y position
            -i * waterfallSpacing + Math.random() * 10 // Z position along the road
        );
        rightWaterfall.rotation.y = -Math.PI * 0.2; // Slightly angle towards road
        scene.add(rightWaterfall);
        waterfalls.push(rightWaterfall);
    }
}

function createTree(treeType = 0) {
    const tree = new THREE.Group();
    const scale = 0.8 + Math.random() * 0.5; // more variation

    // Trunk with slight bend
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B5A2B, 
        roughness: 0.9,
        metalness: 0.0 
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.rotation.z = (Math.random() - 0.5) * 0.1;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    switch (treeType) {
        case 0: // Round bushy tree
            for (let i = 0; i < 3; i++) {
                const leavesGeometry = new THREE.SphereGeometry(1.2, 10, 8);
                const leavesMaterial = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color().setHSL(0.33 + Math.random() * 0.05, 0.3, 0.4 + Math.random() * 0.2) 
                });
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.set(
                    (Math.random() - 0.5) * 0.5,
                    2 + i * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                leaves.scale.setScalar(0.8 + Math.random() * 0.4);
                leaves.castShadow = true;
                leaves.receiveShadow = true;
                tree.add(leaves);
            }
            break;

        case 1: // Pine tree
            for (let i = 0; i < 4; i++) {
                const coneGeometry = new THREE.ConeGeometry(1.5 - i * 0.3, 1.5, 8);
                const coneMaterial = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color().setHSL(0.33, 0.25, 0.3 + i * 0.05) 
                });
                const cone = new THREE.Mesh(coneGeometry, coneMaterial);
                cone.position.y = 1.5 + i * 1.0;
                cone.castShadow = true;
                cone.receiveShadow = true;
                tree.add(cone);
            }
            break;

        case 2: // Palm tree
            trunk.scale.set(0.6, 2, 0.6);
            trunk.position.y = 2;

            for (let i = 0; i < 6; i++) {
                const frondGeometry = new THREE.PlaneGeometry(0.2, 2.5);
                const frondMaterial = new THREE.MeshLambertMaterial({ 
                    color: '#395b39', side: THREE.DoubleSide 
                });
                const frond = new THREE.Mesh(frondGeometry, frondMaterial);
                frond.position.y = 4;
                frond.rotation.x = -Math.PI / 3;
                frond.rotation.z = (i / 6) * Math.PI * 2;
                frond.scale.y = 1 + Math.random() * 0.3;
                frond.castShadow = true;
                frond.receiveShadow = true;
                tree.add(frond);
            }
            break;

        case 3: // Tall thin tree with oval top
            const thinTrunk = trunk.clone();
            thinTrunk.scale.set(0.5, 3, 0.5);
            thinTrunk.position.y = 3;
            tree.add(thinTrunk);

            const ovalLeavesGeometry = new THREE.SphereGeometry(1.2, 10, 8);
            ovalLeavesGeometry.scale(1, 1.5, 1);
            const ovalLeavesMaterial = new THREE.MeshLambertMaterial({ color: '#002100' });
            const ovalLeaves = new THREE.Mesh(ovalLeavesGeometry, ovalLeavesMaterial);
            ovalLeaves.position.y = 6;
            ovalLeaves.castShadow = true;
            ovalLeaves.receiveShadow = true;
            tree.add(ovalLeaves);
            break;
    }

    tree.scale.set(scale, scale, scale);
    return tree;
}

function createWaterfall() {
    const waterfall = new THREE.Group();

    // cliff backdrop
    const cliffGeometry = new THREE.BoxGeometry(6, 12, 2);
    const cliffMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x555555,
        roughness: 0.9
    });
    const cliff = new THREE.Mesh(cliffGeometry, cliffMaterial);
    cliff.position.set(0, 6, -2);
    cliff.castShadow = true;
    cliff.receiveShadow = true;
    waterfall.add(cliff);

    // water stream using planes
    const waterGeometry = new THREE.PlaneGeometry(2, 10, 16, 32);
    const waterPositions = waterGeometry.attributes.position.array;
    
    // flowing water variations
    for (let i = 0; i < waterPositions.length; i += 3) {
        const y = waterPositions[i + 1];
        const x = waterPositions[i];
        waterPositions[i] += Math.sin(y * 0.3) * 0.1; // Side to side flow
        waterPositions[i + 2] = Math.sin(x * 2) * 0.05; // Depth variation
    }
    waterGeometry.attributes.position.needsUpdate = true;
    waterGeometry.computeVertexNormals();

    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7,
        shininess: 100,
        side: THREE.DoubleSide
    });

    const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMesh.position.set(0, 5, -1);
    waterMesh.receiveShadow = true;
    waterfall.add(waterMesh);

    // water pool at bottom
    const poolGeometry = new THREE.CylinderGeometry(3, 2.5, 0.5, 16);
    const poolMaterial = new THREE.MeshPhongMaterial({
        color: 0x006994,
        transparent: true,
        opacity: 0.8,
        shininess: 100
    });
    const pool = new THREE.Mesh(poolGeometry, poolMaterial);
    pool.position.set(0, -0.25, 0);
    pool.receiveShadow = true;
    waterfall.add(pool);

    //mist particles
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < particleCount; i++) {
        positions.push(
            (Math.random() - 0.5) * 4, // x spread
            Math.random() * 8,        // y height
            (Math.random() - 0.5) * 2 // z spread
        );
    }

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.4,
        size: 0.5,
        sizeAttenuation: true
    });

    const mistParticles = new THREE.Points(particleGeometry, particleMaterial);
    mistParticles.position.set(0, 2, 0);
    waterfall.add(mistParticles);

    // rocks around the base
    for (let i = 0; i < 8; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5, 0);
        const rockMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.1, 0.2, 0.2 + Math.random() * 0.3)
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(
            (Math.random() - 0.5) * 6,
            Math.random() * 0.5,
            (Math.random() - 0.5) * 3
        );
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        waterfall.add(rock);
    }

    return waterfall;
}
function nextLevel(score){
    if(score>=1000){
    alert("Level 1 Complete");
    resetGame();
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
    
    treeGroups.forEach(tree => {
        tree.position.z += rollingSpeed;
        if (tree.position.z > 20) {
            tree.position.z -= 200;
        }
    });
    nextLevel(score);
     //theto (jump animation when up key is pressed)
    if (jump_can === 0) {
    heroSphere.position.y += velocity_y * deltaTime;
    velocity_y -= 45 * deltaTime; 

        if (heroSphere.position.y <= heroBaseY) {
            heroSphere.position.y = heroBaseY;
            velocity_y = 0;
            jump_can = 1; 
        }
    } 
    
    else {
        
        heroSphere.position.y = heroBaseY + Math.sin(distance * 10) * bounceValue;
    }

    //update cylinder rolling
    // obstacles.forEach(obstacle =>{
        
    // })
      //pabii
    // Spawn random obstacle (low probability each frame)
    if (Math.random() < 0.015) { // adjust 0.01 to control frequency
        const choice = Math.random();
        if (choice < 0.4) {
            addRollingLogs(scene);   // log

        } else if (choice < 0.7) {
            spawnBoulder(scene,heroSphere,leftLane,middleLane,rightLane);  // trees

        } else {
           // spawnBoulder();    // rolling boulder
        }
    }
   //update obstacles
    updateObstacles(scene, rollingSpeed,heroBaseY);
    //check collision
    checkCollisions(heroSphere, heroBaseY, scene);
    // Smooth lane changing
    heroSphere.position.x = THREE.MathUtils.lerp(heroSphere.position.x, currentLane, 5 * deltaTime);
    
    // Add subtle bouncing
    //heroSphere.position.y = heroBaseY + Math.sin(distance * 10) * bounceValue;

   
    
    // Move road segments to create infinite road effect
    roadSegments.forEach(segment => {
        segment.position.z += rollingSpeed;
        if (segment.position.z > 20) {
            segment.position.z -= roadSegments.length * 20;
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
    updateCamera();
    //camera.position.z = THREE.MathUtils.lerp(camera.position.z, heroSphere.position.z + 8, 2 * deltaTime);
    
 emotions.forEach(emotion => {
        if (!emotion.userData.collected) {
            emotion.position.z += rollingSpeed*0.8; // move towards player

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

    render();
    requestAnimationFrame(update);
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
    sceneHeight = window.innerHeight;
    sceneWidth = window.innerWidth;
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