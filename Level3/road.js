import * as THREE from 'three';

let roadSegments = [];
let sideRocks = [];

// Load textures
const textureLoader = new THREE.TextureLoader();

function loadTexture(path) {
    return textureLoader.load(
        path,
        undefined,
        undefined,
        (err) => console.error(`❌ Failed to load texture: ${path}`, err)
    );
}

// Rock textures
const rockTexture1 = loadTexture('./assets/textures/wall_stone.png');
const rockTexture2 = loadTexture('./assets/textures/pebbles.jpg');
const rockTexture3 = loadTexture('./assets/textures/brownWall.jpg');

// Road texture
const roadTexture = loadTexture('./assets/textures/sand1.jpeg');

// Make textures tile
[rockTexture1, rockTexture2, rockTexture3].forEach(tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
});

roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(1, 10); // Repeat along road length

export function addRoad(scene) {
    const roadWidth = 8;
    const roadLength = 20;
    const segmentCount = 10;

    for (let i = 0; i < segmentCount; i++) {
        // --- ROAD SURFACE ---
        const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength, 64, 64);
        const positions = roadGeometry.attributes.position.array;

        // Add bumps and dunes
        for (let j = 0; j < positions.length; j += 3) {
            const x = positions[j];
            const z = positions[j + 2];

            const largeDunes = Math.sin(x * 0.1) * Math.cos(z * 0.08) * 0.15;
            const mediumRipples = Math.sin(x * 0.8 + z * 0.3) * Math.cos(z * 0.6) * 0.05;
            const fineGrain = (Math.random() - 0.5) * 0.02;
            const microDetail = (Math.random() - 0.5) * 0.008;

            positions[j + 1] += largeDunes + mediumRipples + fineGrain + microDetail;
        }

        roadGeometry.attributes.position.needsUpdate = true;
        roadGeometry.computeVertexNormals();

        const roadMaterial = new THREE.MeshStandardMaterial({
            map: roadTexture,
            roughness: 0.9,
            metalness: 0.1
        });

        const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
        roadSegment.rotation.x = -Math.PI / 2;
        roadSegment.position.z = -i * roadLength;
        roadSegment.receiveShadow = true;
        scene.add(roadSegment);
        roadSegments.push(roadSegment);

        // --- ROCK TYPES ---
        const rockTypes = [
            { geometry: new THREE.DodecahedronGeometry(1, 0), texture: rockTexture1, roughness: 0.85, metalness: 0.2 },
            { geometry: new THREE.DodecahedronGeometry(1, 0), texture: rockTexture2, roughness: 0.85, metalness: 0.2 },
            { 
                geometry: new THREE.DodecahedronGeometry(1, 0), 
                texture: rockTexture3, 
                roughness: 0.92, 
                metalness: 0.05,
                color: 0x8B4513 // brown tint
            }
        ];

        const rocksPerEdge = 6;
        for (let r = 0; r < rocksPerEdge; r++) {
            // --- LEFT SIDE ROCK ---
            const rockTypeLeft = rockTypes[Math.floor(Math.random() * rockTypes.length)];
            const rockMaterialLeft = new THREE.MeshStandardMaterial({
                map: rockTypeLeft.texture,
                roughness: rockTypeLeft.roughness,
                metalness: rockTypeLeft.metalness,
                color: rockTypeLeft.color !== undefined ? rockTypeLeft.color : 0xffffff
            });
            const rockLeft = new THREE.Mesh(rockTypeLeft.geometry, rockMaterialLeft);
            rockLeft.position.set(
                -roadWidth / 2 - 1 - Math.random() * 2,
                0.3,
                -i * roadLength - (r * (roadLength / rocksPerEdge)) - Math.random() * 2
            );
            rockLeft.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            const scaleL = 0.3 + Math.random() * 1.2;
            rockLeft.scale.set(
                scaleL * (0.8 + Math.random() * 0.4),
                scaleL * (0.7 + Math.random() * 0.6),
                scaleL * (0.8 + Math.random() * 0.4)
            );
            rockLeft.castShadow = true;
            scene.add(rockLeft);
            sideRocks.push(rockLeft);

            // --- RIGHT SIDE ROCK ---
            const rockTypeRight = rockTypes[Math.floor(Math.random() * rockTypes.length)];
            const rockMaterialRight = new THREE.MeshStandardMaterial({
                map: rockTypeRight.texture,
                roughness: rockTypeRight.roughness,
                metalness: rockTypeRight.metalness,
                color: rockTypeRight.color !== undefined ? rockTypeRight.color : 0xffffff
            });
            const rockRight = new THREE.Mesh(rockTypeRight.geometry, rockMaterialRight);
            rockRight.position.set(
                roadWidth / 2 + 1 + Math.random() * 2,
                0.3,
                -i * roadLength - (r * (roadLength / rocksPerEdge)) - Math.random() * 2
            );
            rockRight.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            const scaleR = 0.3 + Math.random() * 1.2;
            rockRight.scale.set(
                scaleR * (0.8 + Math.random() * 0.4),
                scaleR * (0.7 + Math.random() * 0.6),
                scaleR * (0.8 + Math.random() * 0.4)
            );
            rockRight.castShadow = true;
            scene.add(rockRight);
            sideRocks.push(rockRight);
        }
    }
}

export { roadSegments, sideRocks };
