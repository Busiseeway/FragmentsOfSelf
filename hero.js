import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


let heroSphere;
let heroRadius = 0.3;
let heroBaseY = 2;

export function addHero(scene, currentLane) {
    // const sphereGeometry = new THREE.DodecahedronGeometry(heroRadius, 1);
    // const sphereMaterial = new THREE.MeshStandardMaterial({
    //     color: 0x4A90E2,
    //     flatShading: true,
    //     metalness: 0.3,
    //     roughness: 0.4
    // });
    
    // heroSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // heroSphere.receiveShadow = true;
    // heroSphere.castShadow = true;
    // scene.add(heroSphere);
    // heroSphere.position.y = heroBaseY;
    // heroSphere.position.z = 0;
    // heroSphere.position.x = currentLane;


    const loader = new GLTFLoader();
    loader.load('CGVCharacter2.glb', function(gltf){
       
        heroSphere = gltf.scene;
        // Traverse and replace materials with unlit MeshBasicMaterial that preserve textures/colors
        // heroSphere.traverse(function (node) {
        //     if (node.isMesh) {
        //         const oldMat = node.material;

        //         // Keep texture map if present, keep opacity/transparency, side, skinning
        //         const newMatParams = {};

        //         if (Array.isArray(oldMat)) {
        //             // handle multi-material meshes: map array to new material array
        //             const newMats = oldMat.map(m => {
        //                 const params = {
        //                     map: m.map || null,
        //                     color: (m.color) ? m.color.clone() : new THREE.Color(0xffffff),
        //                     side: m.side !== undefined ? m.side : THREE.FrontSide,
        //                     transparent: m.transparent === true,
        //                     opacity: m.opacity !== undefined ? m.opacity : 1,
        //                     // support skinning/morph targets if model uses them
        //                     skinning: node.isSkinnedMesh === true,
        //                     morphTargets: m.morphTargets === true || node.morphTargetInfluences !== undefined
        //                 };
        //                 return new THREE.MeshBasicMaterial(params);
        //             });
        //             node.material = newMats;
        //         } else {
        //             const m = oldMat;
        //             newMatParams.map = m.map || null;
        //             newMatParams.color = (m.color) ? m.color.clone() : new THREE.Color(0xffffff);
        //             newMatParams.side = m.side !== undefined ? m.side : THREE.FrontSide;
        //             newMatParams.transparent = m.transparent === true;
        //             newMatParams.opacity = m.opacity !== undefined ? m.opacity : 1;
        //             newMatParams.skinning = node.isSkinnedMesh === true;
        //             newMatParams.morphTargets = m.morphTargets === true || node.morphTargetInfluences !== undefined;

        //             const basicMat = new THREE.MeshBasicMaterial(newMatParams);

        //             // if the old material used an alphaMap or alphaTest, copy them where possible
        //             if (m.alphaMap) basicMat.alphaMap = m.alphaMap;
        //             if (m.alphaTest) basicMat.alphaTest = m.alphaTest;

        //             node.material = basicMat;
        //         }

        //         // keep original renderOrder or other flags if needed
        //         node.material.needsUpdate = true;

        //         // If the mesh used vertex colors, preserve that (MeshBasic supports vertexColors)
        //         if (node.geometry && node.geometry.attributes && node.geometry.attributes.color) {
        //             if (Array.isArray(node.material)) {
        //                 node.material.forEach(mat => mat.vertexColors = true);
        //             } else {
        //                 node.material.vertexColors = true;
        //             }
        //         }

        //         // NOTE: MeshBasicMaterial does not respond to lights and won't receive shadows.
        //         // If you need the character to cast/receive shadows visually, that requires a
        //         // more advanced setup (separate shadow-only material or custom shader).
        //     }
        // });
        heroSphere.scale.set(0.05,0.05,0.05);
        heroSphere.position.set(currentLane, heroBaseY, 0);
        heroSphere.receiveShadow = true;
        heroSphere.castShadow=true;
        scene.add(heroSphere);
        heroSphere.position.y = heroBaseY;
        heroSphere.position.z = 0;
        heroSphere.position.x = currentLane;
        heroSphere.rotation.x = Math.PI;
        heroSphere.rotation.z=Math.PI;

        
    },undefined, function(error){
        console.error(error);
    })

    return heroSphere;

}

export { heroSphere, heroBaseY, heroRadius };