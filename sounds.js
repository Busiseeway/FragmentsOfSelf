import * as THREE from 'three';

let sounds = [];

export function addSounds(scene, camera){
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'assets/sounds/Spooky_Dance.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5);
	sound.play();
});

scene.add(sound);
sounds.push(sound);
}

export {sounds};
