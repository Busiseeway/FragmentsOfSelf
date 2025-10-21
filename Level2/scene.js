function createScene() {
  distance = 0;
  clock = new THREE.Clock();
  clock.start();
  heroRollingSpeed = rollingSpeed * 5;

  sceneWidth = window.innerWidth;
  sceneHeight = window.innerHeight;
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x87ceeb, 10, 100);

  camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x87ceeb, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(sceneWidth, sceneHeight);
  document.body.appendChild(renderer.domElement);

  const listener = new THREE.AudioListener();
  camera.add(listener);

  //theto (add rain sound)
  const rainSound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(
    "cold-snowfall-ambience-5-minutes-sound-effect-164512.mp3",
    function (buffer) {
      rainSound.setBuffer(buffer);
      rainSound.setLoop(true);
      rainSound.setVolume(0.4);
      rainSound.play();
    }
  );

  addRoad();
  addHero();
  addLight();
  addSideTrees();
  //addSideWaterfalls(); // Add waterfalls along the sides

  //theto (add railings to scene)
  addSideRailings();

  //thet(add rain)
  //createRain();
  createLightning();
  addEmotions(scene);
  addHearts();

  camera.position.set(0, 4, 8);
  camera.lookAt(0, 0, 0);

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("keydown", handleKeyDown);
}
