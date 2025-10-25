import * as THREE from 'three';

let sounds = [];

export function addSounds(scene, camera){
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audioLoader = new THREE.AudioLoader();

    // Spooky Dance
    const spookyDance = new THREE.Audio(listener);
    audioLoader.load('assets/sounds/Spooky_Dance.mp3', function(buffer) {
        spookyDance.setBuffer(buffer);
        spookyDance.setLoop(true);
        spookyDance.setVolume(0.5);
        // do not play yet
    });

    sounds.push({ name: 'spookyDance', audio: spookyDance });
}

export { sounds };
