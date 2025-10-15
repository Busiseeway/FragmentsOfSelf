import * as THREE from 'three';

export function addBeach(scene) { 
    const roadWidth = 8;
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
    

    addBeachDetails(scene);
}

function addBeachDetails(scene) {
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

