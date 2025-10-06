import * as THREE from 'three';

let heroSphere;
let heroRadius = 0.3;
let heroBaseY = 0.5;

export function addHero(scene, currentLane) {
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

    return heroSphere;
}

export { heroSphere, heroBaseY, heroRadius };