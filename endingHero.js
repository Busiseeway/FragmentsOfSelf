// endingHero.js - Monster for ending scene
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

let endingHero;
let mixer;
let currentAction;

export function addEndingHero(scene, onLoadCallback) {
    const loader = new FBXLoader();

    loader.load(
        'Monster/Standing Clap.fbx',
        (fbx) => {
            endingHero = fbx;
            
            // Scale and position the hero
            endingHero.scale.set(0.005, 0.005, 0.005);
            endingHero.position.set(0, 0, 0);
            endingHero.rotation.y = Math.PI; // Face the ocean
            
            // Setup materials and shadows
            endingHero.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Ensure materials render properly
                    if (child.material) {
                        child.material.side = THREE.DoubleSide;
                        child.material.needsUpdate = true;
                    }
                }
            });

            scene.add(endingHero);

            // Setup animation mixer
            mixer = new THREE.AnimationMixer(endingHero);
            
            if (fbx.animations && fbx.animations.length > 0) {
                currentAction = mixer.clipAction(fbx.animations[0]);
                currentAction.play();
                console.log("Playing Standing clap animation");
            } else {
                console.warn("No animations found in Standing clap.fbx");
            }

            console.log("Ending hero loaded successfully!");
            
            // Call callback if provided
            if (onLoadCallback) {
                onLoadCallback();
            }
        },
        (xhr) => {
            const percentComplete = (xhr.loaded / xhr.total * 100).toFixed(2);
            console.log(`Loading ending hero: ${percentComplete}%`);
        },
        (error) => {
            console.error('Error loading ending hero:', error);
            console.log("Check that 'Standing clap.fbx' exists in the correct path");
        }
    );
}

export function updateEndingHero(deltaTime) {
    if (mixer) {
        mixer.update(deltaTime);
    }
}

export { endingHero, mixer };