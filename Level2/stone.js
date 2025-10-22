import * as THREE from "three";

export function createRealisticStone() {
  const stoneTypes = ["round", "angular", "flat", "pebble"];
  const stoneType = stoneTypes[Math.floor(Math.random() * stoneTypes.length)];

  let stoneGeometry;
  const baseSize = 0.08 + Math.random() * 0.12; // Random size 0.08 to 0.2

  switch (stoneType) {
    case "round":
      stoneGeometry = new THREE.SphereGeometry(baseSize, 6, 4);
      const roundPositions = stoneGeometry.attributes.position.array;
      for (let i = 0; i < roundPositions.length; i += 3) {
        const noise = (Math.random() - 0.5) * 0.3;
        roundPositions[i] *= 1 + noise;
        roundPositions[i + 1] *= 1 + noise;
        roundPositions[i + 2] *= 1 + noise;
      }
      break;

    case "angular":
      stoneGeometry = new THREE.DodecahedronGeometry(baseSize, 0);
      break;

    case "flat":
      stoneGeometry = new THREE.SphereGeometry(baseSize * 1.2, 6, 4);
      stoneGeometry.scale(1, 0.3, 1); // Flatten it
      break;

    case "pebble":
      stoneGeometry = new THREE.SphereGeometry(baseSize * 0.7, 8, 6);
      stoneGeometry.scale(1.2, 0.8, 1); // Oval shape
      break;
  }

  stoneGeometry.attributes.position.needsUpdate = true;
  stoneGeometry.computeVertexNormals();

  //stone colors
  const stoneColors = [
    0x8b7d6b, // Warm gray
    0x696969, // Dim gray
    0x708090, // Slate gray
    0x778899, // Light slate gray
    0x654321, // Dark brown
    0xa0522d, // Sienna
    0x2f4f4f, // Dark slate gray
    0x556b2f, // Dark olive green
    0x8fbc8f, // Dark sea green
    0x9acd32, // Yellow green
  ];

  const stoneColor =
    stoneColors[Math.floor(Math.random() * stoneColors.length)];
  const stoneMaterial = new THREE.MeshLambertMaterial({
    color: stoneColor,
    transparent: false,
    roughness: 0.8,
  });

  const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
  stone.castShadow = true;
  stone.receiveShadow = true;

  // Add slight random rotation for natural placement
  stone.rotation.x = (Math.random() - 0.5) * 0.4;
  stone.rotation.z = (Math.random() - 0.5) * 0.4;

  return stone;
}
