import { addEmotions, emotions, emotionTypes } from './emotions.js';
import { spawnObstacle, spawnBarricade, spawnBoulder, updateObstacles, clearObstacles } from './obstacles.js';
import { addHearts, checkCollisions, resetHearts } from './healthBar.js';


let sceneWidth, sceneHeight;
let camera, scene, renderer;
let sun, road, heroSphere;
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
let roadSegments = [];
let treeGroups = [];
let waterfalls = [];
var score = 0;

//pabi
let obstacles = [];

//theto
let jump_can=1;
let velocity_y=0;
let delta=0;
let railings = [];
let cloudParticles=[];
let rainParticles=[];
let flash;
let rain;
let rainMaterial, rainVelocities;
let rainCount = 30000;
let waterSegments = []; 



init();

function init() {
    createScene();
    update();
}

function createScene() {

    
    distance = 0;
    clock = new THREE.Clock();
    clock.start();
    heroRollingSpeed = rollingSpeed * 5;
    
    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x87CEEB, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sceneWidth, sceneHeight);
    document.body.appendChild(renderer.domElement);

    const listener = new THREE.AudioListener();
    camera.add(listener);

    
    //theto (add rain sound)
    const rainSound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('cold-snowfall-ambience-5-minutes-sound-effect-164512.mp3', function(buffer) {
        rainSound.setBuffer(buffer);
        rainSound.setLoop(true);
        rainSound.setVolume(0.4);
        rainSound.play();
    });
    
    addRoad();
    addHero();
    addLight();
    addSideTrees();
    //addSideWaterfalls(); // Add waterfalls along the sides

    //theto (add railings to scene)
    addSideRailings();

    //thet(add rain)
    //createRain();
    createLightning();
    addEmotions(scene);
    addHearts();
    
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);
    
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', handleKeyDown);
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
        velocity_y=16;
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
            vertexColors: false,
            metalness: 0.1,
            opacity: 0.85
        });
        
        const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
        roadSegment.rotation.x = -Math.PI / 2;
        roadSegment.position.z = -i * roadLength;
        roadSegment.receiveShadow = true;
        roadSegment.castShadow = false;
        scene.add(roadSegment);
        roadSegments.push(roadSegment);
    }

    //theto (changed from sand to water)
    const sandWidth = 50;
    const sandLength = 200;
    const sandSegments = 5; 
    
    // Natural water color variations
    const sandColors = [
        0x556B2F, 
        0x6B8E23, 
        0x2F4F4F, 
        0x3E2723, 
        0x1B4D3E 
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
        
        const waterMaterial = new THREE.MeshPhongMaterial({

            color: 0x1E90FF,       
            transparent: true,
            opacity: 0.7,
            shininess: 100,        
            side: THREE.DoubleSide
        });


       
        
        
        const leftWaterSegment = new THREE.Mesh(sandGeometry, waterMaterial);
        leftWaterSegment.rotation.x = -Math.PI / 2;
        leftWaterSegment.position.x = -(roadWidth / 2 + sandWidth / 2);
        leftWaterSegment.position.y = -0.02;
        leftWaterSegment.position.z = -i * (sandLength / sandSegments);
        leftWaterSegment.receiveShadow = true;
        scene.add(leftWaterSegment);

        const rightWaterSegment = new THREE.Mesh(sandGeometry.clone(), waterMaterial.clone());
        rightWaterSegment.rotation.x = -Math.PI / 2;
        rightWaterSegment.position.x = (roadWidth / 2 + sandWidth / 2);
        rightWaterSegment.position.y = -0.02;
        rightWaterSegment.position.z = -i * (sandLength / sandSegments);
        rightWaterSegment.receiveShadow = true;
        scene.add(rightWaterSegment);

        // save them to animate later
        waterSegments.push(leftWaterSegment, rightWaterSegment);
    }

    addBeachDetails();
}

