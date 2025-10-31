import * as THREE from 'three';

let camera, scene, renderer;
let sceneWidth, sceneHeight;

export function createScene(container = document.body) {
    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;
    
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x87CEEB, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMapz;
    renderer.setSize(sceneWidth, sceneHeight);

    //document.body.appendChild(renderer.domElement);
    container.appendChild(renderer.domElement);
    
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);
    
    window.addEventListener('resize', onWindowResize, false);

    return { scene, camera, renderer };
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}


export { scene, camera, renderer };