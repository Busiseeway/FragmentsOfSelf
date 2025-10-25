import * as THREE from 'three';

let sounds = [];

export function addSounds(scene, camera){
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audioLoader = new THREE.AudioLoader();


    const snow = new THREE.Audio(listener);
    audioLoader.load('assets/sounds/cold-snowfall-ambience.mp3', function(buffer) {
        snow.setBuffer(buffer);
        snow.setLoop(true);
        snow.setVolume(0.5);
        // do not play yet
    });

    sounds.push({ name: 'snow', audio: snow });
}

export { sounds };
