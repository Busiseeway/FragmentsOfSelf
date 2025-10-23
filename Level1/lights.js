import * as THREE from "three";

let sun;

export function addLight(scene) {
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.1);
  scene.add(hemisphereLight);

  sun = new THREE.DirectionalLight(707070, 0.2);
  sun.position.set(10, 10, 5);
  sun.castShadow = true;
  scene.add(sun);

  const color = 808080;
  const intensity = 0.5;
  const light = new THREE.AmbientLight(color, intensity);
  scene.add(light);

  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 50;
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
}

export { sun };