function createRain() {
    rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    rainVelocities = new Float32Array(rainCount);

    // populate positions and velocities
    for (let i = 0; i < rainCount; i++) {
        const x = Math.random() * 400 - 200;
        const y = Math.random() * 800;
        const z = Math.random() * 400 - 200;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // vertical fall speed for each drop
        rainVelocities[i] = 0.5 + Math.random() * 0.9;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    rainMaterial = new THREE.PointsMaterial({
        color: 0x99bbff,
        size: 0.05,
        transparent: false,
        opacity: 0.1,
        sizeAttenuation: true,
        depthWrite: false
    });

    rain = new THREE.Points(rainGeo, rainMaterial);
    rain.frustumCulled = false;
    scene.add(rain);
}

// Create a point light used for lightning flashes
function createLightning() {
    flash = new THREE.PointLight(0xBFE9FF, 0, 300); 
    flash.position.set(0, 200, -50);
    scene.add(flash);
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
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    scene.add(hemisphereLight);
    
    sun = new THREE.DirectionalLight(0xffffff, 0.02);
    sun.position.set(10, 10, 5);
    sun.castShadow = true;
    scene.add(sun);
    
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
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

//theto (adding railings to side of road)
function createRailingStrip() {
    const geometry = new THREE.BoxGeometry(0.3, 2, 1000); 
    const material = new THREE.MeshStandardMaterial({ color: 0x556B2F, roughness: 0.8 });
    return new THREE.Mesh(geometry, material);
}


function addSideRailings() {
    const numberOfStrips = 1000;  // number of repeating segments
    const stripSpacing = 100;   // length of each segment

    for (let i = 0; i < numberOfStrips; i++) {
        const left = createRailingStrip();
        left.position.set(-4.5, 0.5, -i * stripSpacing);
        scene.add(left);
        railings.push(left);

        const right = createRailingStrip();
        right.position.set(4.5, 0.5, -i * stripSpacing);
        scene.add(right);
        railings.push(right);
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
                    color: new THREE.Color().setHSL(0.33 + Math.random() * 0.05, 0.7, 0.4 + Math.random() * 0.2) 
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
                    color: new THREE.Color().setHSL(0.33, 0.6, 0.3 + i * 0.05) 
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
                    color: 0x32CD32, side: THREE.DoubleSide 
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
            const ovalLeavesMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
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

//pabi

function resetGame() {
    // remove all obstacles
    obstacles.forEach(o => scene.remove(o));
    obstacles = [];
    currentLane = middleLane;
    heroSphere.position.set(currentLane, heroBaseY, 0);
    distance = 0;
}



function update() {
    const deltaTime = clock.getDelta();
    distance += rollingSpeed;
    
    // Update hero rolling animation
    heroSphere.rotation.x += heroRollingSpeed * deltaTime;
    
    // Smooth lane changing
    heroSphere.position.x = THREE.MathUtils.lerp(heroSphere.position.x, currentLane, 5 * deltaTime);
    
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
    } 
    
    else {
        
        heroSphere.position.y = heroBaseY + Math.sin(distance * 10) * bounceValue;
    }
    
    // Move road segments to create infinite road effect
    roadSegments.forEach(segment => {
        segment.position.z += rollingSpeed;
        if (segment.position.z > 20) {
            segment.position.z -= roadSegments.length * 20;
        }
    });

    //theto
    railings.forEach(railing=>{
        railing.position.z+=rollingSpeed;
        if(railing.position.z>20){
            railing.position.z-=1000;
        }
    })

    waterSegments.forEach((segment, index) => {
        const positions = segment.geometry.attributes.position.array;
        const time = performance.now() * 0.001;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            positions[i + 1] = Math.sin(x * 0.1 + time) * 0.1 + Math.cos(z * 0.1 + time) * 0.1;
        }

        segment.geometry.attributes.position.needsUpdate = true;
        segment.geometry.computeVertexNormals();
    });

    
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

    if (rain && rainGeo) {
    const positions = rainGeo.attributes.position.array;
    const dropFactor = 60 * deltaTime; // scale by frame time

    for (let i = 0; i < rainCount; i++) {
        const idx = i * 3 + 1; // y coordinate
        positions[idx] -= rainVelocities[i] * 500 * deltaTime; // smooth fall speed

        // reset drop when below ground
        if (positions[idx] < -60) {
            positions[i * 3] = Math.random() * 400 - 200;       // x reset
            positions[idx] = Math.random() * 300 + 200;         // y reset above
            positions[i * 3 + 2] = Math.random() * 400 - 200;   // z reset
        }
    }

    rainGeo.attributes.position.needsUpdate = true;
}

    // ----- lightning flashes -----
    if (flash) {
        // rare chance to trigger a flash
        if (Math.random() > 0.997) {
            flash.intensity = 6 + Math.random() * 10;
            flash.position.set(Math.random() * 200 - 100, 150 + Math.random() * 100, Math.random() * 200 - 100);
        }
        // gradually decay intensity
        flash.intensity = Math.max(0, flash.intensity - 40 * deltaTime);
    }
    

    //pabii
    // Spawn random obstacle (low probability each frame)
    if (Math.random() < 0.01) { // adjust 0.01 to control frequency
        const choice = Math.random();
        if (choice < 0.4) {
            spawnObstacle(leftLane, middleLane, rightLane, heroSphere, scene);   // log
        } else if (choice < 0.7) {
            spawnBarricade(leftLane, rightLane, heroBaseY, scene);  // barricade
        } else {
            spawnBoulder(leftLane, rightLane, middleLane, heroBaseY, scene);    // rolling boulder
        }
    }



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

    // Check collisions
    checkCollisions(heroSphere, heroBaseY, scene)
    updateObstacles(scene, rollingSpeed, heroBaseY)

    // Update camera to follow slightly
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, heroSphere.position.z + 8, 2 * deltaTime);
    
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