import * as THREE from 'three';

let emotions = [];
const loader = new THREE.TextureLoader();

// Define textures for each emotion
const emotionTypes = [
  { texture: loader.load('textures/angry.png'), name: "Anger" },
  { texture: loader.load('textures/happy.png'), name: "Joy" },
  { texture: loader.load('textures/calm.png'), name: "Calm" },
  { texture: loader.load('textures/crying.png'), name: "Hope" }
];

export function addEmotions(scene) {
  for (let i = 0; i < 10; i++) {
    // Pick a random type
    const type = emotionTypes[Math.floor(Math.random() * emotionTypes.length)];

    // Make a sphere with its texture
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
      map: type.texture, 
      transparent: true 
    });
    const emotion = new THREE.Mesh(geometry, material);

    // Place it randomly in a lane
    const lane = [-2, 0, 2][Math.floor(Math.random() * 3)];
    emotion.position.set(lane, 1, -i * 20 - 20);

    // Store its type
    emotion.userData = { type: type.name, collected: false };

    scene.add(emotion);
    emotions.push(emotion);
  }
}

export { emotions, emotionTypes };
