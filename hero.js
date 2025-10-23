import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

let heroSphere;
let heroRadius = 0.3;
let heroBaseY = 1;
let mixer;
let currentAction;
let animations = {};
let isJumping = false;
let isSliding=false

export function addHero(scene, currentLane) {
  const loader = new FBXLoader();

  // Load main idle/walk model
  loader.load(
    'Monster/Running (8).fbx',
    (object) => {
      heroSphere = object;
      heroSphere.scale.set(0.003, 0.003, 0.003);
      heroSphere.position.set(currentLane, heroBaseY, 0);
      heroSphere.rotation.set(0,Math.PI, 0);
      heroSphere.castShadow = true;
      heroSphere.receiveShadow = true;
      object.traverse((child) => {
        if(child.isMesh){
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(heroSphere);

      mixer = new THREE.AnimationMixer(heroSphere);

      if (object.animations.length > 0) {
        animations.idle = mixer.clipAction(object.animations[0]);
        currentAction = animations.idle;
        currentAction.play();
      }

      // Load jump animation
      loader.load(
        'Monster/Jump (1).fbx',
        (jumpGltf) => {
          if (jumpGltf.animations.length > 0) {
            animations.jump = mixer.clipAction(jumpGltf.animations[0]);
            animations.jump.clampWhenFinished = true;
          }
        },
        undefined,
        (err) => console.error('Error loading jump model:', err)
      );

      //slide animation
      loader.load(
        'Monster/Running Slide.fbx',
        (jumpGltf) => {
          if (jumpGltf.animations.length > 0) {
            animations.slide = mixer.clipAction(jumpGltf.animations[0]);
            animations.slide.clampWhenFinished = true;
          }
        },
        undefined,
        (err) => console.error('Error loading slide model:', err)
      );
    },
    undefined,
    (err) => console.error('Error loading main model:', err)
  );

  return heroSphere;
}

export function updateHero(deltaTime) {
  if (mixer) mixer.update(deltaTime);
}

export function playJumpAnimation(type) {
  if (type=='jump' && animations.jump && !isJumping) {
    switchAnimation(animations.jump);
    isJumping = true;

    // Return to idle after short delay
    setTimeout(() => {
      switchAnimation(animations.idle);
      isJumping = false;
    }, 800); // adjust duration to match your jump animation
  }
  else if (type=='slide' && animations.slide && !isSliding) {
    switchAnimation(animations.slide);
    isSliding = true;

    // Return to idle after short delay
    setTimeout(() => {
      switchAnimation(animations.idle);
      isSliding = false;
    }, 800); // adjust duration to match your jump animation
  }
}

function switchAnimation(newAction) {
  if (!newAction || newAction === currentAction) return;
  currentAction.fadeOut(0.2);
  newAction.reset().fadeIn(0.2).play();
  currentAction = newAction;
}

export { heroSphere, heroBaseY, heroRadius };
