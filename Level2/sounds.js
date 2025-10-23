import * as THREE from "three";

let sounds = [];

export function addSounds(scene, camera) {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  //theto (add rain sound)
  const rainSound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(
    "assests/sounds/cold-snowfall-ambience.mp3",
    function (buffer) {
      rainSound.setBuffer(buffer);
      rainSound.setLoop(true);
      rainSound.setVolume(0.4);
      rainSound.play();
    }
  );
  scene.add(rainSound);
  sounds.push(rainSound);
}

export { sounds };
