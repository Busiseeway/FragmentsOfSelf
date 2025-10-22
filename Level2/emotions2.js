import * as THREE from "three";

let emotions = [];
const loader = new THREE.TextureLoader();

// Define textures for each emotion with their score values
const emotionTypes = [
  {
    texture: loader.load("assets/textures/angry.png"),
    name: "Anger",
    score: -20,
  },
  { texture: loader.load("assets/textures/sad.png"), name: "Sad", score: -10 },
  {
    texture: loader.load("assets/textures/sick.png"),
    name: "Sick",
    score: -20,
  },
  {
    texture: loader.load("assets/textures/scared.png"),
    name: "Scared",
    score: -10,
  },
  {
    texture: loader.load("assets/textures/happy.png"),
    name: "Happy",
    score: 20,
  },
  { texture: loader.load("assets/textures/love.png"), name: "Love", score: 25 },
  { texture: loader.load("assets/textures/shy.png"), name: "Shy", score: 10 },
  {
    texture: loader.load("assets/textures/proud.png"),
    name: "Proud",
    score: 15,
  },
];

// Add emotions to the scene
export function addEmotions(scene) {
  const lanes = [-2, 0, 2];

  for (let i = 0; i < 10; i++) {
    const type = emotionTypes[Math.floor(Math.random() * emotionTypes.length)];

    const geometry = new THREE.CircleGeometry(1, 32);
    const material = new THREE.MeshLambertMaterial({
      map: type.texture,
      transparent: true,
      fog: false, // Emotions ignore fog
    });

    const emotion = new THREE.Mesh(geometry, material);

    // Position in random lane and Z position within visible range
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    emotion.position.set(lane, 1, -10 - Math.random() * 80);

    // Rotate to face camera
    emotion.rotation.y = Math.PI;

    // Store type and score
    emotion.userData = {
      type: type.name,
      score: type.score,
      collected: false,
    };

    scene.add(emotion);
    emotions.push(emotion);
  }
}

// Call this inside your main2.js update loop to move and respawn
export function updateEmotions(heroSphere, scene, rollingSpeed) {
  const lanes = [-2, 0, 2];

  emotions.forEach((emotion, i) => {
    if (!emotion.userData.collected) {
      // Move toward hero
      emotion.position.z += rollingSpeed;

      // Small floating animation
      emotion.position.y = 1 + Math.sin(Date.now() * 0.005 + i) * 0.2;

      // Collision check
      const dx = heroSphere.position.x - emotion.position.x;
      const dy = heroSphere.position.y - emotion.position.y;
      const dz = heroSphere.position.z - emotion.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 1.5) {
        // Collected
        emotion.userData.collected = true;

        // Optional: play collection sound here
        // if (sounds.collect) sounds.collect.play();

        // Add score
        if (document.getElementById("score")) {
          let score =
            parseInt(
              document.getElementById("score").textContent.replace(/\D/g, "")
            ) || 0;
          score += emotion.userData.score;
          document.getElementById("score").textContent = "Score: " + score;
        }

        // Move it far away to respawn later (FIXED: within visible range)
        emotion.position.x = lanes[Math.floor(Math.random() * lanes.length)];
        emotion.position.z = -80 - Math.random() * 80;
        emotion.userData.collected = false;

        // Change to a new random type/color
        const newType =
          emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
        emotion.material.map = newType.texture;
        emotion.userData.type = newType.name;
        emotion.userData.score = newType.score;
      }

      // Respawn if too close to camera
      if (emotion.position.z > 10) {
        emotion.position.x = lanes[Math.floor(Math.random() * lanes.length)];
        emotion.position.z = -80 - Math.random() * 80;

        const newType =
          emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
        emotion.material.map = newType.texture;
        emotion.userData.type = newType.name;
        emotion.userData.score = newType.score;
        emotion.userData.collected = false;
      }
    }
  });
}

export { emotions, emotionTypes };
