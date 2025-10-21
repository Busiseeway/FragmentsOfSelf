function addSideRailings() {
  const numberOfStrips = 1000; // number of repeating segments
  const stripSpacing = 100; // length of each segment

  for (let i = 0; i < numberOfStrips; i++) {
    const left = createRailingStrip();
    left.position.set(-4.5, 0.5, -i * stripSpacing);
    scene.add(left);
    railings.push(left);

    const right = createRailingStrip();
    right.position.set(4.5, 0.5, -i * stripSpacing);
    scene.add(right);
    railings.push(right);
  }
}

//theto (adding railings to side of road)
function createRailingStrip() {
  const geometry = new THREE.BoxGeometry(0.3, 2, 1000);
  const material = new THREE.MeshStandardMaterial({
    color: 0x556b2f,
    roughness: 0.8,
  });
  return new THREE.Mesh(geometry, material);
}
