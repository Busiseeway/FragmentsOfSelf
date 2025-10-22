import * as THREE from "three";

let roadSegments = [];
let waterSegments = [];

export function addRoad(scene) {
  const roadWidth = 8;
  const roadLength = 20;
  const segmentCount = 10;

  for (let i = 0; i < segmentCount; i++) {
    const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength, 64, 64);

    const positions = roadGeometry.attributes.position.array;
    for (let j = 0; j < positions.length; j += 3) {
      const x = positions[j];
      const z = positions[j + 2];

      // Large dunes and formations
      const largeDunes = Math.sin(x * 0.1) * Math.cos(z * 0.08) * 0.15;
      const mediumRipples =
        Math.sin(x * 0.8 + z * 0.3) * Math.cos(z * 0.6) * 0.05;
      const fineGrain = (Math.random() - 0.5) * 0.02;
      const microDetail = (Math.random() - 0.5) * 0.008;

      positions[j + 1] += largeDunes + mediumRipples + fineGrain + microDetail;
    }
    roadGeometry.attributes.position.needsUpdate = true;
    roadGeometry.computeVertexNormals();

    //Sand material
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0xe6d7c3,
      transparent: false,
      roughness: 0.9,
      metalness: 0.1,
      opacity: 0.85,
    });

    const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
    roadSegment.rotation.x = -Math.PI / 2;
    roadSegment.position.z = -i * roadLength;
    roadSegment.receiveShadow = true;
    roadSegment.castShadow = false;
    scene.add(roadSegment);
    roadSegments.push(roadSegment);
  }

  //theto (changed from sand to water)
  const sandWidth = 50;
  const sandLength = 200;
  const sandSegments = 5;

  // Natural water color variations
  const sandColors = [0x556b2f, 0x6b8e23, 0x2f4f4f, 0x3e2723, 0x1b4d3e];

  for (let i = 0; i < sandSegments; i++) {
    // Use natural color variation instead of rainbow
    const colorIndex = Math.floor(Math.random() * sandColors.length);
    const sandColor = new THREE.Color(sandColors[colorIndex]);

    const sandGeometry = new THREE.PlaneGeometry(
      sandWidth,
      sandLength / sandSegments,
      32,
      32
    );

    const sidePositions = sandGeometry.attributes.position.array;
    for (let j = 0; j < sidePositions.length; j += 3) {
      const x = sidePositions[j];
      const z = sidePositions[j + 2];

      // Gentle undulating dunes
      const dunes = Math.sin(x * 0.05) * Math.cos(z * 0.03) * 0.3;

      // Wind ripples
      const ripples = Math.sin(x * 0.4 + z * 0.2) * 0.08;

      // Random grain detail
      const grain = (Math.random() - 0.5) * 0.04;

      sidePositions[j + 1] += dunes + ripples + grain;
    }
    sandGeometry.attributes.position.needsUpdate = true;
    sandGeometry.computeVertexNormals();

    const waterMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e90ff,
      transparent: true,
      opacity: 0.7,
      shininess: 100,
      side: THREE.DoubleSide,
    });

    const leftWaterSegment = new THREE.Mesh(sandGeometry, waterMaterial);
    leftWaterSegment.rotation.x = -Math.PI / 2;
    leftWaterSegment.position.x = -(roadWidth / 2 + sandWidth / 2);
    leftWaterSegment.position.y = -0.02;
    leftWaterSegment.position.z = -i * (sandLength / sandSegments);
    leftWaterSegment.receiveShadow = true;
    scene.add(leftWaterSegment);

    const rightWaterSegment = new THREE.Mesh(
      sandGeometry.clone(),
      waterMaterial.clone()
    );
    rightWaterSegment.rotation.x = -Math.PI / 2;
    rightWaterSegment.position.x = roadWidth / 2 + sandWidth / 2;
    rightWaterSegment.position.y = -0.02;
    rightWaterSegment.position.z = -i * (sandLength / sandSegments);
    rightWaterSegment.receiveShadow = true;
    scene.add(rightWaterSegment);

    // save them to animate later
    waterSegments.push(leftWaterSegment, rightWaterSegment);
  }

  addBeachDetails(scene);
}

function addBeachDetails(scene) {
  const detailCount = 50;
  const roadWidth = 8;

  for (let i = 0; i < detailCount; i++) {
    // Create small shell/pebble details
    const detailGeometry = new THREE.SphereGeometry(
      0.02 + Math.random() * 0.03,
      6,
      4
    );
    const detailMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(
        0.1 + Math.random() * 0.1,
        0.2 + Math.random() * 0.3,
        0.6 + Math.random() * 0.3
      ),
    });

    const detail = new THREE.Mesh(detailGeometry, detailMaterial);

    detail.position.x = (Math.random() - 0.5) * (roadWidth + 80);
    detail.position.z = -Math.random() * 200;
    detail.position.y = 0.01;

    detail.castShadow = true;
    scene.add(detail);
  }
}

export { roadSegments, waterSegments };
