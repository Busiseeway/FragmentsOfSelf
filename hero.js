import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let heroSphere;
let heroRadius = 0.3;
let heroBaseY = 1;
let mixer;
let currentAction;
let animations = {};
let isJumping = false;

export function addHero(scene, currentLane, onLoaded) {
  const loader = new GLTFLoader();

  loader.load(
    "/Monster/BetterOne.glb",
    (gltf) => {
      heroSphere = gltf.scene;
      heroSphere.scale.set(0.3, 0.3, 0.3);
      heroSphere.position.set(currentLane, heroBaseY, 0);
      heroSphere.rotation.set(0, Math.PI, 0);
      heroSphere.castShadow = true;
      heroSphere.receiveShadow = true;
      scene.add(heroSphere);

      mixer = new THREE.AnimationMixer(heroSphere);

      if (gltf.animations.length > 0) {
        animations.idle = mixer.clipAction(gltf.animations[0]);
        currentAction = animations.idle;
        currentAction.play();
      }

      // Load jump animation
      loader.load(
        "/Monster/BetterOneJump.glb",
        (jumpGltf) => {
          if (jumpGltf.animations.length > 0) {
            animations.jump = mixer.clipAction(jumpGltf.animations[0]);
          }
          // Call the callback after both models are loaded
          if (onLoaded) onLoaded();
        },
        undefined,
        (err) => console.error("Error loading jump model:", err)
      );
    },
    undefined,
    (err) => console.error("Error loading main model:", err)
  );

  return heroSphere;
}

export function updateHero(deltaTime) {
  if (mixer) mixer.update(deltaTime);
}

export function playJumpAnimation() {
  if (animations.jump && !isJumping) {
    switchAnimation(animations.jump);
    isJumping = true;

    // Return to idle after short delay
    setTimeout(() => {
      switchAnimation(animations.idle);
      isJumping = false;
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
