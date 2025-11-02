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
  let animationId = null;
  let menuMusic = null;
  
  // Detect base path
  const basePath = window.location.pathname.includes('/home/sbitbybit')
    ? '/home/sbitbybit'
    : '';

  // Play menu music
  const listener = new THREE.AudioListener();
  const camera2 = new THREE.PerspectiveCamera();
  camera2.add(listener);

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
      position: relative;
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
      position: relative;
  `;

  // Monster container
  const monster = document.createElement('div');
  monster.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
  `;

  init();

  function init() {
    createScene();
    
    // Setup audio
    menuMusic = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/sounds/deep-sea-monster-roar-329857.mp3', 
      buffer => {
        menuMusic.setBuffer(buffer);
        menuMusic.setLoop(true);
        menuMusic.setVolume(1.0);
        menuMusic.play();
      },
      undefined,
      error => {
        console.warn('Audio loading failed:', error);
      }
    );

    monster.appendChild(renderer.domElement);
    renderer.domElement.style.background = 'transparent';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';

    clock = new THREE.Clock();
    addMainHero(scene, 0);

    animate();
  }

  function animate() {
    const deltaTime = clock.getDelta();
    distance += rollingSpeed;
    animationId = requestAnimationFrame(animate);
    updateHero(deltaTime);
    renderer.render(scene, camera);
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (menuMusic && menuMusic.isPlaying) {
      menuMusic.stop();
    }
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
        position: relative;
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
    showControlsScreen();
  });

  quitButton.addEventListener('click', () => {
    cleanup();
    // Redirect to the base path (main menu)
    window.location.href = basePath ? `${basePath}/index.html` : '/index.html';
  });

  function showControlsScreen() {
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

    const glow = document.createElement('div');
    glow.style.cssText = `
        position: absolute;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%);
        border-radius: 50%;
    `;
    glow.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }],
      { duration: 6000, iterations: Infinity, direction: 'alternate' }
    );
    controlsOverlay.appendChild(glow);

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
        position: relative;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    `;

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
  }

  // Assemble menu
  overlay.appendChild(monster);
  overlay.appendChild(title);
  overlay.appendChild(tagline);
  overlay.appendChild(startButton);
  overlay.appendChild(controlsButton);
  overlay.appendChild(quitButton);
  document.body.appendChild(overlay);

  // Add CSS animations
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
  if (!document.head.querySelector('style[data-menu-animations]')) {
    style.setAttribute('data-menu-animations', 'true');
    document.head.appendChild(style);
  }

  // Story screen function
  function showStoryScreen() {
    cleanup();
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
      document.body.removeChild(storyOverlay);
      if (onStartCallback) onStartCallback();
    });

    storyOverlay.appendChild(storyText);
    storyOverlay.appendChild(startLevelButton);
    document.body.appendChild(storyOverlay);
  }
}