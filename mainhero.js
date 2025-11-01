import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

let mainHero;
let heroRadius = 0.3;
let heroBaseY = -2;
let mixer;
let currentAction;
let animations = {};
let isJumping = false;
let isSliding=false

export function addMainHero(scene, currentLane) {
  const loader = new FBXLoader();

  // Load main idle/walk model
  loader.load(
    'Monster/Roar.fbx',
    (object) => {
      mainHero = object;
      mainHero.scale.set(0.009, 0.009, 0.009);
      mainHero.position.set(currentLane, heroBaseY, 0);
      mainHero.rotation.set(0,Math.PI/2, 0);
    //   mainHero.castShadow = true;
    //   mainHero.receiveShadow = true;
      
      scene.add(mainHero);

      mixer = new THREE.AnimationMixer(mainHero);

      if (object.animations.length > 0) {
        animations.idle = mixer.clipAction(object.animations[0]);
        currentAction = animations.idle;
        currentAction.play();
      }
    },
    undefined,
    (err) => console.error('Error loading main model:', err)
  );

  return mainHero;
}

export function updateHero(deltaTime) {
  if (mixer) mixer.update(deltaTime);
}



export {mainHero, heroBaseY, heroRadius};
