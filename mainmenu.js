// mainmenu.js
import * as THREE from 'three';
import {
  addMainHero,
  mainHero,
  heroBaseY,
  updateHero,
} from "./mainhero.js";
import { createScene, scene, camera, renderer } from "./mainscene.js";


export function createMenu3(onStartCallback) {
  let rollingSpeed = 0.6;
   let clock;
    let distance = 0;
  // Play menu music
  const listener = new THREE.AudioListener();
  const camera2 = new THREE.PerspectiveCamera();
  camera2.add(listener);
  

  const menuMusic = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('assets/sounds/deep-sea-monster-roar-329857.mp3', buffer => {
    menuMusic.setBuffer(buffer);
    menuMusic.setLoop(true);
    menuMusic.setVolume(1.0);
    menuMusic.play();
  });

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'main-menu';
  overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, #1e0033 0%, #000 90%);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 1000;
      overflow: hidden;
  `;

  // Background glow
  const glow = document.createElement('div');
  glow.style.cssText = `
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(118,75,162,0.4), transparent 70%);
      border-radius: 50%;
      animation: pulse 6s infinite alternate ease-in-out;
  `;
  glow.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }],
    { duration: 6000, iterations: Infinity, direction: 'alternate' }
  );
  overlay.appendChild(glow);

  // Game Title
  const title = document.createElement('h1');
  title.textContent = 'FRAGMENTS OF SELF';
  title.style.cssText = `
      color: #FFD700;
      font-size: 60px;
      letter-spacing: 4px;
      text-align: center;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      margin-bottom: 40px;
      z-index: 2;
  `;

  // Tagline
  const tagline = document.createElement('p');
  tagline.textContent = 'Face the memories. Piece together who you are.';
  tagline.style.cssText = `
      color: #eee;
      font-size: 18px;
      margin-bottom: 60px;
      text-align: center;
      z-index: 2;
  `;

  //Monster
   const monster =document.createElement('div');
  
  init();
 

  function init(){
    createScene();
    monster.appendChild(renderer.domElement);
    renderer.domElement.style.background = 'transparent';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';

    clock = new THREE.Clock();
    addMainHero(scene,0);
     //mainHero.position.set(-3, heroBaseY, 0); // move hero left
     //mainHero.position.set(-3,heroBaseY,0);

    // // Adjust camera to view both hero and center area
    // camera.position.set(0, 2, 6);
    // camera.lookAt(new THREE.Vector3(0, 1, 0));
    animate();
  }


  function animate() {
    const deltaTime = clock.getDelta();
    distance += rollingSpeed;
    requestAnimationFrame(animate);
    updateHero(deltaTime);
    renderer.render(scene, camera);
  }
  
  

  // Helper to make buttons
  function createButton(text) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
        background: linear-gradient(135deg, #FFD700 0%, #ffcc00 100%);
        color: #333;
        border: none;
        padding: 15px 50px;
        font-size: 20px;
        font-weight: bold;
        border-radius: 12px;
        cursor: pointer;
        margin: 10px;
        z-index: 2;
        transition: transform 0.2s, box-shadow 0.2s;
    `;
    btn.addEventListener('mouseover', () => {
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.7)';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = 'none';
    });
    return btn;
  }

  // Buttons
  const startButton = createButton('START GAME');
  const controlsButton = createButton('CONTROLS');
  const quitButton = createButton('QUIT');

  startButton.addEventListener('click', () => {
    showStoryScreen();
  });

  controlsButton.addEventListener('click', () => {
  // Create overlay
  const controlsOverlay = document.createElement('div');
  controlsOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 2000;
      opacity: 0;
      animation: fadeIn 0.3s forwards;
  `;

  // Glowing background effect
  const glow = document.createElement('div');
  glow.style.cssText = `
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%);
      border-radius: 50%;
      animation: pulse 6s infinite alternate ease-in-out;
  `;
  glow.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }],
    { duration: 6000, iterations: Infinity, direction: 'alternate' }
  );
  controlsOverlay.appendChild(glow);

  // Controls content
  const controlsBox = document.createElement('div');
  controlsBox.innerHTML = `
      <h2 style="margin-bottom:20px; color:#FFD700; text-shadow: 0 0 10px #FFD700;">Game Controls</h2>
      <p style="color:white; font-size:18px; line-height:1.6;">← → Arrow keys: Move</p>
      <p style="color:white; font-size:18px; line-height:1.6;">↑ Arrow key: Jump</p>
      <p style="color:white; font-size:18px; line-height:1.6;">↓ Arrow key: Slide</p>
      <p style="color:white; font-size:18px; line-height:1.6;">V: Change Camera View</p>
      
  `;
  controlsBox.style.cssText = `
      background: rgba(30,0,51,0.9);
      padding: 30px 50px;
      border-radius: 20px;
      text-align: center;
      z-index: 2;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  `;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'CLOSE';
  closeBtn.style.cssText = `
      background: linear-gradient(135deg, #FFD700 0%, #ffcc00 100%);
      color: #333;
      border: none;
      padding: 12px 35px;
      font-size: 18px;
      border-radius: 12px;
      cursor: pointer;
      margin-top: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 2;
  `;
  closeBtn.addEventListener('mouseover', () => {
      closeBtn.style.transform = 'scale(1.1)';
      closeBtn.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.7)';
  });
  closeBtn.addEventListener('mouseout', () => {
      closeBtn.style.transform = 'scale(1)';
      closeBtn.style.boxShadow = 'none';
  });
  closeBtn.addEventListener('click', () => {
      document.body.removeChild(controlsOverlay);
  });

  controlsOverlay.appendChild(controlsBox);
  controlsBox.appendChild(closeBtn);
  document.body.appendChild(controlsOverlay);

  // Fade-in animation
  const style = document.createElement('style');
  style.innerHTML = `
      @keyframes fadeIn {
        to { opacity: 1; }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.3); }
      }
  `;
  document.head.appendChild(style);
});


  quitButton.addEventListener('click', () => {
    window.location.href = '/';
  });

  // Assemble menu
  overlay.appendChild(title);
  overlay.appendChild(tagline);
  overlay.appendChild(startButton);
  overlay.appendChild(controlsButton);
  overlay.appendChild(quitButton);
  overlay.appendChild(monster);
  document.body.appendChild(overlay);

  // Story screen function
  function showStoryScreen() {
    document.body.removeChild(overlay);

    const storyOverlay = document.createElement('div');
    storyOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #000000, #1e0033);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        text-align: center;
        font-family: 'Arial', sans-serif;
        padding: 40px;
        z-index: 1000;
    `;

    const storyText = document.createElement('p');
    storyText.innerHTML = `
        You wake up in a world that feels familiar yet distant, blurry, not clear.<br>
        Fragments of who you once were float around you... memories, emotions, faces.<br><br>
        To move forward, you must gather what was lost.<br>
        Each level brings you closer to remembering who you are. The world looks more clearer.
    `;
    storyText.style.cssText = `
        font-size: 20px;
        line-height: 1.6;
        max-width: 700px;
        margin-bottom: 40px;
    `;

    const startLevelButton = createButton('START LEVEL 1');
    startLevelButton.style.background = 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)';
    startLevelButton.addEventListener('click', () => {
      if (menuMusic && menuMusic.isPlaying) menuMusic.stop();
      document.body.removeChild(storyOverlay);
      if (onStartCallback) onStartCallback();
    });

    storyOverlay.appendChild(storyText);
    storyOverlay.appendChild(startLevelButton);
    document.body.appendChild(storyOverlay);
  }
}
