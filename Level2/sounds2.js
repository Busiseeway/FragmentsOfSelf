import * as THREE from 'three';

let sounds = [];
const toggleButton = document.getElementById('audio-btn');
let isPlaying = false; // Track the current state

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
        // Try to play immediately
        snow.play();
        isPlaying = true;
    });
    
    

    //sounds.push({ name: 'snow', audio: snow });
    toggleButton.addEventListener('click', function() {
            if (isPlaying) {
                snow.pause();
                isPlaying = false;
                //toggleButton.textContent = 'Play Music';
                toggleButton.innerHTML = '<img src="./assets/icons/icons8-no-audio-50.png" width="50" height="50"/>' ;
            } else {
                snow.play();
                console.log("Music playing");
                isPlaying = true;
                // toggleButton.textContent = 'Pause Music';
                toggleButton.innerHTML = '<img src="./assets/icons/icons8-audio-50.png" width="50" height="50"/>' ;
            }
        });
    console.log("Sound on 2");
    scene.add(snow);
    sounds.push(snow);
}

export { sounds };
