//import * as THREE from 'three';

let emotions = [];
const loader = new THREE.TextureLoader();

// Define textures for each emotion with their score values
const emotionTypes = [
  { texture: loader.load('assets/textures/angry.png'), name: "Anger", score: -20 },
  { texture: loader.load('assets/textures/sad.png'), name: "Sad", score: -10 },
  { texture: loader.load('assets/textures/sick.png'), name: "Sick", score: -20 },
  { texture: loader.load('assets/textures/scared.png'), name: "Scared", score: -10 },
  { texture: loader.load('assets/textures/happy.png'), name: "Happy", score: 20 },
  { texture: loader.load('assets/textures/love.png'), name: "Love", score: 25 },
  { texture: loader.load('assets/textures/shy.png'), name: "Shy", score: 10 },
  { texture: loader.load('assets/textures/proud.png'), name: "Proud", score: 15 }
];

export function addEmotions(scene) {
  for (let i = 0; i < 10; i++) {
    // Pick a random type
    const type = emotionTypes[Math.floor(Math.random() * emotionTypes.length)];

    // Make a sphere with its texture
    const geometry = new THREE.CircleGeometry(0.5, 32, 32);
    const material = new THREE.MeshLambertMaterial({ 
      map: type.texture, 
      transparent: true 
    });
    const emotion = new THREE.Mesh(geometry, material);

    // Place it randomly in a lane
    const lane = [-2, 0, 2][Math.floor(Math.random() * 3)];
    emotion.position.set(lane, 1, -i * 20 - 20);

    // Store its type and score
    emotion.userData = { 
      type: type.name, 
      score: type.score,
      collected: false 
    };

    scene.add(emotion);
    emotions.push(emotion);
  }
}

export { emotions, emotionTypes };