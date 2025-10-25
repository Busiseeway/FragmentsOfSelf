import * as THREE from 'three';

let sounds = [];
const toggleButton = document.getElementById('audio-btn');
    let isPlaying = false; // Track the current state

export function addSounds(scene, camera){
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'assets/sounds/Tokyo.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5);
	//sound.play();
});
 toggleButton.addEventListener('click', function() {
        if (isPlaying) {
            sound.pause();
            isPlaying = false;
            //toggleButton.textContent = 'Play Music';
            toggleButton.innerHTML = '<img src="./assets/icons/icons8-no-audio-50.png" width="50" height="50"/>' ;
        } else {
            sound.play();
            console.log("Music playing");
            isPlaying = true;
            // toggleButton.textContent = 'Pause Music';
            toggleButton.innerHTML = '<img src="./assets/icons/icons8-audio-50.png" width="50" height="50"/>' ;
        }
    });
console.log("Sound on");
scene.add(sound);
sounds.push(sound);
}

export {sounds};
