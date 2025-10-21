function addLight() {
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
  scene.add(hemisphereLight);

  sun = new THREE.DirectionalLight(0xffffff, 0.02);
  sun.position.set(10, 10, 5);
  sun.castShadow = true;
  scene.add(sun);

  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 50;
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
}

// Create a point light used for lightning flashes
function createLightning() {
  flash = new THREE.PointLight(0xbfe9ff, 0, 300);
  flash.position.set(0, 200, -50);
  scene.add(flash);
}
