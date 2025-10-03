import * as THREE from 'three';

let roadSegments = [];

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
        const roadMaterial = new THREE.MeshStandardMaterial({ 
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
}    

export { roadSegments };

