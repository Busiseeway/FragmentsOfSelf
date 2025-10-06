import * as THREE from 'three';

let roadSegments = [];
let sideRocks = [];

export function addRoad(scene) {
    const roadWidth = 8;
    const roadLength = 20;
    const segmentCount = 10;

    for (let i = 0; i < segmentCount; i++) {
        const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength, 64, 64);

        const positions = roadGeometry.attributes.position.array;
        for (let j = 0; j < positions.length; j += 3) {
            const x = positions[j];
            const z = positions[j + 2];

            // Create dunes and bumps
            const largeDunes = Math.sin(x * 0.1) * Math.cos(z * 0.08) * 0.15;
            const mediumRipples = Math.sin(x * 0.8 + z * 0.3) * Math.cos(z * 0.6) * 0.05;
            const fineGrain = (Math.random() - 0.5) * 0.02;
            const microDetail = (Math.random() - 0.5) * 0.008;

            positions[j + 1] += largeDunes + mediumRipples + fineGrain + microDetail;
        }
        roadGeometry.attributes.position.needsUpdate = true;
        roadGeometry.computeVertexNormals();

        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0xE6D7C3,
            roughness: 0.9
        });

        const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
        roadSegment.rotation.x = -Math.PI / 2;
        roadSegment.position.z = -i * roadLength;
        roadSegment.receiveShadow = true;
        scene.add(roadSegment);
        roadSegments.push(roadSegment);

        //diverse rocks along edges
        const rockTypes = [
            // Granite-like 
            { 
                geometry: new THREE.DodecahedronGeometry(1, 0),
                colors: [0x8B8680, 0x9C9388, 0x7A7570],
                roughness: 0.85,
                metalness: 0.2
            },
            // Sandstone
            { 
                geometry: new THREE.IcosahedronGeometry(1, 0),
                colors: [0xD4A574, 0xC19A6B, 0xE8C5A0],
                roughness: 0.95,
                metalness: 0.1
            },

            { 
                geometry: new THREE.OctahedronGeometry(1, 0),
                colors: [0x2F2F2F, 0x3D3D3D, 0x1A1A1A],
                roughness: 0.9,
                metalness: 0.15
            },
            // Limestone (light beige)
            { 
                geometry: new THREE.TetrahedronGeometry(1, 0),
                colors: [0xE5DCC5, 0xF5EAD6, 0xD9CEB0],
                roughness: 0.88,
                metalness: 0.05
            },
            // Reddish rock (iron-rich)
            { 
                geometry: new THREE.DodecahedronGeometry(1, 1),
                colors: [0x8B4513, 0xA0522D, 0x6B3410],
                roughness: 0.92,
                metalness: 0.25
            }
        ];

        const rocksPerEdge = 6;
        for (let r = 0; r < rocksPerEdge; r++) {
            // Select random rock type
            const rockType = rockTypes[Math.floor(Math.random() * rockTypes.length)];
            const rockColor = rockType.colors[Math.floor(Math.random() * rockType.colors.length)];
            
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: rockColor,
                roughness: rockType.roughness,
                metalness: rockType.metalness
            });

            // left side rock
            const rockLeft = new THREE.Mesh(rockType.geometry, rockMaterial);
            rockLeft.position.set(
                -roadWidth / 2 - 1 - Math.random() * 2,
                0.3,
                -i * roadLength - (r * (roadLength / rocksPerEdge)) - Math.random() * 2
            );
            rockLeft.rotation.x = Math.random() * Math.PI;
            rockLeft.rotation.y = Math.random() * Math.PI;
            rockLeft.rotation.z = Math.random() * Math.PI;
            
            // More varied sizes
            const scaleL = 0.3 + Math.random() * 1.2;
            const scaleVariationX = 0.8 + Math.random() * 0.4;
            const scaleVariationY = 0.7 + Math.random() * 0.6;
            const scaleVariationZ = 0.8 + Math.random() * 0.4;
            rockLeft.scale.set(
                scaleL * scaleVariationX, 
                scaleL * scaleVariationY, 
                scaleL * scaleVariationZ
            );
            rockLeft.castShadow = true;
            scene.add(rockLeft);
            sideRocks.push(rockLeft);

            // right side rock - use different type
            const rockType2 = rockTypes[Math.floor(Math.random() * rockTypes.length)];
            const rockColor2 = rockType2.colors[Math.floor(Math.random() * rockType2.colors.length)];
            const rockMaterial2 = new THREE.MeshStandardMaterial({
                color: rockColor2,
                roughness: rockType2.roughness,
                metalness: rockType2.metalness
            });
            
            const rockRight = new THREE.Mesh(rockType2.geometry, rockMaterial2);
            rockRight.position.set(
                roadWidth / 2 + 1 + Math.random() * 2,
                0.3,
                -i * roadLength - (r * (roadLength / rocksPerEdge)) - Math.random() * 2
            );
            rockRight.rotation.x = Math.random() * Math.PI;
            rockRight.rotation.y = Math.random() * Math.PI;
            rockRight.rotation.z = Math.random() * Math.PI;
            
            const scaleR = 0.3 + Math.random() * 1.2;
            const scaleVariationX2 = 0.8 + Math.random() * 0.4;
            const scaleVariationY2 = 0.7 + Math.random() * 0.6;
            const scaleVariationZ2 = 0.8 + Math.random() * 0.4;
            rockRight.scale.set(
                scaleR * scaleVariationX2, 
                scaleR * scaleVariationY2, 
                scaleR * scaleVariationZ2
            );
            rockRight.castShadow = true;
            scene.add(rockRight);
            sideRocks.push(rockRight);
        }
    }
}

export { roadSegments, sideRocks };